export type BrandMenuItem = {
  /** Label in mobile menu BRAND tab (use this when it differs from the page card header). */
  menuLabel?: string;
  /** Default label; used in menu when menuLabel is omitted. */
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
    menuLabel: 'MEMBERS ONLY',
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
  {
    menuLabel: 'TERMS',
    label: 'TERMS',
    route: '/brand/terms',
    cardTitle: 'TERMS OF SERVICE',
  },
];

export const BRAND_SLUGS = ['about', 'contact', 'member', 'reviews', 'careers', 'faq', 'terms'] as const;
export type BrandSlug = typeof BRAND_SLUGS[number];

/** Text shown on each row in the mobile menu BRAND tab. */
export function getBrandMenuLabel(item: BrandMenuItem): string {
  return item.menuLabel ?? item.label;
}

export function getBrandNavTitle(slug: string): string {
  const item = BRAND_MENU_ITEMS.find((i) => i.route === `/brand/${slug}`);
  if (item?.navTitle) return item.navTitle;
  if (['about', 'member', 'terms'].includes(slug)) return slug.toUpperCase();
  return getBrandMenuLabel(item ?? { label: slug.toUpperCase(), route: '' });
}

export function getBrandCardHeaderTitle(slug: string): string {
  const item = BRAND_MENU_ITEMS.find((i) => i.route === `/brand/${slug}`);
  return item?.cardTitle ?? item?.label ?? slug.toUpperCase();
}
