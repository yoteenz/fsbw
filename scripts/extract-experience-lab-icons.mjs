#!/usr/bin/env node
/**
 * Experience Lab icon extraction v2 — per-glyph CC classification, label-gap detection,
 * text-contamination audit, and centralized per-icon overrides.
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
const FIDELITY_DOC_REL = 'docs/studio-os/design-system/EXPERIENCE_LAB_ICON_FIDELITY_REPAIR.md';
const FAILURE_MANIFEST_REL = 'src/assets/studio-world/experience-lab/icons/generated/_failure-manifest.json';

export const EXTRACTION_PIPELINE_VERSION = 'experience-lab-icons-v2';

const ROWS = 8;
const COLS = 8;
const OUTPUT_CANVAS = 256;
const DEFAULT_SAFE_PADDING = 22;
const BLACK_LUM = 28;
const WHITE_LUM = 235;
const MIN_GLYPH_PIXELS = 48;
const MIN_CONFIDENCE = 0.55;
const EDGE_RING = 2;
const TEXT_CONTAMINATION_THRESHOLD = 0.22;

const FOUNDER_REPORTED_KEYS = new Set([
  'zoomIn',
  'materials',
  'analytics',
  'permissions',
  'camera',
  'playback',
  'perspective',
  'terminal',
  'dashboard',
]);

const sourcePath = path.join(ROOT, SOURCE_REL);
const outputDir = path.join(ROOT, OUTPUT_DIR_REL);

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

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

function buildRowStats(rgba, cellW, cellH, channels, minAlpha = 24) {
  const rows = [];
  for (let y = 0; y < cellH; y += 1) {
    let bright = 0;
    let minX = cellW;
    let maxX = 0;
    for (let x = 0; x < cellW; x += 1) {
      const i = (y * cellW + x) * channels;
      const a = alphaFromLuminance(rgba[i], rgba[i + 1], rgba[i + 2], minAlpha);
      if (a >= minAlpha) {
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

/** Detect printed label band from bottom using spread + density signals. */
function detectLabelBandStart(rows, cellW, cellH) {
  const labelZoneStart = Math.floor(cellH * 0.45);
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

  if (labelRows.length === 0) return Math.floor(cellH * 0.82);
  return Math.max(8, Math.min(...labelRows) - 3);
}

/** Largest horizontal whitespace gap directly above the detected label band. */
function detectLabelGapRow(rows, cellH, labelBandStart) {
  const searchStart = Math.max(Math.floor(cellH * 0.5), labelBandStart - 42);
  const searchEnd = Math.min(labelBandStart - 2, Math.floor(cellH * 0.86));
  if (searchStart >= searchEnd) return null;

  let bestGap = null;
  let bestScore = -1;

  for (let y = searchStart; y < searchEnd - 3; y += 1) {
    const window = rows.slice(y, y + 3);
    const avgBright = window.reduce((s, r) => s + r.bright, 0) / window.length;
    const below = rows.slice(y + 3, Math.min(cellH, y + 18));
    const belowBright = below.reduce((s, r) => s + r.bright, 0) / Math.max(1, below.length);
    const belowLooksLikeLabel = below.some(
      (r) => r.bright >= 10 && r.spread >= Math.max(14, Math.floor(cellH * 0.12)),
    );
    if (avgBright <= 6 && belowBright >= 12 && belowLooksLikeLabel) {
      const score = belowBright - avgBright;
      if (score > bestScore) {
        bestScore = score;
        bestGap = y;
      }
    }
  }
  return bestGap;
}

function resolveLabelStart(rgba, cellW, cellH, channels, override) {
  if (override?.labelStart != null) return override.labelStart;
  if (override?.labelExclusionY != null) {
    return Math.max(8, Math.floor(cellH * override.labelExclusionY));
  }

  const rows = buildRowStats(rgba, cellW, cellH, channels);
  const bandStart = detectLabelBandStart(rows, cellW, cellH);
  const gapRow = detectLabelGapRow(rows, cellH, bandStart);
  if (gapRow != null && gapRow < bandStart) return Math.max(8, gapRow);
  return bandStart;
}

