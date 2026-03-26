import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth';
import { getSupabaseUser } from './_lib/supabase';
import { fromProfileRow } from './_lib/profileMapping';
import { writeAuditLog } from './_lib/auditLog';

function toProfileRow(profile: Record<string, unknown>) {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role ?? null,
    first_name: profile.firstName ?? null,
    last_name: profile.lastName ?? null,
    phone_number: profile.phoneNumber ?? null,
    birthday: profile.birthday ?? null,
    facebook: profile.facebook ?? null,
    instagram: profile.instagram ?? null,
    youtube: profile.youtube ?? null,
    tiktok: profile.tiktok ?? null,
    twitter: profile.twitter ?? null,
    profile_image: profile.profileImage ?? null,
    membership_type: profile.membershipType ?? null,
    subscription_tier: profile.subscriptionTier ?? null,
    current_tier_name: profile.currentTierName ?? profile.tier ?? null,
    default_address: profile.defaultAddress ?? null,
    shipping_address: profile.shippingAddress ?? null,
    saved_addresses: profile.savedAddresses ?? null,
    referral_code: profile.referralCode ?? null,
    gift_card_balance: Number(profile.giftCardBalance) || 0,
    has_made_first_purchase: Boolean(profile.hasMadeFirstPurchase),
    loyalty_points: Number(profile.loyaltyPoints) || 0,
    unlocked_discounts: profile.unlockedDiscounts ?? null,
    voucher_list: profile.voucherList ?? null,
    voucher_history: profile.voucherHistory ?? null,
    digital_cash_history: profile.digitalCashHistory ?? null,
    welcome_discount_tiers_credited_by_period: profile.welcomeDiscountTiersCreditedByPeriod ?? null,
    notification_newsletter:
      typeof profile.notificationNewsletter === 'boolean' ? profile.notificationNewsletter : true,
    notification_sales: typeof profile.notificationSales === 'boolean' ? profile.notificationSales : true,
    notification_order_tracking:
      typeof profile.notificationOrderTracking === 'boolean' ? profile.notificationOrderTracking : true,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabaseUser(user.accessToken);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(200).json(null);
    }
    return res.status(200).json(fromProfileRow(data as Record<string, unknown>));
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    // Partial update: fetch existing profile so we only overwrite fields that are in the request body.
    // Otherwise e.g. PATCH { firstName } would set profile_image to null.
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    const existingApp = existing ? fromProfileRow(existing as Record<string, unknown>) : {};
    const merged = { ...existingApp, ...body, id: user.id, email: user.email };
    const row = toProfileRow(merged) as Record<string, unknown>;
    row.id = user.id;
    row.email = user.email;
    row.updated_at = new Date().toISOString();
    if (!existing) {
      row.created_at = new Date().toISOString();
    }

    // Upsert: create profile if none exists (e.g. after email confirm), otherwise update.
    const { data, error } = await supabase
      .from('profiles')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    try {
      await writeAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'profile.update',
        resourceType: 'profiles',
        resourceId: user.id,
        details: { updated: true },
      });
    } catch {
      /* ignore */
    }
    return res.status(200).json(fromProfileRow(data as Record<string, unknown>));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
