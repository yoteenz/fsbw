import { DESKTOP_ROOM_TITLE_TABLET_MIN_WIDTH } from './desktopRoomTitlePlacementDebug';
import { isDesktopArtboardLayoutActive } from './desktopPreview';
import {
  DESKTOP_ACCOUNT_HUB_PATH,
  shouldUseDesktopAccountHub,
} from './desktopCommerceRoutes';

/** Max length for return path (pathname + search) after sign-in. */
const MAX_RETURN_LEN = 1024;

/** Concierge floor — Reception (default client landing after sign-in on desktop/tablet). */
export const DESKTOP_CLIENT_RECEPTION_PATH = '/desktop/concierge?zone=reception';

/**
 * Tablet (768+) and desktop layouts, including phone `/desktop/*` artboard mode.
 * Phones on standard mobile routes stay on `/account` after sign-in.
 */
export function isDesktopTabletClientSignInViewport(): boolean {
  if (typeof window === 'undefined') return false;
  if (isDesktopArtboardLayoutActive()) return true;
  return window.innerWidth >= DESKTOP_ROOM_TITLE_TABLET_MIN_WIDTH;
}

/**
 * Build `/sign-in?returnTo=…` so after auth the user returns to the page they came from.
 * `loc` should be the current route (`useLocation()`).
 */
export function signInHrefWithReturnTo(loc: { pathname: string; search?: string }): string {
  const path = `${loc.pathname}${loc.search || ''}`.slice(0, MAX_RETURN_LEN);
  return `/sign-in?returnTo=${encodeURIComponent(path)}`;
}

function isSafeInternalPath(p: string): boolean {
  if (!p || p.length > MAX_RETURN_LEN) return false;
  if (!p.startsWith('/')) return false;
  if (p.startsWith('//')) return false;
  return true;
}

function normalizeReturnToParam(returnToParam: string | null | undefined): string | null {
  if (returnToParam == null || returnToParam === '') return null;
  let raw = returnToParam.trim().slice(0, MAX_RETURN_LEN * 4);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // use raw
  }
  raw = raw.slice(0, MAX_RETURN_LEN);
  if (isSafeInternalPath(raw)) {
    if (raw === '/account' && shouldUseDesktopAccountHub()) {
      return DESKTOP_ACCOUNT_HUB_PATH;
    }
    return raw;
  }

  const legacy = raw.replace(/^\//, '').toLowerCase();
  if (legacy === 'checkout') return '/checkout';
  if (legacy === 'checkout/gift-card') return '/checkout/gift-card';
  if (legacy === 'checkout/slay-tickets') return '/checkout/slay-tickets';
  if (legacy === 'checkout/bookings') return '/checkout/bookings';
  if (legacy === 'checkout/summary') return '/checkout/summary';
  if (legacy === 'account/settings') return '/account/settings';
  if (legacy.startsWith('admin/') || legacy === 'admin') {
    const p = raw.startsWith('/') ? raw : `/${raw}`;
    return isSafeInternalPath(p) ? p : null;
  }
  return null;
}

/**
 * Target path after successful sign-in (or session restore when already signed in).
 * Prefers `returnTo` query (encoded path), then legacy tokens, then `location.state.from`.
 */
export function resolveReturnToAfterSignIn(
  returnToParam: string | null | undefined,
  state: { from?: string } | null | undefined,
): string {
  const fromQuery = normalizeReturnToParam(returnToParam);
  if (fromQuery) return fromQuery;

  const from = state?.from;
  if (typeof from === 'string') {
    const t = from.trim().slice(0, MAX_RETURN_LEN);
    if (isSafeInternalPath(t)) return t;
    if ((t.startsWith('/account') || t.startsWith('/wishlist')) && isSafeInternalPath(t)) return t;
  }

  if (isDesktopTabletClientSignInViewport()) {
    return DESKTOP_CLIENT_RECEPTION_PATH;
  }

  return '/account';
}
