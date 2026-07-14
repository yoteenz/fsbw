#!/usr/bin/env node
/**
 * Generate v6 Studio World icons from founder unlabeled source + grid calibration only.
 * No label removal · no OCR · no automatic crop inference · no labeled catalog reads.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const UNLABELED_REL = 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png';
const LABELED_REL = 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png';
const TWIN_REL = 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png';
const CALIBRATION_REL =
  'src/features/studio-world/icons/grid-calibration/studio-world-icon-grid-calibration-canonical.json';
const REGISTRY_REL = 'src/features/studio-world/icons/experience-lab-icon-registry.ts';
const OUTPUT_DIR_REL = 'src/assets/studio-world/experience-lab/icons/generated-v6';
const ASSETS_TS = 'src/features/studio-world/icons/experience-lab-icon-assets.generated.ts';
const METADATA_JSON = 'src/features/studio-world/icons/experience-lab-icon-extraction-metadata.generated.json';
const SPRITE_CONFIG = 'src/features/studio-world/icons/experience-lab-icon-sprite.config.ts';
const PARITY_JSON = 'src/features/studio-world/icons/studio-world-icon-runtime-parity.generated.json';
const PARITY_DOC = 'docs/studio-os/design-system/STUDIO_WORLD_ICON_RUNTIME_PARITY.md';
const CONTACT_SHEET = `${OUTPUT_DIR_REL}/_contact-sheet.png`;
const FOUNDER_SHEET = `${OUTPUT_DIR_REL}/_founder-priority-comparison.png`;
const V6_VERSION = 'studio-world-icons-v6-grid-calibration';

const OUTPUT_CANVAS = 512;
const GLYPH_PADDING = 18;
const BLACK_LUM = 28;
const WHITE_LUM = 235;
const EDGE_RING = 2;

const FOUNDER_PRIORITY = new Set([
  'experienceLab', 'blueprint', 'construction', 'materials', 'lighting', 'camera',
  'zoomIn', 'analytics', 'permissions', 'playback', 'perspective', 'terminal',
  'dashboard', 'attachments', 'team', 'share', 'diagnostics',
]);

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

function parseRegistry() {
  const text = fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8');
  const entries = [];
  const blockRe = /(\w+):\s*\{[^}]*sourceLabel:\s*'([^']+)'[^}]*row:\s*(\d+)[^}]*column:\s*(\d+)/gs;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    entries.push({ key: m[1], sourceLabel: m[2], row: Number(m[3]), column: Number(m[4]) });
  }
  return entries;
}

function loadCalibration() {
  const cal = JSON.parse(fs.readFileSync(path.join(ROOT, CALIBRATION_REL), 'utf8'));
  if (!cal.canonical) {
    console.warn('[v6] Warning: calibration JSON is not marked canonical — generating preview-quality assets');
  }
  return cal;
}

function resolveContentRect(cal) {
  const left = Math.round(cal.outerLeft * cal.sourceWidth);
  const top = Math.round(cal.outerTop * cal.sourceHeight);
  const right = Math.round(cal.sourceWidth * (1 - cal.outerRight));
  const bottom = Math.round(cal.sourceHeight * (1 - cal.outerBottom));
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function boundaryPixel(normalized, origin, span) {
  return origin + Math.round(normalized * span);
}

function resolveCellRect(cal, row, column) {
  const content = resolveContentRect(cal);
  const rowPad = cal.rowPadding[row] ?? { top: 0, bottom: 0 };
  const colPad = cal.columnPadding[column] ?? { left: 0, right: 0 };
  const rowOffset = cal.rowOffsets[row] ?? 0;
  const colOffset = cal.columnOffsets[column] ?? 0;

  let left = boundaryPixel(cal.columnBoundaries[column], content.left, content.width)
    + (colPad.left ?? 0) + colOffset;
  let right = boundaryPixel(cal.columnBoundaries[column + 1], content.left, content.width)
    - (colPad.right ?? 0) + colOffset;
  let top = boundaryPixel(cal.rowBoundaries[row], content.top, content.height)
    + (rowPad.top ?? 0) + rowOffset;
  let bottom = boundaryPixel(cal.rowBoundaries[row + 1], content.top, content.height)
    - (rowPad.bottom ?? 0) + rowOffset;

  const override = (cal.cellOverrides ?? []).find(
    (o) => o.enabled && o.row === row && o.column === column,
  );
  if (override) {
    left += override.insetLeft + override.offsetX;
    right -= override.insetRight;
    top += override.insetTop + override.offsetY;
    bottom -= override.insetBottom;
    if (override.scale !== 1) {
      const cx = (left + right) / 2;
      const cy = (top + bottom) / 2;
      const halfW = ((right - left) * override.scale) / 2;
      const halfH = ((bottom - top) * override.scale) / 2;
      left = Math.round(cx - halfW);
      right = Math.round(cx + halfW);
      top = Math.round(cy - halfH);
      bottom = Math.round(cy + halfH);
    }
  }

  return {
    left: Math.max(0, left),
    top: Math.max(0, top),
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
    hasOverride: Boolean(override),
  };
}

function validateCalibration(cal) {
  const errors = [];
  if (cal.rowCount !== 8) errors.push('rowCount must be 8');
  if (cal.columnCount !== 8) errors.push('columnCount must be 8');
  if (cal.rowBoundaries.length !== 9) errors.push('rowBoundaries must have 9 entries');
  if (cal.columnBoundaries.length !== 9) errors.push('columnBoundaries must have 9 entries');
  for (let i = 1; i < cal.rowBoundaries.length; i += 1) {
    if (cal.rowBoundaries[i] <= cal.rowBoundaries[i - 1]) errors.push('row boundaries not ordered');
  }
  for (let i = 1; i < cal.columnBoundaries.length; i += 1) {
    if (cal.columnBoundaries[i] <= cal.columnBoundaries[i - 1]) errors.push('column boundaries not ordered');
  }
  if (cal.sourceAssetPath.includes('catalog-labeled')) errors.push('forbidden labeled source');
  if (cal.sourceAssetPath.includes('unlabeled-twin')) errors.push('forbidden twin source');
  return errors;
}

function glyphBounds(rgba, w, h, channels) {
  let minX = w, maxX = 0, minY = h, maxYFound = 0, count = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * channels;
      if (alphaFromLuminance(rgba[i], rgba[i + 1], rgba[i + 2]) >= 24) {
        count += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxYFound = Math.max(maxYFound, y);
      }
    }
  }
  if (count < 20) return null;
  return { minX, maxX, minY, maxY: maxYFound, count };
}

async function cellToTransparentPng(sourcePath, cal, entry) {
  const cell = resolveCellRect(cal, entry.row, entry.column);
  const { data, info } = await sharp(sourcePath)
    .extract({ left: cell.left, top: cell.top, width: cell.width, height: cell.height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const bounds = glyphBounds(data, width, height, channels);
  if (!bounds) return { ok: false, reason: 'blank-cell', cell };

  const pad = GLYPH_PADDING;
  const x0 = Math.max(0, bounds.minX - pad);
  const y0 = Math.max(0, bounds.minY - pad);
  const x1 = Math.min(width - 1, bounds.maxX + pad);
  const y1 = Math.min(height - 1, bounds.maxY + pad);
  const cropW = x1 - x0 + 1;
  const cropH = y1 - y0 + 1;

  const { data: cropData, info: cropInfo } = await sharp(sourcePath)
    .extract({ left: cell.left + x0, top: cell.top + y0, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(cropInfo.width * cropInfo.height * 4);
  let fgPixels = 0;
  let edgePixels = 0;
  for (let y = 0; y < cropInfo.height; y += 1) {
    for (let x = 0; x < cropInfo.width; x += 1) {
      const i = (y * cropInfo.width + x) * cropInfo.channels;
      const a = alphaFromLuminance(cropData[i], cropData[i + 1], cropData[i + 2]);
      const oi = (y * cropInfo.width + x) * 4;
      if (a > 0) {
        fgPixels += 1;
        out[oi] = cropData[i];
        out[oi + 1] = cropData[i + 1];
        out[oi + 2] = cropData[i + 2];
        out[oi + 3] = a;
        if (x < EDGE_RING || y < EDGE_RING || x >= cropInfo.width - EDGE_RING || y >= cropInfo.height - EDGE_RING) {
          edgePixels += 1;
        }
      }
    }
  }

  if (fgPixels < 24) return { ok: false, reason: 'blank-output', cell };
  if (edgePixels > fgPixels * 0.55) return { ok: false, reason: 'edge-touch', cell };

  const scale = Math.min((OUTPUT_CANVAS - pad * 2) / cropInfo.width, (OUTPUT_CANVAS - pad * 2) / cropInfo.height);
  const outW = Math.max(1, Math.round(cropInfo.width * scale));
  const outH = Math.max(1, Math.round(cropInfo.height * scale));
  const padTop = Math.floor((OUTPUT_CANVAS - outH) / 2);
  const padLeft = Math.floor((OUTPUT_CANVAS - outW) / 2);

  const resized = await sharp(out, { raw: { width: cropInfo.width, height: cropInfo.height, channels: 4 } })
    .resize(outW, outH, { fit: 'inside' })
    .png()
    .toBuffer();

  const png = await sharp({
    create: { width: OUTPUT_CANVAS, height: OUTPUT_CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, left: padLeft, top: padTop }])
    .png()
    .toBuffer();

  return {
    ok: true,
    png,
    fgPixels,
    cell,
    contentSha256: crypto.createHash('sha256').update(png).digest('hex'),
  };
}

function categoryForRow(row) {
  if (row === 0) return 'studio-modes';
  if (row === 1) return 'project-review';
  if (row === 2) return 'playback';
  if (row === 3) return 'viewport-tools';
  if (row === 4) return 'inspector';
  if (row === 5) return 'data-sharing';
  if (row === 6) return 'collaboration';
  return 'system';
}

function writeAssetsTs(results, labeledSha, sourceSha, bundleHash, calVersion) {
  const imports = results
    .filter((r) => r.generated)
    .map((r) => `import ${r.key}Asset from '../../../assets/studio-world/experience-lab/icons/generated-v6/${r.filename}';`)
    .join('\n');
  const entries = results
    .filter((r) => r.generated)
    .map(
      (r) => `  ${r.key}: {
    src: ${r.key}Asset,
    sourceLabel: '${r.sourceLabel}',
    category: '${r.category}',
    confidence: 1,
    auditStatus: '${r.runtimeStatus}',
    contentSha256: '${r.contentSha256}',
    approved: ${r.approved},
    cropManifestVersion: '${V6_VERSION}',
    sourceRole: 'unlabeled-grid-calibrated',
    parityStatus: '${r.runtimeStatus}',
    hasCellOverride: ${r.hasOverride},
  }`,
    )
    .join(',\n');

  const body = `/** Generated by scripts/generate-studio-world-icons-from-grid-calibration.mjs — v6 grid calibration only. */
