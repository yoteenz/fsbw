/** Max length for return path (pathname + search) after sign-in. */
const MAX_RETURN_LEN = 1024;

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
  if (isSafeInternalPath(raw)) return raw;

  const legacy = raw.replace(/^\//, '').toLowerCase();
  if (legacy === 'checkout') return '/checkout';
  if (legacy === 'checkout/gift-card') return '/checkout/gift-card';
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
  return '/account';
}
