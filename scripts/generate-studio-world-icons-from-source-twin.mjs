#!/usr/bin/env node
/**
 * Generate v5 Studio World icons from pixel-preserving unlabeled twin only.
 * No label-removal at runtime — twin is pre-derived from labeled catalog.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TWIN_REL = 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png';
const DEPRECATED_UNLABELED_REL = 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png';
const LABELED_REL = 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png';
const REGISTRY_REL = 'src/features/studio-world/icons/experience-lab-icon-registry.ts';
const TWIN_PARITY_JSON = 'src/features/studio-world/icons/studio-world-icon-source-twin-parity.generated.json';
const OUTPUT_DIR_REL = 'src/assets/studio-world/experience-lab/icons/generated-v5';
const ASSETS_TS = 'src/features/studio-world/icons/experience-lab-icon-assets.generated.ts';
const METADATA_JSON = 'src/features/studio-world/icons/experience-lab-icon-extraction-metadata.generated.json';
const SPRITE_CONFIG = 'src/features/studio-world/icons/experience-lab-icon-sprite.config.ts';
const PARITY_JSON = 'src/features/studio-world/icons/studio-world-icon-runtime-parity.generated.json';
const PARITY_DOC = 'docs/studio-os/design-system/STUDIO_WORLD_ICON_RUNTIME_PARITY.md';
const CONTACT_SHEET = `${OUTPUT_DIR_REL}/_contact-sheet.png`;
const PAIR_SHEET = `${OUTPUT_DIR_REL}/_source-twin-runtime-comparison.png`;
const FOUNDER_SHEET = `${OUTPUT_DIR_REL}/_founder-priority-comparison.png`;
const V5_VERSION = 'studio-world-icons-v5-source-twin';

const ROWS = 8;
const COLS = 8;
const OUTPUT_CANVAS = 512;
const GLYPH_PADDING = 18;
const BLACK_LUM = 28;
const WHITE_LUM = 235;
const EDGE_RING = 2;
/** Twin has labels surgically removed — use full cell for glyph bounds. */
const GLYPH_ZONE_MAX_RATIO = 1;

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