import type { ExperienceLabIconName } from './experience-lab-icon-registry';

${imports}

export type ExperienceLabIconAssetEntry = {
  src: string;
  sourceLabel: string;
  category: string;
  confidence: number;
  auditStatus: 'PASS' | 'WARN' | 'FAIL' | 'PENDING';
  contentSha256: string;
  approved: boolean;
  cropManifestVersion: string;
  sourceRole: 'unlabeled-grid-calibrated';
  parityStatus: 'PASS' | 'WARN' | 'FAIL';
  hasCellOverride: boolean;
};

export const EXPERIENCE_LAB_ICON_ASSETS: Record<ExperienceLabIconName, ExperienceLabIconAssetEntry> = {
${entries}
} as Record<ExperienceLabIconName, ExperienceLabIconAssetEntry>;

export const EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256 = '${sourceSha}';
export const EXPERIENCE_LAB_ICON_LABELED_CATALOG_SHA256 = '${labeledSha}';
export const EXPERIENCE_LAB_ICON_EXTRACTION_VERSION = '${V6_VERSION}';
export const EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION = '${V6_VERSION}';
export const EXPERIENCE_LAB_ICON_BUNDLE_SHA256 = '${bundleHash}';
export const EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED = false;
export const EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN = true;
export const EXPERIENCE_LAB_ICON_V3_PIPELINE_RETIRED = true;
export const EXPERIENCE_LAB_ICON_V4_PIPELINE_RETIRED = true;
export const EXPERIENCE_LAB_ICON_V5_PIPELINE_RETIRED = true;
export const EXPERIENCE_LAB_ICON_OUTPUT_CANVAS = ${OUTPUT_CANVAS};
export const EXPERIENCE_LAB_ICON_ASSET_DIR = 'generated-v6';
export const EXPERIENCE_LAB_ICON_SOURCE_ROLE = 'unlabeled-grid-calibrated' as const;
export const EXPERIENCE_LAB_ICON_GRID_CALIBRATION_VERSION = '${calVersion}';
export const EXPERIENCE_LAB_ICON_RETIRED_TWIN_SHA256 = '96a179e4ac77626f9d59be111486eda69176a5b245749827d8749a4663e0e96b';
`;

  fs.writeFileSync(path.join(ROOT, ASSETS_TS), body);
}

function writeSpriteConfig(labeledSha, sourceSha, bundleHash, summary, calVersion) {
  const body = `/** Sprite config — v6 grid-calibrated unlabeled extraction (v2–v5 retired from production). */
