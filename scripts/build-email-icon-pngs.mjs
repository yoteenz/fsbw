#!/usr/bin/env node
/**
 * Rasterize site SVG icons to PNG for email clients (Gmail/Outlook block SVG in <img>).
 * Output: public/assets/email/icons/*.png
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/assets/email/icons');

const ICONS = [
  { src: 'public/assets/rose-alert.svg', out: 'rose-accent.png', size: 48 },
  { src: 'public/assets/points-icon.svg', out: 'points-icon.png', size: 48 },
  { src: 'public/assets/hub-icon.svg', out: 'hub-icon.png', size: 48 },
  { src: 'public/assets/loyalty-points-rewards.png', out: 'loyalty-points.png', size: 48, skipRaster: true },
  { src: 'public/assets/instagram-icon.svg', out: 'instagram-icon.png', size: 40 },
  { src: 'public/assets/twitter-icon.svg', out: 'twitter-icon.png', size: 40 },
  { src: 'public/assets/facebook-icon.svg', out: 'facebook-icon.png', size: 40 },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const entry of ICONS) {
    const srcPath = path.join(ROOT, entry.src);
    const outPath = path.join(OUT_DIR, entry.out);
    if (!fs.existsSync(srcPath)) {
      console.warn('Skip missing:', entry.src);
      continue;
    }

    if (entry.skipRaster) {
      await sharp(srcPath)
        .resize(entry.size, entry.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outPath);
    } else {
      await sharp(srcPath)
        .resize(entry.size, entry.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outPath);
    }
    console.log('Wrote', path.relative(ROOT, outPath));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
