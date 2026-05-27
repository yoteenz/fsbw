export const BRAND_MENU_ITEMS = [
  { label: 'ABOUT US', route: '/brand/about' },
  { label: 'CONTACT US', route: '/brand/contact' },
  { label: 'BECOME A MEMBER', route: '/brand/member' },
  { label: 'REVIEWS', route: '/brand/reviews' },
  { label: 'CAREERS', route: '/brand/careers' },
  { label: 'FAQ', route: '/brand/faq' },
  { label: 'TERMS OF SERVICE', route: '/brand/terms' }
] as const;

export const BRAND_SLUGS = ['about', 'contact', 'member', 'reviews', 'careers', 'faq', 'terms'] as const;
export type BrandSlug = typeof BRAND_SLUGS[number];

export function getBrandNavTitle(slug: string): string {
  return slug.toUpperCase();
}
