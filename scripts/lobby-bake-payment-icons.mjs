#!/usr/bin/env node
/**
 * Bake lobby payment PNGs (chroma-key) into public/assets/lobby-payment/.
 * Requires: python3, pillow, numpy.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PAYMENT_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder';

/** Still cropped from the multi-logo sheet until separate art exists. */
const SHEET_REMOTE = `${PAYMENT_BASE}/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz.jpeg`;

/** slug → Supabase JPEG URL */
const STANDALONE_REMOTES = {
  visa: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(8).jpeg`,
  amex: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(6).jpeg`,
  affirm: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz.jpeg`,
  paypal: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(4).jpeg`,
  'shop-pay': `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(1).jpeg`,
  'google-pay': `${PAYMENT_BASE}/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(1).jpeg`,
  afterpay: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(2).jpeg`,
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpDir = path.join(root, 'tmp');
const outDir = path.join(root, 'public/assets/lobby-payment');

const pyChromaSingle = `
from PIL import Image
import numpy as np, sys
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
arr = np.array(im.convert('RGB'))
h,w = arr.shape[:2]
pad = max(8, min(40, h//8, w//8))
corners = np.vstack([
    arr[0:pad,0:pad,:3].reshape(-1,3),
    arr[0:pad,-pad:,:3].reshape(-1,3),
    arr[-pad:,0:pad,:3].reshape(-1,3),
    arr[-pad:,-pad:,:3].reshape(-1,3),
])
bg = corners.mean(axis=0)
br,bgc,bb = bg
r,g,b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
cr,cg,cb = r.astype(np.float32), g.astype(np.float32), b.astype(np.float32)
dist = np.sqrt((cr-br)**2+(cg-bgc)**2+(cb-bb)**2)
ge = cg - np.maximum(cr, cb)
alpha = np.clip((dist-55)*(255/35), 0, 255)
alpha = np.where(ge>40, np.minimum(alpha, np.clip((ge-40)*5,0,255)), alpha).astype(np.uint8)
oa = np.array(im); oa[:,:,3] = alpha
out_im = Image.fromarray(oa)
bbox = out_im.getbbox()
if bbox: out_im = out_im.crop(bbox)
max_h = 512
w2,h2 = out_im.size
if h2 > max_h: out_im = out_im.resize((int(w2*max_h/h2), max_h), Image.Resampling.LANCZOS)
out_im.save(out, 'PNG')
print(out, out_im.size)
`;

const pySheet = `
from PIL import Image
import numpy as np, os, sys
src, out_dir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
w, h = im.size
# Cropped from multi-logo sheet (standalone JPEGs mislabeled for discover / apple-pay).
crops = {
    'mastercard': (1000, 60, 1790, 620),
    'discover': (60, 1900, 900, 2460),
    'apple-pay': (3450, 1300, 4230, 1860),
    'klarna': (3450, 60, 4230, 620),
}
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
    ge = cg.astype(np.float32) - np.maximum(cr.astype(np.float32), cb.astype(np.float32))
    alpha = np.clip((dist-55)*(255/35), 0, 255)
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
for lab, box in crops.items():
    out = chroma_key_crop(box)
    path = os.path.join(out_dir, f'{lab}.png')
    out.save(path, 'PNG')
    print(lab, out.size)
`;

mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

for (const [slug, url] of Object.entries(STANDALONE_REMOTES)) {
  const tmp = path.join(tmpDir, `lobby-pay-${slug}.jpeg`);
  execFileSync('curl', ['-fsSL', '-o', tmp, url], { stdio: 'inherit' });
  execFileSync('python3', ['-c', pyChromaSingle, tmp, path.join(outDir, `${slug}.png`)], {
    stdio: 'inherit',
    cwd: root,
  });
}

const tmpSheet = path.join(tmpDir, 'lobby-payment-cards-src.jpeg');
execFileSync('curl', ['-fsSL', '-o', tmpSheet, SHEET_REMOTE], { stdio: 'inherit' });
execFileSync('python3', ['-c', pySheet, tmpSheet, outDir], { stdio: 'inherit', cwd: root });

console.log('Wrote icons to', outDir);
console.log(
  'Bump LOBBY_PAYMENT_ICONS_VERSION in src/constants/lobbyPaymentIcons.ts after deploy if icons look cached.'
);
