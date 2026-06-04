/**
 * Remove baked checkerboard from PSA avatar PNGs (conservative — character-safe).
 *
 * Usage:
 *   node scripts/psa-flatten-avatar-backgrounds.mjs
 *
 * Default output is true alpha. Only removes neutral checker squares and tinted
 * fringe pixels — does NOT flood through skin, clothing, or warm tones.
 */
import { Jimp } from 'jimp';
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = path.join(process.cwd(), 'public/assets');
const TRANSPARENT_INT = 0;

function rgbaFromInt(c) {
  return { r: c >>> 24, g: (c >>> 16) & 255, b: (c >>> 8) & 255, a: c & 255 };
}

/** Neutral light/dark checker squares (Fal fake transparency). */
function isCheckerPixel(p) {
  if (p.a === 0) return false;

  /** Residual export fringe — force fully transparent. */
  if (p.a < 20) return true;

  if (p.a < 200) return false;

  const max = Math.max(p.r, p.g, p.b);
  const min = Math.min(p.r, p.g, p.b);
  const spread = max - min;

  /** Light square (~255,255,255). */
  if (max >= 228 && spread <= 8) return true;
  /** Dark square (~192–227 neutral gray). */
  if (max >= 180 && max <= 227 && spread <= 10) return true;

  return false;
}

async function flattenFile(filename) {
  const filePath = path.join(ASSETS_DIR, filename);
  const img = await Jimp.read(filePath);
  const w = img.width;
  const h = img.height;

  const visited = new Uint8Array(w * h);
  const queue = [];

  const trySeed = (x, y) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    const p = rgbaFromInt(img.getPixelColor(x, y));
    if (!isCheckerPixel(p)) return;
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
    img.setPixelColor(TRANSPARENT_INT, x, y);
    replaced += 1;

    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const idx = ny * w + nx;
      if (visited[idx]) continue;
      const p = rgbaFromInt(img.getPixelColor(nx, ny));
      if (!isCheckerPixel(p)) continue;
      visited[idx] = 1;
      queue.push([nx, ny]);
    }
  }

  /** Interior checker islands (surrounded by character but still neutral squares). */
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = rgbaFromInt(img.getPixelColor(x, y));
      if (!isCheckerPixel(p)) continue;
      img.setPixelColor(TRANSPARENT_INT, x, y);
      replaced += 1;
    }
  }

  await img.write(filePath);
  return { filename, replaced, total: w * h };
}

const files = fs.readdirSync(ASSETS_DIR).filter((f) => f.startsWith('psa-avatar-') && f.endsWith('.png'));
console.log('Mode: conservative checkerboard removal → transparent');
const results = [];
for (const f of files.sort()) {
  results.push(await flattenFile(f));
}
for (const r of results) {
  console.log(
    `${r.filename}: replaced ${r.replaced}/${r.total} px (${((100 * r.replaced) / r.total).toFixed(1)}%)`
  );
}
