#!/usr/bin/env python3
"""Chroma-key lobby shelf/case JPEGs — green spill + acrylic neutralization."""
from __future__ import annotations

import sys

import numpy as np
from PIL import Image, ImageFilter


def _ge(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    return g - np.maximum(r, b)


def _re(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    return r - np.maximum(g, b)


def _smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def _corner_bg(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    h, w = r.shape
    s = min(120, h // 6, w // 6)
    patches = (
        np.stack([r[0:s, 0:s], g[0:s, 0:s], b[0:s, 0:s]], axis=-1),
        np.stack([r[0:s, w - s : w], g[0:s, w - s : w], b[0:s, w - s : w]], axis=-1),
        np.stack([r[h - s : h, 0:s], g[h - s : h, 0:s], b[h - s : h, 0:s]], axis=-1),
        np.stack([r[h - s : h, w - s : w], g[h - s : h, w - s : w], b[h - s : h, w - s : w]], axis=-1),
    )
    return np.vstack([p.reshape(-1, 3) for p in patches]).mean(axis=0)


def _is_greenscreen_bg(bg: np.ndarray) -> bool:
    return bool(bg[1] > bg[0] + 28 and bg[1] > bg[2] + 28)


def _is_redscreen_bg(bg: np.ndarray) -> bool:
    return bool(bg[0] > bg[1] + 28 and bg[0] > bg[2] + 28)


def unspill_foreground(arr: np.ndarray) -> None:
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
    mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
    sat = mx - mn
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    ge = _ge(r, g, b)
    fg = arr[:, :, 3] > 8
    rb_avg = (r + b) * 0.5

    # Crush green cast on all foreground (strongest on acrylic / edges).
    spill = fg & (ge > 4)
    g_fix = np.where(spill, np.minimum(g, rb_avg + ge * 0.08), g)
    glass = fg & (sat < 80) & (lum > 35) & (lum < 195) & (ge > 2)
    g_fix = np.where(glass, rb_avg, g_fix)
    arr[:, :, 1] = np.clip(g_fix, 0, 255).astype(np.uint8)


def unspill_red_foreground(arr: np.ndarray) -> None:
    """Neutralize red cyclorama spill on acrylic edges and glass panels."""
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
    mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
    sat = mx - mn
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    re = _re(r, g, b)
    fg = arr[:, :, 3] > 8
    gb_avg = (g + b) * 0.5

    spill = fg & (re > 4)
    r_fix = np.where(spill, np.minimum(r, gb_avg + re * 0.08), r)
    glass = fg & (sat < 80) & (lum > 35) & (lum < 195) & (re > 2)
    r_fix = np.where(glass, gb_avg, r_fix)
    arr[:, :, 0] = np.clip(r_fix, 0, 255).astype(np.uint8)


def drop_green_haze(arr: np.ndarray, shelf_acrylic_band: bool) -> None:
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    ge = _ge(r, g, b)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    hh, ww = arr.shape[:2]
    shelf_body = np.zeros((hh, ww), dtype=bool)
    if shelf_acrylic_band:
        shelf_body[int(hh * 0.42) :, :] = True

    # Green-tinted semi-transparent pixels (classic acrylic spill on green screen).
    haze = (ge > 14) & (g > 52) & (arr[:, :, 3] < 200) & (lum < 155)
    # Keep solid mannequin / neon; drop green veil on panels and fringe.
    core = (arr[:, :, 3] > 210) & (ge < 12)
    kill = haze & ~core
    arr[kill, 3] = 0
    arr[kill, :3] = 0

    fringe = (arr[:, :, 3] < 48) & (ge > 20) & (g > 50) & (lum < 115)
    if shelf_acrylic_band:
        fringe = fringe & ~shelf_body
    arr[fringe, 3] = 0
    arr[fringe, :3] = 0

    wispy = (arr[:, :, 3] < 24) & (ge > 12) & (lum < 95)
    if shelf_acrylic_band:
        wispy = wispy & ~shelf_body
    arr[wispy, 3] = 0
    arr[wispy, :3] = 0


def drop_red_haze(arr: np.ndarray, shelf_acrylic_band: bool) -> None:
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    re = _re(r, g, b)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    hh, ww = arr.shape[:2]
    shelf_body = np.zeros((hh, ww), dtype=bool)
    if shelf_acrylic_band:
        shelf_body[int(hh * 0.42) :, :] = True

    haze = (re > 14) & (r > 52) & (arr[:, :, 3] < 200) & (lum < 155)
    core = (arr[:, :, 3] > 210) & (re < 12)
    kill = haze & ~core
    arr[kill, 3] = 0
    arr[kill, :3] = 0

    fringe = (arr[:, :, 3] < 48) & (re > 20) & (r > 50) & (lum < 115)
    if shelf_acrylic_band:
        fringe = fringe & ~shelf_body
    arr[fringe, 3] = 0
    arr[fringe, :3] = 0

    wispy = (arr[:, :, 3] < 24) & (re > 12) & (lum < 95)
    if shelf_acrylic_band:
        wispy = wispy & ~shelf_body
    arr[wispy, 3] = 0
    arr[wispy, :3] = 0


def solidify_acrylic(arr: np.ndarray, shelf_acrylic_band: bool) -> None:
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    ge = _ge(r, g, b)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    hh, ww = arr.shape[:2]
    if shelf_acrylic_band:
        zone = np.zeros((hh, ww), dtype=bool)
        zone[int(hh * 0.42) :, :] = True
    else:
        zone = np.ones((hh, ww), dtype=bool)
    acrylic = zone & (lum > 30) & (lum < 200) & (ge < 28) & (arr[:, :, 3] >= 200)
    arr[acrylic, 3] = np.maximum(arr[acrylic, 3], 240)


def key_greenscreen(im: Image.Image, shelf_acrylic_band: bool) -> Image.Image:
    arr = np.array(im.convert('RGBA'))
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
    mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
    sat = mx - mn
    ge = _ge(r, g, b)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

    protect = (
        (ge < 16)
        | (sat < 32)
        | (lum > 145)
        | ((lum > 48) & (ge < 28) & (sat < 95))
        | ((r > 115) & (r > g + 12) & (sat > 40))
    )
    is_bg = (ge > 34) & (g > 62)

    alpha = np.zeros(r.shape, dtype=np.float32)
    alpha[protect] = 255.0
    alpha[is_bg] = 0.0
    mid = ~protect & ~is_bg
    if np.any(mid):
        t = np.clip((ge[mid] - 8.0) / 20.0, 0.0, 1.0)
        alpha[mid] = 255.0 * (1.0 - t)

    arr[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    unspill_foreground(arr)
    solidify_acrylic(arr, shelf_acrylic_band)
    drop_green_haze(arr, shelf_acrylic_band)

    a_norm = arr[:, :, 3].astype(np.float32) / 255.0
    arr[:, :, :3] = np.clip(arr[:, :, :3] * a_norm[..., np.newaxis], 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def key_redscreen(im: Image.Image, shelf_acrylic_band: bool) -> Image.Image:
    arr = np.array(im.convert('RGBA'))
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
    mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
    sat = mx - mn
    re = _re(r, g, b)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

    protect = (
        (re < 16)
        | (sat < 32)
        | (lum > 145)
        | ((lum > 48) & (re < 28) & (sat < 95))
        | ((r > 115) & (r > g + 12) & (sat > 40))
    )
    is_bg = (re > 34) & (r > 62)

    alpha = np.zeros(r.shape, dtype=np.float32)
    alpha[protect] = 255.0
    alpha[is_bg] = 0.0
    mid = ~protect & ~is_bg
    if np.any(mid):
        t = np.clip((re[mid] - 8.0) / 20.0, 0.0, 1.0)
        alpha[mid] = 255.0 * (1.0 - t)

    arr[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    unspill_red_foreground(arr)
    solidify_acrylic(arr, shelf_acrylic_band)
    drop_red_haze(arr, shelf_acrylic_band)

    a_norm = arr[:, :, 3].astype(np.float32) / 255.0
    arr[:, :, :3] = np.clip(arr[:, :, :3] * a_norm[..., np.newaxis], 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def key_redscreen_case(im: Image.Image) -> Image.Image:
    """Red cyclorama display case — preserve clear acrylic; remove red backdrop."""
    arr = np.array(im.convert('RGBA'))
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
    mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
    sat = mx - mn
    re = _re(r, g, b)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    bg = _corner_bg(r, g, b)
    dist_bg = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)

    protect = (
        (re < 16)
        | (sat < 32)
        | (lum > 145)
        | ((lum > 48) & (re < 28) & (sat < 95))
        | ((r > 115) & (r > g + 12) & (sat > 40))
    )
    is_bg = (re > 34) & (r > 62)

    alpha = np.zeros(r.shape, dtype=np.float32)
    alpha[protect] = 255.0
    alpha[is_bg] = 0.0
    mid = ~protect & ~is_bg
    if np.any(mid):
        t = np.clip((re[mid] - 8.0) / 20.0, 0.0, 1.0)
        alpha[mid] = 255.0 * (1.0 - t)

    # Clear acrylic (low red excess) — keep visible; do not use bare lum on red cyclorama.
    glass = (re < 22) & (sat < 58) & (lum > 55) & (lum < 232)
    alpha[glass] = np.maximum(alpha[glass], 0.82)
    subject = (dist_bg > 50) | ((sat > 36) & (dist_bg > 24)) | ((re < 20) & (dist_bg > 28))
    alpha = np.where(subject, np.maximum(alpha, 0.96), alpha)

    arr[:, :, 3] = (np.clip(alpha, 0.0, 1.0) * 255.0).astype(np.uint8)
    unspill_red_foreground(arr)
    solidify_case_glass(arr, dist_bg, sat, lum, r, g)

    hull = _case_subject_hull(arr[:, :, 3])
    in_hull = hull & (dist_bg > 8)
    arr[in_hull, 3] = np.maximum(arr[in_hull, 3], 200)
    glass_in_hull = hull & (sat < 60) & (lum > 52)
    arr[glass_in_hull, 3] = np.maximum(arr[glass_in_hull, 3], 225)
    _fill_alpha_holes(arr)

    alpha_f = arr[:, :, 3].astype(np.float32) / 255.0
    fringe = ((alpha_f < 0.12) & (re > 28) & (r > 55)) | ((alpha_f < 0.08) & (dist_bg < 18))
    fringe = fringe & ~hull
    arr[fringe, 3] = 0
    arr[fringe, :3] = 0
    drop_red_haze(arr, shelf_acrylic_band=False)

    a_norm = arr[:, :, 3].astype(np.float32) / 255.0
    arr[:, :, :3] = np.clip(arr[:, :, :3] * a_norm[..., np.newaxis], 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def _case_subject_hull(alpha_u8: np.ndarray) -> np.ndarray:
    """Expand solid subject seeds so backdrop-colored acrylic stays inside the hull."""
    seeds = alpha_u8 >= 200
    if not np.any(seeds):
        seeds = alpha_u8 >= 128
    if not np.any(seeds):
        return seeds
    mask_im = Image.fromarray((seeds.astype(np.uint8) * 255))
    for _ in range(10):
        mask_im = mask_im.filter(ImageFilter.MaxFilter(7))
    return np.array(mask_im) > 96


def _fill_alpha_holes(arr: np.ndarray, min_neighbor_alpha: int = 200) -> None:
    """Close 1–2px pinholes in alpha without growing the outer silhouette much."""
    a = arr[:, :, 3]
    hole = (a < 48) & (
        (np.roll(a, 1, 0) >= min_neighbor_alpha)
        | (np.roll(a, -1, 0) >= min_neighbor_alpha)
        | (np.roll(a, 1, 1) >= min_neighbor_alpha)
        | (np.roll(a, -1, 1) >= min_neighbor_alpha)
    )
    arr[hole, 3] = 220


def solidify_case_glass(
    arr: np.ndarray,
    dist_bg: np.ndarray,
    sat: np.ndarray,
    lum: np.ndarray,
    r: np.ndarray,
    g: np.ndarray,
) -> None:
    """Display case acrylic — only boost existing foreground (never the keyed-out backdrop)."""
    fg = arr[:, :, 3] > 48
    glass = fg & (dist_bg > 14) & (sat < 56) & (lum > 58) & (lum < 232)
    panels = glass & (dist_bg > 20)
    arr[panels, 3] = np.maximum(arr[panels, 3], 210)
    frame = fg & ((dist_bg > 46) | ((lum < 94) & (dist_bg > 22)))
    arr[frame, 3] = np.maximum(arr[frame, 3], 248)
    neon = fg & (r > 112) & (r > g + 10) & (sat > 38)
    arr[neon, 3] = 255


def key_studio_case(im: Image.Image) -> Image.Image:
    """Gray cyclorama display case — acrylic is backdrop-colored; avoid fringe wipe on glass."""
    arr = np.array(im.convert('RGBA'))
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
    mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
    sat = mx - mn
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    bg = _corner_bg(r, g, b)
    dist_bg = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)

    alpha = _smoothstep(18.0, 46.0, dist_bg)
    alpha[dist_bg < 15.0] = 0.0

    subject = (dist_bg > 52) | (lum < 88) | ((sat > 36) & (dist_bg > 26))
    alpha = np.where(subject, np.maximum(alpha, 0.96), alpha)

    # Acrylic / neutral panels (similar RGB to backdrop — must not be fringe-wiped).
    glass = (dist_bg > 14) & (sat < 54) & (lum > 60) & (lum < 230)
    alpha[glass] = np.maximum(alpha[glass], 0.78)

    arr[:, :, 3] = (np.clip(alpha, 0.0, 1.0) * 255.0).astype(np.uint8)

    fg = alpha > 0.06
    rb_max = np.maximum(r, b)
    despill = fg & (g > rb_max + 2) & (lum < 155)
    g_fix = np.where(g > rb_max, rb_max + (g - rb_max) * 0.08, g)
    arr[:, :, 1] = np.where(despill, np.clip(g_fix, 0, 255), arr[:, :, 1]).astype(np.uint8)

    unspill_foreground(arr)
    solidify_case_glass(arr, dist_bg, sat, lum, r, g)

    hull = _case_subject_hull(arr[:, :, 3])
    in_hull = hull & (dist_bg > 10)
    arr[in_hull, 3] = np.maximum(arr[in_hull, 3], 200)
    glass_in_hull = hull & (sat < 58) & (lum > 55)
    arr[glass_in_hull, 3] = np.maximum(arr[glass_in_hull, 3], 225)
    _fill_alpha_holes(arr)

    alpha_f = arr[:, :, 3].astype(np.float32) / 255.0
    # Only drop pixels that are clearly backdrop — not low-dist acrylic.
    fringe = (alpha_f < 0.10) & (dist_bg < 16) & ~hull
    arr[fringe, 3] = 0
    arr[fringe, :3] = 0

    a_norm = arr[:, :, 3].astype(np.float32) / 255.0
    arr[:, :, :3] = np.clip(arr[:, :, :3] * a_norm[..., np.newaxis], 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def key_studio_backdrop(im: Image.Image, shelf_acrylic_band: bool) -> Image.Image:
    """Gray / neutral cyclorama — distance key from corner backdrop (not green excess)."""
    if not shelf_acrylic_band:
        return key_studio_case(im)

    arr = np.array(im.convert('RGBA'))
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
    mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
    sat = mx - mn
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    bg = _corner_bg(r, g, b)
    dist_bg = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)

    alpha = _smoothstep(24.0, 52.0, dist_bg)
    alpha[dist_bg < 20.0] = 0.0

    subject = (dist_bg > 58) | (lum < 90) | ((sat > 40) & (dist_bg > 32))
    alpha = np.where(subject, np.maximum(alpha, 0.92), alpha)

    fg_zone = dist_bg > 30
    protect = fg_zone & (
        ((sat < 32) & (lum > 100) & (lum < 220))
        | ((lum > 48) & (sat < 95) & (dist_bg > 28))
        | ((r > 115) & (r > g + 12) & (sat > 40))
    )
    alpha[protect] = np.maximum(alpha[protect], 0.88)

    arr[:, :, 3] = (np.clip(alpha, 0.0, 1.0) * 255.0).astype(np.uint8)

    fg = alpha > 0.08
    rb_max = np.maximum(r, b)
    despill = fg & (g > rb_max + 2) & (lum < 150)
    g_fix = np.where(g > rb_max, rb_max + (g - rb_max) * 0.08, g)
    arr[:, :, 1] = np.where(despill, np.clip(g_fix, 0, 255), arr[:, :, 1]).astype(np.uint8)

    unspill_foreground(arr)
    solidify_acrylic(arr, shelf_acrylic_band)

    alpha_f = arr[:, :, 3].astype(np.float32) / 255.0
    fringe = (alpha_f < 0.22) & (dist_bg < 38)
    arr[fringe, 3] = 0
    arr[fringe, :3] = 0
    wispy = (alpha_f < 0.14) & (dist_bg < 48)
    arr[wispy, 3] = 0
    arr[wispy, :3] = 0

    a_norm = arr[:, :, 3].astype(np.float32) / 255.0
    arr[:, :, :3] = np.clip(arr[:, :, :3] * a_norm[..., np.newaxis], 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def post_resize_cleanup(out_im: Image.Image, shelf_acrylic_band: bool) -> Image.Image:
    arr = np.array(out_im)
    unspill_foreground(arr)
    if shelf_acrylic_band:
        drop_green_haze(arr, shelf_acrylic_band)
    else:
        r = arr[:, :, 0].astype(np.float32)
        g = arr[:, :, 1].astype(np.float32)
        b = arr[:, :, 2].astype(np.float32)
        mx = np.max(arr[:, :, :3], axis=2).astype(np.float32)
        mn = np.min(arr[:, :, :3], axis=2).astype(np.float32)
        sat = mx - mn
        lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
        re = _re(r, g, b)
        fg = arr[:, :, 3] > 80
        glass = fg & (sat < 56) & (lum > 58) & (lum < 232)
        arr[glass, 3] = np.maximum(arr[glass, 3], 215)
        frame = fg & (lum < 96)
        arr[frame, 3] = np.maximum(arr[frame, 3], 248)
        _fill_alpha_holes(arr)
        unspill_red_foreground(arr)
        drop_red_haze(arr, shelf_acrylic_band=False)
        # Remove residual red fringe after downscale.
        fringe = (arr[:, :, 3] < 40) & (re > 22) & (r > 48)
        arr[fringe, 3] = 0
        arr[fringe, :3] = 0
    a_norm = arr[:, :, 3].astype(np.float32) / 255.0
    arr[:, :, :3] = np.clip(arr[:, :, :3] * a_norm[..., np.newaxis], 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def bake(src: str, out: str, max_w: int, shelf_acrylic_band: bool) -> None:
    im = Image.open(src)
    arr_rgb = np.array(im.convert('RGB'))
    r0 = arr_rgb[:, :, 0].astype(np.float32)
    g0 = arr_rgb[:, :, 1].astype(np.float32)
    b0 = arr_rgb[:, :, 2].astype(np.float32)
    bg = _corner_bg(r0, g0, b0)
    if _is_greenscreen_bg(bg):
        out_im = key_greenscreen(im, shelf_acrylic_band)
        key_mode = 'green'
    elif _is_redscreen_bg(bg):
        out_im = key_redscreen_case(im) if not shelf_acrylic_band else key_redscreen(im, shelf_acrylic_band)
        key_mode = 'red'
    else:
        out_im = key_studio_backdrop(im, shelf_acrylic_band)
        key_mode = 'studio'
    alpha = np.array(out_im)[:, :, 3]
    ys, xs = np.where(alpha > 128)
    if len(xs):
        pad = 3 if shelf_acrylic_band else 3
        bbox = (
            max(0, int(xs.min()) - pad),
            max(0, int(ys.min()) - pad),
            min(alpha.shape[1], int(xs.max()) + pad + 1),
            min(alpha.shape[0], int(ys.max()) + pad + 1),
        )
        out_im = out_im.crop(bbox)
    else:
        bbox = out_im.getbbox()
        if bbox:
            out_im = out_im.crop(bbox)
    w2, h2 = out_im.size
    if w2 > max_w:
        out_im = out_im.resize((max_w, max(1, int(h2 * max_w / w2))), Image.Resampling.LANCZOS)
        out_im = post_resize_cleanup(out_im, shelf_acrylic_band)
    out_im.save(out, 'PNG', optimize=True)
    a = np.array(out_im)[:, :, 3]
    ge = np.array(out_im)[:, :, 1].astype(np.float32) - np.maximum(
        np.array(out_im)[:, :, 0].astype(np.float32),
        np.array(out_im)[:, :, 2].astype(np.float32),
    )
    fg = a > 128
    print(
        out_im.size,
        key_mode,
        'transparent%',
        round(100 * (a < 10).mean(), 1),
        'fg ge>12',
        int(((ge > 12) & fg).sum()),
    )


def main() -> None:
    if len(sys.argv) < 4:
        print('Usage: lobby-chroma-key.py <src> <out.png> <max_width> [--shelf]', file=sys.stderr)
        sys.exit(1)
    src, out, max_w = sys.argv[1], sys.argv[2], int(sys.argv[3])
    shelf = '--shelf' in sys.argv[4:]
    bake(src, out, max_w, shelf_acrylic_band=shelf)


if __name__ == '__main__':
    main()