function findConnectedComponents(mask, cellW, cellH) {
  const visited = new Uint8Array(cellW * cellH);
  const components = [];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (let sy = 0; sy < cellH; sy += 1) {
    for (let sx = 0; sx < cellW; sx += 1) {
      const start = sy * cellW + sx;
      if (!mask[start] || visited[start]) continue;

      const pixels = [];
      const stack = [[sx, sy]];
      visited[start] = 1;
      let minX = sx;
      let maxX = sx;
      let minY = sy;
      let maxY = sy;

      while (stack.length) {
        const [x, y] = stack.pop();
        pixels.push([x, y]);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        for (const [dx, dy] of dirs) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellH) continue;
          const ni = ny * cellW + nx;
          if (!mask[ni] || visited[ni]) continue;
          visited[ni] = 1;
          stack.push([nx, ny]);
        }
      }

      components.push({
        pixels: pixels.length,
        minX,
        maxX,
        minY,
        maxY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
      });
    }
  }
  return components;
}

function classifyGlyphComponents(components, cellW, cellH, labelStart) {
  const labelBaselines = components
    .filter((c) => c.height <= 14 && c.minY >= labelStart - 18 && c.centerY >= cellH * 0.48)
    .map((c) => c.minY);
  const labelBaseline =
    labelBaselines.length > 0
      ? Math.round(labelBaselines.reduce((s, v) => s + v, 0) / labelBaselines.length)
      : labelStart;

  const glyph = [];
  const label = [];

  for (const c of components) {
    const shortStroke = c.height <= 14 && c.width <= Math.max(14, cellW * 0.12);
    const onLabelBaseline = Math.abs(c.minY - labelBaseline) <= 4 && c.centerY >= cellH * 0.48;
    const belowGap = c.minY >= labelStart - 2;
    const tinyFragment = c.pixels < 28 && shortStroke;

    if ((shortStroke && onLabelBaseline) || (belowGap && shortStroke) || tinyFragment) {
      label.push(c);
    } else if (c.maxY < labelStart + 1) {
      glyph.push(c);
    } else if (c.height >= 18 && c.centerY < labelStart - 6) {
      glyph.push(c);
    } else {
      label.push(c);
    }
  }

  return { glyph, label, labelBaseline };
}

function boundsFromOverride(override, cellW, cellH, labelStart) {
  if (override?.bounds) return { ...override.bounds };
  if (
    override?.glyphTop != null ||
    override?.glyphBottom != null ||
    override?.glyphLeft != null ||
    override?.glyphRight != null
  ) {
    return {
      minX: Math.max(0, override.glyphLeft ?? 0),
      minY: Math.max(0, override.glyphTop ?? 0),
      maxX: Math.min(cellW - 1, override.glyphRight ?? cellW - 1),
      maxY: Math.min(labelStart - 1, override.glyphBottom ?? labelStart - 1),
    };
  }
  return null;
}

function detectGlyphBounds(rgba, cellW, cellH, channels, labelStart, override) {
  const explicit = boundsFromOverride(override, cellW, cellH, labelStart);
  if (explicit) {
    if (explicit.maxX < explicit.minX || explicit.maxY < explicit.minY) return null;
    return explicit;
  }

  const minAlpha = override?.alphaFloor ?? 24;
  const mask = new Uint8Array(cellW * cellH);
  for (let y = 0; y < labelStart; y += 1) {
    for (let x = 0; x < cellW; x += 1) {
      const i = (y * cellW + x) * channels;
      if (alphaFromLuminance(rgba[i], rgba[i + 1], rgba[i + 2], minAlpha) >= minAlpha) {
        mask[y * cellW + x] = 1;
      }
    }
  }

  const components = findConnectedComponents(mask, cellW, cellH);
  const { glyph } = classifyGlyphComponents(components, cellW, cellH, labelStart);
  const pool = glyph.length > 0 ? glyph : components.filter((c) => c.maxY < labelStart);

  if (pool.length === 0) return null;

  let minX = cellW;
  let minY = labelStart;
  let maxX = 0;
  let maxY = 0;
  for (const c of pool) {
    minX = Math.min(minX, c.minX);
    minY = Math.min(minY, c.minY);
    maxX = Math.max(maxX, c.maxX);
    maxY = Math.max(maxY, c.maxY);
  }

  const padX = Math.max(3, Math.round(cellW * 0.02));
  const padY = Math.max(3, Math.round(cellH * 0.02));
  return {
    minX: Math.max(0, minX - padX),
    minY: Math.max(0, minY - padY),
    maxX: Math.min(cellW - 1, maxX + padX),
    maxY: Math.min(labelStart - 1, maxY + padY),
  };
}

