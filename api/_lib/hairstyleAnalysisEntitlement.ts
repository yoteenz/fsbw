/**
 * Hairstyle analysis membership entitlement — 3 / 6 / 12 month subscribers get
 * one free analysis per UTC calendar month (card tier matches subscription).
 */
import { isAdminEmail } from './adminAuth.js';
import { isFounderPsaPremiumBypass } from './psaPremiumCheck.js';
import type { PsaPremiumProfile } from './psaPremiumCheck.js';
import {
  hairstyleAnalysisTemplateUrlForTier,
  normalizeHairstyleAnalysisCardTier,
  type HairstyleAnalysisCardTier,
} from './hairstyleAnalysisTemplates.js';

export const HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT = 1;

const SUBSCRIPTION_TO_CARD_TIER: Record<string, HairstyleAnalysisCardTier> = {
  '3months': 'three_month',
  '6months': 'six_month',
  '12months': 'twelve_month',
};

export type HairstyleAnalysisEntitlement = {
  eligible: boolean;
  analysisTier: HairstyleAnalysisCardTier | null;
  templateUrl: string | null;
  subscriptionTier: string | null;
  monthlyLimit: number;
  unlimited: boolean;
};

export function isHairstyleAnalysisUnlimited(email: string | null | undefined): boolean {
  const normalized = (email ?? '').trim().toLowerCase();
  return isAdminEmail(normalized) || isFounderPsaPremiumBypass(normalized);
}

export function analysisTierFromSubscription(
  subscriptionTier: string | null | undefined
): HairstyleAnalysisCardTier | null {
  const key = (subscriptionTier ?? '').trim().toLowerCase();
  return SUBSCRIPTION_TO_CARD_TIER[key] ?? null;
}

export function resolveHairstyleAnalysisEntitlement(
  profile: PsaPremiumProfile | null,
  email: string | null | undefined
): HairstyleAnalysisEntitlement {
  const unlimited = isHairstyleAnalysisUnlimited(email);
  const subscriptionTier = profile?.subscriptionTier ?? null;
  const analysisTier = analysisTierFromSubscription(subscriptionTier);

  if (unlimited) {
    return {
      eligible: true,
      analysisTier: analysisTier ?? 'three_month',
      templateUrl: hairstyleAnalysisTemplateUrlForTier(analysisTier ?? 'three_month'),
      subscriptionTier,
      monthlyLimit: HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT,
      unlimited: true,
    };
  }

  if (!analysisTier) {
    return {
      eligible: false,
      analysisTier: null,
      templateUrl: null,
      subscriptionTier,
      monthlyLimit: HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT,
      unlimited: false,
    };
  }

  return {
    eligible: true,
    analysisTier,
    templateUrl: hairstyleAnalysisTemplateUrlForTier(analysisTier),
    subscriptionTier,
    monthlyLimit: HAIRSTYLE_ANALYSIS_MONTHLY_LIMIT,
    unlimited: false,
  };
}

export function effectiveHairstyleAnalysisTierForRequest(options: {
  entitlement: HairstyleAnalysisEntitlement;
  requestedTier: string | null | undefined;
  isAdmin: boolean;
}): HairstyleAnalysisCardTier {
  if (options.isAdmin && options.requestedTier) {
    return normalizeHairstyleAnalysisCardTier(options.requestedTier);
  }
  if (options.entitlement.analysisTier) {
    return options.entitlement.analysisTier;
  }
  return 'three_month';
}
