/**
 * Premium membership tiers: same USD base prices as the upgrade chart on Account → Rewards.
 * Used at checkout, admin revenue (membership payments), and for renewal amount reference.
 */
export type SubscriptionTierId = '3months' | '6months' | '12months';

export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTierId,
  { name: string; priceUsd: number; periodMonths: number }
> = {
  '3months': { name: '3 MONTHS PREMIUM', priceUsd: 280, periodMonths: 3 },
  '6months': { name: '6 MONTHS PREMIUM', priceUsd: 520, periodMonths: 6 },
  '12months': { name: '12 MONTHS PREMIUM', priceUsd: 960, periodMonths: 12 },
};

export function isSubscriptionTierId(v: string | null | undefined): v is SubscriptionTierId {
  return v === '3months' || v === '6months' || v === '12months';
}

export function getSubscriptionPriceUsd(tier: SubscriptionTierId): number {
  return SUBSCRIPTION_TIERS[tier].priceUsd;
}

export function getSubscriptionPeriodMonths(tier: SubscriptionTierId): number {
  return SUBSCRIPTION_TIERS[tier].periodMonths;
}

export function getSubscriptionDisplayName(tier: SubscriptionTierId): string {
  return SUBSCRIPTION_TIERS[tier].name;
}
