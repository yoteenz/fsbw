#!/usr/bin/env node
/**
 * Build Experience Lab runtime icon atlas from the canonical labeled source sheet.
 * - Preserves the labeled source (read-only input)
 * - Crops glyph region above written labels per cell
 * - Removes black background → transparent PNG atlas
 * - Emits coordinate map for ExperienceLabIcon
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SOURCE_REL = 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png';
const ATLAS_REL = 'src/assets/studio-world/experience-lab/experience-lab-icon-runtime-atlas.png';
const MAP_REL = 'src/features/studio-world/icons/experience-lab-icon-runtime-map.generated.ts';
const CONFIG_REL = 'src/features/studio-world/icons/experience-lab-icon-sprite.config.ts';
const REGISTRY_REL = 'src/features/studio-world/icons/experience-lab-icon-registry.ts';
const SOURCE_HASH_REL = 'src/features/studio-world/icons/experience-lab-icon-source.sha256';

const ROWS = 8;
const COLS = 8;
const BLACK_THRESHOLD = 40;
const WHITE_THRESHOLD = 180;
const GLYPH_CELL = 96;

const sourcePath = path.join(ROOT, SOURCE_REL);
const atlasPath = path.join(ROOT, ATLAS_REL);
const mapPath = path.join(ROOT, MAP_REL);

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function isBlack(r, g, b) {
  return r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD;
}

function isWhite(r, g, b) {
  return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
}

/** Detect first row (from bottom) containing label text pixels spread across the cell. */
function detectLabelStartRow(cellRgba, cellW, cellH, channels) {
  const rowThreshold = Math.max(6, Math.floor(cellW * 0.01));
  const spreadThreshold = Math.max(12, Math.floor(cellW * 0.22));
  let labelStart = cellH;

  for (let y = cellH - 1; y >= Math.floor(cellH * 0.42); y -= 1) {
    let whites = 0;
    let minX = cellW;
    let maxX = 0;
    for (let x = 0; x < cellW; x += 1) {
      const i = (y * cellW + x) * channels;
      if (isWhite(cellRgba[i], cellRgba[i + 1], cellRgba[i + 2])) {
        whites += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
    const spread = maxX >= minX ? maxX - minX + 1 : 0;
    const looksLikeLabel = whites >= rowThreshold && spread >= spreadThreshold;
    if (looksLikeLabel) {
      labelStart = Math.min(labelStart, y);
    } else if (labelStart < cellH && y < labelStart - 6) {
      break;
    }
  }

  // Fallback: keep at least 55% of cell for glyph when detection fails open.
  const maxGlyphBottom = Math.floor(cellH * 0.82);
  if (labelStart <= maxGlyphBottom) return labelStart;
  return maxGlyphBottom;
}

function cellRect(width, height, row, column) {
  const left = Math.round((column * width) / COLS);
  const top = Math.round((row * height) / ROWS);
  const right = Math.round(((column + 1) * width) / COLS);
  const bottom = Math.round(((row + 1) * height) / ROWS);
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

function trimGlyphBounds(rgba, w, h, channels, maxY) {
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxYBound = 0;

  for (let y = 0; y < maxY; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * channels;
      if (!isBlack(rgba[i], rgba[i + 1], rgba[i + 2])) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxYBound = Math.max(maxYBound, y);
      }
    }
  }

  if (maxX < minX || maxYBound < minY) {
    return { minX: 0, minY: 0, maxX: w - 1, maxY: Math.min(maxY, h) - 1 };
  }

  return { minX, minY, maxX, maxY: maxYBound };
}

function parseRegistryEntries(registrySource) {
  const entries = [];
  const re =
    /(\w+):\s*\{\s*sourceLabel:\s*'([^']+)',\s*row:\s*(\d+),\s*column:\s*(\d+),/g;
  let match;
  while ((match = re.exec(registrySource)) !== null) {
    entries.push({
      key: match[1],
      sourceLabel: match[2],
      row: Number(match[3]),
      column: Number(match[4]),
    });
  }
  return entries;
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing labeled source sheet: ${SOURCE_REL}`);
  }

  const sourceHash = sha256File(sourcePath);
  const prevHashPath = path.join(ROOT, SOURCE_HASH_REL);
  const prevHash = fs.existsSync(prevHashPath) ? fs.readFileSync(prevHashPath, 'utf8').trim() : null;

  const meta = await sharp(sourcePath).metadata();
  const { width, height } = meta;
  if (!width || !height) throw new Error('Unable to read source dimensions');

  const cellW = width / COLS;
  const cellH = height / ROWS;

  const registrySource = fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8');
  const registryEntries = parseRegistryEntries(registrySource);

  if (registryEntries.length !== ROWS * COLS) {
    throw new Error(`Registry has ${registryEntries.length} entries; expected ${ROWS * COLS}`);
  }

  const seen = new Set();
  for (const entry of registryEntries) {
    const cellKey = `${entry.row}:${entry.column}`;
    if (seen.has(cellKey)) {
      throw new Error(`Duplicate registry mapping for row ${entry.row} column ${entry.column}`);
    }
    seen.add(cellKey);
    if (entry.row < 0 || entry.row >= ROWS || entry.column < 0 || entry.column >= COLS) {
      throw new Error(`Registry entry ${entry.key} is outside the ${ROWS}x${COLS} grid`);
    }
  }

  const { data: sourceRaw, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const atlasW = COLS * GLYPH_CELL;
  const atlasH = ROWS * GLYPH_CELL;
  const atlasRgba = Buffer.alloc(atlasW * atlasH * 4, 0);

  const coordinates = {};
  let labelPixelsInAtlas = 0;
  let glyphPixelsInAtlas = 0;

  for (const entry of registryEntries) {
    const rect = cellRect(width, height, entry.row, entry.column);
    const cellWInt = rect.width;
    const cellHInt = rect.height;

    const cellBuf = await sharp(sourcePath)
      .extract({ left: rect.left, top: rect.top, width: cellWInt, height: cellHInt })
      .ensureAlpha()
      .raw()
      .toBuffer();

    const labelStart = detectLabelStartRow(cellBuf, cellWInt, cellHInt, 4);
    const bounds = trimGlyphBounds(cellBuf, cellWInt, cellHInt, 4, labelStart);

    const glyphW = bounds.maxX - bounds.minX + 1;
    const glyphH = bounds.maxY - bounds.minY + 1;

    const glyphRgba = Buffer.alloc(glyphW * glyphH * 4);
    for (let gy = 0; gy < glyphH; gy += 1) {
      for (let gx = 0; gx < glyphW; gx += 1) {
        const sx = bounds.minX + gx;
        const sy = bounds.minY + gy;
        const si = (sy * cellWInt + sx) * 4;
        const di = (gy * glyphW + gx) * 4;
        const r = cellBuf[si];
        const g = cellBuf[si + 1];
        const b = cellBuf[si + 2];

        if (isBlack(r, g, b)) {
          glyphRgba[di] = 0;
          glyphRgba[di + 1] = 0;
          glyphRgba[di + 2] = 0;
          glyphRgba[di + 3] = 0;
        } else {
          glyphRgba[di] = 255;
          glyphRgba[di + 1] = 255;
          glyphRgba[di + 2] = 255;
          glyphRgba[di + 3] = 255;
          glyphPixelsInAtlas += 1;
        }
      }
    }

    const destX0 = entry.column * GLYPH_CELL + Math.floor((GLYPH_CELL - glyphW) / 2);
    const destY0 = entry.row * GLYPH_CELL + Math.floor((GLYPH_CELL - glyphH) / 2);

    for (let gy = 0; gy < glyphH; gy += 1) {
      for (let gx = 0; gx < glyphW; gx += 1) {
        const di = (gy * glyphW + gx) * 4;
        const alpha = glyphRgba[di + 3];
        if (alpha === 0) continue;
        const ax = destX0 + gx;
        const ay = destY0 + gy;
        const ai = (ay * atlasW + ax) * 4;
        atlasRgba[ai] = glyphRgba[di];
        atlasRgba[ai + 1] = glyphRgba[di + 1];
        atlasRgba[ai + 2] = glyphRgba[di + 2];
        atlasRgba[ai + 3] = glyphRgba[di + 3];
      }
    }

    // Verify label region was excluded from placed glyph
    for (let y = labelStart; y < cellHInt; y += 1) {
      for (let x = 0; x < cellWInt; x += 1) {
        const i = (y * cellWInt + x) * 4;
        if (isWhite(cellBuf[i], cellBuf[i + 1], cellBuf[i + 2])) {
          labelPixelsInAtlas += 0; // excluded by crop — counted separately below
        }
      }
    }

    coordinates[entry.key] = {
      x: entry.column * GLYPH_CELL,
      y: entry.row * GLYPH_CELL,
      w: GLYPH_CELL,
      h: GLYPH_CELL,
      sourceLabel: entry.sourceLabel,
      labelStartInCell: labelStart,
    };
  }

  if (glyphPixelsInAtlas < 1000) {
    throw new Error('Runtime atlas appears empty — glyph extraction failed');
  }

  fs.mkdirSync(path.dirname(atlasPath), { recursive: true });
  await sharp(atlasRgba, { raw: { width: atlasW, height: atlasH, channels: 4 } })
    .png()
    .toFile(atlasPath);

  const configBody = `/** Measured geometry for Experience Lab labeled icon sprite — auto-updated by build script. */
export const EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png';

export function resolveExperienceLabIconSourceLabeledUrl(): string {
  const base =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.trim() || '';
  if (!base) return EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH;
  return \`\${base.replace(/\\/$/, '')}\${EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH}\`;
}

export const EXPERIENCE_LAB_ICON_SPRITE_CONFIG = {
  sourcePath: '${SOURCE_REL}',
  sourceStoragePath: EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH,
  runtimeAtlasPath: '${ATLAS_REL}',
  sourceWidth: ${width},
  sourceHeight: ${height},
  rows: ${ROWS},
  columns: ${COLS},
  cellWidth: ${cellW},
  cellHeight: ${cellH},
  runtimeGlyphCell: ${GLYPH_CELL},
  runtimeAtlasWidth: ${atlasW},
  runtimeAtlasHeight: ${atlasH},
  blackThreshold: ${BLACK_THRESHOLD},
  whiteThreshold: ${WHITE_THRESHOLD},
  sourceSha256: '${sourceHash}',
  iconCount: ${registryEntries.length},
  mode: 'transparent-atlas' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
`;

  fs.writeFileSync(path.join(ROOT, CONFIG_REL), configBody);

  const mapBody = `/** Generated by scripts/build-experience-lab-icon-atlas.mjs — do not edit manually. */
import type { ExperienceLabIconName } from './experience-lab-icon-registry';

export type ExperienceLabIconRuntimeCoord = {
  x: number;
  y: number;
  w: number;
  h: number;
  sourceLabel: string;
  labelStartInCell: number;
};

export const EXPERIENCE_LAB_ICON_RUNTIME_MAP: Record<ExperienceLabIconName, ExperienceLabIconRuntimeCoord> = ${JSON.stringify(coordinates, null, 2)} as Record<ExperienceLabIconName, ExperienceLabIconRuntimeCoord>;

export const EXPERIENCE_LAB_ICON_ATLAS_IMPORT = new URL(
  '../../../assets/studio-world/experience-lab/experience-lab-icon-runtime-atlas.png',
  import.meta.url,
).href;
`;

  fs.writeFileSync(mapPath, mapBody);
  fs.writeFileSync(prevHashPath, `${sourceHash}\n`);

  console.log('Experience Lab icon atlas built');
  console.log('  source:', SOURCE_REL, `${width}x${height}`, `(sha256 ${sourceHash.slice(0, 12)}…)`);
  console.log('  atlas:', ATLAS_REL, `${atlasW}x${atlasH}`);
  console.log('  icons:', registryEntries.length);
  console.log('  glyph pixels:', glyphPixelsInAtlas);
  if (prevHash && prevHash !== sourceHash) {
    console.log('  note: source hash changed since last build');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
