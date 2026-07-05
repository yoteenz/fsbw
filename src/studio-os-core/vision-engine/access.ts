import { tryGetStudioOsAuthProvider } from '../auth/provider';
import { VISION_SHARE_SESSION_KEY } from './constants';

/** Vision Engine is internal-only — Studio OS authenticated roles. */
export function canAccessVisionEngineAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  const provider = tryGetStudioOsAuthProvider();
  const user = provider?.getCurrentUser() ?? null;
  if (!user?.email) return false;
  return provider?.isAdminEmail(user.email) ?? false;
}

export function isVisionShareSessionActive(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(VISION_SHARE_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setVisionShareSessionActive(active: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  if (active) sessionStorage.setItem(VISION_SHARE_SESSION_KEY, '1');
  else sessionStorage.removeItem(VISION_SHARE_SESSION_KEY);
}

/** Runtime may activate for admin launch or valid Vision Share link only. */
export function canLaunchVisionPresentation(): boolean {
  return canAccessVisionEngineAdmin() || isVisionShareSessionActive();
}
