import { getEffectiveSubscriptionTier, getEffectiveTierName } from './adminAuth';

/**
 * Same gate as `/lobby`: signed-in users need an active premium **subscription** and/or **BLACK** spend tier
 * to access subscriber-only areas (lobby, premium-only PDP options, etc.).
 */
export function isPremiumMemberForGatedFeatures(): boolean {
  try {
    if (localStorage.getItem('isSignedIn') !== 'true') return false;
    const raw = localStorage.getItem('currentUser');
    if (!raw) return false;
    const user = JSON.parse(raw) as Record<string, unknown>;
    const effectiveSubscriptionTier = getEffectiveSubscriptionTier(user);
    const isPremium = effectiveSubscriptionTier != null;
    const effectiveTierName = getEffectiveTierName(user);
    const isBlackTier = (effectiveTierName || '').toUpperCase() === 'BLACK';
    return Boolean(isPremium || isBlackTier);
  } catch {
    return false;
  }
}

/** Session flags consumed by Account → Rewards / membership upgrade chart (matches lobby `handleUpgrade`). */
export function prepareMembershipUpgradeNavigation(): void {
  try {
    sessionStorage.setItem('returningFromCheckout', 'true');
    localStorage.setItem('membershipShowPremiumView', 'true');
    localStorage.removeItem('membershipSelectedTier');
  } catch {
    /* ignore */
  }
}
