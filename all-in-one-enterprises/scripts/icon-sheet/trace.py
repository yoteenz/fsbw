"""Trace segmented glyphs (glyphs.json) from the founder icon sheet into SVG path data → icons.json.
Each icon keeps its position/size inside a 56×56 sheet-px window centred on its glyph, so relative scale is preserved."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SHEET = os.path.join(HERE, '..', '..', 'docs', 'migration-recovery', 'icon-sheet', 'aio-icon-sheet-source.png')
BUILD = os.path.join(HERE, '.build')
os.makedirs(BUILD, exist_ok=True)
import json
import numpy as np, cv2, potrace
from PIL import Image
W, UP = 56, 10
im = np.asarray(Image.open(SHEET).convert('RGB')).astype(np.float32)
inkness = 255 - im.min(-1)
G = json.load(open(os.path.join(BUILD, 'glyphs.json')))

def window(name):
    x0, y0, x1, y1 = G[name]['box']
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    wx, wy = int(round(cx - W / 2)), int(round(cy - W / 2))
    a = inkness[wy:wy + W, wx:wx + W].copy()
    keep = np.zeros_like(a, bool)                     # only this glyph's own box (+3px), nothing from neighbours
    keep[max(0, y0 - 3 - wy):y1 + 3 - wy, max(0, x0 - 3 - wx):x1 + 3 - wx] = True
    a[~keep] = 0
    peak = np.percentile(a[a > 60], 90) if (a > 60).any() else 255
    alpha = np.clip(a / peak, 0, 1)
    rgb = im[wy:wy + W, wx:wx + W][alpha > 0.6]
    color = '#%02x%02x%02x' % tuple(int(v) for v in np.median(rgb, 0)) if len(rgb) else '#000000'
    return alpha, color

def components(alpha):
    n, lab, st, _ = cv2.connectedComponentsWithStats((alpha > 0.5).astype(np.uint8), 8)
    return lab, sorted(range(1, n), key=lambda i: -st[i, 4])

def trace(alpha):
    big = cv2.resize(alpha, (W * UP, W * UP), interpolation=cv2.INTER_CUBIC)
    bm = potrace.Bitmap(big <= 0.5)  # potracer: False = ink
    plist = bm.trace(turdsize=12, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.35)
    f = lambda p: f'{p.x / UP:.1f} {p.y / UP:.1f}'.replace('.0 ', ' ').replace('.0,', ',')
    parts = []
    for curve in plist:
        seg = [f'M{f(curve.start_point)}']
        for s in curve.segments:
            if s.is_corner:
                seg.append(f'L{f(s.c)}L{f(s.end_point)}')
            else:
                seg.append(f'C{f(s.c1)} {f(s.c2)} {f(s.end_point)}')
        parts.append(''.join(seg) + 'Z')
    return ''.join(parts)

out = {}
for name in G:
    alpha, color = window(name)
    out[name] = {'d': trace(alpha), 'color': color}

# derived glyphs (artwork taken from the sheet)
alpha, color = window('migrate')
lab, order = components(alpha)
xs = {i: np.nonzero(lab == i)[1].mean() for i in order[:2]}
up = min(xs, key=xs.get)                                  # left arrow points up
arrow = np.where(lab == up, alpha, 0)
ys_, xs_ = np.nonzero(arrow > 0.05); cy, cx = (ys_.min() + ys_.max()) / 2, (xs_.min() + xs_.max()) / 2
arrow = np.roll(np.roll(arrow, int(round(W / 2 - cy)), 0), int(round(W / 2 - cx)), 1)
out['arrow-right'] = {'d': trace(np.rot90(arrow, -1).copy()), 'color': '#000000'}
for src, dst in (('info-log', 'info-mark'), ('help', 'help-mark'), ('error-log', 'alert-mark')):
    alpha, color = window(src)
    lab, order = components(alpha)
    inner = np.where(np.isin(lab, order[1:]), alpha, 0)
    # keep only pixels belonging to inner parts (soft edges included)
    soft = cv2.dilate(np.isin(lab, order[1:]).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    out[dst] = {'d': trace(np.where(soft, alpha, 0) * (~np.isin(lab, order[:1]))), 'color': color}
json.dump(out, open(os.path.join(BUILD, 'icons.json'), 'w'))
print(len(out), 'icons;', sum(len(v['d']) for v in out.values()) // 1024, 'KB path data')
