#!/usr/bin/env node
/**
 * Bake lobby nav neon PNG (products / tools / booking) from gray or dark JPEG.
 * Preserves glow halos — avoids BiRefNet flattening.
 *
 * Usage:
 *   npm run lobby:bake-neon-products [remote-url]
 *   npm run lobby:bake-neon-nav -- products|tools|booking [remote-url]
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const NAV = {
  products: {
    out: 'neon-products.png',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/XmqZbgWvltNaqQ7UNbrHu_2iaRxZwG.jpeg',
    maxDim: 900,
  },
  tools: {
    out: 'neon-tools.png',
    remote: '',
    maxDim: 900,
  },
  booking: {
    out: 'neon-booking.png',
    remote: '',
    maxDim: 900,
  },
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const py = `
from PIL import Image, ImageFilter
import numpy as np
import sys

src, out, max_dim = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGBA')
w, h = im.size
# Downscale huge studio JPEGs before halo filters (full-res is slow and unnecessary).
work_max = 2400
if max(w, h) > work_max:
    scale0 = work_max / max(w, h)
    im = im.resize((max(1, int(w * scale0)), max(1, int(h * scale0))), Image.Resampling.LANCZOS)
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
bg_dist = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
bg_dist_n = bg_dist / 255.0
white_bg = bg[0] > 240 and bg[1] > 240 and bg[2] > 240

# Bbox from sign + glow only — white/gray studio: ignore bare luminance (entire frame reads bright).
if white_bg:
    neon = (bg_dist > 28) | (red_excess > 0.10) | ((lum > 0.35) & (lum < 0.97) & (red_excess > 0.04))
else:
    neon = (bg_dist > 42) | (red_excess > 0.18) | (lum > 0.52)
ys, xs = np.where(neon)
if len(xs) == 0:
    neon = (red_excess > 0.10) | (bg_dist > 24)
    ys, xs = np.where(neon)
pad = int(max(w, h) * 0.03)
minx, maxx = max(0, int(xs.min()) - pad), min(w - 1, int(xs.max()) + pad)
miny, maxy = max(0, int(ys.min()) - pad), min(h - 1, int(ys.max()) + pad)

core = (lum > 0.38) | (red_excess > 0.14)
core_img = Image.fromarray((core[miny:maxy + 1, minx:maxx + 1] * 255).astype(np.uint8), 'L')
halo_px = int(max(maxy - miny, maxx - minx) * 0.18) | 1
halo_px = min(max(halo_px, 31), 81)
if halo_px % 2 == 0:
    halo_px += 1
halo = np.array(core_img.filter(ImageFilter.MaxFilter(halo_px)), dtype=np.float32) / 255.0
blur_r = max(6, halo_px // 8)
halo = np.array(
    Image.fromarray((halo * 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(blur_r)),
    dtype=np.float32,
) / 255.0

cr = r[miny:maxy + 1, minx:maxx + 1]
cg = g[miny:maxy + 1, minx:maxx + 1]
cb = b[miny:maxy + 1, minx:maxx + 1]
clum = lum[miny:maxy + 1, minx:maxx + 1]
cdist = dist[miny:maxy + 1, minx:maxx + 1]
cred = red_excess[miny:maxy + 1, minx:maxx + 1]
cbg = bg_dist_n[miny:maxy + 1, minx:maxx + 1]
raw_bg = bg_dist[miny:maxy + 1, minx:maxx + 1]

a_dist = smoothstep(0.05, 0.28, cdist)
a_lum = smoothstep(0.04, 0.18, clum)
a_red = smoothstep(0.10, 0.22, cred)
# Gray studio: distance from sampled corner backdrop.
a_bg = smoothstep(0.06, 0.20, cbg)
alpha = np.maximum(a_red, np.maximum(a_lum * 0.9, a_dist * 0.75))
alpha = np.maximum(alpha, a_bg)
# Hard-remove neutral studio inside crop.
if white_bg:
    backdrop = (raw_bg < 52) | ((clum > 0.90) & (cred < 0.10))
else:
    backdrop = raw_bg < 44
alpha = np.where(backdrop, 0.0, alpha)
alpha = np.where((raw_bg < 58) & (cred < 0.12) & (clum < 0.48), np.minimum(alpha, 0.08), alpha)
alpha = np.where((cred > 0.08) & (clum > 0.5), np.minimum(1, alpha + (clum - 0.5) * 0.4), alpha)
alpha *= halo
alpha = clamp01(alpha)

alpha_img = Image.fromarray((alpha * 255).astype(np.uint8), 'L')
blurred = np.array(alpha_img.filter(ImageFilter.GaussianBlur(1.0)), dtype=np.float32) / 255.0
alpha = alpha * 0.55 + blurred * 0.45

ch, cw = maxy - miny + 1, maxx - minx + 1
out_arr = np.zeros((ch, cw, 4), dtype=np.uint8)
out_arr[..., 0] = cr.astype(np.uint8)
out_arr[..., 1] = cg.astype(np.uint8)
out_arr[..., 2] = cb.astype(np.uint8)
out_arr[..., 3] = (alpha * 255).astype(np.uint8)
out_im = Image.fromarray(out_arr, 'RGBA')

w2, h2 = out_im.size
scale = min(1.0, max_dim / max(w2, h2))
if scale < 1:
    out_im = out_im.resize((max(1, int(w2 * scale)), max(1, int(h2 * scale))), Image.Resampling.LANCZOS)
out_im.save(out, 'PNG', optimize=True)
a = np.array(out_im)[:, :, 3]
print(f'{out_im.size[0]}x{out_im.size[1]} transparent% {round(100 * (a < 10).mean(), 1)} crop {cw}x{ch} from {w}x{h}')
`;

const args = process.argv.slice(2);
let navKey = 'products';
let remoteOverride = null;
if (args[0] && NAV[args[0]]) {
  navKey = args[0];
  remoteOverride = args[1] || null;
} else if (args[0]?.startsWith('http')) {
  remoteOverride = args[0];
}

const cfg = NAV[navKey];
if (!cfg) {
  console.error('Unknown nav key. Use: products | tools | booking');
  process.exit(1);
}

const remote = remoteOverride || cfg.remote;
if (!remote) {
  console.error(`No remote URL for ${navKey}. Pass URL as second argument.`);
  process.exit(1);
}

const outPath = path.join(root, 'public/assets', cfg.out);
const tmpSrc = path.join(root, 'tmp', `neon-${navKey}-src.jpeg`);

mkdirSync(path.dirname(tmpSrc), { recursive: true });
execFileSync('curl', ['-fsSL', '-o', tmpSrc, remote], { stdio: 'inherit' });
execFileSync('python3', ['-c', py, tmpSrc, outPath, String(cfg.maxDim)], { stdio: 'inherit', cwd: root });
console.log('Wrote', outPath);
console.log(`Bump LOBBY_NEON_* version in lobbySceneAssets.ts for ${cfg.out}`);
