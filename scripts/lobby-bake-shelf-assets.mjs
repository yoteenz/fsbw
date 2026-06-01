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
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/5Cof6W3Y0p6Eyq8ew7Sil_dzSVHBRK.jpeg',
    out: 'hd-group.png',
  },
  {
    name: 'transparent',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/7h5bbuiitNAnalQhkOszS_pP56MlDZ.jpeg',
    out: 'transparent-group.png',
  },
  {
    name: 'custom',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/7iUsTnn1PQRK9Io3291KW_pHVg5Q26.jpeg',
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

lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

# Mannequin, acrylic shelf glass, white rim lights, red neon labels — keep opaque.
protect = (
    (ge < 18)
    | (sat < 32)
    | (lum > 145)
    | ((lum > 50) & (ge < 30) & (sat < 95))
    | ((r > 115) & (r > g + 12) & (sat > 40))
)
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

# Despill green on hair only — skip bright glass, white rims, red neon label.
fg = arr[:, :, 3] > 20
rb_max = np.maximum(r, b)
despill_mask = fg & (lum < 130) & (r < g + 25)
g_despill = np.where(g > rb_max, rb_max + (g - rb_max) * 0.12, g)
arr[:, :, 1] = np.where(despill_mask, np.clip(g_despill, 0, 255), arr[:, :, 1]).astype(np.uint8)

hh, ww = arr.shape[:2]
y_shelf = int(hh * 0.42)
shelf_body = np.zeros((hh, ww), dtype=bool)
shelf_body[y_shelf:, :] = True

# Solidify acrylic shelf body (front panel + base) before fringe cleanup.
acrylic = shelf_body & (lum > 35) & (ge < 34) & (arr[:, :, 3] > 0)
arr[acrylic, 3] = np.maximum(arr[acrylic, 3], 235)

# Drop green backdrop fringe only (not on shelf acrylic).
fringe = (arr[:, :, 3] < 40) & (ge > 35) & (g > 65) & (lum < 90) & ~shelf_body
arr[fringe, 3] = 0
arr[fringe, :3] = 0
wispy = (arr[:, :, 3] < 28) & (ge > 22) & (lum < 85) & ~shelf_body
arr[wispy, 3] = 0
arr[wispy, :3] = 0

# Premultiply RGB for clean compositing edges.
a_norm = arr[:, :, 3].astype(np.float32) / 255.0
arr[:, :, :3] = np.clip(arr[:, :, :3] * a_norm[..., np.newaxis], 0, 255).astype(np.uint8)

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

const onlyName = process.argv[2];
const remoteOverride = process.argv[3];
const targets = onlyName ? SHELVES.filter((s) => s.name === onlyName) : SHELVES;
if (onlyName && targets.length === 0) {
  console.error(`Unknown shelf "${onlyName}". Use: hd | transparent | custom`);
  process.exit(1);
}

for (const shelf of targets) {
  const tmpSrc = path.join(tmpDir, `${shelf.name}.jpeg`);
  const outPath = path.join(assetsDir, shelf.out);
  const remote = remoteOverride?.startsWith('http') ? remoteOverride : shelf.remote;
  console.log('Fetching', shelf.name, '…');
  execFileSync('curl', ['-fsSL', '-o', tmpSrc, remote], { stdio: 'inherit' });
  execFileSync('python3', ['-c', py, tmpSrc, outPath, '800'], { stdio: 'inherit', cwd: root });
  console.log('Wrote', outPath);
}

console.log(
  'Bump LOBBY_SHELF_ASSET_VERSION in src/constants/lobbySceneAssets.ts after deploy (Vercel caches /assets/*).'
);
