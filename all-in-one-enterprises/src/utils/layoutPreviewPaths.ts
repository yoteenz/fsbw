import { aioAppConfig } from '../config/appConfig';
import type { AioLayoutPreviewMode } from '../layout-preview/layoutPreviewMode';
import { DESKTOP_ROUTE_SEGMENT, MOBILE_ROUTE_SEGMENT } from '../layout-preview/layoutPreviewMode';

const BASE = aioAppConfig.routes.base.replace(/\/$/, '');

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '') return BASE || '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

/** Strip /desktop or /mobile prefix → canonical app path. */
export function stripLayoutPreviewPrefix(pathname: string): string {
  const path = normalizePath(pathname);
  const desktopPrefix = `${BASE}/${DESKTOP_ROUTE_SEGMENT}`;
  const mobilePrefix = `${BASE}/${MOBILE_ROUTE_SEGMENT}`;

  if (path === desktopPrefix || path === mobilePrefix) {
    return BASE || '/';
  }
  if (path.startsWith(`${desktopPrefix}/`)) {
    const rest = path.slice(desktopPrefix.length);
    return `${BASE}${rest}` || '/';
  }
  if (path.startsWith(`${mobilePrefix}/`)) {
    const rest = path.slice(mobilePrefix.length);
    return `${BASE}${rest}` || '/';
  }
  return path;
}

/** Add /desktop or /mobile prefix to canonical path. */
export function withLayoutPreviewPrefix(pathname: string, mode: 'desktop' | 'mobile'): string {
  const canonical = stripLayoutPreviewPrefix(pathname);
  const segment = mode === 'desktop' ? DESKTOP_ROUTE_SEGMENT : MOBILE_ROUTE_SEGMENT;
  const prefix = `${BASE}/${segment}`.replace(/\/\//g, '/');

  if (canonical === BASE || canonical === `${BASE}/` || canonical === '/') {
    return prefix;
  }

  const suffix = canonical.startsWith(BASE) ? canonical.slice(BASE.length) : canonical;
  return `${prefix}${suffix}`.replace(/\/\//g, '/');
}

export function layoutPreviewModeFromPath(pathname: string): AioLayoutPreviewMode {
  const path = normalizePath(pathname);
  const desktopPrefix = `${BASE}/${DESKTOP_ROUTE_SEGMENT}`;
  const mobilePrefix = `${BASE}/${MOBILE_ROUTE_SEGMENT}`;

  if (path === desktopPrefix || path.startsWith(`${desktopPrefix}/`)) return 'desktop';
  if (path === mobilePrefix || path.startsWith(`${mobilePrefix}/`)) return 'mobile';
  return 'responsive';
}

export function layoutPreviewPathForMode(pathname: string, mode: AioLayoutPreviewMode): string {
  const canonical = stripLayoutPreviewPrefix(pathname);
  if (mode === 'responsive') return canonical;
  return withLayoutPreviewPrefix(canonical, mode);
}

export const layoutPreviewPaths = {
  desktopRoot: `${BASE}/${DESKTOP_ROUTE_SEGMENT}`.replace(/\/\//g, '/'),
  mobileRoot: `${BASE}/${MOBILE_ROUTE_SEGMENT}`.replace(/\/\//g, '/'),
  desktopGetStarted: `${BASE}/${DESKTOP_ROUTE_SEGMENT}/get-started`.replace(/\/\//g, '/'),
  mobileGetStarted: `${BASE}/${MOBILE_ROUTE_SEGMENT}/get-started`.replace(/\/\//g, '/'),
};
