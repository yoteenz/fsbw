#!/usr/bin/env node
/**
 * Studio World icon v3 generator — deterministic crop manifest authority only.
 * Does NOT use connected-component auto-publish or v2 extraction heuristics.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SOURCE_REL = 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png';
const MANIFEST_TS = 'src/features/studio-world/icons/studio-world-icon-crop-manifest.ts';
const OUTPUT_DIR_REL = 'src/assets/studio-world/experience-lab/icons/generated-v3';
const ASSETS_TS = 'src/features/studio-world/icons/experience-lab-icon-assets.generated.ts';
const METADATA_JSON = 'src/features/studio-world/icons/experience-lab-icon-extraction-metadata.generated.json';
const SPRITE_CONFIG = 'src/features/studio-world/icons/experience-lab-icon-sprite.config.ts';
const CONTACT_SHEET = `${OUTPUT_DIR_REL}/_contact-sheet.png`;
const V3_VERSION = 'studio-world-icons-v3';

const BLACK_LUM = 28;
const WHITE_LUM = 235;
const EDGE_RING = 2;

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

function parseManifestFromTs() {
  const text = fs.readFileSync(path.join(ROOT, MANIFEST_TS), 'utf8');
  const sourceMatch = text.match(/sha256: '([a-f0-9]+)'/);
  const sourceSha256 = sourceMatch?.[1] ?? '';
  const entries = [];
  const blockRe =
    /(\w+):\s*\{[^}]*semanticKey:\s*'(\w+)'[^}]*sourceLabel:\s*'([^']+)'[^}]*row:\s*(\d+)[^}]*column:\s*(\d+)[^}]*cropX:\s*(\d+)[^}]*cropY:\s*(\d+)[^}]*cropWidth:\s*(\d+)[^}]*cropHeight:\s*(\d+)[^}]*glyphPadding:\s*(\d+)[^}]*outputSize:\s*(\d+)[^}]*opticalScale:\s*([\d.]+)[^}]*translateX:\s*(-?\d+)[^}]*translateY:\s*(-?\d+)[^}]*approved:\s*(true|false)/gs;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    entries.push({
      key: m[1],
      sourceLabel: m[3],
      row: Number(m[4]),
      column: Number(m[5]),
      cropX: Number(m[6]),
      cropY: Number(m[7]),
      cropWidth: Number(m[8]),
      cropHeight: Number(m[9]),
      glyphPadding: Number(m[10]),
      outputSize: Number(m[11]),
      opticalScale: Number(m[12]),
      translateX: Number(m[13]),
      translateY: Number(m[14]),
      approved: m[15] === 'true',
    });
  }
  return { entries, sourceSha256 };
}

function cellBounds(row, column, sw, sh) {
  const left = Math.round((column * sw) / 8);
  const top = Math.round((row * sh) / 8);
  const right = Math.round(((column + 1) * sw) / 8);
  const bottom = Math.round(((row + 1) * sh) / 8);
  return { left, top, width: right - left, height: bottom - top };
}

function isInsideCell(entry, sw, sh) {
  const cell = cellBounds(entry.row, entry.column, sw, sh);
  return (
    entry.cropX >= cell.left &&
    entry.cropY >= cell.top &&
    entry.cropX + entry.cropWidth <= cell.left + cell.width &&
    entry.cropY + entry.cropHeight <= cell.top + cell.height
  );
}

async function cropToTransparentPng(sourcePath, entry) {
  const { data, info } = await sharp(sourcePath)
    .extract({
      left: entry.cropX,
      top: entry.cropY,
      width: entry.cropWidth,
      height: entry.cropHeight,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  let fgPixels = 0;
  let edgePixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      const a = alphaFromLuminance(data[i], data[i + 1], data[i + 2]);
      const oi = (y * width + x) * 4;
      if (a > 0) {
        fgPixels += 1;
        out[oi] = data[i];
        out[oi + 1] = data[i + 1];
        out[oi + 2] = data[i + 2];
        out[oi + 3] = a;
        if (
          x < EDGE_RING ||
          y < EDGE_RING ||
          x >= width - EDGE_RING ||
          y >= height - EDGE_RING
        ) {
          edgePixels += 1;
        }
      }
    }
  }

  const canvas = entry.outputSize;
  const scale = Math.min(
    (canvas - entry.glyphPadding * 2) / width,
    (canvas - entry.glyphPadding * 2) / height,
  ) * entry.opticalScale;
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const padTop = Math.max(0, Math.floor((canvas - outH) / 2) + entry.translateY);
  const padLeft = Math.max(0, Math.floor((canvas - outW) / 2) + entry.translateX);

  const resized = await sharp(out, { raw: { width, height, channels: 4 } })
    .resize(outW, outH, { fit: 'inside' })
    .png()
    .toBuffer();

  const centered = await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left: padLeft, top: padTop }])
    .png()
    .toBuffer();

  return {
    png: centered,
    fgPixels,
    edgePixels,
    canvas,
    blank: fgPixels < 24,
    edgeTouch: edgePixels > fgPixels * 0.35,
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

async function buildContactSheet(entries, sourcePath, outputDir) {
  const thumb = 140;
  const cols = 8;
  const rows = 8;
  const sheetW = cols * thumb;
  const sheetH = rows * thumb;
  const sheet = Buffer.alloc(sheetW * sheetH * 4, 0);

  for (let i = 0; i < sheet.length; i += 4) {
    sheet[i] = 14;
    sheet[i + 1] = 14;
    sheet[i + 2] = 16;
    sheet[i + 3] = 255;
  }

  const previewDir = path.join(outputDir, '_preview-unapproved');

  for (const entry of entries) {
    const filename = iconKeyToFilename(entry.key);
    const pngPath = path.join(outputDir, filename);
    const previewPath = path.join(previewDir, filename);
    const usePath = fs.existsSync(pngPath) ? pngPath : previewPath;
    if (!fs.existsSync(usePath)) continue;

    const resized = await sharp(usePath)
      .resize(thumb - 24, thumb - 36, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const ox = entry.column * thumb + Math.floor((thumb - resized.info.width) / 2);
    const oy = entry.row * thumb + 8;
    const { data, info } = resized;

    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        const si = (y * info.width + x) * 4;
        const a = data[si + 3];
        if (a === 0) continue;
        const dx = ox + x;
        const dy = oy + y;
        if (dx < 0 || dy < 0 || dx >= sheetW || dy >= sheetH) continue;
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
    .toFile(path.join(ROOT, CONTACT_SHEET));
}

function writeAssetsTs(results, sourceSha256, bundleHash) {
  const generated = results.filter((r) => r.generated);
  const imports = generated
    .map(
      (r) =>
        `import ${r.key}Asset from '../../../assets/studio-world/experience-lab/icons/generated-v3/${r.filename}';`,
    )
    .join('\n');

  const entries = generated
    .map(
      (r) =>
        `  ${r.key}: {\n    src: ${r.key}Asset,\n    sourceLabel: '${r.sourceLabel}',\n    category: '${r.category}',\n    confidence: 1,\n    auditStatus: '${r.auditStatus}',\n    contentSha256: '${r.contentSha256}',\n    approved: ${r.approved},\n    cropManifestVersion: '${V3_VERSION}',\n  }`,
    )
    .join(',\n');

  const body = `/** Generated by scripts/generate-studio-world-icons-from-crops.mjs — deterministic v3 crops only. */
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
};

