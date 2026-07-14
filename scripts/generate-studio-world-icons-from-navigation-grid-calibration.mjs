#!/usr/bin/env node
/**
 * Slice Navigation master sheet icons from grid calibration — Icon Manufacturing Pipeline.
 * No OCR · no heuristic detection · calibration-driven only.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SOURCE_REL = 'src/assets/studio-world/navigation/icons/source/studio-world-navigation-master-sheet.png';
const CALIBRATION_REL =
  'src/features/studio-world/icons/navigation-master/grid-calibration/navigation-master-grid-calibration-canonical.json';
const REGISTRY_REL = 'src/features/studio-world/icons/navigation-master/navigation-master-icon-registry.ts';
const OUTPUT_DIR_REL = 'src/assets/studio-world/navigation/icons/generated-v1';
const METADATA_JSON =
  'src/features/studio-world/icons/navigation-master/navigation-master-extraction-metadata.generated.json';
const VERSION = 'studio-world-navigation-icons-v1-grid-calibration';
const OUTPUT_CANVAS = 512;
const GLYPH_PADDING = 24;
const BLACK_LUM = 28;
const WHITE_LUM = 235;

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
  return JSON.parse(fs.readFileSync(path.join(ROOT, CALIBRATION_REL), 'utf8'));
}

function resolveContentRect(cal) {
  const left = Math.round(cal.outerLeft * cal.sourceWidth);
  const top = Math.round(cal.outerTop * cal.sourceHeight);
  const right = Math.round(cal.sourceWidth * (1 - cal.outerRight));
  const bottom = Math.round(cal.sourceHeight * (1 - cal.outerBottom));
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function resolveCellRect(cal, row, column) {
  const content = resolveContentRect(cal);
  const rowPad = cal.rowPadding?.[row] ?? { top: 0, bottom: 0 };
  const colPad = cal.columnPadding?.[column] ?? { left: 0, right: 0 };
  const rowOffset = cal.rowOffsets?.[row] ?? 0;
  const colOffset = cal.columnOffsets?.[column] ?? 0;
  const boundaryPixel = (n, origin, span) => origin + Math.round(n * span);

  let left = boundaryPixel(cal.columnBoundaries[column], content.left, content.width) + (colPad.left ?? 0) + colOffset;
  let right = boundaryPixel(cal.columnBoundaries[column + 1], content.left, content.width) - (colPad.right ?? 0) + colOffset;
  let top = boundaryPixel(cal.rowBoundaries[row], content.top, content.height) + (rowPad.top ?? 0) + rowOffset;
  let bottom = boundaryPixel(cal.rowBoundaries[row + 1], content.top, content.height) - (rowPad.bottom ?? 0) + rowOffset;

  const override = cal.cellOverrides?.find((o) => o.enabled && o.row === row && o.column === column);
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
  };
}

async function main() {
  const cal = loadCalibration();
  const entries = parseRegistry();
  const sourcePath = path.join(ROOT, SOURCE_REL);
  const outDir = path.join(ROOT, OUTPUT_DIR_REL);
  fs.mkdirSync(outDir, { recursive: true });

  const source = sharp(sourcePath).ensureAlpha();
  const meta = await source.metadata();
  const results = [];

  for (const entry of entries) {
    const rect = resolveCellRect(cal, entry.row, entry.column);
    const raw = await source
      .clone()
      .extract({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = raw;
    const rgba = Buffer.alloc(info.width * info.height * 4);
    let visible = 0;
    for (let i = 0; i < info.width * info.height; i += 1) {
      const r = data[i * info.channels] ?? 0;
      const g = data[i * info.channels + 1] ?? 0;
      const b = data[i * info.channels + 2] ?? 0;
      const a = alphaFromLuminance(r, g, b);
      rgba[i * 4] = r;
      rgba[i * 4 + 1] = g;
      rgba[i * 4 + 2] = b;
      rgba[i * 4 + 3] = a;
      if (a > 24) visible += 1;
    }

    if (visible < 50) {
      console.warn(`[nav-v1] skip blank cell ${entry.key} r${entry.row}c${entry.column}`);
      continue;
    }

    const filename = iconKeyToFilename(entry.key);
    const outPath = path.join(outDir, filename);
    await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
      .resize(OUTPUT_CANVAS, OUTPUT_CANVAS, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);

    const hash = crypto.createHash('sha256').update(fs.readFileSync(outPath)).digest('hex');
    results.push({ key: entry.key, filename, row: entry.row, column: entry.column, sha256: hash });
    console.log(`[nav-v1] ${entry.key} → ${filename}`);
  }

  fs.writeFileSync(
    path.join(ROOT, METADATA_JSON),
    JSON.stringify({ version: VERSION, generatedAt: new Date().toISOString(), source: SOURCE_REL, icons: results }, null, 2),
  );

  console.log(`Wrote ${results.length} icons to ${OUTPUT_DIR_REL}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
