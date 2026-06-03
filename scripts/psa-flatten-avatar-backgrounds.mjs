/**
 * Replace fake-transparent / green-screen backgrounds on PSA avatar assets with solid black.
 *
 * Usage:
 *   node scripts/psa-flatten-avatar-backgrounds.mjs
 *   node scripts/psa-flatten-avatar-backgrounds.mjs --greenscreen
 *
 * For new Fal exports: use a flat **#00B140** green screen behind the character, then run with `--greenscreen`.
 */
import { Jimp } from 'jimp';
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = path.join(process.cwd(), 'public/assets');
const useGreenScreen = process.argv.includes('--greenscreen');
const FILL = { r: 0, g: 0, b: 0, a: 255 };
const FILL_INT = (FILL.r << 24) | (FILL.g << 16) | (FILL.b << 8) | FILL.a;

function rgbaFromInt(c) {
  return { r: c >>> 24, g: (c >>> 16) & 255, b: (c >>> 8) & 255, a: c & 255 };
}

function colorDist(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function isGreenScreenPixel(p) {
  return p.g >= 120 && p.g > p.r + 35 && p.g > p.b + 35;
}

function isBackgroundPixel(p, bgRefs) {
  if (p.a < 16) return true;
  if (useGreenScreen && isGreenScreenPixel(p)) return true;
  const minDist = Math.min(...bgRefs.map((bg) => colorDist(p, bg)));
  if (minDist <= 48) return true;
  const max = Math.max(p.r, p.g, p.b);
  const min = Math.min(p.r, p.g, p.b);
  /** Light gray / white (Fal fake transparency or checkerboard light squares). */
  if (max >= 220 && max - min <= 24) return true;
  /** Checkerboard dark squares (often ~204–230 gray). */
  if (max >= 190 && max <= 235 && max - min <= 12) return true;
  return false;
}

async function flattenFile(filename) {
  const filePath = path.join(ASSETS_DIR, filename);
  const img = await Jimp.read(filePath);
  const w = img.width;
  const h = img.height;
  const bgRefs = [
    rgbaFromInt(img.getPixelColor(0, 0)),
    rgbaFromInt(img.getPixelColor(w - 1, 0)),
    rgbaFromInt(img.getPixelColor(0, h - 1)),
    rgbaFromInt(img.getPixelColor(w - 1, h - 1)),
  ];

  let replaced = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = rgbaFromInt(img.getPixelColor(x, y));
      if (isBackgroundPixel(p, bgRefs)) {
        img.setPixelColor(FILL_INT, x, y);
        replaced += 1;
      }
    }
  }

  await img.write(filePath);
  return { filename, replaced, total: w * h };
}

const files = fs.readdirSync(ASSETS_DIR).filter((f) => f.startsWith('psa-avatar-'));
console.log(`Mode: ${useGreenScreen ? 'green-screen + auto' : 'auto (gray/checkerboard)'}`);
const results = [];
for (const f of files) {
  results.push(await flattenFile(f));
}
for (const r of results) {
  console.log(`${r.filename}: replaced ${r.replaced}/${r.total} px (${((100 * r.replaced) / r.total).toFixed(1)}%)`);
}
