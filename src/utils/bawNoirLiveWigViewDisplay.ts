/** Shared helpers for NOIR admin live WebP previews (Supabase URLs) vs static /assets PNGs. */

export function isRemoteBawNoirWigViewUrl(src: string): boolean {
  const base = (src || '').split(/[?#]/)[0].trim().toLowerCase();
  return base.startsWith('http://') || base.startsWith('https://');
}

/**
 * True only for **shipped** 2D mannequin PNGs under `/assets/` (single brick layer in the UI).
 * Anything else — Supabase `https://…/storage/…`, `blob:`, `data:`, relative API paths — is a **live**
 * raster that already includes brick; adding `leaf-brick-resize` duplicates it.
 *
 * Also treats absolute URLs to this app’s `/assets/…` as static (same as `/assets/natural…`).
 */
export function isStaticShippedNoirWigAssetSrc(src: string): boolean {
  const raw = (src || '').split(/[?#]/)[0].trim();
  if (!raw) return false;
  if (raw.startsWith('/assets/')) return true;
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const u = new URL(raw);
      if (u.pathname.startsWith('/assets/')) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Live fal / remote preview — not a shipped `/assets/` natural/peak/lagos PNG. */
export function isBawNoirLiveWigViewSrc(src: string): boolean {
  return !isStaticShippedNoirWigAssetSrc(src);
}

/** True when any angle should skip the extra brick underlay (see `isStaticShippedNoirWigAssetSrc`). */
export function hideDuplicateBrickForNoirWigViews(wigViews: readonly string[]): boolean {
  return wigViews.some((v) => isBawNoirLiveWigViewSrc(v));
}
