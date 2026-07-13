#!/usr/bin/env node
/**
 * Experience Lab icon extraction — per-glyph bounds, label exclusion, luminance alpha.
 * Canonical labeled source is read-only; outputs transparent PNGs under icons/generated/.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SOURCE_REL = 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png';
const OUTPUT_DIR_REL = 'src/assets/studio-world/experience-lab/icons/generated';
const MANIFEST_REL = 'src/features/studio-world/icons/experience-lab-icon-assets.generated.ts';
const METADATA_REL = 'src/features/studio-world/icons/experience-lab-icon-extraction-metadata.generated.json';
const CONFIG_REL = 'src/features/studio-world/icons/experience-lab-icon-sprite.config.ts';
const REGISTRY_REL = 'src/features/studio-world/icons/experience-lab-icon-registry.ts';
const SOURCE_HASH_REL = 'src/features/studio-world/icons/experience-lab-icon-source.sha256';
const OVERRIDES_REL = 'scripts/experience-lab-icon-extraction-overrides.mjs';
const CONTACT_SHEET_REL = `${OUTPUT_DIR_REL}/_contact-sheet.png`;
const QA_DOC_REL = 'docs/studio-os/design-system/EXPERIENCE_LAB_EXTRACTED_ICON_QA.md';

const ROWS = 8;
const COLS = 8;
const OUTPUT_CANVAS = 256;
const SAFE_PADDING = 22;
const BLACK_LUM = 28;
const WHITE_LUM = 235;
const MIN_GLYPH_PIXELS = 48;
const MIN_CONFIDENCE = 0.55;
const EDGE_RING = 2;

const sourcePath = path.join(ROOT, SOURCE_REL);
const outputDir = path.join(ROOT, OUTPUT_DIR_REL);

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function alphaFromLuminance(r, g, b) {
  const lum = luminance(r, g, b);
  if (lum <= BLACK_LUM) return 0;
  if (lum >= WHITE_LUM) return 255;
  const t = (lum - BLACK_LUM) / (WHITE_LUM - BLACK_LUM);
  return Math.round(Math.pow(t, 0.72) * 255);
}

function iconKeyToFilename(key) {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}

function cellRect(width, height, row, column) {
  const left = Math.round((column * width) / COLS);
  const top = Math.round((row * height) / ROWS);
  const right = Math.round(((column + 1) * width) / COLS);
  const bottom = Math.round(((row + 1) * height) / ROWS);
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

/** Detect upper bound (exclusive) of glyph region by finding label band from bottom. */
function detectLabelStartRow(rgba, cellW, cellH, channels) {
  const labelZoneStart = Math.floor(cellH * 0.6);
  const rowThreshold = Math.max(10, Math.floor(cellW * 0.014));
  const spreadThreshold = Math.max(18, Math.floor(cellW * 0.22));
  const labelRows = [];

  for (let y = cellH - 1; y >= labelZoneStart; y -= 1) {
    let bright = 0;
    let minX = cellW;
    let maxX = 0;
    for (let x = 0; x < cellW; x += 1) {
      const i = (y * cellW + x) * channels;
      const lum = luminance(rgba[i], rgba[i + 1], rgba[i + 2]);
      if (lum >= 150) {
        bright += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
    const spread = maxX >= minX ? maxX - minX + 1 : 0;
    const density = spread > 0 ? bright / spread : 0;
    const looksLikeLabel =
      bright >= rowThreshold &&
      spread >= spreadThreshold &&
      density >= 0.22 &&
      bright >= Math.max(18, spread * 0.18);
    if (looksLikeLabel) labelRows.push(y);
  }

  if (labelRows.length === 0) return Math.floor(cellH * 0.82);

  const labelStart = Math.min(...labelRows);
  return Math.max(8, labelStart - 3);
}

function detectGlyphBounds(rgba, cellW, cellH, channels, maxY, minAlpha = 24) {
  let minX = cellW;
  let minY = maxY;
  let maxX = 0;
  let maxYBound = 0;

  for (let y = 0; y < maxY; y += 1) {
    for (let x = 0; x < cellW; x += 1) {
      const i = (y * cellW + x) * channels;
      const a = alphaFromLuminance(rgba[i], rgba[i + 1], rgba[i + 2]);
      if (a >= minAlpha) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxYBound = Math.max(maxYBound, y);
      }
    }
  }

  if (maxX < minX || maxYBound < minY) return null;

  const padX = Math.max(3, Math.round(cellW * 0.02));
  const padY = Math.max(3, Math.round(cellH * 0.02));
  return {
    minX: Math.max(0, minX - padX),
    minY: Math.max(0, minY - padY),
    maxX: Math.min(cellW - 1, maxX + padX),
    maxY: Math.min(maxY - 1, maxYBound + padY),
  };
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

function categoryForRow(row) {
  const map = [
    'viewport',
    'project',
    'playback',
    'viewport-tools',
    'inspector',
    'data',
    'collaboration',
    'navigation',
  ];
  return map[row] ?? 'system';
}

function computeConfidence({ glyphPixels, canvasPixels, edgePixels, labelStart, cellH, bounds }) {
  let confidence = 1;
  const occupancy = glyphPixels / canvasPixels;
  if (glyphPixels < MIN_GLYPH_PIXELS) confidence -= 0.45;
  if (occupancy < 0.015) confidence -= 0.35;
  if (occupancy > 0.72) confidence -= 0.25;
  if (edgePixels / Math.max(1, glyphPixels) > 0.08) confidence -= 0.2;
  if (labelStart < cellH * 0.55) confidence -= 0.05;
  if (!bounds) confidence = 0;
  return Math.max(0, Math.min(1, confidence));
}

function countEdgeOpaque(rgba, size, channels) {
  let edge = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const onEdge =
        x < EDGE_RING || y < EDGE_RING || x >= size - EDGE_RING || y >= size - EDGE_RING;
      if (!onEdge) continue;
      const i = (y * size + x) * channels;
      if (rgba[i + 3] > 0) edge += 1;
    }
  }
  return edge;
}

