/** Frontal Slayer — Launch Integrity Auditor™ route manifests */

export const LAUNCH_CRITICAL_ROUTES = [
  { path: '/', label: 'Home landing' },
  { path: '/lobby', label: 'Lobby' },
  { path: '/home/shop', label: 'Shop home' },
  { path: '/sign-in', label: 'Sign in' },
  { path: '/bag', label: 'Shopping bag' },
  { path: '/checkout', label: 'Checkout' },
  { path: '/checkout/bookings', label: 'Booking checkout' },
  { path: '/checkout/gift-card', label: 'Gift card checkout' },
  { path: '/straight/noir', label: 'NOIR PDP' },
  { path: '/build-a-wig', label: 'Build-a-Wig hub' },
  { path: '/build-a-wig/noir', label: 'BAW NOIR' },
  { path: '/wishlist', label: 'Wishlist' },
  { path: '/booking/consultation', label: 'Consult booking' },
  { path: '/tools/gift-card', label: 'Gift card tool' },
  { path: '/lobby/lounge', label: 'Lounge' },
];

export const LAUNCH_ACCOUNT_ROUTES = [
  { path: '/account', label: 'Account hub' },
  { path: '/account/settings', label: 'Account settings' },
  { path: '/account/concierge', label: 'Concierge' },
  { path: '/account/rewards', label: 'Rewards / membership' },
  { path: '/account/orders', label: 'Orders' },
  { path: '/account/alerts', label: 'Alerts / notifications' },
  { path: '/account/payment', label: 'Payment' },
];

export const LAUNCH_ADMIN_ROUTES = [
  { path: '/admin/dashboard', label: 'Admin dashboard' },
  { path: '/admin/marketing', label: 'Admin marketing' },
  { path: '/admin/clients/overview', label: 'Admin clients' },
  { path: '/admin/meetings', label: 'Admin meetings' },
  { path: '/admin/pending', label: 'Admin pending' },
  { path: '/admin/studio/mission-control', label: 'Studio mission control' },
  { path: '/admin/studio/department/creative-direction', label: 'Creative Direction Studio' },
];

export const LAUNCH_BRAND_ROUTES = [
  { path: '/brand', label: 'Brand root' },
  { path: '/brand/about', label: 'Brand about' },
  { path: '/brand/contact', label: 'Brand contact' },
  { path: '/brand/faq', label: 'Brand FAQ' },
  { path: '/brand/terms', label: 'Brand terms' },
];

/** Legacy paths that should redirect — not 404 */
export const EXPECTED_REDIRECTS = [
  { path: '/orders', expectTarget: '/account/orders' },
  { path: '/brand', expectTarget: '/brand/about' },
  { path: '/lounge', expectTarget: '/lobby/lounge' },
  { path: '/shopping-bag', expectTarget: '/bag' },
];

export const REQUIRED_PUBLIC_ASSETS = [
  'public/assets/marble-half.png',
  'public/assets/special-offer.svg',
  'index.html',
];

/** Code fixes confirmed during this launch audit sprint */
export const FIXES_APPLIED = [
  { route: '/brand', issue: '404 on bare /brand', fix: 'Navigate → /brand/about', file: 'src/App.tsx' },
  { route: '/orders', issue: 'Legacy /orders bookmark 404', fix: 'Navigate → /account/orders', file: 'src/App.tsx' },
  { route: '/shopping-bag', issue: 'Legacy /shopping-bag 404', fix: 'Navigate → /bag', file: 'src/App.tsx' },
  { route: '/account/notifications', issue: 'Desktop nav dead link', fix: 'Navigate → /account/alerts', file: 'src/App.tsx' },
  { route: 'CDS Scene Stack', issue: 'CIE reuse gate blocked first generation', fix: 'forceGenerate when layer has no publicUrl', file: 'src/hooks/useSceneStack.ts' },
  { route: 'e2e signed-in', issue: '/orders drift from canonical path', fix: 'Use /account/orders in e2e/helpers/routes.ts', file: 'e2e/helpers/routes.ts' },
];

/** Resolved e2e drift — kept for regression tracking (auditor marks fixed). */
export const RESOLVED_E2E_FIXES = [
  { e2ePath: '/brand', fix: 'Redirect /brand → /brand/about in App.tsx' },
  { e2ePath: '/orders', fix: 'Redirect /orders → /account/orders; e2e uses /account/orders' },
];

/**
 * Commerce / payment integration — NOT inferred from route registry.
 * Missing env = launch blocker even when /checkout route exists.
 */
export const COMMERCE_INTEGRATION_CHECKS = [
  {
    id: 'stripe-secret',
    label: 'STRIPE_SECRET_KEY',
    envKeys: ['STRIPE_SECRET_KEY'],
    blocks: 'Product PaymentIntents, membership Checkout, booking autopay',
    doc: 'docs/STRIPE_MEMBERSHIP_SETUP.md',
  },
  {
    id: 'stripe-publishable',
    label: 'STRIPE_PUBLISHABLE_KEY',
    envKeys: ['STRIPE_PUBLISHABLE_KEY', 'VITE_STRIPE_PUBLISHABLE_KEY'],
    blocks: 'Client-side Stripe Elements on checkout',
    doc: 'api/stripe/product-checkout-available.ts',
  },
  {
    id: 'stripe-webhook',
    label: 'STRIPE_WEBHOOK_SECRET',
    envKeys: ['STRIPE_WEBHOOK_SECRET'],
    blocks: 'Order + membership confirmation after payment',
    doc: 'api/stripe/webhook.ts',
  },
  {
    id: 'stripe-membership-prices',
    label: 'STRIPE_PRICE_ID_3MONTHS / _6MONTHS / _12MONTHS',
    envKeys: ['STRIPE_PRICE_ID_3MONTHS', 'STRIPE_PRICE_ID_6MONTHS', 'STRIPE_PRICE_ID_12MONTHS'],
    requireAll: true,
    blocks: 'Rewards / membership subscription checkout',
    doc: 'api/_lib/stripeMembership.ts',
  },
  {
    id: 'site-url',
    label: 'SITE_URL',
    envKeys: ['SITE_URL', 'VERCEL_URL'],
    blocks: 'Stripe return URLs and webhook callbacks',
    doc: 'api/_lib/stripeMembership.ts → siteUrlFromEnv',
  },
];
