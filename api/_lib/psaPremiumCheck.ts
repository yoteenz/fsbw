/**
 * Server-side premium gate for PSA (Personal Slay Assistant).
 * Matches client `isPremiumMemberForGatedFeatures`: active subscription tier and/or BLACK spend tier.
 * Founder admin email gets a PSA-only test bypass when Supabase profile is stale.
 */
import { FOUNDER_PRIVILEGED_ADMIN_EMAIL } from './adminAuth.js';
import { getSupabaseUser } from './supabase.js';

const PREMIUM_TIERS = new Set(['3months', '6months', '12months']);

export type PsaPremiumProfile = {
  membershipType: string | null;
  subscriptionTier: string | null;
  tierName: string | null;
  isPremium: boolean;
};

function isPremiumFromProfileRow(row: {
  membership_type?: string | null;
  subscription_tier?: string | null;
  current_tier_name?: string | null;
}): boolean {
  const membershipType = (row.membership_type ?? '').trim().toUpperCase();
  const subscriptionTier = (row.subscription_tier ?? '').trim().toLowerCase();
  const tierName = (row.current_tier_name ?? '').trim().toUpperCase();
  if (tierName === 'BLACK') return true;
  if (membershipType === 'PREMIUM') return true;
  return subscriptionTier !== '' && PREMIUM_TIERS.has(subscriptionTier);
}

/** PSA-only: founder Gmail can test chat when Rewards admin toggle has not synced to Supabase yet. */
export function isFounderPsaPremiumBypass(email: string | null | undefined): boolean {
  const normalized = (email ?? '').trim().toLowerCase();
  return normalized === FOUNDER_PRIVILEGED_ADMIN_EMAIL;
}

export async function getPsaPremiumProfile(
  userId: string,
  accessToken: string,
  email?: string
): Promise<PsaPremiumProfile | null> {
  const founderBypass = isFounderPsaPremiumBypass(email);

  const supabase = getSupabaseUser(accessToken);
  const { data, error } = await supabase
    .from('profiles')
    .select('membership_type, subscription_tier, current_tier_name')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    if (founderBypass) {
      return {
        membershipType: null,
        subscriptionTier: null,
        tierName: null,
        isPremium: true,
      };
    }
    return null;
  }

  const row = data as {
    membership_type?: string | null;
    subscription_tier?: string | null;
    current_tier_name?: string | null;
  };

  const membershipType = row.membership_type?.trim() || null;
  const subscriptionTier = row.subscription_tier?.trim().toLowerCase() || null;
  const tierName = row.current_tier_name?.trim() || null;

  return {
    membershipType,
    subscriptionTier,
    tierName,
    isPremium: isPremiumFromProfileRow(row) || founderBypass,
  };
}
