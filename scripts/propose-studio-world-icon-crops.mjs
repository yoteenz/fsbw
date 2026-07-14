#!/usr/bin/env node
/**
 * Proposes deterministic glyph crop rectangles from the labeled master catalog.
 * Output is written to studio-world-icon-crop-manifest.ts — detection assists only;
 * manifest coordinates are the canonical authority.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SOURCE_REL = 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png';
const REGISTRY_REL = 'src/features/studio-world/icons/experience-lab-icon-registry.ts';
const MANIFEST_OUT = 'src/features/studio-world/icons/studio-world-icon-crop-manifest.ts';
const OVERRIDES_REL = 'scripts/config/studio-world-icon-crop-overrides.json';

const ROWS = 8;
const COLS = 8;
const BLACK_LUM = 28;
const WHITE_LUM = 235;
const DEFAULT_GLYPH_PADDING = 18;
const DEFAULT_OUTPUT_SIZE = 512;

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function alphaFromLuminance(r, g, b, alphaFloor = 24) {
  const lum = luminance(r, g, b);
  if (lum <= BLACK_LUM) return 0;
  if (lum >= WHITE_LUM) return 255;
  const t = (lum - BLACK_LUM) / (WHITE_LUM - BLACK_LUM);
  const a = Math.round(Math.pow(t, 0.72) * 255);
  return a >= alphaFloor ? a : 0;
}

function cellRect(width, height, row, column) {
  const left = Math.round((column * width) / COLS);
  const top = Math.round((row * height) / ROWS);
  const right = Math.round(((column + 1) * width) / COLS);
  const bottom = Math.round(((row + 1) * height) / ROWS);
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function buildRowStats(rgba, cellW, cellH, channels) {
  const rows = [];
  for (let y = 0; y < cellH; y += 1) {
    let bright = 0;
    let minX = cellW;
    let maxX = 0;
    for (let x = 0; x < cellW; x += 1) {
      const i = (y * cellW + x) * channels;
      const a = alphaFromLuminance(rgba[i], rgba[i + 1], rgba[i + 2]);
      if (a >= 24) {
        bright += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
    const spread = maxX >= minX ? maxX - minX + 1 : 0;
    rows.push({ y, bright, spread, density: spread > 0 ? bright / spread : 0 });
  }
  return rows;
}

function detectLabelBandStart(rows, cellW, cellH) {
  const labelZoneStart = Math.floor(cellH * 0.42);
  const rowThreshold = Math.max(8, Math.floor(cellW * 0.012));
  const spreadThreshold = Math.max(16, Math.floor(cellW * 0.18));
  const labelRows = [];

  for (let i = rows.length - 1; i >= labelZoneStart; i -= 1) {
    const row = rows[i];
    const looksLikeLabel =
      row.bright >= rowThreshold &&
      row.spread >= spreadThreshold &&
      row.density >= 0.18 &&
      row.bright >= Math.max(14, row.spread * 0.14);
    if (looksLikeLabel) labelRows.push(row.y);
  }

  if (labelRows.length === 0) return Math.floor(cellH * 0.8);
  return Math.max(8, Math.min(...labelRows) - 4);
}

function glyphBoundsInCell(rgba, cellW, cellH, channels, labelStartY) {
  let minX = cellW;
  let maxX = 0;
  let minY = cellH;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < labelStartY; y += 1) {
    for (let x = 0; x < cellW; x += 1) {
      const i = (y * cellW + x) * channels;
      const a = alphaFromLuminance(rgba[i], rgba[i + 1], rgba[i + 2]);
      if (a >= 24) {
        count += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (count < 24) return null;
  return { minX, maxX, minY, maxY, count };
}

function parseRegistryKeys() {
  const text = fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8');
  const entries = [];
  const blockRe = /(\w+):\s*\{[^}]*sourceLabel:\s*'([^']+)'[^}]*row:\s*(\d+)[^}]*column:\s*(\d+)/gs;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    entries.push({
      semanticKey: m[1],
      sourceLabel: m[2],
      row: Number(m[3]),
      column: Number(m[4]),
    });
  }
  return entries;
}

function loadOverrides() {
  const p = path.join(ROOT, OVERRIDES_REL);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function main() {
  const sourcePath = path.join(ROOT, SOURCE_REL);
  const sourceSha256 = crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex');
  const meta = await sharp(sourcePath).metadata();
  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const overrides = loadOverrides();
  const registry = parseRegistryKeys();
  const manifest = {};

  for (const entry of registry) {
    const cell = cellRect(width, height, entry.row, entry.column);
    const cellBuf = await sharp(data, { raw: { width, height, channels } })
      .extract({ left: cell.left, top: cell.top, width: cell.width, height: cell.height })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const rows = buildRowStats(cellBuf, cell.width, cell.height, channels);
    const labelStart = overrides[entry.semanticKey]?.labelStartY ?? detectLabelBandStart(rows, cell.width, cell.height);
    const bounds = glyphBoundsInCell(cellBuf, cell.width, cell.height, channels, labelStart);
    const ov = overrides[entry.semanticKey] ?? {};

    let cropX;
    let cropY;
    let cropWidth;
    let cropHeight;

    if (ov.cropX != null) {
      cropX = ov.cropX;
      cropY = ov.cropY;
      cropWidth = ov.cropWidth;
      cropHeight = ov.cropHeight;
    } else if (bounds) {
      const pad = ov.glyphPadding ?? DEFAULT_GLYPH_PADDING;
      const relX = Math.max(0, bounds.minX - pad);
      const relY = Math.max(0, bounds.minY - pad);
      const relW = Math.min(cell.width - relX, bounds.maxX - bounds.minX + 1 + pad * 2);
      const relH = Math.min(cell.height - relY, bounds.maxY - bounds.minY + 1 + pad * 2);
      cropX = cell.left + relX;
      cropY = cell.top + relY;
      cropWidth = Math.max(8, relW);
      cropHeight = Math.max(8, relH);
    } else {
      cropX = cell.left + 8;
      cropY = cell.top + 8;
      cropWidth = cell.width - 16;
      cropHeight = Math.floor(cell.height * 0.72);
    }

    manifest[entry.semanticKey] = {
      semanticKey: entry.semanticKey,
      sourceLabel: entry.sourceLabel,
      row: entry.row,
      column: entry.column,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      glyphPadding: ov.glyphPadding ?? DEFAULT_GLYPH_PADDING,
      outputSize: ov.outputSize ?? DEFAULT_OUTPUT_SIZE,
      opticalScale: ov.opticalScale ?? 1,
      translateX: ov.translateX ?? 0,
      translateY: ov.translateY ?? 0,
      approved: ov.approved ?? false,
      notes: ov.notes ?? 'Deterministic glyph crop; excludes printed label band.',
    };
  }

  const lines = Object.values(manifest)
    .map((e) => {
      const note = e.notes.replace(/'/g, "\\'");
      return `  ${e.semanticKey}: {
    semanticKey: '${e.semanticKey}',
    sourceLabel: '${e.sourceLabel}',
    row: ${e.row},
    column: ${e.column},
    cropX: ${e.cropX},
    cropY: ${e.cropY},
    cropWidth: ${e.cropWidth},
    cropHeight: ${e.cropHeight},
    glyphPadding: ${e.glyphPadding},
    outputSize: ${e.outputSize},
    opticalScale: ${e.opticalScale},
    translateX: ${e.translateX},
    translateY: ${e.translateY},
    approved: ${e.approved},
    notes: '${note}',
  }`;
    })
    .join(',\n');

  const ts = `import type { ExperienceLabIconName } from './experience-lab-icon-registry';

/** Deterministic crop manifest — canonical authority for Studio World icon extraction v3. */
export const STUDIO_WORLD_ICON_CROP_MANIFEST_VERSION = 'studio-world-icon-crops-v3' as const;