function detectTextContamination(canvasRgba, size, channels) {
  const bottomStart = Math.floor(size * 0.78);
  const mask = new Uint8Array(size * size);
  let total = 0;
  let bottom = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * channels;
      if (canvasRgba[i + 3] > 20) {
        total += 1;
        if (y >= bottomStart) {
          bottom += 1;
          mask[y * size + x] = 1;
        }
      }
    }
  }

  const bottomComponents = findConnectedComponents(mask, size, size).filter((c) => c.minY >= bottomStart);
  const baselineRows = bottomComponents.map((c) => c.minY);
  const baselineSpread =
    baselineRows.length > 1 ? Math.max(...baselineRows) - Math.min(...baselineRows) : 0;
  const narrowStrokes = bottomComponents.filter((c) => c.height <= 14 && c.width <= 12).length;
  const bottomRatio = bottom / Math.max(1, total);
  const wordBand =
    bottomComponents.length >= 4 &&
    narrowStrokes >= 3 &&
    baselineSpread <= 10 &&
    bottom >= 20;
  const letterLikeDensity = narrowStrokes / Math.max(1, bottomComponents.length);
  const score = wordBand
    ? 0.35 + letterLikeDensity * 0.35 + Math.min(0.3, bottom / (size * 3))
    : Math.min(0.18, (bottom / Math.max(1, size * 8)) * 0.18);

  return {
    contaminated: wordBand || score >= TEXT_CONTAMINATION_THRESHOLD,
    score,
    bottomRatio,
    bottomComponents: bottomComponents.length,
    narrowStrokes,
    wordBand,
    totalPixels: total,
  };
}

function computeConfidence({
  glyphPixels,
  canvasPixels,
  edgePixels,
  labelStart,
  cellH,
  bounds,
  contamination,
  overrideApplied,
}) {
  let confidence = 1;
  const occupancy = glyphPixels / canvasPixels;
  if (glyphPixels < MIN_GLYPH_PIXELS) confidence -= 0.45;
  if (occupancy < 0.012) confidence -= 0.35;
  if (occupancy > 0.68) confidence -= 0.25;
  if (edgePixels / Math.max(1, glyphPixels) > 0.08) confidence -= 0.2;
  if (labelStart < cellH * 0.5) confidence -= 0.08;
  if (!bounds) confidence = 0;
  if (contamination.contaminated) confidence -= 0.35;
  if (contamination.bottomRatio > 0.35) confidence -= 0.2;
  if (overrideApplied) confidence = Math.max(confidence, 0.72);
  return Math.max(0, Math.min(1, confidence));
}

