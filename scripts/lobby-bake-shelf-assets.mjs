#!/usr/bin/env node
/**
 * Download lobby shelf green-screen JPEGs and write chroma-keyed PNGs.
 * Requires: python3 with pillow and numpy.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SHELVES = [
  {
    name: 'hd',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/RQY7MNHaS7mk5m9RKKMd__Qtm01P5p.jpeg',
    out: 'hd-group.png',
  },
  {
    name: 'transparent',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/2fkXzNmBPwDypFe2xv4P__QY7xpaxh.jpeg',
    out: 'transparent-group.png',
  },
  {
    name: 'custom',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/AKowa_ZYGg6DxNa2oiwsU_aMURAC98.jpeg',
    out: 'custom-group.png',
  },
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpDir = path.join(root, 'tmp/shelf-src');
const assetsDir = path.join(root, 'public/assets');

const py = `
from PIL import Image
import numpy as np
import sys

src, out, max_w = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGBA')
arr = np.array(im)
h, w = arr.shape[:2]
corners = [arr[0:80, 0:80, :3], arr[0:80, w-80:w, :3], arr[h-80:h, 0:80, :3], arr[h-80:h, w-80:w, :3]]
samples = np.vstack([c.reshape(-1, 3) for c in corners])
bg = samples.mean(axis=0)
r = arr[:,:,0].astype(np.float32)
g = arr[:,:,1].astype(np.float32)
b = arr[:,:,2].astype(np.float32)
br, bgc, bb = bg[0], bg[1], bg[2]
dist = np.sqrt((r-br)**2 + (g-bgc)**2 + (b-bb)**2)
green_excess = g - np.maximum(r, b)
threshold, soft = 70, 35
alpha = np.clip((dist - threshold) * (255 / soft), 0, 255)
alpha = np.where(green_excess > 45, np.minimum(alpha, np.clip((green_excess - 45) * 5, 0, 255)), alpha)
arr[:,:,3] = alpha.astype(np.uint8)
out_im = Image.fromarray(arr)
bbox = out_im.getbbox()
if bbox:
    out_im = out_im.crop(bbox)
w2, h2 = out_im.size
if w2 > max_w:
    out_im = out_im.resize((max_w, int(h2 * max_w / w2)), Image.Resampling.LANCZOS)
out_im.save(out, 'PNG', optimize=True)
print(out_im.size)
`;

mkdirSync(tmpDir, { recursive: true });
mkdirSync(assetsDir, { recursive: true });

for (const shelf of SHELVES) {
  const tmpSrc = path.join(tmpDir, `${shelf.name}.jpeg`);
  const outPath = path.join(assetsDir, shelf.out);
  console.log('Fetching', shelf.name, '…');
  execFileSync('curl', ['-fsSL', '-o', tmpSrc, shelf.remote], { stdio: 'inherit' });
  execFileSync('python3', ['-c', py, tmpSrc, outPath, '800'], { stdio: 'inherit', cwd: root });
  console.log('Wrote', outPath);
}

console.log(
  'Bump LOBBY_SHELF_ASSET_VERSION in src/constants/lobbySceneAssets.ts after deploy (Vercel caches /assets/*).'
);
