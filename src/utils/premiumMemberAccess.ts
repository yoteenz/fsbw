import { getEffectiveSubscriptionTier, getEffectiveTierName } from './adminAuth';

/**
 * Same gate as `/lobby` and PSA: signed-in users need an active premium **subscription** and/or **BLACK** spend tier
 * to access subscriber-only areas (lobby, lounge, PSA, premium-only PDP options, etc.).
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

type CartLinePremiumGated = {
  bcfBundleDeal?: boolean;
  quantity?: number;
  type?: string;
  bookingTier?: string;
};

/** True when this cart row requires premium and should be removed if the user no longer qualifies. */
export function isPremiumGatedCartLine(item: CartLinePremiumGated): boolean {
  if (item.bcfBundleDeal) return true;
  if (item.type === 'booking-appointment') return true;
  if (item.type === 'booking-consult' && item.bookingTier === 'premium') return true;
  return false;
}

/**
 * Removes premium-only rows when the user no longer qualifies (`isPremiumMemberForGatedFeatures`):
 * **BCF bundle-deal**, **hair appointments** (`booking-appointment`), **premium-tier consults**
 * (`booking-consult` + `bookingTier === 'premium'`). Standard consults stay in the cart.
 */
export function stripIneligibleBcfBundleDealLines<T extends CartLinePremiumGated>(
  items: T[] | null | undefined
): { next: T[]; removedLineCount: number; removedUnitCount: number } {
  const list = Array.isArray(items) ? items : [];
  if (isPremiumMemberForGatedFeatures()) {
    return { next: list, removedLineCount: 0, removedUnitCount: 0 };
  }
  let removedLineCount = 0;
  let removedUnitCount = 0;
  const next = list.filter((item) => {
    if (isPremiumGatedCartLine(item)) {
      removedLineCount += 1;
      removedUnitCount += item.quantity ?? 1;
      return false;
    }
    return true;
  });
  return { next, removedLineCount, removedUnitCount };
}

function persistCartAfterBundleDealStrip(next: unknown[]): void {
  localStorage.setItem('cartItems', JSON.stringify(next));
  const newCount = (next as CartLinePremiumGated[]).reduce(
    (sum, ci) => sum + (ci.quantity ?? 1),
    0
  );
  localStorage.setItem('cartCount', String(newCount));
  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
  window.dispatchEvent(new Event('cartUpdated'));
}

/** Rewrite `cartItems` in localStorage if any bundle-deal lines are present while user is not premium. */
export function applyStripIneligibleBcfBundleDealsToStoredCart(): void {
  try {
    const raw = localStorage.getItem('cartItems');
    if (!raw) return;
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return;
    const { next, removedUnitCount } = stripIneligibleBcfBundleDealLines(items);
    if (removedUnitCount <= 0) return;
    persistCartAfterBundleDealStrip(next);
  } catch {
    /* ignore */
  }
}

/** Remove ineligible bundle-deal rows from `savedForLater` in localStorage. */
export function applyStripIneligibleBcfBundleDealsToStoredSavedForLater(): void {
  try {
    const raw = localStorage.getItem('savedForLater');
    if (!raw) return;
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return;
    const { next, removedUnitCount } = stripIneligibleBcfBundleDealLines(items);
    if (removedUnitCount <= 0) return;
    localStorage.setItem('savedForLater', JSON.stringify(next));
    window.dispatchEvent(new Event('savedItemsChanged'));
  } catch {
    /* ignore */
  }
}

export function applyStripIneligibleBcfBundleDealsToAllStoredCarts(): void {
  applyStripIneligibleBcfBundleDealsToStoredCart();
  applyStripIneligibleBcfBundleDealsToStoredSavedForLater();
}
