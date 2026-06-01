#!/usr/bin/env node
/**
 * Bake lounge salon-chairs PNG from green-screen JPEG (preserves upholstery/chrome detail).
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

protect = (
    (ge < 18)
    | (sat < 32)
    | (lum > 145)
    | ((lum > 45) & (ge < 32) & (sat < 100))
)
is_bg = (ge > 42) & (g > 70)

alpha = np.zeros(r.shape, dtype=np.float32)
alpha[protect] = 255.0
alpha[is_bg] = 0.0
mid = ~protect & ~is_bg
if np.any(mid):
    t = np.clip((ge[mid] - 18.0) / 24.0, 0.0, 1.0)
    alpha[mid] = 255.0 * (1.0 - t)

spill = mid & (ge >= 18) & (ge <= 40)
alpha[spill] = np.maximum(alpha[spill], 210.0)

arr[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)

fg = arr[:, :, 3] > 20
rb_max = np.maximum(r, b)
despill_mask = fg & (lum < 140)
g_despill = np.where(g > rb_max, rb_max + (g - rb_max) * 0.1, g)
arr[:, :, 1] = np.where(despill_mask, np.clip(g_despill, 0, 255), arr[:, :, 1]).astype(np.uint8)

fringe = (arr[:, :, 3] < 40) & (ge > 35) & (g > 65) & (lum < 90)
arr[fringe, 3] = 0
arr[fringe, :3] = 0
wispy = (arr[:, :, 3] < 28) & (ge > 22) & (lum < 85)
arr[wispy, 3] = 0
arr[wispy, :3] = 0

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
print(out_im.size)
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
