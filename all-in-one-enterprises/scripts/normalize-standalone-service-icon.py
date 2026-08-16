#!/usr/bin/env python3
"""Normalize a standalone service icon onto the 03F.1 512×512 transparent canvas."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

from icon_normalize_lib import CANVAS, normalize_artwork, save_icon

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / 'public/brand/icons/services'


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit('usage: normalize-standalone-service-icon.py <source.png> <output-filename.png> [semantic-key]')

    src = Path(sys.argv[1])
    dest = OUT_DIR / sys.argv[2]
    key = sys.argv[3] if len(sys.argv) > 3 else dest.stem
    out, report = normalize_artwork(Image.open(src), name=key)
    save_icon(out, dest)
    print(f'wrote {dest} ({CANVAS}px, occ={report.occupancy_pct}%, edge={report.min_edge_clearance_pct}%)')


if __name__ == '__main__':
    main()
