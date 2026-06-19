/** PSA marketing copy for membership pages, upgrade chart and brand Become a Member. */

export type PsaEngagementTierKey = '3months' | '6months' | '12months';

export const PSA_MEMBERSHIP_TITLE = 'PERSONAL SLAY ASSISTANT';

export const PSA_MEMBERSHIP_SUBTITLE =
  'YOUR AI HAIR CONCIERGE — PRODUCT MATCHING, BUILD-A-WIG GUIDANCE, POLICIES, LOYALTY + IN-APP NAV';

/** Short label for tier benefit bullet lists (generic). */
export const PSA_MEMBERSHIP_BENEFIT_LABEL = 'PERSONAL SLAY ASSISTANT';

/** Tier-based chat limits — keep in sync with `api/_lib/psaEngagementLimits.ts`. */
export const PSA_ENGAGEMENT_BY_TIER: Record<
  PsaEngagementTierKey,
  { tierLabel: string; monthlyLimit: number; dailyLimit: number }
> = {
  '3months': { tierLabel: '3 MONTH PREMIUM', monthlyLimit: 45, dailyLimit: 10 },
  '6months': { tierLabel: '6 MONTH PREMIUM', monthlyLimit: 90, dailyLimit: 18 },
  '12months': { tierLabel: '12 MONTH PREMIUM', monthlyLimit: 180, dailyLimit: 30 },
};

export function psaBenefitLabelForTier(_tierKey: PsaEngagementTierKey): string {
  return PSA_MEMBERSHIP_BENEFIT_LABEL;
}

export function formatPsaUsageRemaining(
  monthCount: number,
  monthLimit: number,
  dayCount: number,
  dayLimit: number
): string {
  const monthLeft = Math.max(0, monthLimit - monthCount);
  const dayLeft = Math.max(0, dayLimit - dayCount);
  return `${monthLeft} MSGS LEFT THIS MONTH · ${dayLeft} TODAY`;
}
