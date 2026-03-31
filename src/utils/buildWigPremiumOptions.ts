/**
 * Option groups under **PREMIUM MEMBERSHIP OPTIONS** on the build-a-wig hub (cap/length/density are above).
 * `handleOptionSelect` categories map to routes: lace, texture, color, hairline, styling, addOns → `/addons`.
 */
export const BUILD_WIG_PREMIUM_MEMBERSHIP_OPTION_CATEGORIES = [
  'lace',
  'texture',
  'color',
  'hairline',
  'styling',
  'addOns'
] as const;

export type BuildWigPremiumMembershipOptionCategory =
  (typeof BUILD_WIG_PREMIUM_MEMBERSHIP_OPTION_CATEGORIES)[number];

export function isBuildWigPremiumMembershipOptionCategory(category: string): category is BuildWigPremiumMembershipOptionCategory {
  return (BUILD_WIG_PREMIUM_MEMBERSHIP_OPTION_CATEGORIES as readonly string[]).includes(category);
}
