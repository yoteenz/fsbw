export type SlayQuestRewardType =
  | 'loyalty_points'
  | 'free_voucher'
  | 'free_gift'
  | 'double_points'
  | 'exclusive_digital_wallpaper'
  | 'mystery_reward'
  | 'free_expedited_shipping'
  | 'free_expedited_processing'
  | 'bonus_hairstyle_analysis'
  | 'digital_cash';

export type SlayQuestAssetPhase = 'phase1' | 'phase2' | 'phase3';

export type SlayQuestFallbackIcon =
  | 'diamond'
  | 'voucher'
  | 'gift'
  | 'double_points'
  | 'wallpaper'
  | 'mystery'
  | 'shipping'
  | 'processing'
  | 'analysis'
  | 'cash';

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
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3335.png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3336.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3337.png',
    fallbackIcon: 'voucher',
    alt: 'Luxury free voucher collectible reward',
    unlockCopy: 'Your voucher reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED YOUR FREE VOUCHER.",
  },
  free_gift: {
    id: 'free_gift',
    label: 'Free Gift',
    rewardType: 'free_gift',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3338.png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3339.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3340.png',
    fallbackIcon: 'gift',
    alt: 'Luxury free gift collectible reward',
    unlockCopy: 'Your free gift reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED YOUR FREE GIFT.",
  },
  double_points: {
    id: 'double_points',
    label: 'Double Points',
    rewardType: 'double_points',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3237.png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3235.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3236.png',
    fallbackIcon: 'double_points',
    alt: 'Luxury double points collectible reward',
    unlockCopy: 'Your double points reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED DOUBLE POINTS.",
  },
  exclusive_digital_wallpaper: {
    id: 'exclusive_digital_wallpaper',
    label: 'Exclusive Digital Wallpaper',
    rewardType: 'exclusive_digital_wallpaper',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3326.png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3322.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3321.png',
    fallbackIcon: 'wallpaper',
    alt: 'Luxury exclusive digital wallpaper collectible reward',
    unlockCopy: 'Your exclusive digital wallpaper is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED YOUR EXCLUSIVE DIGITAL WALLPAPER.",
  },
  mystery_reward: {
    id: 'mystery_reward',
    label: 'Mystery Reward',
    rewardType: 'mystery_reward',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/image%20(66).png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3282.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/image%20(67).png',
    fallbackIcon: 'mystery',
    alt: 'Luxury mystery reward collectible',
    unlockCopy: 'Your mystery reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED YOUR MYSTERY REWARD.",
  },
  free_expedited_shipping: {
    id: 'free_expedited_shipping',
    label: 'Free Expedited Shipping',
    rewardType: 'free_expedited_shipping',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3353.png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3354.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3264.png',
    fallbackIcon: 'shipping',
    alt: 'Luxury free expedited shipping collectible reward',
    unlockCopy: 'Your expedited shipping reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED FREE EXPEDITED SHIPPING.",
  },
  free_expedited_processing: {
    id: 'free_expedited_processing',
    label: 'Free Expedited Processing',
    rewardType: 'free_expedited_processing',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3349.png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3350.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3351.png',
    fallbackIcon: 'processing',
    alt: 'Luxury free expedited processing collectible reward',
    unlockCopy: 'Your expedited processing reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED FREE EXPEDITED PROCESSING.",
  },
  bonus_hairstyle_analysis: {
    id: 'bonus_hairstyle_analysis',
    label: 'Bonus Hairstyle Analysis',
    rewardType: 'bonus_hairstyle_analysis',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3312.png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3364.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3316.png',
    fallbackIcon: 'analysis',
    alt: 'Luxury bonus hairstyle analysis collectible reward',
    unlockCopy: 'Your bonus hairstyle analysis reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED YOUR BONUS HAIRSTYLE ANALYSIS.",
  },
  digital_cash: {
    id: 'digital_cash',
    label: 'Digital Cash',
    rewardType: 'digital_cash',
    phase1Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3360.png',
    phase2Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3361.png',
    phase3Url: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Collectibles/IMG_3362.png',
    fallbackIcon: 'cash',
    alt: 'Luxury digital cash collectible reward',
    unlockCopy: 'Your digital cash reward is coming to life.',
    psaSuccessMessage: "CONGRATULATIONS. YOU'VE UNLOCKED DIGITAL CASH.",
  },
};
