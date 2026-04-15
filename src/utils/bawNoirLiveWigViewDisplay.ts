/** Shared helpers for NOIR admin live WebP previews (Supabase URLs) vs static /assets PNGs. */

export function isRemoteBawNoirWigViewUrl(src: string): boolean {
  const base = (src || '').split(/[?#]/)[0].trim().toLowerCase();
  return base.startsWith('http://') || base.startsWith('https://');
}

/** Inline fal preview blobs (localStorage) — same “no extra brick layer” as https URLs. */
function isDataUrlBawNoirWigView(src: string): boolean {
  const base = (src || '').split(/[?#]/)[0].trim().toLowerCase();
  return base.startsWith('data:image/');
}

/** True when any angle is a live preview (remote URL or data: blob) — brick is already in the raster. */
export function hideDuplicateBrickForNoirWigViews(wigViews: readonly string[]): boolean {
  return wigViews.some((v) => isRemoteBawNoirWigViewUrl(v) || isDataUrlBawNoirWigView(v));
}
