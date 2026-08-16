#!/usr/bin/env python3
"""03F.2 — Full expanded icon library quality audit (24 platform icons)."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from icon_normalize_lib import CANVAS, audit_canvas

ROOT = Path(__file__).resolve().parents[1]
ICON_ROOT = ROOT / 'public/brand/icons'
OUT_JSON = ROOT / 'docs/design/aio-expanded-icon-audit.json'
CONTACT_SHEET = ROOT / 'public/brand/icons/_qa-expanded-icon-contact-sheet.png'

EXPANDED_ICONS: list[tuple[str, str, str, str, int]] = [
    # group, registry_key, filename, label, min_recommended_px
    ('compliance', 'companyFormation', 'aio-icon-company-formation.png', 'Company Formation', 32),
    ('compliance', 'operatingAuthority', 'aio-icon-operating-authority.png', 'Operating Authority', 32),
    ('compliance', 'permits', 'aio-icon-permits.png', 'Permits', 32),
    ('compliance', 'boc3', 'aio-icon-boc3.png', 'BOC-3', 32),
    ('compliance', 'iftaFuelTax', 'aio-icon-ifta-fuel-tax.png', 'IFTA / Fuel Tax', 32),
    ('compliance', 'irpRoadTax', 'aio-icon-irp-road-tax.png', 'IRP / Road Tax', 32),
    ('compliance', 'renewals', 'aio-icon-renewals.png', 'Renewals', 32),
    ('compliance', 'documentVault', 'aio-icon-document-vault.png', 'Document Vault', 32),
    ('freight', 'fleet', 'aio-icon-fleet.png', 'Fleet', 32),
    ('freight', 'driver', 'aio-icon-driver.png', 'Driver', 32),
    ('freight', 'operationsDispatch', 'aio-icon-dispatch-operations.png', 'Dispatch', 40),
    ('freight', 'loadFreight', 'aio-icon-load-freight.png', 'Load / Freight', 32),
    ('freight', 'routeTracking', 'aio-icon-route-tracking.png', 'Route / Tracking', 40),
    ('freight', 'bolPod', 'aio-icon-bol-pod.png', 'BOL / POD', 40),
    ('freight', 'shipper', 'aio-icon-shipper.png', 'Shipper', 32),
    ('freight', 'brokerage', 'aio-icon-brokerage.png', 'Brokerage', 32),
    ('platform', 'factoring', 'aio-icon-factoring.png', 'Factoring / Cash Flow', 40),
    ('platform', 'invoiceBilling', 'aio-icon-invoice-billing.png', 'Invoice / Billing', 40),
    ('platform', 'payments', 'aio-icon-payments.png', 'Payments / Payouts', 32),
    ('platform', 'reportsAnalytics', 'aio-icon-reports-analytics.png', 'Reports / Analytics', 32),
    ('platform', 'messages', 'aio-icon-messages.png', 'Messages / Chat', 32),
    ('platform', 'notifications', 'aio-icon-notifications.png', 'Notifications', 40),
    ('platform', 'calendarScheduling', 'aio-icon-calendar-scheduling.png', 'Calendar / Scheduling', 40),
    ('platform', 'support', 'aio-icon-support.png', 'Support / Help', 32),
]


@dataclass
class IconAudit:
    icon: str
    registry_key: str
    group: str
    label: str
    status: str
    canvas: str
    edge_safe: bool
    centered: bool
    transparent: bool
    registry_ok: bool
    min_size_px: int
    occupancy_pct: float
    min_edge_clearance_pct: float
    h_balance_pct: float
    v_balance_pct: float
    neighbor_contamination: bool
    matte_background: bool
    notes: str


def _stroke_mask(arr: np.ndarray) -> np.ndarray:
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    visible = a > 48
    non_white = ~((r > 230) & (g > 230) & (b > 230))
    stroke = visible & non_white & ((r < 110) & (g < 110) & (b < 110))
    return stroke if stroke.any() else (visible & non_white)


def check_transparency(arr: np.ndarray) -> tuple[bool, bool]:
    """Returns (corner_transparent, no_opaque_matte)."""
    a = arr[:, :, 3]
    corner = 24
    corners = [
        a[:corner, :corner],
        a[:corner, -corner:],
        a[-corner:, :corner],
        a[-corner:, -corner:],
    ]
    corner_transparent = all(int(c.max()) <= 16 for c in corners)

    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mask = _stroke_mask(arr)
    bg = ~mask
    # Flag only substantially opaque non-artwork pixels (ignore anti-aliased fringe)
    matte = bg & (a > 128) & ~((r > 230) & (g > 230) & (b > 230))
    no_matte = not bool(matte.any())
    return corner_transparent, no_matte


def check_centering(report_bounds: tuple[int, int, int, int], size: int) -> tuple[bool, float, float]:
    x1, y1, x2, y2 = report_bounds
    aw, ah = x2 - x1 + 1, y2 - y1 + 1
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    center = (size - 1) / 2
    h_balance = abs(cx - center) / size * 100
    v_balance = abs(cy - center) / size * 100
    # Allow up to 3% optical offset
    centered = bool(h_balance <= 3.0 and v_balance <= 3.0)
    return centered, round(h_balance, 1), round(v_balance, 1)


def check_neighbor_contamination(arr: np.ndarray, bounds: tuple[int, int, int, int]) -> bool:
    """Detect isolated dark pixels far outside main artwork cluster."""
    h, w = arr.shape[:2]
    mask = _stroke_mask(arr)
    if not mask.any():
        return True

    x1, y1, x2, y2 = bounds
    aw, ah = x2 - x1 + 1, y2 - y1 + 1
    pad = int(max(aw, ah) * 0.08)
    inner = np.zeros((h, w), dtype=bool)
    inner[
        max(0, y1 - pad) : min(h, y2 + pad + 1),
        max(0, x1 - pad) : min(w, x2 + pad + 1),
    ] = True
    outer_strokes = mask & ~inner
    return bool(outer_strokes.any())


def audit_icon(group: str, key: str, filename: str, label: str, min_px: int) -> IconAudit:
    path = ICON_ROOT / group / filename
    notes: list[str] = []
    registry_ok = path.exists()

    if not path.exists():
        return IconAudit(
            icon=filename,
            registry_key=key,
            group=group,
            label=label,
            status='MISSING',
            canvas='—',
            edge_safe=False,
            centered=False,
            transparent=False,
            registry_ok=False,
            min_size_px=min_px,
            occupancy_pct=0,
            min_edge_clearance_pct=0,
            h_balance_pct=0,
            v_balance_pct=0,
            neighbor_contamination=True,
            matte_background=True,
            notes='Asset file missing',
        )

    im = Image.open(path).convert('RGBA')
    arr = np.array(im)
    report = audit_canvas(im, filename, 0)
    transparent, no_matte = check_transparency(arr)
    centered, h_bal, v_bal = check_centering(report.artwork_bounds, CANVAS)
    contamination = check_neighbor_contamination(arr, report.artwork_bounds)

    edge_safe = bool(not report.touches_edge and report.min_edge_clearance_pct >= 12)
    if not edge_safe:
        notes.append('edge clearance below 12%')
    if not centered:
        notes.append(f'optical offset H={h_bal}% V={v_bal}%')
    if contamination:
        notes.append('possible neighbor contamination')
    if not transparent:
        notes.append('non-transparent background detected')
    if not no_matte:
        notes.append('matte/semi-opaque background pixels')
    if im.size != (CANVAS, CANVAS):
        notes.append(f'canvas {im.size} != {CANVAS}')

    if not (60 <= report.occupancy_pct <= 72):
        notes.append(f'occupancy {report.occupancy_pct}% outside 60–72% target')

    status = 'PASS' if not notes else 'RECROP'
    if status == 'PASS':
        notes_str = 'Already correct (03F.1 pipeline)'
    else:
        notes_str = '; '.join(notes)

    return IconAudit(
        icon=filename,
        registry_key=key,
        group=group,
        label=label,
        status=status,
        canvas=f'{CANVAS}×{CANVAS}',
        edge_safe=edge_safe,
        centered=centered,
        transparent=bool(transparent and no_matte),
        registry_ok=registry_ok,
        min_size_px=min_px,
        occupancy_pct=float(report.occupancy_pct),
        min_edge_clearance_pct=float(report.min_edge_clearance_pct),
        h_balance_pct=float(h_bal),
        v_balance_pct=float(v_bal),
        neighbor_contamination=bool(contamination),
        matte_background=bool(not no_matte),
        notes=notes_str,
    )


def build_contact_sheet(audits: list[IconAudit]) -> None:
    cols = 4
    rows = 6
    cell = 280
    label_h = 36
    sheet = Image.new('RGBA', (cols * cell, rows * (cell + label_h)), (255, 255, 255, 255))
    draw = ImageDraw.Draw(sheet)

    for i, audit in enumerate(audits):
        r, c = divmod(i, cols)
        path = ICON_ROOT / audit.group / audit.icon
        icon = Image.open(path).convert('RGBA')
        preview = icon.resize((cell - 40, cell - 40), Image.Resampling.LANCZOS)
        ox = c * cell + (cell - preview.width) // 2
        oy = r * (cell + label_h) + (cell - preview.height) // 2
        sheet.paste(preview, (ox, oy), preview)
        status_color = (0, 128, 0) if audit.status == 'PASS' else (200, 0, 0)
        draw.text(
            (c * cell + 8, r * (cell + label_h) + cell + 4),
            f'{audit.label} [{audit.status}]',
            fill=status_color,
        )

    CONTACT_SHEET.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(CONTACT_SHEET, optimize=True)
    print(f'contact sheet → {CONTACT_SHEET}')


def main() -> None:
    audits = [audit_icon(g, k, f, l, m) for g, k, f, l, m in EXPANDED_ICONS]
    build_contact_sheet(audits)

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps([asdict(a) for a in audits], indent=2), encoding='utf-8')
    print(f'audit json → {OUT_JSON}')

    print('\nICON | STATUS | CANVAS | EDGE | CENTER | ALPHA | REG | MIN')
    failures = []
    for a in audits:
        print(
            f"{a.icon} | {a.status} | {a.canvas} | {'Y' if a.edge_safe else 'N'} | "
            f"{'Y' if a.centered else 'N'} | {'Y' if a.transparent else 'N'} | "
            f"{'Y' if a.registry_ok else 'N'} | {a.min_size_px}px"
        )
        if a.status != 'PASS':
            failures.append(a.icon)

    if failures:
        raise SystemExit(f'Audit failures: {", ".join(failures)}')
    print(f'\nOK — all {len(audits)} expanded icons passed 03F.2 audit')


if __name__ == '__main__':
    main()
