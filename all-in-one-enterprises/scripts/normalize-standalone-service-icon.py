#!/usr/bin/env python3
"""Normalize a standalone service icon onto the 03E 256×256 transparent canvas."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / 'public/brand/icons/services'
CANVAS = 256
TARGET_FILL = 0.72


def make_transparent(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert('RGBA'))
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    white = (r > 235) & (g > 235) & (b > 235)
    arr[white, 3] = 0
    arr[a < 16, 3] = 0
    return Image.fromarray(arr)


def bbox_of_artwork(img: Image.Image) -> tuple[int, int, int, int]:
    arr = np.array(img)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    dark = (r < 90) & (g < 90) & (b < 90) & (a > 128)
    ys, xs = np.where(dark)
    return xs.min(), ys.min(), xs.max(), ys.max()


def normalize_standalone(src: Path, dest: Path, target_fill: float = TARGET_FILL) -> None:
    im = make_transparent(Image.open(src))
    x1, y1, x2, y2 = bbox_of_artwork(im)
    pad = 12
    x1 = max(0, x1 - pad)
    y1 = max(0, y1 - pad)
    x2 = min(im.width - 1, x2 + pad)
    y2 = min(im.height - 1, y2 + pad)
    art = im.crop((x1, y1, x2 + 1, y2 + 1))

    aw, ah = art.size
    scale = (CANVAS * target_fill) / max(aw, ah)
    nw, nh = max(1, int(round(aw * scale))), max(1, int(round(ah * scale)))
    art = art.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    ox = (CANVAS - nw) // 2
    oy = (CANVAS - nh) // 2
    canvas.paste(art, (ox, oy), art)
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, optimize=True)


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit('usage: normalize-standalone-service-icon.py <source.png> <output-filename.png>')

    src = Path(sys.argv[1])
    dest = OUT_DIR / sys.argv[2]
    normalize_standalone(src, dest)
    print('wrote', dest)


if __name__ == '__main__':
    main()
