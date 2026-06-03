/** PSA marketing copy for membership pages, upgrade chart, and brand Become a Member. */

export type PsaEngagementTierKey = '3months' | '6months' | '12months';

export const PSA_MEMBERSHIP_TITLE = 'PERSONAL SLAY ASSISTANT (PSA)';

export const PSA_MEMBERSHIP_SUBTITLE =
  'YOUR AI HAIR CONCIERGE — PRODUCT MATCHING, BUILD-A-WIG GUIDANCE, POLICIES, LOYALTY + IN-APP NAV';

/** Short label for tier benefit bullet lists (generic). */
export const PSA_MEMBERSHIP_BENEFIT_LABEL = 'PERSONAL SLAY ASSISTANT (PSA)';

/** Tier-based chat limits — keep in sync with `api/_lib/psaEngagementLimits.ts`. */
export const PSA_ENGAGEMENT_BY_TIER: Record<
  PsaEngagementTierKey,
  { tierLabel: string; monthlyLimit: number; dailyLimit: number }
> = {
  '3months': { tierLabel: '3 MONTH PREMIUM', monthlyLimit: 45, dailyLimit: 10 },
  '6months': { tierLabel: '6 MONTH PREMIUM', monthlyLimit: 90, dailyLimit: 18 },
  '12months': { tierLabel: '12 MONTH PREMIUM', monthlyLimit: 180, dailyLimit: 30 },
};

export const PSA_ENGAGEMENT_LIMITS_SUMMARY =
  'PSA CHAT LIMITS BY PLAN — 3 MONTH: 45 MESSAGES/MONTH (10/DAY) · 6 MONTH: 90/MONTH (18/DAY) · 12 MONTH: 180/MONTH (30/DAY)';

export function psaBenefitLabelForTier(tierKey: PsaEngagementTierKey): string {
  const t = PSA_ENGAGEMENT_BY_TIER[tierKey];
  return `PERSONAL SLAY ASSISTANT (PSA) — ${t.monthlyLimit} MSGS/MO (${t.dailyLimit}/DAY)`;
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
