/** Shared helpers for NOIR admin live WebP previews (Supabase URLs) vs static /assets PNGs. */

export function isRemoteBawNoirWigViewUrl(src: string): boolean {
  const base = (src || '').split(/[?#]/)[0].trim().toLowerCase();
  return base.startsWith('http://') || base.startsWith('https://');
}

/**
 * True when this angle’s `src` is a live fal/WebP raster (brick already baked in) — not a static `/assets/` PNG.
 * Handles `blob:`, `data:`, `http(s):`, and protocol-relative `//` CDN URLs.
 */
export function isBawNoirLiveWigViewSrc(src: string): boolean {
  const base = (src || '').split(/[?#]/)[0].trim().toLowerCase();
  if (!base) return false;
  if (base.startsWith('/assets/')) return false;
  if (base.startsWith('data:image/')) return true;
  if (base.startsWith('blob:')) return true;
  if (base.startsWith('http://') || base.startsWith('https://')) return true;
  // Protocol-relative absolute URL (e.g. //xxx.supabase.co/...)
  if (base.startsWith('//')) return true;
  return false;
}

/** True when any angle is live — used for row-level spacing / legacy call sites. */
export function hideDuplicateBrickForNoirWigViews(wigViews: readonly string[]): boolean {
  return wigViews.some((v) => isBawNoirLiveWigViewSrc(v));
}
