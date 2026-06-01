#!/usr/bin/env node
/**
 * Bake lounge TV design PNG from green-screen JPEG.
 * Requires: python3 with pillow and numpy.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEFAULT_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/kv6DR-SLYFfBb8V4UPFOr_WHgmeCou.jpeg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpSrc = path.join(root, 'tmp/lounge-tv-design-src.jpeg');
const outPath = path.join(root, 'public/assets/lounge-tv-design.png');
const remote = process.argv[2] || DEFAULT_REMOTE;

const py = `
from PIL import Image
import numpy as np
import sys

src, out, max_w = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGBA')
arr = np.array(im)
h, w = arr.shape[:2]
r = arr[:, :, 0].astype(np.float32)
g = arr[:, :, 1].astype(np.float32)
b = arr[:, :, 2].astype(np.float32)
mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
sat = mx - mn
ge = g - np.maximum(r, b)
lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

# Studio gray / white backdrop (corner sample).
s = min(80, h // 8, w // 8)
corners = [arr[0:s, 0:s, :3], arr[0:s, w - s : w, :3], arr[h - s : h, 0:s, :3], arr[h - s : h, w - s : w, :3]]
bg = np.vstack([c.reshape(-1, 3) for c in corners]).mean(axis=0)
dist_bg = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
alpha_studio = np.clip((dist_bg - 36) * (255 / 32), 0, 255)

# Green-screen fallback.
protect = (ge < 18) | (sat < 32) | (lum > 145) | ((lum > 45) & (ge < 32) & (sat < 100))
is_bg = (ge > 42) & (g > 70)
alpha_green = np.zeros(r.shape, dtype=np.float32)
alpha_green[protect] = 255.0
alpha_green[is_bg] = 0.0
mid = ~protect & ~is_bg
if np.any(mid):
    t = np.clip((ge[mid] - 18.0) / 24.0, 0.0, 1.0)
    alpha_green[mid] = 255.0 * (1.0 - t)

is_greenscreen = bg[1] > bg[0] + 28 and bg[1] > bg[2] + 28
arr[:, :, 3] = (alpha_green if is_greenscreen else alpha_studio).astype(np.uint8)

fg = arr[:, :, 3] > 20
rb_max = np.maximum(r, b)
despill_mask = fg & (lum < 140) & (ge > 20)
g_despill = np.where(g > rb_max, rb_max + (g - rb_max) * 0.1, g)
arr[:, :, 1] = np.where(despill_mask, np.clip(g_despill, 0, 255), arr[:, :, 1]).astype(np.uint8)

fringe = (arr[:, :, 3] < 40) & (dist_bg < 50) & (lum > 120)
arr[fringe, 3] = 0
arr[fringe, :3] = 0
wispy = (arr[:, :, 3] < 24) & (dist_bg < 42)
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
execFileSync('curl', ['-fsSL', '-o', tmpSrc, remote], { stdio: 'inherit' });
execFileSync('python3', ['-c', py, tmpSrc, outPath, '820'], { stdio: 'inherit', cwd: root });
console.log('Wrote', outPath);
