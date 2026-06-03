/**
 * Replace Fal's fake transparent (light gray/white) background on PSA avatar assets
 * with solid black so the FAB does not show a gray box on site pages.
 *
 * Usage: node scripts/psa-flatten-avatar-backgrounds.mjs
 */
import { Jimp } from 'jimp';
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = path.join(process.cwd(), 'public/assets');
const FILL = { r: 0, g: 0, b: 0, a: 255 };
const FILL_INT = (FILL.r << 24) | (FILL.g << 16) | (FILL.b << 8) | FILL.a;

function rgbaFromInt(c) {
  return { r: c >>> 24, g: (c >>> 16) & 255, b: (c >>> 8) & 255, a: c & 255 };
}

function colorDist(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function isBackgroundPixel(p, bgRefs) {
  if (p.a < 16) return true;
  const minDist = Math.min(...bgRefs.map((bg) => colorDist(p, bg)));
  if (minDist <= 42) return true;
  const max = Math.max(p.r, p.g, p.b);
  const min = Math.min(p.r, p.g, p.b);
  if (max >= 228 && max - min <= 18) return true;
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

  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
    await img.write(filePath);
  } else {
    await img.write(filePath);
  }
  return { filename, replaced, total: w * h };
}

const files = fs.readdirSync(ASSETS_DIR).filter((f) => f.startsWith('psa-avatar-'));
const results = [];
for (const f of files) {
  results.push(await flattenFile(f));
}
for (const r of results) {
  console.log(`${r.filename}: replaced ${r.replaced}/${r.total} px (${((100 * r.replaced) / r.total).toFixed(1)}%)`);
}