function classifyAuditStatus(confidence, contamination, overrideApplied) {
  if (contamination.contaminated || confidence < MIN_CONFIDENCE) return 'FAIL';
  if (contamination.bottomRatio > 0.14 || confidence < 0.82) return 'WARN';
  if (overrideApplied) return 'WARN';
  return 'PASS';
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

async function extractIcon(entry, sourcePath, width, height, override) {
  const safePadding = override?.safePadding ?? DEFAULT_SAFE_PADDING;
  const rect = cellRect(width, height, entry.row, entry.column);
  const cellBuf = await sharp(sourcePath)
    .extract({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const cellW = rect.width;
  const cellH = rect.height;
  const channels = 4;
  const labelStart = resolveLabelStart(cellBuf, cellW, cellH, channels, override);
  const bounds = detectGlyphBounds(cellBuf, cellW, cellH, channels, labelStart, override);

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
      const a = alphaFromLuminance(r, g, b, override?.alphaFloor ?? 24);
      glyphRgba[di] = 255;
      glyphRgba[di + 1] = 255;
      glyphRgba[di + 2] = 255;
      glyphRgba[di + 3] = a;
      if (a > 0) glyphPixels += 1;
    }
  }

  const innerMax = OUTPUT_CANVAS - safePadding * 2;
  const opticalBoost = override?.opticalScale ?? 1;
  const scale = Math.min(innerMax / glyphW, innerMax / glyphH) * opticalBoost;
  const outW = Math.max(1, Math.round(glyphW * scale));
  const outH = Math.max(1, Math.round(glyphH * scale));

  const scaled = await sharp(glyphRgba, { raw: { width: glyphW, height: glyphH, channels: 4 } })
    .resize(outW, outH, { kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const canvas = Buffer.alloc(OUTPUT_CANVAS * OUTPUT_CANVAS * 4, 0);
  const offsetX =
    Math.floor((OUTPUT_CANVAS - outW) / 2) + Math.round(override?.horizontalOffset ?? 0);
  const offsetY =
    Math.floor((OUTPUT_CANVAS - outH) / 2) + Math.round(override?.verticalOffset ?? 0);

  let canvasPixels = 0;
  for (let y = 0; y < outH; y += 1) {
    for (let x = 0; x < outW; x += 1) {
      const si = (y * outW + x) * 4;
      const a = scaled[si + 3];
      if (a === 0) continue;
      const dx = offsetX + x;
      const dy = offsetY + y;
      if (dx < 0 || dy < 0 || dx >= OUTPUT_CANVAS || dy >= OUTPUT_CANVAS) continue;
      const di = (dy * OUTPUT_CANVAS + dx) * 4;
      canvas[di] = scaled[si];
      canvas[di + 1] = scaled[si + 1];
      canvas[di + 2] = scaled[si + 2];
      canvas[di + 3] = a;
      canvasPixels += 1;
    }
  }

  const edgePixels = countEdgeOpaque(canvas, OUTPUT_CANVAS, 4);
  const contamination = detectTextContamination(canvas, OUTPUT_CANVAS, 4);
  const overrideApplied = Boolean(override);
  const confidence = computeConfidence({
    glyphPixels: canvasPixels,
    canvasPixels: OUTPUT_CANVAS * OUTPUT_CANVAS,
    edgePixels,
    labelStart,
    cellH,
    bounds,
    contamination,
    overrideApplied,
  });
  const auditStatus = classifyAuditStatus(confidence, contamination, overrideApplied);

  if (canvasPixels < MIN_GLYPH_PIXELS) {
    throw new Error(`${entry.key}: output nearly blank (${canvasPixels} px)`);
  }
  if (auditStatus === 'FAIL') {
    throw new Error(
      `${entry.key}: extraction failed — conf=${confidence.toFixed(2)} contamination=${contamination.score.toFixed(2)}`,
    );
  }

  const filename = iconKeyToFilename(entry.key);
  const outPath = path.join(outputDir, filename);
  await sharp(canvas, { raw: { width: OUTPUT_CANVAS, height: OUTPUT_CANVAS, channels: 4 } })
    .png()
    .toFile(outPath);

  const fileHash = sha256File(outPath);

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
    overrideApplied,
    auditStatus,
    textContamination: contamination,
    contentSha256: fileHash,
    overrideReason: override?.overrideReason ?? null,
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

function writeManifest(results, sourceHash, bundleHash) {
  const imports = results
    .map(
      (r) =>
        `import ${r.key}Asset from '../../../assets/studio-world/experience-lab/icons/generated/${r.filename}';`,
    )
    .join('\n');

  const entries = results
    .map(
      (r) =>
        `  ${r.key}: {\n    src: ${r.key}Asset,\n    sourceLabel: '${r.sourceLabel}',\n    category: '${r.category}',\n    confidence: ${r.confidence.toFixed(3)},\n    auditStatus: '${r.auditStatus}',\n    contentSha256: '${r.contentSha256}',\n  }`,
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
  auditStatus: 'PASS' | 'WARN' | 'FAIL';
  contentSha256: string;
};

export const EXPERIENCE_LAB_ICON_ASSETS: Record<ExperienceLabIconName, ExperienceLabIconAssetEntry> = {
${entries}
} as Record<ExperienceLabIconName, ExperienceLabIconAssetEntry>;

export const EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256 = '${sourceHash}';
export const EXPERIENCE_LAB_ICON_EXTRACTION_VERSION = '${EXTRACTION_PIPELINE_VERSION}';
export const EXPERIENCE_LAB_ICON_BUNDLE_SHA256 = '${bundleHash}';
export const EXPERIENCE_LAB_ICON_OUTPUT_CANVAS = ${OUTPUT_CANVAS};
`;

  fs.writeFileSync(path.join(ROOT, MANIFEST_REL), body);
}

function writeConfig(meta, sourceHash, width, height, bundleHash, auditSummary) {
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
  bundleSha256: '${bundleHash}',
  extractionVersion: '${EXTRACTION_PIPELINE_VERSION}',
  iconCount: ${meta.length},
  auditPass: ${auditSummary.pass},
  auditWarn: ${auditSummary.warn},
  auditFail: ${auditSummary.fail},
  mode: 'extracted-transparent-png' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
`;
  fs.writeFileSync(path.join(ROOT, CONFIG_REL), body);
}

function writeFidelityDoc(results, sourceHash, forensicRows) {
  const founderRows = results
    .filter((r) => FOUNDER_REPORTED_KEYS.has(r.key))
    .map(
      (r) =>
        `### ${r.sourceLabel} (\`${r.key}\`)

| Stage | Detail |
|---|---|
| Source cell | row ${r.row}, col ${r.column} |
| Glyph bounds | ${r.sourceBounds.minX},${r.sourceBounds.minY} → ${r.sourceBounds.maxX},${r.sourceBounds.maxY} |
| Label cutoff | y=${r.labelStartInCell} |
| Bottom-band ratio | ${r.textContamination.bottomRatio.toFixed(3)} |
| Contamination score | ${r.textContamination.score.toFixed(3)} (${r.textContamination.contaminated ? 'FAIL' : 'clean'}) |
| Override | ${r.overrideApplied ? `yes — ${r.overrideReason}` : 'no'} |
| Audit | **${r.auditStatus}** · conf ${r.confidence.toFixed(2)} |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs \`generated/${r.filename}\` vs QA route sizes.`,
    )
    .join('\n\n');

  const auditCounts = results.reduce(
    (acc, r) => {
      acc[r.auditStatus] += 1;
      return acc;
    },
    { PASS: 0, WARN: 0, FAIL: 0 },
  );

  const body = `# Experience Lab Icon Fidelity Repair

Pipeline: **${EXTRACTION_PIPELINE_VERSION}** · Source SHA256: \`${sourceHash}\`

## Forensic root cause

Prior extraction merged **printed label strokes** into glyph bounding boxes because:

1. Global bottom-up label heuristic mis-estimated \`labelStart\` on navigation-row icons.
2. Connected bright pixels were merged without **glyph vs label** component classification.
3. Confidence formula ignored **bottom-band text contamination** (reported 1.00 while labels remained).

## Repair applied

- Connected-component glyph/label classifier
- Horizontal gap detection between icon and label band
- Per-icon centralized overrides (\`scripts/config/experience-lab-icon-extraction-overrides.ts\`)
- Output text-contamination detector (baseline strip heuristics, no OCR)
- Optical scale registry tuning for undersized glyphs

## 64-icon audit summary

| Status | Count |
|---|---:|
| PASS | ${auditCounts.PASS} |
| WARN | ${auditCounts.WARN} |
| FAIL | ${auditCounts.FAIL} |

## Founder review group

${founderRows}

## Full forensic table

| Key | Label | Row | Col | Status | Conf | Override | Bottom ratio | Contamination |
|---|---|---:|---:|---|---:|---|---:|---:|
${forensicRows}

## Regenerate

\`\`\`bash
npm run experience-lab:build-icons
\`\`\`
`;
  fs.writeFileSync(path.join(ROOT, FIDELITY_DOC_REL), body);
}

function writeQaDoc(results, sourceHash, forensic) {
  const rows = results
    .sort((a, b) => a.row - b.row || a.column - b.column)
    .map(
      (r) =>
        `| ${r.key} | ${r.sourceLabel} | ${r.row} | ${r.column} | ${r.auditStatus} | ${r.confidence.toFixed(2)} | ${r.overrideApplied ? 'yes' : 'no'} | ${r.textContamination.bottomRatio.toFixed(2)} | ![${r.key}](../../../src/assets/studio-world/experience-lab/icons/generated/${r.filename}) |`,
    )
    .join('\n');

  const body = `# Experience Lab Extracted Icon QA

Pipeline version: **${EXTRACTION_PIPELINE_VERSION}**

## Forensic audit — prior sprite corruption

${forensic}

## Canonical labeled source (unchanged)

Path: \`${SOURCE_REL}\`

Storage: \`740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png\`

SHA256: \`${sourceHash}\`

## Generated contact sheet

![Contact sheet](../../../src/assets/studio-world/experience-lab/icons/generated/_contact-sheet.png)

## Per-icon extraction results

| Semantic key | Source label | Row | Col | Audit | Confidence | Override | Bottom ratio | Preview |
|---|---|---:|---:|---|---:|---|---:|---|
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

**Repair (v2):** connected-component glyph/label classification · label-gap detection · per-icon overrides · text-contamination audit · individual 256×256 transparent PNGs · \`<img>\` rendering with registry \`opticalScale\`.
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
      `  ✓ ${entry.key.padEnd(16)} ${result.auditStatus.padEnd(4)} conf=${result.confidence.toFixed(2)} bottom=${result.textContamination.bottomRatio.toFixed(2)}`,
    );
  }

  const bundleHash = crypto
    .createHash('sha256')
    .update(results.map((r) => r.contentSha256).join(''))
    .digest('hex');

  const auditSummary = results.reduce(
    (acc, r) => {
      acc[r.auditStatus.toLowerCase()] += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0 },
  );

  const failureManifest = {
    version: EXTRACTION_PIPELINE_VERSION,
    sourceSha256: sourceHash,
    bundleSha256: bundleHash,
    generatedAt: new Date().toISOString(),
    founderReported: [...FOUNDER_REPORTED_KEYS],
    icons: results.map((r) => ({
      key: r.key,
      auditStatus: r.auditStatus,
      overrideApplied: r.overrideApplied,
      overrideReason: r.overrideReason,
      textContamination: r.textContamination,
      confidence: r.confidence,
    })),
  };

  fs.writeFileSync(
    path.join(ROOT, METADATA_REL),
    JSON.stringify({ version: EXTRACTION_PIPELINE_VERSION, sourceSha256: sourceHash, bundleSha256: bundleHash, icons: results }, null, 2),
  );
  fs.writeFileSync(path.join(ROOT, FAILURE_MANIFEST_REL), JSON.stringify(failureManifest, null, 2));

  await buildContactSheet(results);

  const forensicRows = results
    .sort((a, b) => a.row - b.row || a.column - b.column)
    .map(
      (r) =>
        `| ${r.key} | ${r.sourceLabel} | ${r.row} | ${r.column} | ${r.auditStatus} | ${r.confidence.toFixed(2)} | ${r.overrideApplied ? 'yes' : 'no'} | ${r.textContamination.bottomRatio.toFixed(2)} | ${r.textContamination.score.toFixed(2)} |`,
    )
    .join('\n');

  writeManifest(results, sourceHash, bundleHash);
  writeConfig(results, sourceHash, width, height, bundleHash, auditSummary);
  writeQaDoc(results, sourceHash, FORENSIC_AUDIT);
  writeFidelityDoc(results, sourceHash, forensicRows);
  fs.writeFileSync(path.join(ROOT, SOURCE_HASH_REL), `${sourceHash}\n`);

  console.log('\nExperience Lab icons extracted');
  console.log(`  version: ${EXTRACTION_PIPELINE_VERSION}`);
  console.log(`  source: ${SOURCE_REL} ${width}x${height}`);
  console.log(`  output: ${OUTPUT_DIR_REL}/ (${results.length} PNGs @ ${OUTPUT_CANVAS}px)`);
  console.log(`  audit: PASS=${auditSummary.pass} WARN=${auditSummary.warn} FAIL=${auditSummary.fail}`);
  console.log(`  bundle: ${bundleHash.slice(0, 16)}…`);
  console.log(`  contact: ${CONTACT_SHEET_REL}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
