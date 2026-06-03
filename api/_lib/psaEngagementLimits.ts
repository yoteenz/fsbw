/**
 * PSA chat engagement limits by premium subscription tier.
 * 3-month lowest, 12-month (and BLACK) highest — balances member value vs OpenAI cost.
 */
import type { PsaPremiumProfile } from './psaPremiumCheck.js';
import { isFounderPsaPremiumBypass } from './psaPremiumCheck.js';

export type PsaEngagementTierKey = '3months' | '6months' | '12months';

export type PsaEngagementLimits = {
  tierKey: PsaEngagementTierKey;
  tierLabel: string;
  monthlyLimit: number;
  dailyLimit: number;
};

export const PSA_ENGAGEMENT_BY_TIER: Record<PsaEngagementTierKey, PsaEngagementLimits> = {
  '3months': {
    tierKey: '3months',
    tierLabel: '3 MONTH PREMIUM',
    monthlyLimit: 45,
    dailyLimit: 10,
  },
  '6months': {
    tierKey: '6months',
    tierLabel: '6 MONTH PREMIUM',
    monthlyLimit: 90,
    dailyLimit: 18,
  },
  '12months': {
    tierKey: '12months',
    tierLabel: '12 MONTH PREMIUM',
    monthlyLimit: 180,
    dailyLimit: 30,
  },
};

const TIER_ORDER: PsaEngagementTierKey[] = ['3months', '6months', '12months'];

export function resolvePsaEngagementTier(profile: PsaPremiumProfile): PsaEngagementTierKey {
  const tierName = (profile.tierName ?? '').trim().toUpperCase();
  if (tierName === 'BLACK') return '12months';

  const sub = (profile.subscriptionTier ?? '').trim().toLowerCase();
  if (sub === '6months' || sub === '12months' || sub === '3months') {
    return sub;
  }

  // Legacy PREMIUM without subscription_tier — use lowest tier cap.
  return '3months';
}

export function getPsaEngagementLimits(profile: PsaPremiumProfile): PsaEngagementLimits {
  return PSA_ENGAGEMENT_BY_TIER[resolvePsaEngagementTier(profile)];
}

/** Founder test bypass: no consumption cap (PSA-only). */
export function isPsaEngagementUnlimited(email: string | null | undefined): boolean {
  return isFounderPsaPremiumBypass(email);
}

export function formatPsaLimitSummary(): string {
  return TIER_ORDER.map((key) => {
    const t = PSA_ENGAGEMENT_BY_TIER[key];
    return `${t.tierLabel.replace(' PREMIUM', '')}: ${t.monthlyLimit}/MO (${t.dailyLimit}/DAY)`;
  }).join(' · ');
}

export function psaBenefitLabelForTier(tierKey: PsaEngagementTierKey): string {
  const t = PSA_ENGAGEMENT_BY_TIER[tierKey];
  return `PERSONAL SLAY ASSISTANT (PSA) — ${t.monthlyLimit} MSGS/MO (${t.dailyLimit}/DAY)`;
}
