/**
 * Server-side premium gate for PSA (Personal Slay Assistant).
 * Matches client `isPremiumMemberForGatedFeatures`: active subscription tier and/or BLACK spend tier.
 */
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

export async function getPsaPremiumProfile(
  userId: string,
  accessToken: string
): Promise<PsaPremiumProfile | null> {
  const supabase = getSupabaseUser(accessToken);
  const { data, error } = await supabase
    .from('profiles')
    .select('membership_type, subscription_tier, current_tier_name')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

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
    isPremium: isPremiumFromProfileRow(row),
  };
}
