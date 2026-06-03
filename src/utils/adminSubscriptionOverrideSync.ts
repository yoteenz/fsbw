/**
 * Persist founder admin subscription preview toggle to Supabase so server gates (PSA chat) match local UI.
 */
import { patchProfile } from './api';

export type AdminSubscriptionOverrideTier = 'standard' | '3months' | '6months' | '12months';

function profilePatchForAdminSubscriptionOverride(
  tier: AdminSubscriptionOverrideTier
): { membershipType: string; subscriptionTier: string | null } {
  if (tier === 'standard') {
    return { membershipType: 'STANDARD', subscriptionTier: null };
  }
  return { membershipType: 'PREMIUM', subscriptionTier: tier };
}

function applyAdminSubscriptionOverrideToLocalUser(
  patch: ReturnType<typeof profilePatchForAdminSubscriptionOverride>
): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return;
    const user = JSON.parse(raw) as Record<string, unknown>;
    user.membershipType = patch.membershipType;
    if (patch.subscriptionTier) {
      user.subscriptionTier = patch.subscriptionTier;
    } else {
      delete user.subscriptionTier;
    }
    localStorage.setItem('currentUser', JSON.stringify(user));

    const registeredRaw = localStorage.getItem('registeredUsers');
    if (registeredRaw) {
      const email = ((user.email as string) || '').trim().toLowerCase();
      const registered = JSON.parse(registeredRaw) as Record<string, unknown>[];
      if (Array.isArray(registered) && email) {
        const idx = registered.findIndex(
          (u) => (((u.email as string) || '').trim().toLowerCase() === email)
        );
        if (idx !== -1) {
          registered[idx] = { ...registered[idx], ...user };
          localStorage.setItem('registeredUsers', JSON.stringify(registered));
        }
      }
    }

    window.dispatchEvent(new Event('signInStateChanged'));
  } catch {
    /* ignore */
  }
}

/** Write admin subscription override to Supabase + align local `currentUser`. */
export async function syncAdminSubscriptionOverrideToSupabase(
  tier: AdminSubscriptionOverrideTier
): Promise<void> {
  const patch = profilePatchForAdminSubscriptionOverride(tier);
  await patchProfile(patch);
  applyAdminSubscriptionOverrideToLocalUser(patch);
}
