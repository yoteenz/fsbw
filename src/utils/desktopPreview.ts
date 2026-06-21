/** Fixed desktop artboard for phone preview (`/desktop-preview`). */
export const DESKTOP_PREVIEW_VIEWPORT_WIDTH = 1920;
export const DESKTOP_PREVIEW_VIEWPORT_HEIGHT = 1080;

const PREVIEW_PREFIX = '/desktop-preview';
const DESKTOP_PREFIX = '/desktop';

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
