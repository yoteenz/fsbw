#!/usr/bin/env python3
"""Extract six service icons from the approved AIO master icon sheet (03E / 03F.1)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

from icon_normalize_lib import CANVAS, audit_canvas, crop_grid_cell, normalize_artwork, save_icon

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / 'public/brand/icons/services/_source-master-icon-sheet.png'
INSURANCE_SRC = ROOT / 'public/brand/icons/services/_source-trucking-insurance-standalone.png'
OUT_DIR = ROOT / 'public/brand/icons/services'

ICONS = [
    ('aio-icon-start-business.png', 0, 'serviceStartBusiness'),
    ('aio-icon-permits-compliance.png', 1, 'servicePermitsCompliance'),
    ('aio-icon-dispatch.png', 3, 'serviceDispatch'),
    ('aio-icon-move-freight.png', 4, 'serviceMoveFreight'),
    ('aio-icon-get-paid-faster.png', 5, 'serviceGetPaidFaster'),
]


def main() -> None:
    if not MASTER.exists():
        raise SystemExit(f'Master sheet not found: {MASTER}')

    im = Image.open(MASTER).convert('RGBA')
    cols, rows = 3, 2
    reports = []

    for filename, idx, key in ICONS:
        row, col = divmod(idx, cols)
        cell = crop_grid_cell(im, row=row, col=col, cols=cols, rows=rows)
        out, report = normalize_artwork(cell, name=key, exclude_label_band=True)
        save_icon(out, OUT_DIR / filename)
        reports.append(report)
        print(f'wrote {OUT_DIR / filename} ({CANVAS}px, occ={report.occupancy_pct}%, edge={report.min_edge_clearance_pct}%)')

    if not INSURANCE_SRC.exists():
        raise SystemExit(f'Insurance standalone source missing: {INSURANCE_SRC}')
    insurance, ins_report = normalize_artwork(
        Image.open(INSURANCE_SRC),
        name='serviceTruckingInsurance',
    )
    save_icon(insurance, OUT_DIR / 'aio-icon-trucking-insurance.png')
    reports.append(ins_report)
    print(
        f'wrote {OUT_DIR / "aio-icon-trucking-insurance.png"} '
        f'({CANVAS}px, occ={ins_report.occupancy_pct}%, edge={ins_report.min_edge_clearance_pct}%)'
    )

    bad = [r for r in reports if r.touches_edge or r.min_edge_clearance_pct < 12]
    if bad:
        names = ', '.join(r.filename for r in bad)
        raise SystemExit(f'Edge clearance QA failed for: {names}')


if __name__ == '__main__':
    main()
