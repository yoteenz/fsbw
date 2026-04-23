import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';

/** GET /api/admin/referrals – list from referral_earnings table (admin only). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('referral_earnings').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) return res.status(500).json({ error: error.message });
    const rows = Array.isArray(data) ? data : [];
    const log = rows.map((r: Record<string, unknown>) => ({
      referrerEmail: r.referrer_email,
      referredEmail: r.referred_email,
      orderId: r.order_id,
      orderNumber: r.order_number,
      amount: Number(r.amount) || 0,
      status: r.status,
      date: r.created_at,
    }));
    const confirmed = log.filter((e) => e.status === 'confirmed');
    const totalEarned = confirmed.reduce((sum, e) => sum + (e.amount || 0), 0);
    const byReferrer: Record<string, { count: number; earned: number }> = {};
    for (const e of confirmed) {
      const email = String(e.referrerEmail ?? '')
        .trim()
        .toLowerCase();
      if (!byReferrer[email]) byReferrer[email] = { count: 0, earned: 0 };
      byReferrer[email].count += 1;
      byReferrer[email].earned += e.amount || 0;
    }
    return res.status(200).json({
      log,
      totalEarned,
      inviteeCount: confirmed.length,
      byReferrer,
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
