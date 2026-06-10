/** Shared helpers for NOIR admin live WebP previews (Supabase URLs) vs static /assets PNGs. */

import { NOIR_NATURAL_FRONT_MANNEQUIN_SRC } from './bawStaticMannequinReferencePaths';

function normalizedSrcPath(src: string): string {
  const raw = (src || '').split(/[?#]/)[0].trim();
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//')) {
      const u = new URL(raw.startsWith('//') ? `https:${raw}` : raw);
      return decodeURIComponent(u.pathname).toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return decodeURIComponent(raw).toLowerCase();
}

export function isRemoteBawNoirWigViewUrl(src: string): boolean {
  const base = (src || '').split(/[?#]/)[0].trim().toLowerCase();
  return base.startsWith('http://') || base.startsWith('https://') || base.startsWith('//');
}

/**
 * True only for **shipped** 2D mannequin PNGs under `/assets/` (single brick layer in the UI).
 * Also treats absolute URLs to this app’s `/assets/…` as static (same as `/assets/natural…`).
 */
export function isStaticShippedNoirWigAssetSrc(src: string): boolean {
  const raw = (src || '').split(/[?#]/)[0].trim();
  if (!raw) return false;
  if (raw.startsWith('/assets/')) return true;
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//')) {
      const u = new URL(raw.startsWith('//') ? `https:${raw}` : raw);
      if (u.pathname.startsWith('/assets/')) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Mannequin overlay rasters (figure only) that still need the UI **`leaf-brick-resize`** layer.
 * Includes shipped `/assets/` naturals and Supabase `live-preview/Noir/…` reference PNGs — **not**
 * Fal `wig-preview-live/` WebPs (those already include brick).
 */
export function isBawNoirMannequinOverlaySrc(src: string): boolean {
  const raw = (src || '').split(/[?#]/)[0].trim();
  if (!raw) return false;
  if (isStaticShippedNoirWigAssetSrc(src)) return true;

  const norm = normalizedSrcPath(src);
  const frontNorm = normalizedSrcPath(NOIR_NATURAL_FRONT_MANNEQUIN_SRC);
  if (norm === frontNorm) return true;

  if (norm.includes('/live-preview/noir/') && !norm.includes('wig-preview-live/')) {
    return true;
  }

  return false;
}

/**
 * Live fal / cached preview — raster **already includes brick**; skip the extra CSS brick underlay.
 */
export function isBawNoirLiveWigViewSrc(src: string): boolean {
  const raw = (src || '').split(/[?#]/)[0].trim().toLowerCase();
  if (!raw) return false;
  if (isBawNoirMannequinOverlaySrc(src)) return false;

  if (raw.startsWith('data:') || raw.startsWith('blob:')) return true;

  const norm = normalizedSrcPath(src);
  if (norm.includes('wig-preview-live/')) return true;
  if (norm.includes('/after-color/')) return true;

  return false;
}

/** True when any angle should skip the extra brick underlay (see `isBawNoirLiveWigViewSrc`). */
export function hideDuplicateBrickForNoirWigViews(wigViews: readonly string[]): boolean {
  return wigViews.some((v) => isBawNoirLiveWigViewSrc(v));
}
