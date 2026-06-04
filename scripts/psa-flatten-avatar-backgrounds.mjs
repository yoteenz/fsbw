/**
 * Remove fake-transparent / checkerboard backgrounds on PSA avatar PNGs.
 *
 * Usage:
 *   node scripts/psa-flatten-avatar-backgrounds.mjs
 *   node scripts/psa-flatten-avatar-backgrounds.mjs --greenscreen
 *   node scripts/psa-flatten-avatar-backgrounds.mjs --opaque-black   # legacy fill
 *
 * Default output is **true alpha** (transparent). Use `--opaque-black` only for old black-matte exports.
 * For new Fal exports on green screen: `--greenscreen`.
 */
import { Jimp } from 'jimp';
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = path.join(process.cwd(), 'public/assets');
const useGreenScreen = process.argv.includes('--greenscreen');
const useOpaqueBlack = process.argv.includes('--opaque-black');
const TRANSPARENT_INT = 0;
const OPAQUE_BLACK_INT = (0 << 24) | (0 << 16) | (0 << 8) | 255;
const FILL_INT = useOpaqueBlack ? OPAQUE_BLACK_INT : TRANSPARENT_INT;

function rgbaFromInt(c) {
  return { r: c >>> 24, g: (c >>> 16) & 255, b: (c >>> 8) & 255, a: c & 255 };
}

function colorDist(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function isGreenScreenPixel(p) {
  return p.g >= 120 && p.g > p.r + 35 && p.g > p.b + 35;
}

function isCheckerboardPixel(p) {
  const max = Math.max(p.r, p.g, p.b);
  const min = Math.min(p.r, p.g, p.b);
  const spread = max - min;

  /** Light checker / white matte. */
  if (max >= 220 && spread <= 28) return true;
  /** Mid-gray checker squares (~190–235). */
  if (max >= 180 && max <= 240 && spread <= 16) return true;
  /** Dark gray checker (~120–140 neutral or tinted). */
  if (max >= 110 && max <= 150 && min <= 12) return true;
  /** Tinted dark squares (e.g. 126,1,1 or 0,1,255). */
  if (max >= 90 && max <= 140 && min <= 8 && spread >= 80) return true;

  return false;
}

function isBackgroundPixel(p, bgRefs) {
  if (p.a < 16) return true;
  if (useGreenScreen && isGreenScreenPixel(p)) return true;
  if (isCheckerboardPixel(p)) return true;

  const minDist = Math.min(...bgRefs.map((bg) => colorDist(p, bg)));
  if (minDist <= 48) return true;

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

  const visited = new Uint8Array(w * h);
  const queue = [];

  const trySeed = (x, y) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    const p = rgbaFromInt(img.getPixelColor(x, y));
    if (!isBackgroundPixel(p, bgRefs)) return;
    visited[idx] = 1;
    queue.push([x, y]);
  };

  for (let x = 0; x < w; x++) {
    trySeed(x, 0);
    trySeed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y);
    trySeed(w - 1, y);
  }

  let replaced = 0;
  while (queue.length) {
    const [x, y] = queue.pop();
    img.setPixelColor(FILL_INT, x, y);
    replaced += 1;

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const idx = ny * w + nx;
      if (visited[idx]) continue;
      const p = rgbaFromInt(img.getPixelColor(nx, ny));
      if (!isBackgroundPixel(p, bgRefs)) continue;
      visited[idx] = 1;
      queue.push([nx, ny]);
    }
  }

  /** Orphan checker cells inside the silhouette (not edge-connected). */
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = rgbaFromInt(img.getPixelColor(x, y));
      if (p.a < 16) continue;
      if (!isCheckerboardPixel(p)) continue;
      img.setPixelColor(FILL_INT, x, y);
      replaced += 1;
    }
  }

  await img.write(filePath);
  return { filename, replaced, total: w * h };
}

const files = fs.readdirSync(ASSETS_DIR).filter((f) => f.startsWith('psa-avatar-'));
console.log(
  `Mode: ${useGreenScreen ? 'green-screen + auto' : 'auto (checkerboard)'}; fill: ${useOpaqueBlack ? 'opaque black' : 'transparent'}`
);
const results = [];
for (const f of files) {
  results.push(await flattenFile(f));
}
for (const r of results) {
  console.log(
    `${r.filename}: replaced ${r.replaced}/${r.total} px (${((100 * r.replaced) / r.total).toFixed(1)}%)`
  );
}
