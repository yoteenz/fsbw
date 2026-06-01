#!/usr/bin/env node
/**
 * Bake lobby display-case PNG from green-screen JPEG (preserves acrylic edges/reflections).
 * Requires: python3 with pillow and numpy.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/RRrEEA6lu1lkeleVPTgsP_wgs8vmEv.jpeg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpSrc = path.join(root, 'tmp/lobby-case-src.jpeg');
const outPath = path.join(root, 'public/assets/CASE.png');
const remote = process.argv[2] || REMOTE;

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

# Acrylic case, rims, interior props — keep opaque (avoid panel holes).
protect = (
    (ge < 18)
    | (sat < 32)
    | (lum > 145)
    | ((lum > 50) & (ge < 30) & (sat < 95))
    | ((r > 115) & (r > g + 12) & (sat > 40))
)
is_bg = (ge > 42) & (g > 70)

alpha = np.zeros(r.shape, dtype=np.float32)
alpha[protect] = 255.0
alpha[is_bg] = 0.0
mid = ~protect & ~is_bg
if np.any(mid):
    t = np.clip((ge[mid] - 18.0) / 24.0, 0.0, 1.0)
    alpha[mid] = 255.0 * (1.0 - t)

spill = mid & (ge >= 18) & (ge <= 38)
alpha[spill] = np.maximum(alpha[spill], 200.0)

arr[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

fg = arr[:, :, 3] > 20
rb_max = np.maximum(r, b)
despill_mask = fg & (lum < 130) & (r < g + 25)
g_despill = np.where(g > rb_max, rb_max + (g - rb_max) * 0.12, g)
arr[:, :, 1] = np.where(despill_mask, np.clip(g_despill, 0, 255), arr[:, :, 1]).astype(np.uint8)

# Solidify clear acrylic panels across the full case.
acrylic = (lum > 32) & (ge < 34) & (arr[:, :, 3] > 0)
arr[acrylic, 3] = np.maximum(arr[acrylic, 3], 235)

fringe = (arr[:, :, 3] < 40) & (ge > 35) & (g > 65) & (lum < 90) & ~acrylic
arr[fringe, 3] = 0
arr[fringe, :3] = 0
wispy = (arr[:, :, 3] < 28) & (ge > 22) & (lum < 85) & ~acrylic
arr[wispy, 3] = 0
arr[wispy, :3] = 0

a_norm = arr[:, :, 3].astype(np.float32) / 255.0
arr[:, :, :3] = np.clip(arr[:, :, :3] * a_norm[..., np.newaxis], 0, 255).astype(np.uint8)

out_im = Image.fromarray(arr)
alpha_ch = arr[:, :, 3]
ys, xs = np.where(alpha_ch > 128)
if len(xs):
    pad = 3
    bbox = (
        max(0, int(xs.min()) - pad),
        max(0, int(ys.min()) - pad),
        min(alpha_ch.shape[1], int(xs.max()) + pad + 1),
        min(alpha_ch.shape[0], int(ys.max()) + pad + 1),
    )
    out_im = out_im.crop(bbox)
w2, h2 = out_im.size
if w2 > max_w:
    out_im = out_im.resize((max_w, max(1, int(h2 * max_w / w2))), Image.Resampling.LANCZOS)
out_im.save(out, 'PNG', optimize=True)
print(out_im.size, 'transparent%', round(100 * (np.array(out_im)[:, :, 3] < 10).mean(), 1))
`;

mkdirSync(path.dirname(tmpSrc), { recursive: true });
execFileSync('curl', ['-fsSL', '-o', tmpSrc, remote], { stdio: 'inherit' });
execFileSync('python3', ['-c', py, tmpSrc, outPath, '920'], { stdio: 'inherit', cwd: root });
console.log('Wrote', outPath);
console.log('Bump LOBBY_CASE_ASSET_VERSION in src/constants/lobbyCaseAssets.ts after deploy.');