async function extractIcon(entry, sourcePath, width, height, override) {
  const rect = cellRect(width, height, entry.row, entry.column);
  const cellBuf = await sharp(sourcePath)
    .extract({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const cellW = rect.width;
  const cellH = rect.height;
  const labelStart = override?.labelStart ?? detectLabelStartRow(cellBuf, cellW, cellH, 4);
  const bounds =
    override?.bounds ??
    detectGlyphBounds(cellBuf, cellW, cellH, 4, labelStart);

  if (!bounds) {
    throw new Error(`${entry.key}: empty glyph bounds after label exclusion`);
  }

  const glyphW = bounds.maxX - bounds.minX + 1;
  const glyphH = bounds.maxY - bounds.minY + 1;

  const glyphRgba = Buffer.alloc(glyphW * glyphH * 4);
  let glyphPixels = 0;
  for (let gy = 0; gy < glyphH; gy += 1) {
    for (let gx = 0; gx < glyphW; gx += 1) {
      const sx = bounds.minX + gx;
      const sy = bounds.minY + gy;
      const si = (sy * cellW + sx) * 4;
      const di = (gy * glyphW + gx) * 4;
      const r = cellBuf[si];
      const g = cellBuf[si + 1];
      const b = cellBuf[si + 2];
      const a = alphaFromLuminance(r, g, b);
      glyphRgba[di] = 255;
      glyphRgba[di + 1] = 255;
      glyphRgba[di + 2] = 255;
      glyphRgba[di + 3] = a;
      if (a > 0) glyphPixels += 1;
    }
  }

  const innerMax = OUTPUT_CANVAS - SAFE_PADDING * 2;
  const scale = Math.min(innerMax / glyphW, innerMax / glyphH);
  const outW = Math.max(1, Math.round(glyphW * scale));
  const outH = Math.max(1, Math.round(glyphH * scale));

  const scaled = await sharp(glyphRgba, { raw: { width: glyphW, height: glyphH, channels: 4 } })
    .resize(outW, outH, { kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const canvas = Buffer.alloc(OUTPUT_CANVAS * OUTPUT_CANVAS * 4, 0);
  const offsetX = Math.floor((OUTPUT_CANVAS - outW) / 2);
  const offsetY = Math.floor((OUTPUT_CANVAS - outH) / 2);

  let canvasPixels = 0;
  for (let y = 0; y < outH; y += 1) {
    for (let x = 0; x < outW; x += 1) {
      const si = (y * outW + x) * 4;
      const a = scaled[si + 3];
      if (a === 0) continue;
      const dx = offsetX + x;
      const dy = offsetY + y;
      const di = (dy * OUTPUT_CANVAS + dx) * 4;
      canvas[di] = scaled[si];
      canvas[di + 1] = scaled[si + 1];
      canvas[di + 2] = scaled[si + 2];
      canvas[di + 3] = a;
      canvasPixels += 1;
    }
  }

  const edgePixels = countEdgeOpaque(canvas, OUTPUT_CANVAS, 4);
  const confidence = computeConfidence({
    glyphPixels: canvasPixels,
    canvasPixels: OUTPUT_CANVAS * OUTPUT_CANVAS,
    edgePixels,
    labelStart,
    cellH,
    bounds,
  });

  if (canvasPixels < MIN_GLYPH_PIXELS) {
    throw new Error(`${entry.key}: output nearly blank (${canvasPixels} px)`);
  }
  if (confidence < MIN_CONFIDENCE) {
    throw new Error(
      `${entry.key}: extraction confidence ${confidence.toFixed(2)} below ${MIN_CONFIDENCE}`,
    );
  }

  const filename = iconKeyToFilename(entry.key);
  const outPath = path.join(outputDir, filename);
  await sharp(canvas, { raw: { width: OUTPUT_CANVAS, height: OUTPUT_CANVAS, channels: 4 } })
    .png()
    .toFile(outPath);

  return {
    key: entry.key,
    sourceLabel: entry.sourceLabel,
    filename,
    row: entry.row,
    column: entry.column,
    category: categoryForRow(entry.row),
    sourceBounds: bounds,
    labelStartInCell: labelStart,
    outputWidth: OUTPUT_CANVAS,
    outputHeight: OUTPUT_CANVAS,
    scaledGlyphWidth: outW,
    scaledGlyphHeight: outH,
    glyphPixels: canvasPixels,
    edgePixels,
    confidence,
    overrideApplied: Boolean(override),
  };
}

async function buildContactSheet(results) {
  const thumb = 128;
  const sheetW = COLS * thumb;
  const sheetH = ROWS * thumb;
  const sheet = Buffer.alloc(sheetW * sheetH * 4);

  for (let i = 0; i < sheet.length; i += 4) {
    sheet[i] = 18;
    sheet[i + 1] = 18;
    sheet[i + 2] = 20;
    sheet[i + 3] = 255;
  }

  for (const item of results) {
    const pngPath = path.join(outputDir, item.filename);
    const resized = await sharp(pngPath)
      .resize(thumb - 16, thumb - 16, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const ox = item.column * thumb + Math.floor((thumb - resized.info.width) / 2);
    const oy = item.row * thumb + Math.floor((thumb - resized.info.height) / 2);
    const { data, info } = resized;

    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const si = (y * info.width + x) * 4;
        const a = data[si + 3];
        if (a === 0) continue;
        const dx = ox + x;
        const dy = oy + y;
        const di = (dy * sheetW + dx) * 4;
        sheet[di] = data[si];
        sheet[di + 1] = data[si + 1];
        sheet[di + 2] = data[si + 2];
        sheet[di + 3] = a;
      }
    }
  }

  await sharp(sheet, { raw: { width: sheetW, height: sheetH, channels: 4 } })
    .png()
    .toFile(path.join(ROOT, CONTACT_SHEET_REL));
}

function writeManifest(results, sourceHash) {
  const imports = results
    .map(
      (r) =>
        `import ${r.key}Asset from '../../../assets/studio-world/experience-lab/icons/generated/${r.filename}';`,
    )
    .join('\n');

  const entries = results
    .map(
      (r) =>
        `  ${r.key}: {\n    src: ${r.key}Asset,\n    sourceLabel: '${r.sourceLabel}',\n    category: '${r.category}',\n    confidence: ${r.confidence.toFixed(3)},\n  }`,
    )
    .join(',\n');

  const body = `/** Generated by scripts/extract-experience-lab-icons.mjs — do not edit manually. */
import type { ExperienceLabIconName } from './experience-lab-icon-registry';

${imports}

export type ExperienceLabIconAssetEntry = {
  src: string;
  sourceLabel: string;
  category: string;
  confidence: number;
};

export const EXPERIENCE_LAB_ICON_ASSETS: Record<ExperienceLabIconName, ExperienceLabIconAssetEntry> = {
${entries}
} as Record<ExperienceLabIconName, ExperienceLabIconAssetEntry>;

export const EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256 = '${sourceHash}';
export const EXPERIENCE_LAB_ICON_OUTPUT_CANVAS = ${OUTPUT_CANVAS};
`;

  fs.writeFileSync(path.join(ROOT, MANIFEST_REL), body);
}

function writeConfig(meta, sourceHash, width, height) {
  const body = `/** Extraction config — auto-updated by scripts/extract-experience-lab-icons.mjs */
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
  generatedDir: '${OUTPUT_DIR_REL}',
  sourceWidth: ${width},
  sourceHeight: ${height},
  rows: ${ROWS},
  columns: ${COLS},
  outputCanvas: ${OUTPUT_CANVAS},
  sourceSha256: '${sourceHash}',
  iconCount: ${meta.length},
  mode: 'extracted-transparent-png' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
`;
  fs.writeFileSync(path.join(ROOT, CONFIG_REL), body);
}

function writeQaDoc(results, sourceHash, forensic) {
  const rows = results
    .sort((a, b) => a.row - b.row || a.column - b.column)
    .map(
      (r) =>
        `| ${r.key} | ${r.sourceLabel} | ${r.row} | ${r.column} | ${r.confidence.toFixed(2)} | ${r.overrideApplied ? 'yes' : 'no'} | ![${r.key}](../../../src/assets/studio-world/experience-lab/icons/generated/${r.filename}) |`,
    )
    .join('\n');

  const body = `# Experience Lab Extracted Icon QA

## Forensic audit — prior sprite corruption

${forensic}

## Canonical labeled source (unchanged)

Path: \`${SOURCE_REL}\`

Storage: \`740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png\`

SHA256: \`${sourceHash}\`

## Generated contact sheet

![Contact sheet](../../../src/assets/studio-world/experience-lab/icons/generated/_contact-sheet.png)

## Per-icon extraction results

| Semantic key | Source label | Row | Col | Confidence | Override | Preview |
|---|---|---:|---:|---:|---|---|
${rows}

## Dev QA route

Compare runtime icons at \`/admin/studio/experience-lab-icon-qa\` (admin only).

## Regenerate

\`\`\`bash
npm run experience-lab:build-icons
\`\`\`
`;
  fs.writeFileSync(path.join(ROOT, QA_DOC_REL), body);
}

const FORENSIC_AUDIT = `
The prior **CSS sprite atlas** pipeline (\`build-experience-lab-icon-atlas.mjs\`) caused visible corruption:

1. **Binary thresholding** — pixels were forced to fully opaque white or fully transparent, destroying anti-aliased edge pixels and thin line art.
2. **Uniform 96×96 atlas slots** — every icon was placed in a fixed slot but \`ExperienceLabIcon\` scaled using the full slot width (\`coord.w = 96\`) even when the glyph only occupied the center fraction, producing incorrect CSS \`background-size\` / \`background-position\` math.
3. **\`image-rendering: crisp-edges\`** — discouraged smooth downscaling on Retina displays.
4. **Shared label-band heuristic** — a single bottom-up label detector for all cells; when it mis-estimated \`labelStart\`, label strokes bled into glyph crops or trimmed valid glyph pixels.
5. **No per-icon optical normalization** — wide vs tall glyphs appeared at inconsistent visual sizes inside 12–32px UI targets.

**Repair:** per-icon luminance-to-alpha extraction → individual 256×256 transparent PNGs → \`<img>\` rendering with optional registry \`opticalScale\`.
`.trim();

async function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing labeled source sheet: ${SOURCE_REL}`);
  }

  const sourceHash = sha256File(sourcePath);
  const meta = await sharp(sourcePath).metadata();
  const { width, height } = meta;
  if (!width || !height) throw new Error('Unable to read source dimensions');

  const registrySource = fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8');
  const registryEntries = parseRegistryEntries(registrySource);
  if (registryEntries.length !== ROWS * COLS) {
    throw new Error(`Registry has ${registryEntries.length} entries; expected ${ROWS * COLS}`);
  }

  let overrides = {};
  const overridesPath = path.join(ROOT, OVERRIDES_REL);
  if (fs.existsSync(overridesPath)) {
    overrides = (await import(overridesPath)).default ?? {};
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const results = [];
  for (const entry of registryEntries) {
    const result = await extractIcon(entry, sourcePath, width, height, overrides[entry.key]);
    results.push(result);
    console.log(
      `  ✓ ${entry.key.padEnd(16)} conf=${result.confidence.toFixed(2)} px=${result.glyphPixels}`,
    );
  }

  fs.writeFileSync(
    path.join(ROOT, METADATA_REL),
    JSON.stringify({ sourceSha256: sourceHash, icons: results }, null, 2),
  );

  await buildContactSheet(results);
  writeManifest(results, sourceHash);
  writeConfig(results, sourceHash, width, height);
  writeQaDoc(results, sourceHash, FORENSIC_AUDIT);
  fs.writeFileSync(path.join(ROOT, SOURCE_HASH_REL), `${sourceHash}\n`);

  console.log('\nExperience Lab icons extracted');
  console.log(`  source: ${SOURCE_REL} ${width}x${height}`);
  console.log(`  output: ${OUTPUT_DIR_REL}/ (${results.length} PNGs @ ${OUTPUT_CANVAS}px)`);
  console.log(`  contact: ${CONTACT_SHEET_REL}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