export const EXPERIENCE_LAB_ICON_ASSETS: Partial<Record<ExperienceLabIconName, ExperienceLabIconAssetEntry>> = {
${entries}
} as Partial<Record<ExperienceLabIconName, ExperienceLabIconAssetEntry>>;

export const EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256 = '${sourceSha256}';
export const EXPERIENCE_LAB_ICON_EXTRACTION_VERSION = '${V3_VERSION}';
export const EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION = '${V3_VERSION}-pending-approval';
export const EXPERIENCE_LAB_ICON_BUNDLE_SHA256 = '${bundleHash}';
export const EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED = false;
export const EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN = true;
export const EXPERIENCE_LAB_ICON_OUTPUT_CANVAS = 512;
export const EXPERIENCE_LAB_ICON_ASSET_DIR = 'generated-v3';
`;

  fs.writeFileSync(path.join(ROOT, ASSETS_TS), body);
}

function writeSpriteConfig(sourceSha256, bundleHash, meta, sw, sh) {
  const approved = meta.filter((m) => m.approved && m.generated).length;
  const body = `/** Sprite config — v3 deterministic crop pipeline (v2 frozen). */
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
  sourceWidth: ${sw},
  sourceHeight: ${sh},
  rows: 8,
  columns: 8,
  outputCanvas: 512,
  sourceSha256: '${sourceSha256}',
  bundleSha256: '${bundleHash}',
  extractionVersion: '${V3_VERSION}',
  opticalLockVersion: '${V3_VERSION}-pending-approval',
  lockdownCertified: false,
  v2PipelineFrozen: true,
  iconCount: 64,
  auditPass: ${approved},
  auditWarn: ${64 - approved},
  auditFail: 0,
  mode: 'deterministic-crop-v3' as const,
} as const;