export const STUDIO_WORLD_ICON_SOURCE = {
  path: 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png',
  width: ${width},
  height: ${height},
  rows: ${ROWS},
  columns: ${COLS},
  sha256: '${sourceSha256}',
} as const;

export type StudioWorldIconCropEntry = {
  semanticKey: ExperienceLabIconName;
  sourceLabel: string;
  row: number;
  column: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  glyphPadding: number;
  outputSize: number;
  opticalScale: number;
  translateX: number;
  translateY: number;
  approved: boolean;
  notes: string;
};

export const StudioWorldIconCropManifest: Record<ExperienceLabIconName, StudioWorldIconCropEntry> = {
${lines},
} as const;

export const STUDIO_WORLD_ICON_CROP_KEYS = Object.keys(StudioWorldIconCropManifest) as ExperienceLabIconName[];

export function resolveStudioWorldIconCrop(key: ExperienceLabIconName): StudioWorldIconCropEntry {
  return StudioWorldIconCropManifest[key];
}

export function resolveStudioWorldIconCellBounds(entry: StudioWorldIconCropEntry): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const { width: sw, height: sh, rows, columns } = STUDIO_WORLD_ICON_SOURCE;
  const left = Math.round((entry.column * sw) / columns);
  const top = Math.round((entry.row * sh) / rows);
  const right = Math.round(((entry.column + 1) * sw) / columns);
  const bottom = Math.round(((entry.row + 1) * sh) / rows);
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

export function isCropInsideCell(entry: StudioWorldIconCropEntry): boolean {
  const cell = resolveStudioWorldIconCellBounds(entry);
  return (
    entry.cropX >= cell.left &&
    entry.cropY >= cell.top &&
    entry.cropX + entry.cropWidth <= cell.left + cell.width &&
    entry.cropY + entry.cropHeight <= cell.top + cell.height
  );
}

export const STUDIO_WORLD_ICON_V3_OUTPUT_DIR =
  'src/assets/studio-world/experience-lab/icons/generated-v3' as const;

/** v2 automated extraction is frozen — do not certify until v3 crops are founder-approved. */
export const EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN = true as const;
export const EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED = false as const;
`;

  fs.writeFileSync(path.join(ROOT, MANIFEST_OUT), ts);
  console.log(`Wrote ${MANIFEST_OUT} (${registry.length} icons)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
