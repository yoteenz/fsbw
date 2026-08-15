import { isStudioInstitutePath } from '../studio-os-core/expert-capture/invite-system/config';

/** All In One Enterprises Inc. website — isolated from Frontal Slayer bootstrap. */
export function isAllInOneDebugPath(pathname: string): boolean {
  return (
    pathname === '/all-in-one' ||
    pathname.startsWith('/all-in-one/') ||
    pathname === '/debug/all-in-one' ||
    pathname.startsWith('/debug/all-in-one/')
  );
}

/** Routes that skip main storefront bootstrap (Expert Capture + Studio Institute + All In One debug). */
export function isIsolatedStudioRoute(pathname: string): boolean {
  if (isAllInOneDebugPath(pathname)) return true;
  if (isStudioInstitutePath(pathname)) return true;
  if (pathname === '/context') return true;
  if (pathname === '/founder-intelligence') return true;
  if (pathname === '/onboarding') return true;
  if (pathname.startsWith('/expert-capture')) return true;
  if (pathname.startsWith('/__')) return true;
  return false;
}
