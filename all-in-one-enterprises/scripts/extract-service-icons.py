#!/usr/bin/env python3
"""Extract six service icons from the approved AIO master icon sheet (Refinement 03E)."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / 'public/brand/icons/services/_source-master-icon-sheet.png'
OUT_DIR = ROOT / 'public/brand/icons/services'

CANVAS = 256
TARGET_FILL = 0.72
LABEL_CUT = 0.68

ICONS = [
    ('aio-icon-start-business.png', 0),
    ('aio-icon-permits-compliance.png', 1),
    # Trucking Insurance: standalone override (03E.1) — see normalize-standalone-service-icon.py
    ('aio-icon-dispatch.png', 3),
    ('aio-icon-move-freight.png', 4),
    ('aio-icon-get-paid-faster.png', 5),
]


def make_transparent(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert('RGBA'))
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    white = (r > 235) & (g > 235) & (b > 235)
    arr[white, 3] = 0
    return Image.fromarray(arr)


def bbox_of_artwork(img: Image.Image) -> tuple[int, int, int, int]:
    arr = np.array(img)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    label_cut = int(img.height * LABEL_CUT)
    dark = (r < 90) & (g < 90) & (b < 90) & (a > 128)
    dark[label_cut:, :] = False
    ys, xs = np.where(dark)
    if len(xs) == 0:
        dark = (r < 90) & (g < 90) & (b < 90) & (a > 128)
        ys, xs = np.where(dark)
    return xs.min(), ys.min(), xs.max(), ys.max()


def normalize_icon(crop: Image.Image) -> Image.Image:
    crop = make_transparent(crop)
    x1, y1, x2, y2 = bbox_of_artwork(crop)
    pad = 8
    x1 = max(0, x1 - pad)
    y1 = max(0, y1 - pad)
    x2 = min(crop.width - 1, x2 + pad)
    y2 = min(crop.height - 1, y2 + pad)
    art = crop.crop((x1, y1, x2 + 1, y2 + 1))

    aw, ah = art.size
    scale = (CANVAS * TARGET_FILL) / max(aw, ah)
    nw, nh = max(1, int(round(aw * scale))), max(1, int(round(ah * scale)))
    art = art.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    ox = (CANVAS - nw) // 2
    oy = (CANVAS - nh) // 2
    canvas.paste(art, (ox, oy), art)
    return canvas


def main() -> None:
    if not MASTER.exists():
        raise SystemExit(f'Master sheet not found: {MASTER}')

    im = Image.open(MASTER).convert('RGBA')
    cols, rows = 3, 2
    cell_w, cell_h = im.width // cols, im.height // rows
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for filename, idx in ICONS:
        row, col = divmod(idx, cols)
        x0, y0 = col * cell_w, row * cell_h
        cell = im.crop((x0, y0, x0 + cell_w, y0 + cell_h))
        out = normalize_icon(cell)
        out.save(OUT_DIR / filename, optimize=True)
        print('wrote', OUT_DIR / filename)


if __name__ == '__main__':
    main()
