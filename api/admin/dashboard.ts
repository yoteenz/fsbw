import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';

type OrderItem = { total?: number; amount?: number; date?: string; createdAt?: string; status?: string; [k: string]: unknown };

function orderAmount(o: OrderItem): number {
  const n = Number((o as OrderItem).total ?? (o as OrderItem).amount ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function orderDate(o: OrderItem): number {
  const d = (o as OrderItem).date ?? (o as OrderItem).createdAt;
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** GET /api/admin/dashboard – stats and recent activity from Supabase (admin only). */
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

    const [profilesRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('id, referral_code'),
      supabase.from('orders').select('active_orders, past_orders'),
    ]);

    if (profilesRes.error) return res.status(500).json({ error: profilesRes.error.message });
    if (ordersRes.error) return res.status(500).json({ error: ordersRes.error.message });

    const profiles = Array.isArray(profilesRes.data) ? profilesRes.data : [];
    const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

    const activeClients = profiles.length;
    const referralCount = profiles.filter((p: { referral_code?: string | null }) => (p.referral_code || '').trim() !== '').length;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const signUpsThisMonth = profiles.filter((p: { created_at?: string | null }) => (p.created_at || '') >= thisMonthStart).length;

    let totalRevenue = 0;
    let totalOrders = 0;
    let pendingForms = 0;
    const allTransactions: { date: string; amount: number; status: string }[] = [];

    for (const row of orders) {
      const active = Array.isArray((row as { active_orders?: unknown[] }).active_orders) ? (row as { active_orders: OrderItem[] }).active_orders : [];
      const past = Array.isArray((row as { past_orders?: unknown[] }).past_orders) ? (row as { past_orders: OrderItem[] }).past_orders : [];
      for (const o of [...active, ...past]) {
        const amt = orderAmount(o);
        totalRevenue += amt;
        totalOrders += 1;
        const status = String((o as OrderItem).status || 'Completed').toUpperCase();
        if (status === 'AWAITING FORM') pendingForms += 1;
        const dateStr = (o as OrderItem).date ?? (o as OrderItem).createdAt;
        if (amt > 0 || dateStr) allTransactions.push({
          date: dateStr || new Date().toISOString().slice(0, 10),
          amount: amt,
          status: status === 'AWAITING FORM' ? 'Pending' : 'Completed',
        });
      }
    }

    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentRevenue = allTransactions.slice(0, 6);

    return res.status(200).json({
      stats: {
        activeClients,
        referralCount,
        totalRevenue,
        totalOrders,
        pendingForms,
        signUpsThisMonth,
      },
      clients: profiles.slice(0, 12).map(() => ({ tier: 'Standard' })),
      bookings: [],
      revenue: recentRevenue,
      notifications: [],
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
