import type { TutorialPageRegistryEntry } from './schema';

/** Supported pages — every future StudioOS page can register here. */
export const TUTORIAL_PAGE_REGISTRY: readonly TutorialPageRegistryEntry[] = [
  { id: 'home', title: 'Home', route: '/home/shop', routeMatch: /^\/home\/shop/, helpTourId: 'mansion-tour', searchKeywords: ['home', 'shop', 'landing'] },
  { id: 'shop', title: 'Shop', route: '/home/shop', helpTourId: 'mansion-tour', searchKeywords: ['shop', 'catalog', 'products'] },
  { id: 'wishlist', title: 'Wishlist', route: '/wishlist', helpTourId: 'wishlist-tour', searchKeywords: ['wishlist', 'saved', 'favorites'] },
  { id: 'cart', title: 'Cart', route: '/bag', helpTourId: 'checkout-tour', searchKeywords: ['cart', 'bag', 'shopping bag'] },
  { id: 'checkout', title: 'Checkout', route: '/checkout', helpTourId: 'checkout-tour', searchKeywords: ['checkout', 'pay', 'order'] },
  { id: 'build-a-wig', title: 'Build-A-Wig', route: '/build-a-wig/view', helpTourId: 'build-a-wig-tour', searchKeywords: ['build-a-wig', 'customize', 'builder'] },
  { id: 'hair-analysis', title: 'Hair Analysis', route: '/home/tools', searchKeywords: ['hair analysis', 'selfie', 'style'] },
  { id: 'signature-collection', title: 'Signature Collection', route: '/shop/units', searchKeywords: ['units', 'noir', 'blanco', 'signature'] },
  { id: 'bundles', title: 'Bundles', route: '/shop/bundles', searchKeywords: ['bundles', 'bcf'] },
  { id: 'closures', title: 'Closures', route: '/shop/closures', searchKeywords: ['closures', 'lace'] },
  { id: 'frontals', title: 'Frontals', route: '/shop/frontals', searchKeywords: ['frontals', 'hd lace'] },
  { id: 'concierge', title: 'Concierge', route: '/account/concierge', helpTourId: 'account-tour', searchKeywords: ['concierge', 'support', 'messages'] },
  { id: 'appointments', title: 'Appointments', route: '/booking/consultation', searchKeywords: ['booking', 'appointment', 'consult'] },
  { id: 'rewards', title: 'Rewards', route: '/account/rewards', helpTourId: 'rewards-tour', searchKeywords: ['rewards', 'points', 'loyalty'] },
  { id: 'points', title: 'Points', route: '/account/rewards', helpTourId: 'rewards-tour', searchKeywords: ['points', 'loyalty points', 'earn'] },
  { id: 'tickets', title: 'Slay Tickets', route: '/account/rewards', searchKeywords: ['slay tickets', 'tickets', 'lounge unlock'] },
  { id: 'voucher-history', title: 'Voucher History', route: '/account', helpTourId: 'vouchers-walkthrough', searchKeywords: ['voucher', 'vouchers', 'redeem', 'expiration', 'voucher history'] },
  { id: 'collectibles', title: 'Collectibles', route: '/account/rewards', searchKeywords: ['collectibles', 'badges'] },
  { id: 'membership', title: 'Membership', route: '/account/rewards', helpTourId: 'membership-tour', searchKeywords: ['membership', 'premium', 'subscription'] },
  { id: 'account', title: 'Account', route: '/account', helpTourId: 'account-tour', searchKeywords: ['account', 'dashboard', 'profile'] },
  { id: 'orders', title: 'Order History', route: '/account/orders', searchKeywords: ['orders', 'order history'] },
  { id: 'notifications', title: 'Notifications', route: '/account/alerts', searchKeywords: ['notifications', 'alerts'] },
  { id: 'referrals', title: 'Referral Program', route: '/account/referrals', searchKeywords: ['referrals', 'refer a friend'] },
  { id: 'affiliate', title: 'Affiliate Program', route: '/account/affiliate', searchKeywords: ['affiliate', 'creator'] },
  { id: 'lounge-tv', title: 'Lounge TV', route: '/lobby/lounge', helpTourId: 'lounge-tv-tour', searchKeywords: ['lounge', 'lounge tv', 'salon'] },
  { id: 'watch-learn', title: 'Watch + Learn', route: '/lobby/lounge', searchKeywords: ['watch', 'learn', 'tutorials'] },
  { id: 'faq', title: 'FAQ', route: '/brand/faq', searchKeywords: ['faq', 'help', 'questions'] },
  { id: 'settings', title: 'Settings', route: '/account/settings', searchKeywords: ['settings', 'preferences', 'security'] },
] as const;

export function resolveTutorialPageForPathname(pathname: string): TutorialPageRegistryEntry | undefined {
  const exact = TUTORIAL_PAGE_REGISTRY.find((p) => p.route === pathname);
  if (exact) return exact;
  const patternMatch = TUTORIAL_PAGE_REGISTRY.find((p) => p.routeMatch?.test(pathname));
  if (patternMatch) return patternMatch;
  const prefixMatches = TUTORIAL_PAGE_REGISTRY.filter(
    (p) => pathname === p.route || pathname.startsWith(`${p.route}/`)
  ).sort((a, b) => b.route.length - a.route.length);
  return prefixMatches[0];
}

export function getTutorialPageById(pageId: string): TutorialPageRegistryEntry | undefined {
  return TUTORIAL_PAGE_REGISTRY.find((p) => p.id === pageId);
}
