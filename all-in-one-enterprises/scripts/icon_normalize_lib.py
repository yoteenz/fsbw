"""Shared icon extraction + safe-canvas normalization (Refinement 03F.1)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image

CANVAS = 512
DEFAULT_TARGET_FILL = 0.68
DETAIL_TARGET_FILL = 0.66
SAFETY_MARGIN_RATIO = 0.18
MIN_EDGE_CLEARANCE_RATIO = 0.12
CELL_BLEED_RATIO = 0.05
LABEL_CUT_RATIO = 0.68

DETAIL_ICON_KEYS = frozenset(
    {
        'serviceTruckingInsurance',
        'trucking-insurance',
        'operationsDispatch',
        'dispatch-operations',
        'bolPod',
        'bol-pod',
        'factoring',
        'brokerage',
        'routeTracking',
        'route-tracking',
        'notifications',
        'calendarScheduling',
        'calendar-scheduling',
        'invoiceBilling',
        'invoice-billing',
        'messages',
        'payments',
    }
)


@dataclass
class NormalizeReport:
    filename: str
    canvas: tuple[int, int]
    artwork_bounds: tuple[int, int, int, int]
    artwork_size: tuple[int, int]
    occupancy_pct: float
    min_edge_clearance_pct: float
    touches_edge: bool
    target_fill: float


def make_transparent(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert('RGBA'))
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    white = (r > 235) & (g > 235) & (b > 235)
    arr[white, 3] = 0
    arr[a < 16, 3] = 0
    return Image.fromarray(arr)


def _largest_component_bbox(mask: np.ndarray) -> tuple[int, int, int, int]:
    """Bounding box of the largest connected stroke cluster — drops neighbor-sheet fragments."""
    h, w = mask.shape
    visited = np.zeros_like(mask, dtype=bool)
    best_size = 0
    best: tuple[int, int, int, int] | None = None

    for y in range(h):
        for x in range(w):
            if not mask[y, x] or visited[y, x]:
                continue
            stack = [(y, x)]
            visited[y, x] = True
            minx = maxx = x
            miny = maxy = y
            count = 0
            while stack:
                cy, cx = stack.pop()
                count += 1
                minx = min(minx, cx)
                maxx = max(maxx, cx)
                miny = min(miny, cy)
                maxy = max(maxy, cy)
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        stack.append((ny, nx))
            if count > best_size:
                best_size = count
                best = (minx, miny, maxx, maxy)

    if best is None:
        raise ValueError('no artwork pixels found')
    return best


def bbox_of_artwork(img: Image.Image, *, exclude_label_band: bool = False) -> tuple[int, int, int, int]:
    arr = np.array(img)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    visible = a > 48
    non_white = ~((r > 230) & (g > 230) & (b > 230))
    stroke = visible & non_white & ((r < 110) & (g < 110) & (b < 110))
    artwork = stroke if stroke.any() else (visible & non_white)
    if exclude_label_band:
        label_cut = int(img.height * LABEL_CUT_RATIO)
        artwork[label_cut:, :] = False
    if not artwork.any():
        artwork = visible & non_white
        if exclude_label_band:
            artwork[label_cut:, :] = False
    if not artwork.any():
        raise ValueError('no artwork pixels found')
    return _largest_component_bbox(artwork)


def _target_fill_for(name: str) -> float:
    lowered = name.lower().replace('_', '-')
    if any(key in lowered for key in DETAIL_ICON_KEYS):
        return DETAIL_TARGET_FILL
    return DEFAULT_TARGET_FILL


def normalize_artwork(
    img: Image.Image,
    *,
    name: str = 'icon',
    exclude_label_band: bool = False,
    target_fill: float | None = None,
) -> tuple[Image.Image, NormalizeReport]:
    img = make_transparent(img)
    x1, y1, x2, y2 = bbox_of_artwork(img, exclude_label_band=exclude_label_band)
    aw, ah = x2 - x1 + 1, y2 - y1 + 1
    # Tiny bleed captures anti-aliased stroke edges without tight-cropping artwork.
    bleed = max(2, int(round(max(aw, ah) * 0.02)))
    x1 = max(0, x1 - bleed)
    y1 = max(0, y1 - bleed)
    x2 = min(img.width - 1, x2 + bleed)
    y2 = min(img.height - 1, y2 + bleed)
    art = img.crop((x1, y1, x2 + 1, y2 + 1))

    aw, ah = art.size
    fill = target_fill if target_fill is not None else _target_fill_for(name)
    scale = (CANVAS * fill) / max(aw, ah)
    nw, nh = max(1, int(round(aw * scale))), max(1, int(round(ah * scale)))
    art = art.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    ox = (CANVAS - nw) // 2
    oy = (CANVAS - nh) // 2
    canvas.paste(art, (ox, oy), art)

    report = audit_canvas(canvas, name, fill)
    return canvas, report


def audit_canvas(canvas: Image.Image, filename: str, target_fill: float) -> NormalizeReport:
    arr = np.array(canvas)
    w, h = canvas.size
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    visible = (a > 48) & ~((r > 230) & (g > 230) & (b > 230))
    ys, xs = np.where(visible)
    x1, y1, x2, y2 = int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())
    aw, ah = x2 - x1 + 1, y2 - y1 + 1
    margins = [x1, y1, w - 1 - x2, h - 1 - y2]
    min_margin = min(margins)
    min_edge_pct = (min_margin / w) * 100
    occupancy_pct = (max(aw, ah) / w) * 100
    return NormalizeReport(
        filename=filename,
        canvas=(w, h),
        artwork_bounds=(x1, y1, x2, y2),
        artwork_size=(aw, ah),
        occupancy_pct=round(occupancy_pct, 1),
        min_edge_clearance_pct=round(min_edge_pct, 1),
        touches_edge=min_margin <= 2,
        target_fill=target_fill,
    )


def crop_grid_cell(
    sheet: Image.Image,
    *,
    row: int,
    col: int,
    cols: int,
    rows: int,
) -> Image.Image:
    cell_w, cell_h = sheet.width // cols, sheet.height // rows
    bleed_x = int(cell_w * CELL_BLEED_RATIO)
    bleed_y = int(cell_h * CELL_BLEED_RATIO)
    x0 = max(0, col * cell_w - bleed_x)
    y0 = max(0, row * cell_h - bleed_y)
    x1 = min(sheet.width, (col + 1) * cell_w + bleed_x)
    y1 = min(sheet.height, (row + 1) * cell_h + bleed_y)
    return sheet.crop((x0, y0, x1, y1))


def save_icon(canvas: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, optimize=True)
