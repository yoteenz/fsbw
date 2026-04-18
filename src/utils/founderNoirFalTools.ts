/**
 * Founder-only Fal NOIR regen UI: **only** when the current session is the founder Gmail.
 * (Fal API still requires Bearer; local admin founder without Supabase session won’t call Fal successfully.)
 */
import { isAdminFounderAccount, isSignedIn } from './adminAuth';
import { getCurrentUserEmailFromStorage } from './perUserStorage';

/** Synchronous guard: regen buttons / Fal-only banners. Live WebPs from storage use `useBawSubpageLiveNoirCompositeWigViews` for everyone. */
export function isFounderNoirFalRegenUiVisible(): boolean {
  if (!isSignedIn()) return false;
  const email = getCurrentUserEmailFromStorage();
  return Boolean(email && isAdminFounderAccount({ email }));
}

export async function canUseFounderNoirFalTools(): Promise<boolean> {
  return isFounderNoirFalRegenUiVisible();
}
