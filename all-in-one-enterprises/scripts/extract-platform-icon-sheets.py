#!/usr/bin/env python3
"""Extract 24 platform icons from approved master sheets (03F / 03F.1)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

from icon_normalize_lib import CANVAS, crop_grid_cell, normalize_artwork, save_icon

ROOT = Path(__file__).resolve().parents[1]
ICON_ROOT = ROOT / 'public/brand/icons'

SHEETS: dict[str, dict] = {
    # NOTE 03F.2: Archived filenames are inverted vs visual content.
    # Compliance artwork lives in platform/_source-master-finance-platform.png
    # Finance/platform artwork lives in compliance/_source-master-compliance-business.png
    'compliance': {
        'source': ICON_ROOT / 'platform' / '_source-master-finance-platform.png',
        'out_dir': ICON_ROOT / 'compliance',
        'icons': [
            ('aio-icon-company-formation.png', 'companyFormation'),
            ('aio-icon-operating-authority.png', 'operatingAuthority'),
            ('aio-icon-permits.png', 'permits'),
            ('aio-icon-boc3.png', 'boc3'),
            ('aio-icon-ifta-fuel-tax.png', 'iftaFuelTax'),
            ('aio-icon-irp-road-tax.png', 'irpRoadTax'),
            ('aio-icon-renewals.png', 'renewals'),
            ('aio-icon-document-vault.png', 'documentVault'),
        ],
    },
    'freight': {
        'source': ICON_ROOT / 'freight' / '_source-master-fleet-freight.png',
        'out_dir': ICON_ROOT / 'freight',
        'icons': [
            ('aio-icon-fleet.png', 'fleet'),
            ('aio-icon-driver.png', 'driver'),
            ('aio-icon-dispatch-operations.png', 'operationsDispatch'),
            ('aio-icon-load-freight.png', 'loadFreight'),
            ('aio-icon-route-tracking.png', 'routeTracking'),
            ('aio-icon-bol-pod.png', 'bolPod'),
            ('aio-icon-shipper.png', 'shipper'),
            ('aio-icon-brokerage.png', 'brokerage'),
        ],
    },
    'platform': {
        'source': ICON_ROOT / 'compliance' / '_source-master-compliance-business.png',
        'out_dir': ICON_ROOT / 'platform',
        'icons': [
            ('aio-icon-factoring.png', 'factoring'),
            ('aio-icon-invoice-billing.png', 'invoiceBilling'),
            ('aio-icon-payments.png', 'payments'),
            ('aio-icon-reports-analytics.png', 'reportsAnalytics'),
            ('aio-icon-messages.png', 'messages'),
            ('aio-icon-notifications.png', 'notifications'),
            ('aio-icon-calendar-scheduling.png', 'calendarScheduling'),
            ('aio-icon-support.png', 'support'),
        ],
    },
}


def extract_sheet(sheet_key: str) -> None:
    meta = SHEETS[sheet_key]
    source = meta['source']
    if not source.exists():
        raise SystemExit(f'Missing source sheet: {source}')

    im = Image.open(source).convert('RGBA')
    cols, rows = 4, 2
    out_dir: Path = meta['out_dir']
    reports = []

    for idx, (filename, key) in enumerate(meta['icons']):
        row, col = divmod(idx, cols)
        cell = crop_grid_cell(im, row=row, col=col, cols=cols, rows=rows)
        out, report = normalize_artwork(cell, name=key, exclude_label_band=True)
        save_icon(out, out_dir / filename)
        reports.append(report)
        print(
            f'wrote {out_dir / filename} ({CANVAS}px, occ={report.occupancy_pct}%, edge={report.min_edge_clearance_pct}%)'
        )

    bad = [r for r in reports if r.touches_edge or r.min_edge_clearance_pct < 12]
    if bad:
        names = ', '.join(r.filename for r in bad)
        raise SystemExit(f'[{sheet_key}] edge clearance QA failed for: {names}')


def main() -> None:
    for key in SHEETS:
        extract_sheet(key)


if __name__ == '__main__':
    main()
