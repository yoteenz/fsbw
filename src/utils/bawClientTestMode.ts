import { isBawTutorialPath } from '../constants/bawTutorialConfig';
import { isBuildAWigCustomizePath, isBuildAWigHubLandingPath, pathnameIsBuildWigPremiumMembershipStep } from './buildAWigRoutes';
import { isActiveBuildWigAppointmentMode } from './bookingNewInstallUnit';
import { isPremiumMemberForGatedFeatures } from './premiumMemberAccess';

export const BAW_TRY_BROWSE_SESSION_KEY = 'bawTryBrowseActive';

function isSignedInFromStorage(): boolean {
  try {
    return localStorage.getItem('isSignedIn') === 'true';
  } catch {
    return false;
  }
}

export function setBawTryBrowseActive(active: boolean): void {
  try {
    if (active) sessionStorage.setItem(BAW_TRY_BROWSE_SESSION_KEY, '1');
    else sessionStorage.removeItem(BAW_TRY_BROWSE_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Guest try route or premium sub-pages opened from try — browse freely, no confirm. */
export function isBawTryBrowseMode(pathname: string): boolean {
  if (isBawTutorialPath(pathname)) return true;
  try {
    return sessionStorage.getItem(BAW_TRY_BROWSE_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function isBawEditPath(pathname: string): boolean {
  return pathname.includes('/edit');
}

/** Signed-in standard members on premium option sub-pages — VIEW SUBSCRIPTIONS footer. */
export function isBawClientTestOnlyMode(pathname: string): boolean {
  if (!isSignedInFromStorage()) return false;
  if (isPremiumMemberForGatedFeatures()) return false;
  if (!pathname.startsWith('/build-a-wig')) return false;
  if (isActiveBuildWigAppointmentMode()) return false;
  if (isBawEditPath(pathname)) return false;
  return pathnameIsBuildWigPremiumMembershipStep(pathname);
}

/**
 * Footer shows VIEW SUBSCRIPTIONS instead of ADD TO BAG / CONFIRM SELECTION when:
 * - Signed out (all BAW pages), or
 * - Signed-in standard member on premium option sub-pages only.
 */
export function isBawViewSubscriptionsFooterMode(pathname: string): boolean {
  if (!pathname.startsWith('/build-a-wig') && !isBawTutorialPath(pathname)) return false;
  if (!isSignedInFromStorage()) return true;
  if (isPremiumMemberForGatedFeatures()) return false;
  return pathnameIsBuildWigPremiumMembershipStep(pathname);
}

/** Signed-in standard members on hub landing — CUSTOMIZE IN BUILD-A-WIG footer. */
export function isBawStandardMemberHubBrowseMode(pathname: string): boolean {
  if (!pathname.startsWith('/build-a-wig')) return false;
  if (isActiveBuildWigAppointmentMode()) return false;
  if (isBawEditPath(pathname)) return false;
  if (isBuildAWigCustomizePath(pathname)) return false;
  if (isPremiumMemberForGatedFeatures()) return false;
  if (!isSignedInFromStorage()) return false;
  if (isBawTutorialPath(pathname)) return false;
  return isBuildAWigHubLandingPath(pathname);
}

export function isBawGuestTryPage(pathname: string): boolean {
  return isBawTutorialPath(pathname) && !isSignedInFromStorage();
}
