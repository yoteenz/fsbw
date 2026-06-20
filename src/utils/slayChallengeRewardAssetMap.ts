import type { SlayQuestRewardType } from '../config/slayQuestRewardAssets';
import { SLAY_CHALLENGE_TIERS } from '../config/slayChallengeTiers';

export type SlayChallengeRewardAssetSelection = {
  rewardType: SlayQuestRewardType;
  selectedRewardLabel: string;
};

export const getSlayChallengeRewardAssetSelection = (reward: string): SlayChallengeRewardAssetSelection | null => {
  if (!reward) return null;
  if (reward.includes('WALLPAPER') || reward.includes('DIGITAL COLLECTIBLE') || reward.includes('MEMBER COLLECTIBLE')) {
    return {
      rewardType: 'exclusive_digital_wallpaper',
      selectedRewardLabel: reward,
    };
  }
  if (reward.includes('MYSTERY')) {
    return {
      rewardType: 'mystery_reward',
      selectedRewardLabel: reward,
    };
  }
  if (reward.includes('SHIPPING')) {
    return {
      rewardType: 'free_expedited_shipping',
      selectedRewardLabel: reward,
    };
  }
  if (reward.includes('PROCESSING')) {
    return {
      rewardType: 'free_expedited_processing',
      selectedRewardLabel: reward,
    };
  }
  if (reward.includes('HAIRSTYLE ANALYSIS') || reward.includes('ANALYSIS CREDIT') || reward.includes('ANALYSIS UPGRADE')) {
    return {
      rewardType: 'bonus_hairstyle_analysis',
      selectedRewardLabel: reward,
    };
  }
  if (reward.includes('DIGITAL CASH')) {
    return {
      rewardType: 'digital_cash',
      selectedRewardLabel: reward,
    };
  }
  if (reward.includes('POINTS') && (reward.includes('2X') || reward.includes('2.5X') || reward.includes('3X'))) {
    return {
      rewardType: 'double_points',
      selectedRewardLabel: reward,
    };
  }
  if (reward.includes('LOYALTY POINTS')) {
    return {
      rewardType: 'loyalty_points',
      selectedRewardLabel: reward,
    };
  }
  if (reward.includes('VOUCHER') || reward.includes('CREDIT') || reward.includes('UPGRADE')) {
    return {
      rewardType: 'free_voucher',
      selectedRewardLabel: reward,
    };
  }
  return {
    rewardType: 'free_gift',
    selectedRewardLabel: reward,
  };
};

/** First tier index whose reward pool includes this collectible type. */
export function resolveSlayChallengeTierIndexForRewardType(rewardType: SlayQuestRewardType): number {
  const index = SLAY_CHALLENGE_TIERS.findIndex((tier) =>
    tier.rewards.some((reward) => getSlayChallengeRewardAssetSelection(reward)?.rewardType === rewardType)
  );
  return index >= 0 ? index : 0;
}

/** Tier reward labels that map to the same collectible art type. */
export function slayChallengeTierRewardsForCollectible(
  tierIndex: number,
  rewardType: SlayQuestRewardType
): string[] {
  const tier = SLAY_CHALLENGE_TIERS[tierIndex];
  if (!tier) return [];
  return tier.rewards.filter(
    (reward) => getSlayChallengeRewardAssetSelection(reward)?.rewardType === rewardType
  );
}
