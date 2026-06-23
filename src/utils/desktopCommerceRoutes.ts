import { isDesktopTabletClientSignInViewport } from './signInReturnTo';

export const DESKTOP_ACCOUNT_HUB_PATH = '/desktop/account';
export const DESKTOP_SHOPPING_BAG_PATH = '/desktop/shopping-bag';

export function isDesktopSitePath(pathname: string): boolean {
  return pathname === '/desktop' || pathname.startsWith('/desktop/');
}

/**
 * Penthouse Suite account hub on `/desktop/*` and tablet-sized viewports (768px+),
 * including phone `/desktop/*` artboard mode.
 */
export function shouldUseDesktopAccountHub(pathname?: string): boolean {
  const path =
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  if (isDesktopSitePath(path)) return true;
  return isDesktopTabletClientSignInViewport();
}

export function resolveAccountHubPath(pathname?: string): string {
  return shouldUseDesktopAccountHub(pathname) ? DESKTOP_ACCOUNT_HUB_PATH : '/account';
}

export function resolveShoppingBagPath(pathname?: string): string {
  return shouldUseDesktopAccountHub(pathname) ? DESKTOP_SHOPPING_BAG_PATH : '/bag';
}
