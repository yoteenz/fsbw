export type BrandMenuItem = {
  /** Label in mobile menu (BRAND tab). */
  label: string;
  route: string;
  /** Red card header on the brand page (defaults to label). */
  cardTitle?: string;
  /** Nav breadcrumb after BRAND > (defaults per slug rules in getBrandNavTitle). */
  navTitle?: string;
};

export const BRAND_MENU_ITEMS: BrandMenuItem[] = [
  { label: 'ABOUT US', route: '/brand/about', cardTitle: 'MISSION STATEMENT' },
  { label: 'CONTACT US', route: '/brand/contact', cardTitle: 'SUBMISSION FORM', navTitle: 'CONTACT' },
  {
    label: 'MEMBERS ONLY',
    route: '/brand/member',
    cardTitle: 'MEMBERS ONLY',
    navTitle: 'MEMBERSHIP',
  },
  { label: 'REVIEWS', route: '/brand/reviews' },
  { label: 'CAREERS', route: '/brand/careers' },
  {
    label: 'FAQ',
    route: '/brand/faq',
    cardTitle: 'FREQUENTLY ASKED QUESTIONS',
  },
  { label: 'TERMS', route: '/brand/terms', cardTitle: 'TERMS OF SERVICE' },
];

export const BRAND_SLUGS = ['about', 'contact', 'member', 'reviews', 'careers', 'faq', 'terms'] as const;
export type BrandSlug = typeof BRAND_SLUGS[number];

export function getBrandNavTitle(slug: string): string {
  const item = BRAND_MENU_ITEMS.find((i) => i.route === `/brand/${slug}`);
  if (item?.navTitle) return item.navTitle;
  if (['about', 'member', 'terms'].includes(slug)) return slug.toUpperCase();
  return item?.label ?? slug.toUpperCase();
}

export function getBrandCardHeaderTitle(slug: string): string {
  const item = BRAND_MENU_ITEMS.find((i) => i.route === `/brand/${slug}`);
  return item?.cardTitle ?? item?.label ?? slug.toUpperCase();
}
