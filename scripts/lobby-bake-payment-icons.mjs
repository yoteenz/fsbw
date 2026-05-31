#!/usr/bin/env node
/**
 * Crop payment logos from the green-screen sheet and write PNGs to public/assets/lobby-payment/.
 * Requires: python3, pillow, numpy (`pip install pillow numpy`).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz.jpeg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpSrc = path.join(root, 'tmp/lobby-payment-cards-src.jpeg');
const outDir = path.join(root, 'public/assets/lobby-payment');

const py = `
from PIL import Image
import numpy as np
import os, sys

src, out_dir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
w, h = im.size

rows = [(60, 620), (1250, 1810)]
cols = [(180, 990), (1000, 1790), (1820, 2590), (2650, 3420), (3450, 4230), (4260, 5030)]
labels_r1 = ['visa', 'mastercard', 'amex', 'discover', 'klarna', 'affirm']
labels_r2 = ['apple-pay', 'paypal', 'afterpay', 'shop-pay']

def chroma_key_crop(box):
    crop = im.crop(box)
    ca = np.array(crop.convert('RGB'))
    cr, cg, cb = ca[:,:,0], ca[:,:,1], ca[:,:,2]
    corners = np.vstack([
        ca[0:30,0:30,:3].reshape(-1,3),
        ca[0:30,-30:,:3].reshape(-1,3),
        ca[-30:,0:30,:3].reshape(-1,3),
        ca[-30:,-30:,:3].reshape(-1,3),
    ])
    bg = corners.mean(axis=0)
    br, bgc, bb = bg
    dist = np.sqrt((cr-br)**2+(cg-bgc)**2+(cb-bb)**2)
    ge = cg - np.maximum(cr, cb)
    alpha = np.clip((dist-65)*(255/30), 0, 255)
    alpha = np.where(ge>40, np.minimum(alpha, np.clip((ge-40)*5,0,255)), alpha).astype(np.uint8)
    out = crop.convert('RGBA')
    oa = np.array(out)
    oa[:,:,3] = alpha
    out = Image.fromarray(oa)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    return out

os.makedirs(out_dir, exist_ok=True)
for ri, (y0, y1) in enumerate(rows):
    labs = labels_r1 if ri == 0 else labels_r2
    for ci, (x0, x1) in enumerate(cols):
        if ci >= len(labs):
            break
        lab = labs[ci]
        pad = 8
        box = (max(0, x0-pad), max(0, y0-pad), min(w, x1+pad), min(h, y1+pad))
        out = chroma_key_crop(box)
        out.save(os.path.join(out_dir, f'{lab}.png'), 'PNG')
        print(lab, out.size)
`;

mkdirSync(path.dirname(tmpSrc), { recursive: true });
mkdirSync(outDir, { recursive: true });
execFileSync('curl', ['-fsSL', '-o', tmpSrc, REMOTE], { stdio: 'inherit' });
execFileSync('python3', ['-c', py, tmpSrc, outDir], { stdio: 'inherit', cwd: root });
console.log('Wrote icons to', outDir);
console.log(
  'Bump LOBBY_PAYMENT_ICONS_VERSION in src/constants/lobbyPaymentIcons.ts after deploy if icons look cached.'
);
