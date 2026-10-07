"""Derive IFTA family brand / media assets from APPROVED sources only (no generation, no stock).

  python3 scripts/ifta/derive-ifta-brand-assets.py <SITE00>/docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE public/brand public/brand/ifta

Outputs are listed with their source + crop in src/ifta/ui/iftaAssetManifest.ts (media ownership).
"""
import sys

sys.exit(
    "Refused. The IFTA footer lockup is the founder full logo. "
    "This script must not overwrite public/brand/ifta lockups or marks."
)

import numpy as np
from PIL import Image, ImageFilter

bundle, brand, out = sys.argv[1:4]

def alpha_from_black(img, lo, hi):
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    lum = a.max(axis=2)
    alpha = np.clip((lum - lo) / (hi - lo), 0, 1)
    safe = np.where(alpha > 0.004, alpha, 1)[..., None]
    rgb = np.clip(a / safe, 0, 255)
    return rgb, alpha

def save_rgba(rgb, alpha, path, trim=True):
    rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    if trim:
        bbox = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        pad = 6
        im = im.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad)))
    im.save(path, optimize=True)
    return im.size

def recolor_white(rgb, alpha, to=(26, 26, 26)):
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    whiteish = ((mx - mn) < 46) & (mx > 110)
    out = rgb.copy()
    out[whiteish] = to
    return out

# 1 · metallic emblem (dark surfaces) from AIO_SIMPLE_NAV_MARK
nav = Image.open(f'{bundle}/00_BRAND/AIO_SIMPLE_NAV_MARK.jpeg').crop((160, 240, 1080, 920))
rgb, a = alpha_from_black(nav, 34, 120)
print('mark-on-dark', save_rgba(rgb, a, f'{out}/aio-mark-on-dark.png'))

# 2 · flat emblem + lockups from the approved lockup PNG
lock = Image.open(f'{brand}/aio-logo-lockup.png')
emb = lock.crop((170, 270, 620, 615))
rgb, a = alpha_from_black(emb, 8, 200)
print('mark-on-light', save_rgba(recolor_white(rgb, a), a, f'{out}/aio-mark-on-light.png'))
full = lock.crop((160, 260, 1580, 620))
rgb, a = alpha_from_black(full, 8, 200)
print('lockup-on-dark', save_rgba(rgb, a, f'{out}/aio-lockup-on-dark.png'))
print('lockup-on-light', save_rgba(recolor_white(rgb, a), a, f'{out}/aio-lockup-on-light.png'))

# Hero / media plates come from the authority boards: scripts/ifta/derive-ifta-authority-plates.py
