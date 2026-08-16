#!/usr/bin/env python3
"""Verify normalized icon assets meet 03F.1 edge-clearance rules."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

from icon_normalize_lib import CANVAS, MIN_EDGE_CLEARANCE_RATIO, audit_canvas

ROOT = Path(__file__).resolve().parents[1]
ICON_ROOT = ROOT / 'public/brand/icons'


def main() -> None:
    files = sorted(ICON_ROOT.rglob('aio-icon-*.png'))
    failures = []
    print('file | canvas | occ% | minEdge% | touch')
    for path in files:
        im = Image.open(path)
        if im.size != (CANVAS, CANVAS):
            failures.append(f'{path.name}: canvas {im.size} != {CANVAS}x{CANVAS}')
        report = audit_canvas(im.convert('RGBA'), path.name, 0)
        touch = 'YES' if report.touches_edge else '-'
        print(
            f"{report.filename} | {report.canvas[0]}x{report.canvas[1]} | "
            f"{report.occupancy_pct} | {report.min_edge_clearance_pct} | {touch}"
        )
        if report.touches_edge or report.min_edge_clearance_pct < MIN_EDGE_CLEARANCE_RATIO * 100:
            failures.append(
                f'{path.name}: edge clearance {report.min_edge_clearance_pct}% (min {MIN_EDGE_CLEARANCE_RATIO*100:.0f}%)'
            )
        if not (60 <= report.occupancy_pct <= 75):
            failures.append(f'{path.name}: occupancy {report.occupancy_pct}% outside 60–75% band')

    if failures:
        raise SystemExit('QA failures:\n' + '\n'.join(failures))
    print(f'OK — {len(files)} icons verified')


if __name__ == '__main__':
    main()
