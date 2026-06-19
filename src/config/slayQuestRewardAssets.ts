export type SlayQuestRewardType = 'loyalty_points' | 'free_voucher' | 'free_gift' | 'double_points';

export type SlayQuestAssetPhase = 'phase1' | 'phase2' | 'phase3';

export type SlayQuestFallbackIcon = 'diamond' | 'voucher' | 'gift' | 'double_points';

export type SlayQuestRewardAssetConfig = {
  id: SlayQuestRewardType;
  label: string;
  rewardType: SlayQuestRewardType;
  phase1Url: string;
  phase2Url: string;
  phase3Url: string;
  fallbackIcon: SlayQuestFallbackIcon;
  alt: string;
  unlockCopy: string;
  psaSuccessMessage: string;
};

export const getSlayQuestAssetPhase = (
  completedRequirements: number,
  totalRequirements = 3
): SlayQuestAssetPhase => {
  const safeTotal = Math.max(1, Math.floor(totalRequirements));
  const safeCompleted = Math.min(Math.max(0, Math.floor(completedRequirements)), safeTotal);

  if (safeCompleted >= safeTotal) return 'phase3';

  const phase2Threshold = Math.max(2, Math.floor(safeTotal * 0.75));
  if (safeCompleted >= phase2Threshold) return 'phase2';

  return 'phase1';
};

export const slayQuestRewardAssets: Record<SlayQuestRewardType, SlayQuestRewardAssetConfig> = {
  loyalty_points: {
    id: 'loyalty_points',
    label: 'Loyalty Points',
    rewardType: 'loyalty_points',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/image%20(62).png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/image%20(63).png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/image%20(64).png',
    fallbackIcon: 'diamond',
    alt: 'Luxury diamond loyalty points collectible reward',
    unlockCopy: 'Your loyalty reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED YOUR LOYALTY POINTS.",
  },
  free_voucher: {
    id: 'free_voucher',
    label: 'Free Voucher',
    rewardType: 'free_voucher',
    phase1Url: 'REPLACE_WITH_SUPABASE_URL_FREE_VOUCHER_PHASE_1',
    phase2Url: 'REPLACE_WITH_SUPABASE_URL_FREE_VOUCHER_PHASE_2',
    phase3Url: 'REPLACE_WITH_SUPABASE_URL_FREE_VOUCHER_PHASE_3',
    fallbackIcon: 'voucher',
    alt: 'Luxury free voucher collectible reward',
    unlockCopy: 'Your voucher reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED YOUR FREE VOUCHER.",
  },
  free_gift: {
    id: 'free_gift',
    label: 'Free Gift',
    rewardType: 'free_gift',
    phase1Url: 'REPLACE_WITH_SUPABASE_URL_FREE_GIFT_PHASE_1',
    phase2Url: 'REPLACE_WITH_SUPABASE_URL_FREE_GIFT_PHASE_2',
    phase3Url: 'REPLACE_WITH_SUPABASE_URL_FREE_GIFT_PHASE_3',
    fallbackIcon: 'gift',
    alt: 'Luxury free gift collectible reward',
    unlockCopy: 'Your free gift reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED YOUR FREE GIFT.",
  },
  double_points: {
    id: 'double_points',
    label: 'Double Points',
    rewardType: 'double_points',
    phase1Url: 'REPLACE_WITH_SUPABASE_URL_DOUBLE_POINTS_PHASE_1',
    phase2Url: 'REPLACE_WITH_SUPABASE_URL_DOUBLE_POINTS_PHASE_2',
    phase3Url: 'REPLACE_WITH_SUPABASE_URL_DOUBLE_POINTS_PHASE_3',
    fallbackIcon: 'double_points',
    alt: 'Luxury double points collectible reward',
    unlockCopy: 'Your double points reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED DOUBLE POINTS.",
  },
};
