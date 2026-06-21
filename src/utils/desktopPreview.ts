/** Fixed desktop artboard for phone preview (`/desktop-preview`). */
export const DESKTOP_PREVIEW_VIEWPORT_WIDTH = 1920;
export const DESKTOP_PREVIEW_VIEWPORT_HEIGHT = 1080;

const PREVIEW_PREFIX = '/desktop-preview';
const DESKTOP_PREFIX = '/desktop';

/** Staging / dev only — not exposed on production custom domain (e.g. frontalslayer.com). */
export function isDesktopPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (host === 'fsbw.vercel.app' || host.endsWith('.vercel.app')) return true;
  const env =
    (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_VERCEL_ENV) ||
    undefined;
  return env === 'preview' || env === 'development';
}

/** Parent shell routes (`/desktop-preview`, `/desktop-preview/*`). */
export function isDesktopPreviewWrapperPath(pathname: string): boolean {
  return pathname === PREVIEW_PREFIX || pathname.startsWith(`${PREVIEW_PREFIX}/`);
}

/** Map `/desktop-preview/...` → `/desktop/...` for the iframe (desktop design only). */
export function resolveDesktopIframePath(previewPathname: string): string {
  if (previewPathname === PREVIEW_PREFIX || previewPathname === `${PREVIEW_PREFIX}/`) {
    return `${DESKTOP_PREFIX}/lobby`;
  }
  if (previewPathname.startsWith(`${PREVIEW_PREFIX}/`)) {
    const suffix = previewPathname.slice(PREVIEW_PREFIX.length);
    return `${DESKTOP_PREFIX}${suffix}`;
  }
  return `${DESKTOP_PREFIX}/lobby`;
}
