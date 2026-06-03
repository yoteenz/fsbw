/**
 * Premium chart feature gates for PSA tools + Concierge (server).
 * Keep tier rules aligned with `src/constants/psaFeatureGates.ts`.
 */
import type { PsaPremiumProfile } from './psaPremiumCheck.js';
import {
  resolvePsaEngagementTier,
  type PsaEngagementTierKey,
} from './psaEngagementLimits.js';

export type PsaFeatureId =
  | 'priority_messages'
  | 'live_order_tracking'
  | 'special_offers'
  | 'exclusive_rewards';

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

const FEATURE_LABEL: Record<PsaFeatureId, string> = {
  priority_messages: 'Priority messages',
  live_order_tracking: 'Live order tracking',
  special_offers: 'Special offers',
  exclusive_rewards: 'Exclusive rewards',
};

const REQUIRED_TIER_LABEL: Record<PsaEngagementTierKey, string> = {
  '3months': '3 Month Premium',
  '6months': '6 Month Premium',
  '12months': '12 Month Premium',
};

export function hasPsaFeature(profile: PsaPremiumProfile, feature: PsaFeatureId): boolean {
  const tier = resolvePsaEngagementTier(profile);
  return TIER_RANK[tier] >= TIER_RANK[FEATURE_MIN_TIER[feature]];
}

export function canAccessPriorityMessages(profile: PsaPremiumProfile): boolean {
  return hasPsaFeature(profile, 'priority_messages');
}

export function canAccessLiveOrderTracking(profile: PsaPremiumProfile): boolean {
  return hasPsaFeature(profile, 'live_order_tracking');
}

export type PsaFeatureGateDenial = {
  code: 'UPGRADE_REQUIRED';
  feature: PsaFeatureId;
  featureLabel: string;
  currentTier: PsaEngagementTierKey;
  currentTierLabel: string;
  requiredTier: PsaEngagementTierKey;
  requiredTierLabel: string;
  message: string;
  upgradePath: string;
};

export function psaFeatureGateDenial(
  profile: PsaPremiumProfile,
  feature: PsaFeatureId
): PsaFeatureGateDenial | null {
  if (hasPsaFeature(profile, feature)) return null;

  const currentTier = resolvePsaEngagementTier(profile);
  const requiredTier = FEATURE_MIN_TIER[feature];
  const featureLabel = FEATURE_LABEL[feature];

  return {
    code: 'UPGRADE_REQUIRED',
    feature,
    featureLabel,
    currentTier,
    currentTierLabel: REQUIRED_TIER_LABEL[currentTier],
    requiredTier,
    requiredTierLabel: REQUIRED_TIER_LABEL[requiredTier],
    message: `${featureLabel} is included with ${REQUIRED_TIER_LABEL[requiredTier]} and above. Your plan is ${REQUIRED_TIER_LABEL[currentTier]}. Upgrade in Account → Rewards to unlock it.`,
    upgradePath: '/account/rewards',
  };
}

/** OpenAI tools the member is allowed to invoke (tier-gated). */
export function filterPsaActionToolsForProfile<T extends { name: string }>(
  tools: readonly T[],
  profile: PsaPremiumProfile
): T[] {
  return tools.filter((tool) => {
    if (tool.name === 'send_priority_message') {
      return canAccessPriorityMessages(profile);
    }
    return true;
  });
}

export function buildPsaTierCapabilitiesBlock(profile: PsaPremiumProfile): string {
  const tier = resolvePsaEngagementTier(profile);
  const tierLabel = REQUIRED_TIER_LABEL[tier];
  const lines = [
    `Member plan: **${tierLabel}** (server-resolved).`,
    `- Priority messages (Concierge inbox): **${hasPsaFeature(profile, 'priority_messages') ? 'YES' : 'NO — requires 6 Month or 12 Month Premium'}**`,
    `- Live order tracking (stage timeline + carrier): **${hasPsaFeature(profile, 'live_order_tracking') ? 'YES' : 'NO — requires 6 Month or 12 Month Premium; basic order status only'}**`,
    `- Special offers (Concierge): **${hasPsaFeature(profile, 'special_offers') ? 'YES' : 'NO — 12 Month Premium'}**`,
  ];
  if (!hasPsaFeature(profile, 'priority_messages')) {
    lines.push(
      '- If they ask to send a priority message or urgent Concierge note: explain it is not on their plan, offer `/account/rewards` to upgrade, or `/brand/contact` for general help.'
    );
  }
  if (!hasPsaFeature(profile, 'live_order_tracking')) {
    lines.push(
      '- For order status on 3 Month: share high-level status only (placed/processing/shipped). Do not invent tracking numbers. Suggest `/orders` or upgrading for live tracking in Concierge.'
    );
  }
  return lines.join('\n');
}
