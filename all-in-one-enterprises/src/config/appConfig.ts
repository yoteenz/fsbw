/**
 * All In One Enterprises Inc. — centralized configuration.
 * Update these values when extracting to a standalone repository.
 */

export const aioAppConfig = {
  company: {
    legalName: 'ALL IN ONE ENTERPRISES INC.',
    displayName: 'ALL IN ONE',
    displaySuffix: 'ENTERPRISES INC.',
    /** Canonical brand tagline — customer-facing primary statement */
    tagline: 'WHERE BUSINESS MEETS THE ROAD.',
    /** Intentional hero line break (presentation only; full tagline above) */
    heroTaglineLines: ['WHERE BUSINESS', 'MEETS THE ROAD.'] as const,
    /** Approved homepage / primary brand supporting paragraph */
    brandDescription:
      'Trucking is more than what happens behind the wheel. All In One handles the business that keeps you moving—from formation, permits and compliance to insurance, dispatch, factoring and freight solutions—all in one place.',
  },
  contact: {
    /** Temporary placeholder — replace with verified number before production. */
    phone: '(866) 000-0000',
    phoneHref: 'tel:+18660000000',
    email: 'contact@allinoneenterprises.example',
    emailHref: 'mailto:contact@allinoneenterprises.example',
  },
  branding: {
    primaryGold: '#D4A017',
    primaryGoldLight: '#D4A017',
    charcoal: '#1A1A1A',
    surfaceDark: '#111415',
    nearBlack: '#0A0A0A',
    white: '#FFFFFF',
    grayMuted: '#6B7280',
  },
  routes: {
    base: '',
    portal: '/portal',
    clientLogin: '/portal',
  },
  assets: {
    /** Hero slot — replace with production asset when available. */
    heroImage:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=80',
    /** Approved horizontal lockup — emblem + ALL IN ONE + ENTERPRISES INC. */
    logoLockup: '/brand/aio-logo-lockup.png',
    /** @deprecated use logoLockup */
    logoSlot: '/brand/aio-logo-lockup.png' as string | null,
  },
  featureFlags: {
    showSampleTestimonial: false,
    showVerifiedMetrics: false,
    roadmapPrototype: true,
    portalPrototype: true,
  },
  disclaimer:
    'Service availability and requirements may vary by jurisdiction. Government approvals and filings remain subject to applicable agencies. All In One Enterprises Inc. provides business assistance and coordination services — not legal, tax, or insurance advice unless explicitly stated in a separate agreement.',
} as const;

export type AioAppConfig = typeof aioAppConfig;
