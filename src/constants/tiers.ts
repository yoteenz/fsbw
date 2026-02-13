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
