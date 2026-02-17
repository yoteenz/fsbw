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
 * Points multiplier: Red = 1.25x, Black = 1.5x; 12-month premium adds 2x (stacked).
 * So: Standard 1x, Red 1.25x, Black 1.5x, 12mo Premium 2x, Red+12mo 3.25x, Black+12mo 3.5x.
 */
export function getPointsMultiplier(tierName: string | null, subscriptionTier: string | null): { multiplier: number; label: string } {
  const tier = (tierName || '').toUpperCase();
  const tierMult = tier === 'BLACK' ? 1.5 : tier === 'RED' ? 1.25 : 1;
  const is12MonthPremium = (subscriptionTier || '').toLowerCase() === '12months';
  const premiumBoost = is12MonthPremium ? 2 : 0;
  const multiplier = tierMult + premiumBoost;
  const tierLabel = tier === 'BLACK' ? 'Black' : tier === 'RED' ? 'Red' : 'Standard';
  const label = multiplier > 1
    ? (is12MonthPremium ? `${multiplier}x (${tierLabel} + 12mo Premium)` : `${multiplier}x ${tierLabel}`)
    : '';
  return { multiplier, label };
}
