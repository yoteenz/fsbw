/** Inline “HERE” links to other brand routes (FAQ answers, terms contact line, etc.). */

export const BRAND_HERE_LINK_LABEL = 'HERE';

export const BRAND_INLINE_LINK_TERMS_SENTINEL = '__BRAND_INLINE_LINK_TERMS__';
export const BRAND_INLINE_LINK_MEMBER_SENTINEL = '__BRAND_INLINE_LINK_MEMBER__';
export const BRAND_INLINE_LINK_CONTACT_SENTINEL = '__BRAND_INLINE_LINK_CONTACT__';

export type BrandInlineLinkConfig = {
  prefix: string;
  suffix: string;
  to: string;
};

export const BRAND_INLINE_LINK_BY_SENTINEL: Record<string, BrandInlineLinkConfig> = {
  [BRAND_INLINE_LINK_TERMS_SENTINEL]: {
    prefix: 'VISIT THE TERMS OF SERVICE PAGE ',
    suffix: ' FOR COMPLETE TERMS, REFUND POLICY AND PURCHASE CONDITIONS.',
    to: '/brand/terms',
  },
  [BRAND_INLINE_LINK_MEMBER_SENTINEL]: {
    prefix:
      'YOU CAN BROWSE WITHOUT AN ACCOUNT, BUT CREATING ONE UNLOCKS ORDER TRACKING, WISHLIST, LOYALTY REWARDS, REFERRALS AND MEMBER-ONLY UPDATES. VISIT BECOME A MEMBER ',
    suffix: ' TO LEARN MORE.',
    to: '/brand/member',
  },
  [BRAND_INLINE_LINK_CONTACT_SENTINEL]: {
    prefix: 'REACH OUR TEAM THROUGH THE CONTACT FORM ',
    suffix: ' OR EMAIL CONTACT@FRONTALSLAYER.COM.',
    to: '/brand/contact',
  },
};

export function getBrandInlineLinkConfig(text: string): BrandInlineLinkConfig | undefined {
  return BRAND_INLINE_LINK_BY_SENTINEL[text];
}