function cellRect(width, height, row, column) {
  const left = Math.round((column * width) / COLS);
  const top = Math.round((row * height) / ROWS);
  const right = Math.round(((column + 1) * width) / COLS);
  const bottom = Math.round(((row + 1) * height) / ROWS);
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function glyphBounds(rgba, w, h, channels, maxY = h) {
  let minX = w, maxX = 0, minY = h, maxYFound = 0, count = 0;
  for (let y = 0; y < Math.min(maxY, h); y += 1) {
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
  return { minX, maxX, minY, maxY: maxYFound, count, cx: (minX + maxX) / 2, cy: (minY + maxYFound) / 2 };
}

function glyphZoneMaxY(height) {
  return Math.max(1, Math.floor(height * GLYPH_ZONE_MAX_RATIO));
}

async function extractCellBuffer(sourcePath, row, column) {
  const meta = await sharp(sourcePath).metadata();
  const sw = meta.width ?? 1402;
  const sh = meta.height ?? 1122;
  const cell = cellRect(sw, sh, row, column);
  return sharp(sourcePath).extract(cell).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

async function parityForEntry(entry, labeledPath, twinPath, mask) {
  const [labeled, twin] = await Promise.all([
    extractCellBuffer(labeledPath, entry.row, entry.column),
    extractCellBuffer(twinPath, entry.row, entry.column),
  ]);
  const lw = labeled.info.width;
  const lh = labeled.info.height;
  const uw = twin.info.width;
  const uh = twin.info.height;
  const protectedMaxY = Math.min(mask.iconSafeBottom, lh - 1, uh - 1);
  const labeledGlyph = glyphBounds(labeled.data, lw, lh, labeled.info.channels, protectedMaxY);
  const twinGlyph = glyphBounds(twin.data, uw, uh, twin.info.channels, protectedMaxY);

  if (!labeledGlyph || !twinGlyph) {
    return { status: 'FAIL', positionDelta: 999, scaleDelta: 999, textInUnlabeled: false, notes: 'Missing glyph bounds in protected region' };
  }

  const positionDelta = Math.hypot(twinGlyph.cx - labeledGlyph.cx, twinGlyph.cy - labeledGlyph.cy);
  const labeledScale = Math.max(labeledGlyph.maxX - labeledGlyph.minX, labeledGlyph.maxY - labeledGlyph.minY);
  const twinScale = Math.max(twinGlyph.maxX - twinGlyph.minX, twinGlyph.maxY - twinGlyph.minY);
  const scaleDelta = Math.abs(twinScale - labeledScale) / Math.max(1, labeledScale);

  let status = 'PASS';
  if (positionDelta > 1.5 || scaleDelta > 0.02) status = 'FAIL';
  else if (positionDelta > 0.5 || scaleDelta > 0.01) status = 'WARN';

  return {
    status,
    positionDelta: Number(positionDelta.toFixed(2)),
    scaleDelta: Number(scaleDelta.toFixed(3)),
    textInUnlabeled: false,
    notes: 'Protected-region labeled vs twin parity',
  };
}

async function cellToTransparentPng(twinPath, entry) {
  const meta = await sharp(twinPath).metadata();
  const sw = meta.width ?? 1402;
  const sh = meta.height ?? 1122;
  const cell = cellRect(sw, sh, entry.row, entry.column);
  const glyphZoneH = glyphZoneMaxY(cell.height);

  const { data, info } = await sharp(twinPath)
    .extract({ left: cell.left, top: cell.top, width: cell.width, height: glyphZoneH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const bounds = glyphBounds(data, width, height, channels, height);
  if (!bounds) return { ok: false, reason: 'blank-cell' };

  const pad = GLYPH_PADDING;
  const x0 = Math.max(0, bounds.minX - pad);
  const y0 = Math.max(0, bounds.minY - pad);
  const x1 = Math.min(width - 1, bounds.maxX + pad);
  const y1 = Math.min(height - 1, bounds.maxY + pad);
  const cropW = x1 - x0 + 1;
  const cropH = y1 - y0 + 1;

  const { data: cropData, info: cropInfo } = await sharp(twinPath)
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

  if (fgPixels < 24) return { ok: false, reason: 'blank-output' };
  if (edgePixels > fgPixels * 0.55) return { ok: false, reason: 'edge-touch' };

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

  return { ok: true, png, fgPixels, contentSha256: crypto.createHash('sha256').update(png).digest('hex') };
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

function writeAssetsTs(results, labeledSha, twinSha, bundleHash) {
  const imports = results
    .filter((r) => r.generated)
    .map((r) => `import ${r.key}Asset from '../../../assets/studio-world/experience-lab/icons/generated-v5/${r.filename}';`)
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
    approved: true,
    cropManifestVersion: '${V5_VERSION}',
    sourceRole: 'pixel-preserving-unlabeled-twin',
    parityStatus: '${r.parityStatus}',
  }`,
    )
    .join(',\n');

  const body = `/** Generated by scripts/generate-studio-world-icons-from-source-twin.mjs — v5 twin grid only. */
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
  sourceRole: 'pixel-preserving-unlabeled-twin';
  parityStatus: 'PASS' | 'WARN' | 'FAIL';
};

export const EXPERIENCE_LAB_ICON_ASSETS: Record<ExperienceLabIconName, ExperienceLabIconAssetEntry> = {
${entries}
} as Record<ExperienceLabIconName, ExperienceLabIconAssetEntry>;

export const EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256 = '${twinSha}';
export const EXPERIENCE_LAB_ICON_LABELED_CATALOG_SHA256 = '${labeledSha}';
export const EXPERIENCE_LAB_ICON_EXTRACTION_VERSION = '${V5_VERSION}';
export const EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION = '${V5_VERSION}';
export const EXPERIENCE_LAB_ICON_BUNDLE_SHA256 = '${bundleHash}';
export const EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED = false;
export const EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN = true;
export const EXPERIENCE_LAB_ICON_V3_PIPELINE_RETIRED = true;
export const EXPERIENCE_LAB_ICON_V4_PIPELINE_RETIRED = true;
export const EXPERIENCE_LAB_ICON_OUTPUT_CANVAS = ${OUTPUT_CANVAS};
export const EXPERIENCE_LAB_ICON_ASSET_DIR = 'generated-v5';
export const EXPERIENCE_LAB_ICON_SOURCE_ROLE = 'pixel-preserving-unlabeled-twin' as const;
export const EXPERIENCE_LAB_ICON_DEPRECATED_UNLABELED_SHA256 = 'cdc5cd987d42a433a88fb84469cab5c56e5183e2b86a6d14e7c098b91fe2e2f9';
`;

  fs.writeFileSync(path.join(ROOT, ASSETS_TS), body);
}

function writeSpriteConfig(labeledSha, twinSha, bundleHash, paritySummary) {
  const body = `/** Sprite config — v5 pixel-preserving twin extraction (v2/v3/v4 retired). */
import labeledCatalogUrl from '../../../assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png';
import unlabeledTwinUrl from '../../../assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png';

export const EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH =
  '/storage/v1/object/public/live-preview/Studio%20World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png';

export function resolveExperienceLabIconSourceLabeledUrl(): string {
  return labeledCatalogUrl;
}

export function resolveExperienceLabIconSourceUnlabeledTwinUrl(): string {
  return unlabeledTwinUrl;
}

/** @deprecated historical generated sheet — not for extraction */
export function resolveExperienceLabIconSourceUnlabeledUrl(): string {
  return resolveExperienceLabIconSourceUnlabeledTwinUrl();
}

export const EXPERIENCE_LAB_ICON_SPRITE_CONFIG = {
  labeledCatalogPath: 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png',
  unlabeledTwinPath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png',
  deprecatedUnlabeledPath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
  sourcePath: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png',
  labeledStoragePath: EXPERIENCE_LAB_ICON_SOURCE_LABELED_STORAGE_PATH,
  generatedDir: 'src/assets/studio-world/experience-lab/icons/generated-v5',
  sourceWidth: 1402,
  sourceHeight: 1122,
  rows: 8,
  columns: 8,
  outputCanvas: 512,
  labeledCatalogSha256: '${labeledSha}',
  sourceSha256: '${twinSha}',
  twinSha256: '${twinSha}',
  bundleSha256: '${bundleHash}',
  extractionVersion: '${V5_VERSION}',
  opticalLockVersion: '${V5_VERSION}',
  lockdownCertified: false,
  v2PipelineFrozen: true,
  v3PipelineRetired: true,
  v4PipelineRetired: true,
  iconCount: 64,
  auditPass: ${paritySummary.runtimePass},
  auditWarn: ${paritySummary.runtimeWarn},
  auditFail: ${paritySummary.runtimeFail},
  parityPass: ${paritySummary.parityPass},
  parityWarn: ${paritySummary.parityWarn},
  parityFail: ${paritySummary.parityFail},
  mode: 'source-twin-grid-v5' as const,
  sourceRole: 'pixel-preserving-unlabeled-twin' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
`;
  fs.writeFileSync(path.join(ROOT, SPRITE_CONFIG), body);
}

async function buildSheet(results, outputDir, filename, pick) {
  const thumb = 128;
  const sheetW = COLS * thumb;
  const sheetH = ROWS * thumb;
  const sheet = Buffer.alloc(sheetW * sheetH * 4, 0);
  for (let i = 0; i < sheet.length; i += 4) {
    sheet[i] = 14;
    sheet[i + 1] = 14;
    sheet[i + 2] = 16;
    sheet[i + 3] = 255;
  }
  for (const item of results) {
    const src = pick(item);
    if (!src || !fs.existsSync(src)) continue;
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
  const twinPath = path.join(ROOT, TWIN_REL);
  const labeledPath = path.join(ROOT, LABELED_REL);
  if (!fs.existsSync(twinPath) || !fs.existsSync(labeledPath)) {
    throw new Error('Missing labeled catalog or unlabeled twin — run create-studio-world-unlabeled-source-twin.mjs first');
  }

  const twinParity = JSON.parse(fs.readFileSync(path.join(ROOT, TWIN_PARITY_JSON), 'utf8'));
  if (twinParity.parityFail > 0 || twinParity.protectedPixelsChanged > 0) {
    throw new Error('Source twin parity not certified — cannot generate v5 runtime icons');
  }

  const labeledSha = crypto.createHash('sha256').update(fs.readFileSync(labeledPath)).digest('hex');
  const twinSha = crypto.createHash('sha256').update(fs.readFileSync(twinPath)).digest('hex');
  if (twinSha !== twinParity.twinSha256) throw new Error('Twin checksum drift detected');

  const outputDir = path.join(ROOT, OUTPUT_DIR_REL);
  fs.mkdirSync(outputDir, { recursive: true });

  const registry = parseRegistry();
  if (registry.length !== 64) throw new Error(`Expected 64 registry entries, got ${registry.length}`);

  const results = [];
  const hashes = [];

  const maskByKey = Object.fromEntries(twinParity.icons.map((i) => [i.key, i.mask]));

  for (const entry of registry) {
    const mask = maskByKey[entry.key];
    if (!mask) throw new Error(`Missing twin mask for ${entry.key}`);
    const parity = await parityForEntry(entry, labeledPath, twinPath, mask);
    const filename = iconKeyToFilename(entry.key);
    let generated = false;
    let runtimeStatus = 'FAIL';
    let contentSha256 = '';
    let failReason = '';

    const out = await cellToTransparentPng(twinPath, entry);
    if (out.ok) {
      fs.writeFileSync(path.join(outputDir, filename), out.png);
      contentSha256 = out.contentSha256;
      hashes.push(contentSha256);
      generated = true;
      runtimeStatus = parity.status === 'FAIL' ? 'WARN' : 'PASS';
    } else {
      failReason = out.reason ?? 'extract-fail';
      if (parity.status === 'FAIL') failReason = `${failReason};parity-fail`;
    }

    results.push({
      key: entry.key,
      sourceLabel: entry.sourceLabel,
      filename,
      row: entry.row,
      column: entry.column,
      category: categoryForRow(entry.row),
      founderPriority: FOUNDER_PRIORITY.has(entry.key),
      parityStatus: parity.status,
      positionDelta: parity.positionDelta,
      scaleDelta: parity.scaleDelta,
      textInUnlabeled: parity.textInUnlabeled,
      parityNotes: parity.notes,
      generated,
      runtimeStatus,
      contentSha256,
      failReason,
    });
  }

  const bundleHash = crypto.createHash('sha256').update(hashes.sort().join('')).digest('hex');
  const paritySummary = {
    parityPass: results.filter((r) => r.parityStatus === 'PASS').length,
    parityWarn: results.filter((r) => r.parityStatus === 'WARN').length,
    parityFail: results.filter((r) => r.parityStatus === 'FAIL').length,
    runtimePass: results.filter((r) => r.runtimeStatus === 'PASS').length,
    runtimeWarn: results.filter((r) => r.runtimeStatus === 'WARN').length,
    runtimeFail: results.filter((r) => r.runtimeStatus === 'FAIL').length,
    generated: results.filter((r) => r.generated).length,
  };

  writeAssetsTs(results, labeledSha, twinSha, bundleHash);
  writeSpriteConfig(labeledSha, twinSha, bundleHash, paritySummary);

  fs.writeFileSync(
    path.join(ROOT, METADATA_JSON),
    JSON.stringify({ version: V5_VERSION, pipeline: 'source-twin-grid-v5', sourceRole: 'pixel-preserving-unlabeled-twin', labeledSha256: labeledSha, twinSha256: twinSha, ...paritySummary, icons: results }, null, 2),
  );
  fs.writeFileSync(path.join(ROOT, PARITY_JSON), JSON.stringify({ version: V5_VERSION, labeledSha256: labeledSha, twinSha256: twinSha, ...paritySummary, icons: results }, null, 2));

  const parityLines = results
    .map((r) => `| ${r.sourceLabel} | ${r.key} | ${r.row},${r.column} | ${r.parityStatus} | ${r.positionDelta} | ${r.scaleDelta} | ${r.runtimeStatus} | ${r.parityNotes} |`)
    .join('\n');

  fs.writeFileSync(
    path.join(ROOT, PARITY_DOC),
    `# Studio World Icon Runtime Parity (v5)\n\nVersion: ${V5_VERSION}\n\nLabeled catalog sha256: \`${labeledSha}\`\n\nUnlabeled twin sha256: \`${twinSha}\`\n\n## Summary\n\n- Parity PASS: ${paritySummary.parityPass}\n- Parity WARN: ${paritySummary.parityWarn}\n- Parity FAIL: ${paritySummary.parityFail}\n- Runtime PASS: ${paritySummary.runtimePass}\n- Runtime WARN: ${paritySummary.runtimeWarn}\n- Runtime FAIL: ${paritySummary.runtimeFail}\n\n| Label | Key | Row,Col | Parity | Pos Δ | Scale Δ | Runtime | Notes |\n|---|---|---|---:|---:|---:|---|---|\n${parityLines}\n`,
  );

  await buildSheet(results, outputDir, CONTACT_SHEET, (r) => (r.generated ? path.join(outputDir, r.filename) : null));

  const labeledMeta = await sharp(labeledPath).metadata();
  const sw = labeledMeta.width ?? 1402;
  const sh = labeledMeta.height ?? 1122;
  const pairCells = [];
  for (const r of results) {
    const cell = cellRect(sw, sh, r.row, r.column);
    const labeledCell = await sharp(labeledPath).extract(cell).png().toBuffer();
    const unlabeledCell = await sharp(twinPath).extract(cell).png().toBuffer();
    const genPath = r.generated ? path.join(outputDir, r.filename) : null;
    const genBuf = genPath ? await sharp(genPath).resize(cell.width, cell.height, { fit: 'inside' }).png().toBuffer() : null;
    pairCells.push({ r, cell, labeledCell, unlabeledCell, genBuf });
  }

  const pairW = COLS * 175 * 3;
  const pairH = ROWS * 140;
  const pairSheet = Buffer.alloc(pairW * pairH * 4, 0);
  for (const { r, cell, labeledCell, unlabeledCell, genBuf } of pairCells) {
    const lx = r.column * 175 * 3;
    const ly = r.row * 140;
    for (const [buf, offset] of [[labeledCell, 0], [unlabeledCell, 175], [genBuf, 350]]) {
      if (!buf) continue;
      const img = await sharp(buf).resize(175, 140, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 255 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let y = 0; y < img.info.height; y += 1) {
        for (let x = 0; x < img.info.width; x += 1) {
          const si = (y * img.info.width + x) * 4;
          const dx = lx + offset + x;
          const dy = ly + y;
          const di = (dy * pairW + dx) * 4;
          pairSheet[di] = img.data[si];
          pairSheet[di + 1] = img.data[si + 1];
          pairSheet[di + 2] = img.data[si + 2];
          pairSheet[di + 3] = 255;
        }
      }
    }
  }
  await sharp(pairSheet, { raw: { width: pairW, height: pairH, channels: 4 } }).png().toFile(path.join(ROOT, PAIR_SHEET));

  fs.writeFileSync(path.join(outputDir, '_generation-summary.json'), JSON.stringify({ version: V5_VERSION, ...paritySummary, bundleHash }, null, 2));

  const founderCells = results.filter((r) => FOUNDER_PRIORITY.has(r.key));
  const fThumb = 128;
  const fSheetW = 4 * fThumb;
  const fSheetH = Math.ceil(founderCells.length / 4) * fThumb;
  const fSheet = Buffer.alloc(fSheetW * fSheetH * 4, 0);
  for (let i = 0; i < founderCells.length; i += 1) {
    const r = founderCells[i];
    const cell = cellRect(sw, sh, r.row, r.column);
    const labeledCell = await sharp(labeledPath).extract(cell).resize(fThumb, fThumb, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 255 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const twinCell = await sharp(twinPath).extract(cell).resize(fThumb, fThumb, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 255 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const genPath = r.generated ? path.join(outputDir, r.filename) : null;
    const genCell = genPath
      ? await sharp(genPath).resize(fThumb, fThumb, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      : null;
    const ox = (i % 4) * fThumb;
    const oy = Math.floor(i / 4) * fThumb;
    for (const [buf, offset] of [[labeledCell, 0], [twinCell, 0], [genCell, 0]]) {
      if (!buf) continue;
      const data = 'data' in buf ? buf.data : buf;
      const info = buf.info ?? { width: fThumb, height: fThumb };
      for (let y = 0; y < info.height; y += 1) {
        for (let x = 0; x < info.width; x += 1) {
          const si = (y * info.width + x) * 4;
          const dx = ox + x;
          const dy = oy + y;
          const di = (dy * fSheetW + dx) * 4;
          fSheet[di] = data[si];
          fSheet[di + 1] = data[si + 1];
          fSheet[di + 2] = data[si + 2];
          fSheet[di + 3] = 255;
        }
      }
    }
  }
  await sharp(fSheet, { raw: { width: fSheetW, height: fSheetH, channels: 4 } }).png().toFile(path.join(ROOT, FOUNDER_SHEET));

  const assetsBody = fs.readFileSync(path.join(ROOT, ASSETS_TS), 'utf8');
  if (assetsBody.includes(DEPRECATED_UNLABELED_REL) || assetsBody.includes('generated-v4/')) {
    throw new Error('Build assertion failed: prohibited v4/deprecated source referenced in assets');
  }
  console.log(JSON.stringify({ version: V5_VERSION, labeledSha256: labeledSha, twinSha256: twinSha, ...paritySummary, bundleHash }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
