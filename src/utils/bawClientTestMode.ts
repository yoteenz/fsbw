import { isBawTutorialPath } from '../constants/bawTutorialConfig';
import { isBuildAWigCustomizePath, isBuildAWigHubLandingPath, pathnameIsBuildWigPremiumMembershipStep } from './buildAWigRoutes';
import { isActiveBuildWigAppointmentMode } from './bookingNewInstallUnit';
import { isPremiumMemberForGatedFeatures } from './premiumMemberAccess';

function isSignedInFromStorage(): boolean {
  try {
    return localStorage.getItem('isSignedIn') === 'true';
  } catch {
    return false;
  }
}

export function isBawEditPath(pathname: string): boolean {
  return pathname.includes('/edit');
}

/** Signed-in standard members on premium option sub-pages — VIEW SUBSCRIPTIONS footer. */
export function isBawClientTestOnlyMode(pathname: string): boolean {
  if (isBawTutorialPath(pathname)) return false;
  if (!pathname.startsWith('/build-a-wig')) return false;
  if (isActiveBuildWigAppointmentMode()) return false;
  if (isBawEditPath(pathname)) return false;
  if (isBuildAWigCustomizePath(pathname)) return false;
  if (isPremiumMemberForGatedFeatures()) return false;
  if (!isSignedInFromStorage()) return false;
  return pathnameIsBuildWigPremiumMembershipStep(pathname);
}

/** Signed-in standard members on hub landing or try route — CUSTOMIZE IN BUILD-A-WIG footer. */
export function isBawStandardMemberHubBrowseMode(pathname: string): boolean {
  if (!pathname.startsWith('/build-a-wig')) return false;
  if (isActiveBuildWigAppointmentMode()) return false;
  if (isBawEditPath(pathname)) return false;
  if (isBuildAWigCustomizePath(pathname)) return false;
  if (isPremiumMemberForGatedFeatures()) return false;
  if (!isSignedInFromStorage()) return false;
  if (isBawTutorialPath(pathname)) return true;
  return isBuildAWigHubLandingPath(pathname);
}

export function isBawGuestTryPage(pathname: string): boolean {
  return isBawTutorialPath(pathname) && !isSignedInFromStorage();
}
