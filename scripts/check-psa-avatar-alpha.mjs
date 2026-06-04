import { Jimp } from 'jimp';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'public/assets');
const files = fs.readdirSync(dir).filter((f) => f.startsWith('psa-avatar-') && f.endsWith('.png')).sort();

function rgba(c) {
  return { r: c >>> 24, g: (c >>> 16) & 255, b: (c >>> 8) & 255, a: c & 255 };
}

function isCheckerLike(p) {
  const max = Math.max(p.r, p.g, p.b);
  const min = Math.min(p.r, p.g, p.b);
  return p.a > 200 && max - min <= 24 && max >= 190;
}

for (const f of files) {
  const img = await Jimp.read(path.join(dir, f));
  const w = img.width;
  const h = img.height;
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ].map(([x, y]) => rgba(img.getPixelColor(x, y)));

  let checkerPx = 0;
  let transparentPx = 0;
  let opaqueBgPx = 0;
  const total = w * h;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = rgba(img.getPixelColor(x, y));
      if (p.a < 16) transparentPx += 1;
      else if (isCheckerLike(p)) checkerPx += 1;
      else if (p.r < 8 && p.g < 8 && p.b < 8 && p.a > 240) opaqueBgPx += 1;
    }
  }

  console.log(
    `${f}\t${w}x${h}\tcorners=${corners.map((c) => `${c.r},${c.g},${c.b},a${c.a}`).join(' ')}\tchecker=${((100 * checkerPx) / total).toFixed(1)}%\ttransparent=${((100 * transparentPx) / total).toFixed(1)}%\tblackBg=${((100 * opaqueBgPx) / total).toFixed(1)}%`
  );
}
