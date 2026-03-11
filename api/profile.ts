import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth';
import { getSupabaseUser } from './_lib/supabase';

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
  };
}

function fromProfileRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    phoneNumber: row.phone_number,
    birthday: row.birthday,
    facebook: row.facebook,
    instagram: row.instagram,
    youtube: row.youtube,
    tiktok: row.tiktok,
    twitter: row.twitter,
    profileImage: row.profile_image,
    membershipType: row.membership_type,
    subscriptionTier: row.subscription_tier,
    defaultAddress: row.default_address,
    shippingAddress: row.shipping_address,
    savedAddresses: row.saved_addresses,
    referralCode: row.referral_code,
    giftCardBalance: row.gift_card_balance,
    hasMadeFirstPurchase: row.has_made_first_purchase,
    loyaltyPoints: row.loyalty_points,
    unlockedDiscounts: row.unlocked_discounts,
    voucherList: row.voucher_list,
    voucherHistory: row.voucher_history,
    digitalCashHistory: row.digital_cash_history,
    welcomeDiscountTiersCreditedByPeriod: row.welcome_discount_tiers_credited_by_period,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
    const row = toProfileRow({ ...body, id: user.id, email: user.email });
    delete (row as Record<string, unknown>).id;
    (row as Record<string, unknown>).updated_at = new Date().toISOString();

    const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).single();
    if (existing) {
      const { data, error } = await supabase
        .from('profiles')
        .update(row)
        .eq('id', user.id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(fromProfileRow(data as Record<string, unknown>));
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: user.email, ...row })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(fromProfileRow(data as Record<string, unknown>));
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