export type ExperienceLabIconSpriteConfig = typeof EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
`;
  fs.writeFileSync(path.join(ROOT, SPRITE_CONFIG), body);
}

function writeMetadata(meta, sourceSha256) {
  const body = {
    version: V3_VERSION,
    pipeline: 'deterministic-crop-manifest',
    v2Frozen: true,
    sourceSha256,
    iconCount: meta.length,
    approvedCount: meta.filter((m) => m.approved).length,
    generatedCount: meta.filter((m) => m.generated).length,
    opticalCertificationVersion: `${V3_VERSION}-pending-approval`,
    icons: meta,
  };
  fs.writeFileSync(path.join(ROOT, METADATA_JSON), JSON.stringify(body, null, 2));
}

async function main() {
  const sourcePath = path.join(ROOT, SOURCE_REL);
  const outputDir = path.join(ROOT, OUTPUT_DIR_REL);
  fs.mkdirSync(outputDir, { recursive: true });

  const meta = await sharp(sourcePath).metadata();
  const sw = meta.width ?? 1402;
  const sh = meta.height ?? 1122;

  const { entries, sourceSha256 } = parseManifestFromTs();
  if (entries.length !== 64) {
    throw new Error(`Expected 64 manifest entries, got ${entries.length}`);
  }

  const results = [];
  const hashes = [];

  for (const entry of entries) {
    const filename = iconKeyToFilename(entry.key);
    const inside = isInsideCell(entry, sw, sh);
    const canPublish = entry.approved && inside && entry.cropWidth > 0 && entry.cropHeight > 0;

    let generated = false;
    let contentSha256 = '';
    let auditStatus = 'PENDING';
    let fgPixels = 0;
    let edgeTouch = false;
    let blank = true;

    if (canPublish) {
      const out = await cropToTransparentPng(sourcePath, entry);
      blank = out.blank;
      edgeTouch = out.edgeTouch;
      fgPixels = out.fgPixels;

      if (!blank && !edgeTouch) {
        const outPath = path.join(outputDir, filename);
        fs.writeFileSync(outPath, out.png);
        contentSha256 = crypto.createHash('sha256').update(out.png).digest('hex');
        hashes.push(contentSha256);
        generated = true;
        auditStatus = 'PASS';
      } else {
        auditStatus = 'FAIL';
      }
    } else if (!inside || entry.cropWidth <= 0 || entry.cropHeight <= 0) {
      auditStatus = 'FAIL';
    }

    results.push({
      key: entry.key,
      sourceLabel: entry.sourceLabel,
      filename,
      row: entry.row,
      column: entry.column,
      category: categoryForRow(entry.row),
      approved: entry.approved,
      generated,
      auditStatus,
      contentSha256,
      cropX: entry.cropX,
      cropY: entry.cropY,
      cropWidth: entry.cropWidth,
      cropHeight: entry.cropHeight,
      fgPixels,
      edgeTouch,
      blank,
      insideCell: inside,
    });
  }

  // Always generate preview PNGs for QA (even unapproved) — separate preview dir
  const previewDir = path.join(outputDir, '_preview-unapproved');
  fs.mkdirSync(previewDir, { recursive: true });
  for (const entry of entries) {
    if (!isInsideCell(entry, sw, sh)) continue;
    const out = await cropToTransparentPng(sourcePath, entry);
    if (out.blank) continue;
    fs.writeFileSync(path.join(previewDir, iconKeyToFilename(entry.key)), out.png);
  }

  const bundleHash = crypto.createHash('sha256').update(hashes.sort().join('')).digest('hex');

  writeAssetsTs(results, sourceSha256, bundleHash);
  writeSpriteConfig(sourceSha256, bundleHash, results, sw, sh);
  writeMetadata(results, sourceSha256);
  await buildContactSheet(entries, sourcePath, outputDir);

  const summary = {
    version: V3_VERSION,
    mapped: entries.length,
    approved: entries.filter((e) => e.approved).length,
    generated: results.filter((r) => r.generated).length,
    previewUnapproved: fs.readdirSync(previewDir).length,
    bundleHash,
  };
  fs.writeFileSync(path.join(outputDir, '_generation-summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
