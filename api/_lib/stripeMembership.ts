/** Stripe Price ids for premium tiers (Dashboard → Products → recurring prices). Env: STRIPE_PRICE_ID_3MONTHS, _6MONTHS, _12MONTHS */

export const MEMBERSHIP_TIERS = ['3months', '6months', '12months'] as const;
export type MembershipTierParam = (typeof MEMBERSHIP_TIERS)[number];

export function isMembershipTierParam(v: unknown): v is MembershipTierParam {
  return typeof v === 'string' && (MEMBERSHIP_TIERS as readonly string[]).includes(v);
}

export function stripePriceIdForTier(tier: MembershipTierParam): string | null {
  switch (tier) {
    case '3months':
      return process.env.STRIPE_PRICE_ID_3MONTHS?.trim() || null;
    case '6months':
      return process.env.STRIPE_PRICE_ID_6MONTHS?.trim() || null;
    case '12months':
      return process.env.STRIPE_PRICE_ID_12MONTHS?.trim() || null;
    default:
      return null;
  }
}

export function siteUrlFromEnv(): string {
  const explicit = (process.env.SITE_URL || '').trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const vercel = (process.env.VERCEL_URL || '').trim();
  if (vercel) return vercel.startsWith('http') ? vercel.replace(/\/$/, '') : `https://${vercel.replace(/\/$/, '')}`;
  return '';
}

export function membershipStripeConfigured(): boolean {
  const sk = (process.env.STRIPE_SECRET_KEY || '').trim();
  if (!sk) return false;
  return (
    Boolean(stripePriceIdForTier('3months')) &&
    Boolean(stripePriceIdForTier('6months')) &&
    Boolean(stripePriceIdForTier('12months'))
  );
}
