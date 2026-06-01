#!/usr/bin/env node
/**
 * Download lobby shelf green-screen JPEGs and write chroma-keyed PNGs.
 * Keys true green backdrop only; protects gray/white mannequin (avoids face holes).
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
r = arr[:, :, 0].astype(np.float32)
g = arr[:, :, 1].astype(np.float32)
b = arr[:, :, 2].astype(np.float32)
mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
sat = mx - mn
ge = g - np.maximum(r, b)

# Mannequin / shelf glass neutrals — never punch holes (old key ate gray faces).
protect = (ge < 18) | (sat < 32)
# True green-screen backdrop.
is_bg = (ge > 42) & (g > 70)

alpha = np.zeros(r.shape, dtype=np.float32)
alpha[protect] = 255.0
alpha[is_bg] = 0.0
mid = ~protect & ~is_bg
if np.any(mid):
    t = np.clip((ge[mid] - 18.0) / 24.0, 0.0, 1.0)
    alpha[mid] = 255.0 * (1.0 - t)

# Feather green spill on hair edges only (keep mostly opaque).
spill = mid & (ge >= 18) & (ge <= 38)
alpha[spill] = np.maximum(alpha[spill], 200.0)

arr[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

# Despill green cast on shelf glass / hair (opaque foreground).
fg = arr[:, :, 3] > 20
rb_max = np.maximum(r, b)
g_despill = np.where(g > rb_max, rb_max + (g - rb_max) * 0.12, g)
arr[:, :, 1] = np.where(fg, np.clip(g_despill, 0, 255), arr[:, :, 1]).astype(np.uint8)

# Drop fringe pixels that are mostly green backdrop.
fringe = (arr[:, :, 3] < 40) & (ge > 35) & (g > 65)
arr[fringe, 3] = 0
arr[fringe, :3] = 0
# Remove wispy semi-transparent halos before crop.
arr[arr[:, :, 3] < 28, 3] = 0
arr[arr[:, :, 3] < 28, :3] = 0
out_im = Image.fromarray(arr)
alpha = arr[:, :, 3]
ys, xs = np.where(alpha > 128)
if len(xs):
    pad = 2
    bbox = (
        max(0, int(xs.min()) - pad),
        max(0, int(ys.min()) - pad),
        min(alpha.shape[1], int(xs.max()) + pad + 1),
        min(alpha.shape[0], int(ys.max()) + pad + 1),
    )
    out_im = out_im.crop(bbox)
else:
    bbox = out_im.getbbox()
    if bbox:
        out_im = out_im.crop(bbox)
w2, h2 = out_im.size
if w2 > max_w:
    out_im = out_im.resize((max_w, max(1, int(h2 * max_w / w2))), Image.Resampling.LANCZOS)
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
