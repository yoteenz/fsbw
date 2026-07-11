import { isStudioInstitutePath } from '../studio-os-core/expert-capture/invite-system/config';

/** Routes that skip main storefront bootstrap (Expert Capture + Studio Institute). */
export function isIsolatedStudioRoute(pathname: string): boolean {
  if (isStudioInstitutePath(pathname)) return true;
  if (pathname === '/context') return true;
  if (pathname.startsWith('/expert-capture')) return true;
  if (pathname.startsWith('/__')) return true;
  return false;
}
