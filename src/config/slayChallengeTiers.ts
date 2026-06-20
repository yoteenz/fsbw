export type SlayChallengeGuideTier = {
  title: string;
  description?: string;
  requirement: string;
  tasks: string[];
  rewardHeading: string;
  rewards: string[];
};

export const SLAY_CHALLENGE_INTRO_BULLETS = [
  'CHOOSE YOUR REWARD FOR THE CURRENT TIER ONLY.',
  'COMPLETE QUALIFYING ACTIVITIES TO UNLOCK THE NEXT TIER.',
  'TIER 2, TIER 3 + TIER 4 REWARD CHOICES APPEAR AFTER YOU COMPLETE THE TIER BEFORE THEM.',
  'ONCE A TIER REWARD IS SELECTED, IT STAYS LOCKED UNTIL THAT TIER IS COMPLETED.',
] as const;

export const SLAY_CHALLENGE_TIERS: SlayChallengeGuideTier[] = [
  {
    title: 'TIER 1 — DISCOVER',
    description: 'EASY TASKS THAT GET MEMBERS INVOLVED.',
    requirement: 'YOU NEED TO COMPLETE AT LEAST 5/7 TO ADVANCE TIERS.',
    tasks: [
      'MAKE A PURCHASE',
      'LEAVE A PRODUCT REVIEW',
      'COMPLETE A HAIRSTYLE ANALYSIS',
      'USE PSA FOR THE FIRST TIME',
      'CREATE A WISHLIST',
      'ADD FUNDS TO DIGITAL CASH',
      'JOIN THE NEWSLETTER',
    ],
    rewardHeading: 'TIER 1 REWARD SELECTION',
    rewards: [
      '600 LOYALTY POINTS',
      '1X FLEXIBLE CAP VOUCHER',
      'MYSTERY REWARD',
      'FREE SHIPPING CREDIT',
      'EXCLUSIVE DIGITAL WALLPAPER / MEMBER COLLECTIBLE',
    ],
  },
  {
    title: 'TIER 2 — ENGAGE',
    requirement: 'THEY ONLY NEED TO COMPLETE 4/7 TO ADVANCE TIERS.',
    tasks: [
      'PURCHASE A PRODUCT',
      'COMPLETE A BUILD-A-WIG DESIGN',
      'TAG FRONTAL SLAYER ON SOCIAL MEDIA',
      'REFER A FRIEND',
      'SUBMIT A VIDEO REVIEW',
      'ATTEND A LOUNGE EVENT (FUTURE ACTIVITY)',
      'WATCH 3 ACADEMY TUTORIALS (FUTURE ACTIVITY)',
    ],
    rewardHeading: 'TIER 2 REWARD SELECTION',
    rewards: [
      '1,000 LOYALTY POINTS',
      '1X HAIRLINE VOUCHER',
      '2X POINTS NEXT PURCHASE',
      '$40 DIGITAL CASH',
      'PRIORITY ORDER PROCESSING UPGRADE',
      'MYSTERY REWARD',
      'BONUS HAIRSTYLE ANALYSIS CREDIT',
    ],
  },
  {
    title: 'TIER 3 — ELEVATE',
    requirement: 'THEY ONLY NEED TO COMPLETE 5/9 TO ADVANCE TIERS.',
    tasks: [
      'REFER 2 FRIENDS',
      'COMPLETE A BUILD-A-WIG PURCHASE',
      'SUBMIT BEFORE & AFTER PHOTOS',
      'POST ON SOCIAL MEDIA + TAG FRONTAL SLAYER',
      'COMPLETE 3 PRODUCT REVIEWS',
      'SAVE 3 BUILD-A-WIG DESIGNS',
      'COMPLETE A PREMIUM HAIRSTYLE ANALYSIS',
      'ATTEND A VIRTUAL CLASS (FUTURE ACTIVITY)',
      'POST ON SOCIAL MEDIA + TAG BRAND',
    ],
    rewardHeading: 'TIER 3 REWARD SELECTION',
    rewards: [
      '2,500 LOYALTY POINTS',
      '1X STYLING VOUCHER',
      '$60 DIGITAL CASH',
      '2.5X POINTS NEXT PURCHASE',
      'PREMIUM MYSTERY REWARD',
    ],
  },
  {
    title: 'TIER 4 — ICON',
    requirement: 'THEY ONLY NEED TO COMPLETE 6/9 TO ADVANCE TIERS.',
    tasks: [
      'REFER 2 FRIENDS',
      'COMPLETE A BUILD-A-WIG PURCHASE',
      'SUBMIT BEFORE & AFTER PHOTOS',
      'POST ON SOCIAL MEDIA + TAG FRONTAL SLAYER',
      'COMPLETE 3 PRODUCT REVIEWS',
      'SAVE 3 BUILD-A-WIG DESIGNS',
      'COMPLETE A PREMIUM HAIRSTYLE ANALYSIS',
      'ATTEND A VIRTUAL CLASS (FUTURE ACTIVITY)',
      'POST ON SOCIAL MEDIA + TAG BRAND',
    ],
    rewardHeading: 'TIER 4 REWARD SELECTION',
    rewards: [
      '5,000 LOYALTY POINTS',
      '1X COLOR VOUCHER',
      '$80 DIGITAL CASH',
      '3X POINTS NEXT PURCHASE',
      'PREMIUM MYSTERY REWARD',
    ],
  },
];

export const SLAY_CHALLENGE_TIER1_REQUIRED_COUNT = 5;

/** Parse "5/7" style requirement copy into counts. */
export function parseSlayChallengeTierRequirement(requirement: string, taskCount: number): { required: number; total: number } {
  const match = requirement.match(/(\d+)\s*\/\s*(\d+)/);
  if (match) {
    return { required: parseInt(match[1], 10), total: parseInt(match[2], 10) };
  }
  return { required: Math.max(1, Math.ceil(taskCount * 0.7)), total: taskCount };
}