import labeledCatalogUrl from '../../../assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png';
import unlabeledSourceUrl from '../../../assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png';

export const EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png';

export function resolveExperienceLabIconSourceLabeledUrl(): string {
  return labeledCatalogUrl;
}

export function resolveExperienceLabIconSourceUnlabeledUrl(): string {
  return unlabeledSourceUrl;
}

/** @deprecated retired twin — reference/rollback only */
export function resolveExperienceLabIconSourceUnlabeledTwinUrl(): string {
  return unlabeledSourceUrl;
}

export const EXPERIENCE_LAB_ICON_SPRITE_CONFIG = {
  labeledCatalogPath: 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png',
  unlabeledSourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
  retiredTwinPath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png',
  sourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
  labeledStoragePath: EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH,
  generatedDir: 'src/assets/studio-world/experience-lab/icons/generated-v6',
  sourceWidth: 1402,
  sourceHeight: 1122,
  rows: 8,
  columns: 8,
  outputCanvas: 512,
  labeledCatalogSha256: '${labeledSha}',
  sourceSha256: '${sourceSha}',
  bundleSha256: '${bundleHash}',
  extractionVersion: '${V6_VERSION}',
  opticalLockVersion: '${V6_VERSION}',
  gridCalibrationVersion: '${calVersion}',
  lockdownCertified: false,
  v2PipelineFrozen: true,
  v3PipelineRetired: true,
  v4PipelineRetired: true,
  v5PipelineRetired: true,
  iconCount: 64,
  auditPass: ${summary.runtimePass},
  auditWarn: ${summary.runtimeWarn},
  auditFail: ${summary.runtimeFail},
  mode: 'grid-calibration-v6' as const,
  sourceRole: 'unlabeled-grid-calibrated' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
`;
  fs.writeFileSync(path.join(ROOT, SPRITE_CONFIG), body);
}

async function buildContactSheet(results, outputDir, filename) {
  const thumb = 128;
  const sheetW = 8 * thumb;
  const sheetH = 8 * thumb;
  const sheet = Buffer.alloc(sheetW * sheetH * 4, 0);
  for (let i = 0; i < sheet.length; i += 4) {
    sheet[i] = 14;
    sheet[i + 1] = 14;
    sheet[i + 2] = 16;
    sheet[i + 3] = 255;
  }
  for (const item of results) {
    if (!item.generated) continue;
    const src = path.join(outputDir, item.filename);
    if (!fs.existsSync(src)) continue;
    const resized = await sharp(src).resize(thumb - 20, thumb - 28, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const ox = item.column * thumb + Math.floor((thumb - resized.info.width) / 2);
    const oy = item.row * thumb + 8;
    const { data, info } = resized;
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const si = (y * info.width + x) * 4;
        const a = data[si + 3];
        if (!a) continue;
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
  await sharp(sheet, { raw: { width: sheetW, height: sheetH, channels: 4 } }).png().toFile(path.join(ROOT, filename));
}

async function main() {
  const sourcePath = path.join(ROOT, UNLABELED_REL);
  const labeledPath = path.join(ROOT, LABELED_REL);
  if (!fs.existsSync(sourcePath)) throw new Error('Missing unlabeled source pack');
  if (fs.existsSync(path.join(ROOT, TWIN_REL))) {
    console.warn('[v6] Retired twin exists — not used for extraction');
  }

  const cal = loadCalibration();
  const calErrors = validateCalibration(cal);
  if (calErrors.length) throw new Error(`Invalid calibration: ${calErrors.join('; ')}`);

  const labeledSha = crypto.createHash('sha256').update(fs.readFileSync(labeledPath)).digest('hex');
  const sourceSha = crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex');

  const outputDir = path.join(ROOT, OUTPUT_DIR_REL);
  fs.mkdirSync(outputDir, { recursive: true });

  const registry = parseRegistry();
  if (registry.length !== 64) throw new Error(`Expected 64 registry entries, got ${registry.length}`);

  const results = [];
  const hashes = [];

  for (const entry of registry) {
    const filename = iconKeyToFilename(entry.key);
    const out = await cellToTransparentPng(sourcePath, cal, entry);
    let generated = false;
    let runtimeStatus = 'FAIL';
    let contentSha256 = '';
    let failReason = '';
    let approved = false;

    if (out.ok) {
      fs.writeFileSync(path.join(outputDir, filename), out.png);
      contentSha256 = out.contentSha256;
      hashes.push(contentSha256);
      generated = true;
      runtimeStatus = 'PASS';
      approved = cal.canonical;
    } else {
      failReason = out.reason ?? 'extract-fail';
    }

    results.push({
      key: entry.key,
      sourceLabel: entry.sourceLabel,
      filename,
      row: entry.row,
      column: entry.column,
      category: categoryForRow(entry.row),
      founderPriority: FOUNDER_PRIORITY.has(entry.key),
      generated,
      runtimeStatus,
      contentSha256,
      failReason,
      approved,
      hasOverride: out.cell?.hasOverride ?? false,
      cellRect: out.cell,
    });
  }

  const bundleHash = crypto.createHash('sha256').update(hashes.sort().join('')).digest('hex');
  const summary = {
    runtimePass: results.filter((r) => r.runtimeStatus === 'PASS').length,
    runtimeWarn: results.filter((r) => r.runtimeStatus === 'WARN').length,
    runtimeFail: results.filter((r) => r.runtimeStatus === 'FAIL').length,
    generated: results.filter((r) => r.generated).length,
  };

  writeAssetsTs(results, labeledSha, sourceSha, bundleHash, cal.calibrationVersion);
  writeSpriteConfig(labeledSha, sourceSha, bundleHash, summary, cal.calibrationVersion);

  fs.writeFileSync(
    path.join(ROOT, METADATA_JSON),
    JSON.stringify({
      version: V6_VERSION,
      pipeline: 'grid-calibration-v6',
      sourceRole: 'unlabeled-grid-calibrated',
      labeledSha256: labeledSha,
      sourceSha256: sourceSha,
      calibrationVersion: cal.calibrationVersion,
      calibrationCanonical: cal.canonical,
      ...summary,
      icons: results,
    }, null, 2),
  );

  fs.writeFileSync(
    path.join(ROOT, PARITY_JSON),
    JSON.stringify({
      version: V6_VERSION,
      labeledSha256: labeledSha,
      sourceSha256: sourceSha,
      calibrationVersion: cal.calibrationVersion,
      note: 'Automated validation does not prove visual correctness — founder approval required',
      ...summary,
      icons: results,
    }, null, 2),
  );

  const parityLines = results
    .map((r) => `| ${r.sourceLabel} | ${r.key} | ${r.row},${r.column} | ${r.runtimeStatus} | ${r.hasOverride ? 'OVERRIDE' : '—'} | ${r.failReason || 'ok'} |`)
    .join('\n');

  fs.writeFileSync(
    path.join(ROOT, PARITY_DOC),
    `# Studio World Icon Runtime Parity (v6 grid calibration)\n\nVersion: ${V6_VERSION}\n\nCalibration: \`${cal.calibrationVersion}\` (canonical=${cal.canonical})\n\nUnlabeled source sha256: \`${sourceSha}\`\n\nLabeled catalog sha256 (reference only): \`${labeledSha}\`\n\n## Summary\n\n- Generated: ${summary.generated}/64\n- Runtime PASS: ${summary.runtimePass}\n- Runtime WARN: ${summary.runtimeWarn}\n- Runtime FAIL: ${summary.runtimeFail}\n\n| Label | Key | Row,Col | Runtime | Override | Notes |\n|---|---|---|---|---|---|\n${parityLines}\n`,
  );

  await buildContactSheet(results, outputDir, CONTACT_SHEET);
  const founderResults = results.filter((r) => r.founderPriority);
  await buildContactSheet(founderResults, outputDir, FOUNDER_SHEET);

  fs.writeFileSync(
    path.join(outputDir, '_generation-summary.json'),
    JSON.stringify({ version: V6_VERSION, calibration: cal.calibrationVersion, ...summary, bundleSha256: bundleHash }, null, 2),
  );

  console.log(`[v6] Generated ${summary.generated}/64 icons → ${OUTPUT_DIR_REL}`);
  if (summary.runtimeFail > 0) {
    console.warn(`[v6] ${summary.runtimeFail} icons failed extraction`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
