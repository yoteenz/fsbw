/**
 * Fix PSA avatar PNGs — alpha boost only (never removes pixels).
 *
 * Semi-transparent fringe in Ideogram exports shows the holo glow through as
 * "holes". This sets any pixel with 0 < alpha < 255 to fully opaque.
 *
 * Does NOT remove checkerboard pixels (color-based removal punches holes in
 * skin, metal, and highlights). Re-export any asset that still shows checker.
 *
 * Usage: node scripts/psa-solidify-avatar-alpha.mjs
 */
import { Jimp } from 'jimp';
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = path.join(process.cwd(), 'public/assets');

function rgbaFromInt(c) {
  return { r: (c >> 24) & 255, g: (c >> 16) & 255, b: (c >> 8) & 255, a: c & 255 };
}

function toInt(p) {
  return ((p.r & 255) << 24) | ((p.g & 255) << 16) | ((p.b & 255) << 8) | (p.a & 255);
}

async function processFile(filename) {
  const filePath = path.join(ASSETS_DIR, filename);
  const img = await Jimp.read(filePath);
  const w = img.width;
  const h = img.height;

  let solidified = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = rgbaFromInt(img.getPixelColor(x, y));
      if (p.a > 0 && p.a < 255) {
        img.setPixelColor(toInt({ ...p, a: 255 }) >>> 0, x, y);
        solidified += 1;
      }
    }
  }

  await img.write(filePath);
  return { filename, solidified, total: w * h };
}

const files = fs
  .readdirSync(ASSETS_DIR)
  .filter((f) => f.startsWith('psa-avatar-') && f.endsWith('.png'))
  .sort();

console.log('PSA avatar: solidify soft alpha only (no pixel removal)');
for (const f of files) {
  const r = await processFile(f);
  console.log(`${r.filename}: solidified ${r.solidified} px (${((100 * r.solidified) / r.total).toFixed(1)}%)`);
}
