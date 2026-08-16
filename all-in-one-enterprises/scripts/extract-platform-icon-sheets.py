#!/usr/bin/env python3
"""Extract 24 platform icons from approved master sheets (Refinement 03F)."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ICON_ROOT = ROOT / 'public/brand/icons'

CANVAS = 256
TARGET_FILL = 0.72
INSET_RATIO = 0.08  # trim grid cell margins before bbox

# Identified by visual content (not upload order)
SHEETS: dict[str, dict] = {
    'compliance': {
        'source': ICON_ROOT / 'compliance' / '_source-master-compliance-business.png',
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
        'source': ICON_ROOT / 'platform' / '_source-master-finance-platform.png',
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
    if len(xs) == 0:
        raise ValueError('no artwork pixels found')
    return xs.min(), ys.min(), xs.max(), ys.max()


def normalize_cell(cell: Image.Image) -> Image.Image:
    w, h = cell.size
    inset_x = int(w * INSET_RATIO)
    inset_y = int(h * INSET_RATIO)
    trimmed = cell.crop((inset_x, inset_y, w - inset_x, h - inset_y))
    trimmed = make_transparent(trimmed)
    x1, y1, x2, y2 = bbox_of_artwork(trimmed)
    pad = 10
    x1 = max(0, x1 - pad)
    y1 = max(0, y1 - pad)
    x2 = min(trimmed.width - 1, x2 + pad)
    y2 = min(trimmed.height - 1, y2 + pad)
    art = trimmed.crop((x1, y1, x2 + 1, y2 + 1))

    aw, ah = art.size
    scale = (CANVAS * TARGET_FILL) / max(aw, ah)
    nw, nh = max(1, int(round(aw * scale))), max(1, int(round(ah * scale)))
    art = art.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    ox = (CANVAS - nw) // 2
    oy = (CANVAS - nh) // 2
    canvas.paste(art, (ox, oy), art)
    return canvas


def extract_sheet(sheet_key: str) -> None:
    meta = SHEETS[sheet_key]
    source = meta['source']
    if not source.exists():
        raise SystemExit(f'Missing source sheet: {source}')

    im = Image.open(source).convert('RGBA')
    cols, rows = 4, 2
    cell_w, cell_h = im.width // cols, im.height // rows
    out_dir: Path = meta['out_dir']
    out_dir.mkdir(parents=True, exist_ok=True)

    for idx, (filename, _key) in enumerate(meta['icons']):
        row, col = divmod(idx, cols)
        cell = im.crop((col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h))
        out = normalize_cell(cell)
        out.save(out_dir / filename, optimize=True)
        print('wrote', out_dir / filename)


def main() -> None:
    for key in SHEETS:
        extract_sheet(key)


if __name__ == '__main__':
    main()
