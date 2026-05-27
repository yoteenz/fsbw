/** Unlock premium rewards copy (matches Account → Rewards marketing list). */
export type BrandUnlockPremiumRewardItem = {
  id: string;
  title: string;
  subtitle: string;
};

export const BRAND_UNLOCK_PREMIUM_REWARD_ITEMS: BrandUnlockPremiumRewardItem[] = [
  {
    id: 'wig-selections',
    title: 'PREMIUM 3D WIG SELECTIONS',
    subtitle: 'ADDITIONAL, MORE EXTENSIVE CUSTOMIZATION OPTIONS',
  },
  {
    id: 'lounge',
    title: 'ENTRY TO MEMBERS ONLY LOUNGE',
    subtitle: 'EARLY ACCESS TO SALES, NEW DROPS + RESTOCKS',
  },
  {
    id: 'support',
    title: 'FAST TRACK CUSTOMER SUPPORT',
    subtitle: 'PRIORITIZED SUPPORT WITH SIGNIFICANTLY REDUCED RESPONSE TIMES',
  },
  {
    id: 'booking',
    title: 'PRIORITY BOOKING + PROCESSING',
    subtitle: 'OPTION TO SCHEDULE IN ADVANCE + PRIORITIZED CUSTOM ORDERS',
  },
  {
    id: 'rewards',
    title: 'MEMBER REWARDS + CHALLENGES',
    subtitle: 'ELIGIBLE FOR A CHANCE TO WIN RAFFLES, DISCOUNTS + VOUCHERS',
  },
  {
    id: 'points',
    title: 'DOUBLE YOUR POINTS',
    subtitle: 'EARN 2X LOYALTY POINTS UNLOCKING REWARDS FASTER',
  },
];
