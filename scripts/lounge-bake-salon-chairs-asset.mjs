#!/usr/bin/env node
/**
 * Bake lounge salon-chairs PNG from green-screen or gray-green studio JPEG.
 * Requires: python3 with pillow and numpy.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/p6V1N9X4lJoobnaRmSFSh_WE2x57MV.jpeg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpSrc = path.join(root, 'tmp/salon-chairs-src.jpeg');
const outPath = path.join(root, 'public/assets/salon-chairs.png');
const remote = process.argv[2] || REMOTE;

const py = `
from PIL import Image
import numpy as np
import sys

src, out, max_w = sys.argv[1], sys.argv[2], int(sys.argv[3])

def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

im = Image.open(src).convert('RGBA')
arr = np.array(im)
r = arr[:, :, 0].astype(np.float32)
g = arr[:, :, 1].astype(np.float32)
b = arr[:, :, 2].astype(np.float32)
h, w = r.shape
mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
sat = mx - mn
ge = g - np.maximum(r, b)
lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

s = min(120, h // 6, w // 6)
corners = [
    arr[0:s, 0:s, :3],
    arr[0:s, w - s : w, :3],
    arr[h - s : h, 0:s, :3],
    arr[h - s : h, w - s : w, :3],
]
bg = np.vstack([c.reshape(-1, 3) for c in corners]).mean(axis=0)
dist_bg = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)

is_greenscreen = bg[1] > bg[0] + 28 and bg[1] > bg[2] + 28

if is_greenscreen:
    protect = (
        (ge < 18)
        | (sat < 32)
        | (lum > 145)
        | ((lum > 45) & (ge < 32) & (sat < 100))
    )
    is_bg = (ge > 42) & (g > 70)
    alpha = np.zeros(r.shape, dtype=np.float32)
    alpha[protect] = 1.0
    alpha[is_bg] = 0.0
    mid = ~protect & ~is_bg
    if np.any(mid):
        t = np.clip((ge[mid] - 18.0) / 24.0, 0.0, 1.0)
        alpha[mid] = 1.0 - t
else:
    # Gray-green studio wall (p6V1N9X4…) — distance key from corner backdrop.
    alpha = smoothstep(24.0, 52.0, dist_bg)
    backdrop = dist_bg < 20.0
    alpha[backdrop] = 0.0
    # Keep chair upholstery, chrome, and highlights (not backdrop-colored).
    subject = (dist_bg > 58) | (lum < 90) | ((sat > 40) & (dist_bg > 32))
    alpha = np.where(subject, np.maximum(alpha, 0.92), alpha)
    chair_core = (dist_bg > 42) & (lum < 135)
    alpha[chair_core] = np.maximum(alpha[chair_core], 0.98)

alpha = np.clip(alpha, 0.0, 1.0)
arr[:, :, 3] = (alpha * 255).astype(np.uint8)

# Despill green cast from studio backdrop on edges.
fg = alpha > 0.08
rb_max = np.maximum(r, b)
despill = fg & (g > rb_max + 2) & (lum < 150)
g_fix = np.where(g > rb_max, rb_max + (g - rb_max) * 0.08, g)
arr[:, :, 1] = np.where(despill, np.clip(g_fix, 0, 255), arr[:, :, 1]).astype(np.uint8)

# Drop backdrop-colored fringe pixels.
fringe = (alpha < 0.22) & (dist_bg < 38) & ~is_greenscreen
arr[fringe, 3] = 0
arr[fringe, :3] = 0
wispy = (alpha < 0.14) & (dist_bg < 48)
arr[wispy, 3] = 0
arr[wispy, :3] = 0

# Premultiply RGB for clean edges.
a = arr[:, :, 3].astype(np.float32) / 255.0
arr[:, :, :3] = np.clip(arr[:, :, :3] * a[..., np.newaxis], 0, 255).astype(np.uint8)

out_im = Image.fromarray(arr)
alpha_ch = arr[:, :, 3]
ys, xs = np.where(alpha_ch > 128)
if len(xs):
    pad = 4
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
const localArg = process.argv[2];
let srcPath = tmpSrc;
if (localArg && existsSync(localArg)) {
  srcPath = localArg;
} else {
  const remoteUrl = localArg?.startsWith('http') ? localArg : remote;
  let fetchOk = false;
  try {
    execFileSync('curl', ['-fsSL', '-o', tmpSrc, remoteUrl], { stdio: 'inherit' });
    fetchOk = true;
  } catch {
    if (existsSync(tmpSrc)) {
      console.warn(
        `Fetch failed for ${remoteUrl} — rebaking from cached ${tmpSrc} (re-upload to Supabase if source changed).`
      );
    } else {
      throw new Error(`Could not download ${remoteUrl} and no cached ${tmpSrc}`);
    }
  }
  if (!fetchOk) {
    console.warn('Remote returned an error (often 404 not_found). Confirm the object is public in Supabase.');
  }
}
execFileSync('python3', ['-c', py, srcPath, outPath, '960'], { stdio: 'inherit', cwd: root });
console.log('Wrote', outPath);
console.log(
  'Bump LOUNGE_SALON_CHAIRS_ASSET_VERSION in src/constants/loungeSceneAssets.ts after deploy.'
);
