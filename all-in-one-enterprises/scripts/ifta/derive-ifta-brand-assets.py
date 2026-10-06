"""Derive IFTA family brand / media assets from APPROVED sources only (no generation, no stock).

  python3 scripts/ifta/derive-ifta-brand-assets.py <SITE00>/docs/aio/ifta/authority-bundle/source/AIO_IFTA_AUTHORITY_BUNDLE public/brand public/brand/ifta

Outputs are listed with their source + crop in src/ifta/ui/iftaAssetManifest.ts (media ownership).
"""
import sys
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

# 3 · Filing Room hero photograph — the photographic region of the approved client parent authority
#     (right of the baked headline, below the baked nav icons, above the baked metrics card)
hero = Image.open(f'{bundle}/02_CLIENT_MODE/AIO_IFTA_CLIENT_MOBILE_PARENT_AUTHORITY.jpeg').convert('RGB').crop((520, 88, 1206, 505))
hero = hero.resize((hero.width * 2, hero.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
hero.save(f'{out}/ifta-filing-room-hero.jpg', quality=90, optimize=True, progressive=True)
print('hero', hero.size)

# 4 · public footer range — mountain band of the approved login hero
login = Image.open(f'{brand}/aio-login-hero.png').convert('RGB')
band = login.crop((0, 400, 760, 640))  # range + dusk sky, left of the truck
band.save(f'{out}/ifta-public-range.jpg', quality=88, optimize=True, progressive=True)
print('range', band.size)

# 5 · runtime sizes (marks 220 px tall, lockups 200 px tall)
for name, h in [('aio-mark-on-dark.png', 220), ('aio-mark-on-light.png', 220), ('aio-lockup-on-dark.png', 200), ('aio-lockup-on-light.png', 200)]:
    m = Image.open(f'{out}/{name}')
    m.resize((round(m.width * h / m.height), h), Image.LANCZOS).save(f'{out}/{name}', optimize=True)
