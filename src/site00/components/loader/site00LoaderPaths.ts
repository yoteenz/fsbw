/** SITE 00 routes that use the immersive geometry loader (boot shell + cinematic gate). */

const SITE00_IMMERSIVE_PREFIXES = [
  '/origin',
  '/enter',
  '/idnty',
  '/bldr',
  '/assts',
  '/bluprint',
  '/build',
  '/control',
  '/live',
] as const;

export function isSite00ImmersivePath(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname === '/' && import.meta.env.VITE_SITE00_ROOT === '1') return true;
  return SITE00_IMMERSIVE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Boot script mirror — keep in sync with `public/site00-assts-boot-gate.js`. */
export const SITE00_IMMERSIVE_BOOT_PREFIXES = SITE00_IMMERSIVE_PREFIXES;
