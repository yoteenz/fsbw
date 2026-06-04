/**
 * @deprecated Use `psa-solidify-avatar-alpha.mjs` instead.
 *
 * Color-based checker removal on Ideogram-cut PSA avatars punches holes in
 * skin, metal, and highlights. This script is kept for legacy green-screen
 * Fal exports only.
 *
 * Usage:
 *   node scripts/psa-flatten-avatar-backgrounds.mjs --greenscreen
 */
console.error(
  'psa-flatten-avatar-backgrounds.mjs is deprecated for Ideogram PSA avatars.\n' +
    'Use: node scripts/psa-solidify-avatar-alpha.mjs\n' +
    'For green-screen Fal exports only, pass --greenscreen --force'
);
if (!process.argv.includes('--force')) {
  process.exit(1);
}

import { Jimp } from 'jimp';
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = path.join(process.cwd(), 'public/assets');
const useGreenScreen = process.argv.includes('--greenscreen');

function rgbaFromInt(c) {
  return { r: (c >> 24) & 255, g: (c >> 16) & 255, b: (c >> 8) & 255, a: c & 255 };
}

function isGreenScreenPixel(p) {
  return p.g >= 120 && p.g > p.r + 35 && p.g > p.b + 35;
}

async function flattenFile(filename) {
  const filePath = path.join(ASSETS_DIR, filename);
  const img = await Jimp.read(filePath);
  let replaced = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const p = rgbaFromInt(img.getPixelColor(x, y));
      if (useGreenScreen && isGreenScreenPixel(p)) {
        img.setPixelColor(0, x, y);
        replaced += 1;
      }
    }
  }
  await img.write(filePath);
  return { filename, replaced };
}

const files = fs.readdirSync(ASSETS_DIR).filter((f) => f.startsWith('psa-avatar-'));
for (const f of files) {
  console.log(await flattenFile(f));
}
