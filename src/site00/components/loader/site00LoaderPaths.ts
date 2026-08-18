/** SITE 00 routes that use the immersive geometry loader (boot shell + cinematic gate). */

import { SITE00_ROUTES } from '../../config/routes';

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

/** Designated desktop artboard routes — skip mobile loader; force desktop composition. */
export function isSite00DesktopArtboardPath(pathname: string): boolean {
  if (!pathname) return false;
  const prefixes = [SITE00_ROUTES.originDesktop, SITE00_ROUTES.idntyStateDesktop, SITE00_ROUTES.bldrStateDesktop] as const;
  return prefixes.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

/** Sign-in is a focused auth surface — skip cinematic cold-start loader. */
export function isSite00SignInPath(pathname: string): boolean {
  if (!pathname) return false;
  return pathname === SITE00_ROUTES.signIn || pathname.startsWith(`${SITE00_ROUTES.signIn}/`);
}

export function isSite00ImmersivePath(pathname: string): boolean {
  if (isSite00DesktopArtboardPath(pathname)) return false;
  if (isSite00SignInPath(pathname)) return false;
  if (!pathname) return false;
  if (pathname === '/' && import.meta.env.VITE_SITE00_ROOT === '1') return true;
  return SITE00_IMMERSIVE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Boot script mirror — keep in sync with `public/site00-assts-boot-gate.js`. */
export const SITE00_IMMERSIVE_BOOT_PREFIXES = SITE00_IMMERSIVE_PREFIXES;
