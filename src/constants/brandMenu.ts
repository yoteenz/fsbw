export const BRAND_MENU_ITEMS = [
  { label: 'ABOUT US', route: '/brand/about' },
  { label: 'CONTACT', route: '/brand/contact' },
  { label: 'CARE + STORAGE', route: '/brand/care' },
  { label: 'BECOME A MEMBER', route: '/brand/member' },
  { label: 'FAQ', route: '/brand/faq' },
  { label: 'PAYMENT + SHIPPING', route: '/brand/payment' },
  { label: 'REVIEWS', route: '/brand/reviews' },
  { label: 'CAREERS', route: '/brand/careers' },
  { label: 'TERMS OF SERVICE', route: '/brand/terms' }
] as const;

export const BRAND_SLUGS = ['about', 'contact', 'care', 'member', 'faq', 'payment', 'reviews', 'careers', 'terms'] as const;
export type BrandSlug = typeof BRAND_SLUGS[number];

export function getBrandNavTitle(slug: string): string {
  return slug.toUpperCase();
}
