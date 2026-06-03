/**
 * Premium chart feature gates (client UI) — mirror `api/_lib/psaFeatureGates.ts`.
 */
export type PsaFeatureId =
  | 'priority_messages'
  | 'live_order_tracking'
  | 'special_offers'
  | 'exclusive_rewards';

export type PsaEngagementTierKey = '3months' | '6months' | '12months';

const FEATURE_MIN_TIER: Record<PsaFeatureId, PsaEngagementTierKey> = {
  priority_messages: '6months',
  live_order_tracking: '6months',
  special_offers: '12months',
  exclusive_rewards: '12months',
};

const TIER_RANK: Record<PsaEngagementTierKey, number> = {
  '3months': 1,
  '6months': 2,
  '12months': 3,
};

export function resolveClientEngagementTier(input: {
  subscriptionTier?: string | null;
  tierName?: string | null;
  membershipType?: string | null;
}): PsaEngagementTierKey {
  if ((input.tierName ?? '').trim().toUpperCase() === 'BLACK') return '12months';
  const sub = (input.subscriptionTier ?? '').trim().toLowerCase();
  if (sub === '6months' || sub === '12months' || sub === '3months') return sub;
  if (input.membershipType === 'PREMIUM' || input.membershipType === 'Premium') return '12months';
  return '3months';
}

export function memberHasPsaFeature(
  input: {
    subscriptionTier?: string | null;
    tierName?: string | null;
    membershipType?: string | null;
  },
  feature: PsaFeatureId
): boolean {
  const tier = resolveClientEngagementTier(input);
  return TIER_RANK[tier] >= TIER_RANK[FEATURE_MIN_TIER[feature]];
}

export function priorityMessagesUpgradeCopy(currentTier: PsaEngagementTierKey): string {
  if (currentTier === '3months') {
    return 'PRIORITY MESSAGES ARE INCLUDED WITH 6 MONTH AND 12 MONTH PREMIUM. UPGRADE YOUR PLAN TO SEND DIRECT NOTES TO THE CONCIERGE TEAM.';
  }
  return 'PRIORITY MESSAGES REQUIRE AN ACTIVE 6 MONTH OR 12 MONTH PREMIUM MEMBERSHIP.';
}

export function liveOrderTrackingUpgradeCopy(currentTier: PsaEngagementTierKey): string {
  if (currentTier === '3months') {
    return 'LIVE ORDER TRACKING (STAGE TIMELINE + CARRIER DETAILS) IS INCLUDED WITH 6 MONTH AND 12 MONTH PREMIUM. UPGRADE TO UNLOCK FULL TRACKING IN CONCIERGE AND PSA.';
  }
  return 'LIVE ORDER TRACKING REQUIRES 6 MONTH OR 12 MONTH PREMIUM.';
}
