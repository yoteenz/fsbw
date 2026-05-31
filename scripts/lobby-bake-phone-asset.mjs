#!/usr/bin/env node
/**
 * Download lobby phone green-screen JPEG and write chroma-keyed PNG to public/assets/lobby-phone.png.
 * Requires: pip install pillow numpy (or run in env that has them).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/d35m8u3jneLSkpJrHKouG_Z4VtKzzm.jpeg';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'public/assets/lobby-phone.png');
const tmpSrc = path.join(root, 'tmp/lobby-phone-src.jpeg');

const py = `
from PIL import Image
import numpy as np
import sys

src = sys.argv[1]
out = sys.argv[2]
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
max_h = 512
w2, h2 = out_im.size
if h2 > max_h:
    out_im = out_im.resize((int(w2 * max_h / h2), max_h), Image.Resampling.LANCZOS)
out_im.save(out, 'PNG')
print(out_im.size)
`;

mkdirSync(path.dirname(tmpSrc), { recursive: true });
execFileSync('curl', ['-fsSL', '-o', tmpSrc, REMOTE], { stdio: 'inherit' });
execFileSync('python3', ['-c', py, tmpSrc, outPath], { stdio: 'inherit', cwd: root });
console.log('Wrote', outPath);
