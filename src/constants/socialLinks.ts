/**
 * Canonical social links used in "More ways to earn" (membership) and menu icons.
 * Update these URLs in one place to keep the site consistent.
 */
const BASE = {
  instagram: 'https://www.instagram.com/frontalslayer/',
  twitter: 'https://x.com/frontalslayer',
  facebook: 'https://www.facebook.com/bookfrontalslayer',
  tiktok: 'https://www.tiktok.com/@frontalslayer',
} as const;

const UTM_MEMBERSHIP = '?utm_source=membership&utm_medium=earn&utm_campaign=';

/** Base URLs for linking (no UTM). Use in menu icons and general links. */
export const SOCIAL_BASE_URLS = BASE;

/** Full URLs for "More ways to earn" tasks (with UTM). */
export const SOCIAL_EARN_LINKS = {
  instagram: BASE.instagram + UTM_MEMBERSHIP + 'follow_instagram',
  twitter: BASE.twitter + UTM_MEMBERSHIP + 'follow_twitter',
  facebook: BASE.facebook + UTM_MEMBERSHIP + 'like_facebook',
  tiktok: BASE.tiktok + UTM_MEMBERSHIP + 'follow_tiktok',
} as const;

/** Platform ids for analytics (must match SocialPlatform in socialAnalytics). */
export type MenuSocialPlatform = 'instagram' | 'twitter' | 'facebook';

/** Menu-only links (Instagram, Twitter, Facebook) for the bottom of the mobile menu. */
export const MENU_SOCIAL_LINKS: readonly { href: string; label: string; icon: string; platform: MenuSocialPlatform }[] = [
  { href: BASE.instagram, label: 'Instagram', icon: '/assets/instagram-icon.svg', platform: 'instagram' },
  { href: BASE.twitter, label: 'X (Twitter)', icon: '/assets/twitter-icon.svg', platform: 'twitter' },
  { href: BASE.facebook, label: 'Facebook', icon: '/assets/facebook-icon.svg', platform: 'facebook' },
];
