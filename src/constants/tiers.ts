/**
 * Spend-tier welcome discount (digital cash) credited to the user's balance.
 * This balance is shown as "DIGITAL CASH" on the account profile and applied at checkout.
 * Benefits are earned once per tier per 6-month cycle (Jan–Jun / Jul–Dec); when tiers reset each period, users can unlock tier benefits again.
 */
export const WELCOME_DISCOUNT_BY_TIER: Record<string, number> = {
  SILVER: 10,
  RED: 40,
  BLACK: 80
};

export function getWelcomeDiscountAmount(tierName: string | null): number {
  if (!tierName || !WELCOME_DISCOUNT_BY_TIER[tierName]) return 10;
  return WELCOME_DISCOUNT_BY_TIER[tierName];
}

/**
 * Points multiplier: 12-month premium takes precedence (2x). Otherwise Red = 1.25x, Black = 1.5x, Standard = 1x.
 * No stacking: Premium 2x replaces tier multiplier; tier only applies when not 12mo Premium.
 */
export function getPointsMultiplier(tierName: string | null, subscriptionTier: string | null): { multiplier: number; label: string } {
  const tier = (tierName || '').toUpperCase();
  const tierMult = tier === 'BLACK' ? 1.5 : tier === 'RED' ? 1.25 : 1;
  const is12MonthPremium = (subscriptionTier || '').toLowerCase() === '12months';
  const multiplier = is12MonthPremium ? 2 : tierMult;
  const label = '';
  return { multiplier, label };
}
