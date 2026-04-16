/**
 * Founder-only Fal NOIR tools: API requires a Bearer token, but the **regen UI** should show
 * whenever the founder is signed in (including local admin password path without Supabase session).
 */
import { getAccessToken } from './api';
import { isAdminFounderAccount, isSignedIn } from './adminAuth';
import { getCurrentUserEmailFromStorage } from './perUserStorage';

export async function canUseFounderNoirFalTools(): Promise<boolean> {
  const email = getCurrentUserEmailFromStorage();
  if (!email || !isAdminFounderAccount({ email })) return false;
  const token = await getAccessToken();
  if (token) return true;
  return isSignedIn();
}
