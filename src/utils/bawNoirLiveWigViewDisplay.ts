/** Shared helpers for NOIR admin live WebP previews (Supabase URLs) vs static /assets PNGs. */

export function isRemoteBawNoirWigViewUrl(src: string): boolean {
  const base = (src || '').split(/[?#]/)[0].trim().toLowerCase();
  return base.startsWith('http://') || base.startsWith('https://');
}

/** True when any angle uses a remote fal WebP (brick already baked into the image). */
export function hideDuplicateBrickForNoirWigViews(wigViews: readonly string[]): boolean {
  return wigViews.some((v) => isRemoteBawNoirWigViewUrl(v));
}
