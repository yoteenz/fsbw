import { isBawTutorialPath } from '../constants/bawTutorialConfig';
import { isBuildAWigCustomizePath } from './buildAWigRoutes';
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

/**
 * Signed-in standard members (and guest try flow) browse Build-a-Wig in test-only mode:
 * no add-to-bag / live try-on / confirm — VIEW SUBSCRIPTIONS toggles the premium chart.
 */
export function isBawClientTestOnlyMode(pathname: string): boolean {
  if (isBawTutorialPath(pathname)) return true;
  if (!pathname.startsWith('/build-a-wig')) return false;
  if (isActiveBuildWigAppointmentMode()) return false;
  if (isBawEditPath(pathname)) return false;
  if (isBuildAWigCustomizePath(pathname)) return false;
  if (isPremiumMemberForGatedFeatures()) return false;
  return isSignedInFromStorage();
}
