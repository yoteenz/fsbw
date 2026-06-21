/** Fixed desktop artboard for phone preview (`/desktop-preview`). */
export const DESKTOP_PREVIEW_VIEWPORT_WIDTH = 1920;
export const DESKTOP_PREVIEW_VIEWPORT_HEIGHT = 1080;

export const DESKTOP_EMBED_QUERY = 'desktopEmbed';

const PREVIEW_PREFIX = '/desktop-preview';
const DESKTOP_PREFIX = '/desktop';

const DEFAULT_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0';
const OUTER_PREVIEW_VIEWPORT_CONTENT =
  'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover';
const INNER_EMBED_VIEWPORT_CONTENT =
  `width=${DESKTOP_PREVIEW_VIEWPORT_WIDTH}, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no`;

let embedViewportLockInstalled = false;
let outerViewportLockInstalled = false;
const gestureBlockers: Array<(event: Event) => void> = [];

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

/** True inside the iframe that `/desktop-preview` mounts (desktop routes with embed flag). */
export function isDesktopEmbedFrame(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get(DESKTOP_EMBED_QUERY) === '1') return true;
  } catch {
    /* ignore */
  }
  try {
    if (window.self !== window.top) {
      return isDesktopPreviewWrapperPath(window.parent.location.pathname);
    }
  } catch {
    /* ignore */
  }
  return false;
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

export function buildDesktopEmbedIframeSrc(desktopPath: string, search: string, hash: string): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.set(DESKTOP_EMBED_QUERY, '1');
  const qs = params.toString();
  return `${desktopPath}${qs ? `?${qs}` : ''}${hash}`;
}

function setViewportContent(content: string): string {
  const meta = document.querySelector('meta[name="viewport"]');
  const previous = meta?.getAttribute('content') ?? DEFAULT_VIEWPORT_CONTENT;
  meta?.setAttribute('content', content);
  return previous;
}

function addGestureZoomBlockers(): void {
  const block = (event: Event) => {
    event.preventDefault();
  };
  gestureBlockers.push(block);
  document.addEventListener('gesturestart', block, { passive: false });
  document.addEventListener('gesturechange', block, { passive: false });
  document.addEventListener('gestureend', block, { passive: false });
}

function removeGestureZoomBlockers(): void {
  for (const block of gestureBlockers) {
    document.removeEventListener('gesturestart', block);
    document.removeEventListener('gesturechange', block);
    document.removeEventListener('gestureend', block);
  }
  gestureBlockers.length = 0;
}

/** Inner iframe document: fixed 1920 layout + block pinch zoom reloads. */
export function installDesktopEmbedViewportLock(): () => void {
  if (typeof document === 'undefined' || embedViewportLockInstalled) {
    return () => undefined;
  }
  embedViewportLockInstalled = true;

  const previousViewport = setViewportContent(INNER_EMBED_VIEWPORT_CONTENT);
  const previousHtmlOverflow = document.documentElement.style.overflow;
  const previousBodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  addGestureZoomBlockers();

  return () => {
    embedViewportLockInstalled = false;
    setViewportContent(previousViewport);
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.style.overflow = previousBodyOverflow;
    removeGestureZoomBlockers();
  };
}

/** Outer `/desktop-preview` shell: block browser zoom gestures on the phone. */
export function installDesktopPreviewShellViewportLock(): () => void {
  if (typeof document === 'undefined' || outerViewportLockInstalled) {
    return () => undefined;
  }
  outerViewportLockInstalled = true;

  const previousViewport = setViewportContent(OUTER_PREVIEW_VIEWPORT_CONTENT);
  const previousHtmlOverflow = document.documentElement.style.overflow;
  const previousBodyOverflow = document.body.style.overflow;
  const previousBodyMargin = document.body.style.margin;
  const previousBodyBackground = document.body.style.background;
  const previousBodyTouchAction = document.body.style.touchAction;

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.margin = '0';
  document.body.style.background = '#050505';
  document.body.style.touchAction = 'manipulation';
  addGestureZoomBlockers();

  return () => {
    outerViewportLockInstalled = false;
    setViewportContent(previousViewport);
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.style.overflow = previousBodyOverflow;
    document.body.style.margin = previousBodyMargin;
    document.body.style.background = previousBodyBackground;
    document.body.style.touchAction = previousBodyTouchAction;
    removeGestureZoomBlockers();
  };
}

export function bootstrapDesktopEmbedFrame(): void {
  if (!isDesktopEmbedFrame()) return;
  installDesktopEmbedViewportLock();
}

export type DesktopPreviewScaleBox = {
  scale: number;
  width: number;
  height: number;
};

export function measureDesktopPreviewScaleBox(
  shellWidth: number,
  shellHeight: number,
): DesktopPreviewScaleBox {
  const scaleX = shellWidth / DESKTOP_PREVIEW_VIEWPORT_WIDTH;
  const scaleY = shellHeight / DESKTOP_PREVIEW_VIEWPORT_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  return {
    scale,
    width: DESKTOP_PREVIEW_VIEWPORT_WIDTH * scale,
    height: DESKTOP_PREVIEW_VIEWPORT_HEIGHT * scale,
  };
}
