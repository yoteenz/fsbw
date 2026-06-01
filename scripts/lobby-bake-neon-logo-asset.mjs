#!/usr/bin/env node
/**
 * Bake lobby neon logo PNG from a dark-background JPEG (preserves glow halos).
 * Avoids fal-ai/birefnet/v2, which flattens neon glow on dark red walls.
 *
 * Usage: npm run lobby:bake-neon-logo
 * Requires: python3 with pillow and numpy.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEFAULT_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/Y6K-Yipl7T4pc1DCirLsp_J40m9P3V.jpeg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'public/assets/neon-logo.png');
const tmpSrc = path.join(root, 'tmp/neon-logo-src.jpeg');
const remote = process.argv[2] || DEFAULT_REMOTE;

const py = `
from PIL import Image, ImageFilter
import numpy as np
import sys

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
w, h = im.size
px = np.array(im, dtype=np.float32)
r, g, b = px[..., 0], px[..., 1], px[..., 2]

def clamp01(x):
    return np.clip(x, 0, 1)

def smoothstep(e0, e1, x):
    t = clamp01((x - e0) / (e1 - e0))
    return t * t * (3 - 2 * t)

lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
dist = np.sqrt(r * r + g * g + b * b) / 441.67
red_excess = np.maximum(0, r / 255 - np.maximum(g, b) / 255)

s = min(120, w // 8, h // 8)
corners = np.vstack([
    px[0:s, 0:s, :3].reshape(-1, 3),
    px[0:s, w - s : w, :3].reshape(-1, 3),
    px[h - s : h, 0:s, :3].reshape(-1, 3),
    px[h - s : h, w - s : w, :3].reshape(-1, 3),
])
bg = corners.mean(axis=0)
bg_dist = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) / 441.67

# Sign region (exclude full-frame dark wall)
neon = (red_excess > 0.08) & (lum > 0.12)
ys, xs = np.where(neon)
if len(xs) == 0:
    neon = lum > 0.2
    ys, xs = np.where(neon)
pad = int(max(w, h) * 0.04)
minx, maxx = max(0, int(xs.min()) - pad), min(w - 1, int(xs.max()) + pad)
miny, maxy = max(0, int(ys.min()) - pad), min(h - 1, int(ys.max()) + pad)

# Core tubes (for halo falloff)
core = (lum > 0.45) | (red_excess > 0.22)
core_img = Image.fromarray((core[miny:maxy + 1, minx:maxx + 1] * 255).astype(np.uint8), 'L')
halo = np.array(core_img.filter(ImageFilter.MaxFilter(121)), dtype=np.float32) / 255.0
halo = np.array(
    Image.fromarray((halo * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(18)),
    dtype=np.float32,
) / 255.0

cr = r[miny:maxy + 1, minx:maxx + 1]
cg = g[miny:maxy + 1, minx:maxx + 1]
cb = b[miny:maxy + 1, minx:maxx + 1]
clum = lum[miny:maxy + 1, minx:maxx + 1]
cdist = dist[miny:maxy + 1, minx:maxx + 1]
cred = red_excess[miny:maxy + 1, minx:maxx + 1]
cbg = bg_dist[miny:maxy + 1, minx:maxx + 1]

a_dist = smoothstep(0.06, 0.32, cdist)
a_lum = smoothstep(0.04, 0.18, clum)
a_red = smoothstep(0.02, 0.12, cred)
a_bg = smoothstep(0.07, 0.2, cbg)
alpha = np.maximum(a_dist, np.maximum(a_lum * 0.92, np.maximum(a_red * 0.88, a_bg)))
alpha = np.where((clum < 0.03) & (cdist < 0.09), alpha * 0.08, alpha)
alpha = np.where(clum > 0.55, np.minimum(1, alpha + (clum - 0.55) * 0.35), alpha)
alpha *= halo
alpha = clamp01(alpha)

alpha_img = Image.fromarray((alpha * 255).astype(np.uint8), 'L')
blurred = np.array(alpha_img.filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32) / 255.0
alpha = alpha * 0.5 + blurred * 0.5

ch, cw = maxy - miny + 1, maxx - minx + 1
out_arr = np.zeros((ch, cw, 4), dtype=np.uint8)
out_arr[..., 0] = cr.astype(np.uint8)
out_arr[..., 1] = cg.astype(np.uint8)
out_arr[..., 2] = cb.astype(np.uint8)
out_arr[..., 3] = (alpha * 255).astype(np.uint8)
out_im = Image.fromarray(out_arr, 'RGBA')

max_dim = 1100
w2, h2 = out_im.size
scale = min(1.0, max_dim / max(w2, h2))
if scale < 1:
    out_im = out_im.resize((max(1, int(w2 * scale)), max(1, int(h2 * scale))), Image.Resampling.LANCZOS)
out_im.save(out, 'PNG', optimize=True)
print(f'{out_im.size[0]}x{out_im.size[1]} crop {cw}x{ch} from {w}x{h}')
`;

mkdirSync(path.dirname(tmpSrc), { recursive: true });
execFileSync('curl', ['-fsSL', '-o', tmpSrc, remote], { stdio: 'inherit' });
execFileSync('python3', ['-c', py, tmpSrc, outPath], { stdio: 'inherit', cwd: root });
console.log('Wrote', outPath);
console.log(
  'Bump LOBBY_NEON_LOGO_ASSET_VERSION in src/constants/lobbySceneAssets.ts after deploy (Vercel caches /assets/*).'
);
