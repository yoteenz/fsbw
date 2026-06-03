/** High-traffic routes for smoke / journey tests (mobile QA). */
export const GUEST_SMOKE_ROUTES = [
  { path: '/home/shop', label: 'Shop home' },
  { path: '/bag', label: 'Shopping bag' },
  { path: '/checkout', label: 'Checkout' },
  { path: '/sign-in', label: 'Sign in' },
  { path: '/straight/noir', label: 'NOIR unit PDP' },
  { path: '/build-a-wig', label: 'Build-a-Wig hub' },
  { path: '/tools', label: 'Tools' },
  { path: '/brand', label: 'Brand' },
  { path: '/booking/consultation', label: 'Booking consult' },
] as const;

export const SIGNED_IN_ACCOUNT_ROUTES = [
  { path: '/account', label: 'Account menu' },
  { path: '/account/concierge', label: 'Concierge' },
  { path: '/account/rewards', label: 'Rewards' },
  { path: '/orders', label: 'Orders' },
  { path: '/wishlist', label: 'Wishlist' },
] as const;
