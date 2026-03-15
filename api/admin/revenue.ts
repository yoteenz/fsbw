import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';

type OrderItem = { total?: number; amount?: number; date?: string; createdAt?: string; [k: string]: unknown };

function orderAmount(o: OrderItem): number {
  const n = Number(o.total ?? o.amount ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** GET /api/admin/revenue – revenue and order counts from Supabase (admin only). */
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
    const { data, error } = await supabase.from('orders').select('active_orders, past_orders');
    if (error) return res.status(500).json({ error: error.message });
    const rows = Array.isArray(data) ? data : [];

    let totalRevenue = 0;
    let totalOrders = 0;
    const byMonth: Record<string, number> = {};

    for (const row of rows) {
      const active = Array.isArray((row as { active_orders?: unknown[] }).active_orders) ? (row as { active_orders: OrderItem[] }).active_orders : [];
      const past = Array.isArray((row as { past_orders?: unknown[] }).past_orders) ? (row as { past_orders: OrderItem[] }).past_orders : [];
      for (const o of [...active, ...past]) {
        const amt = orderAmount(o);
        totalRevenue += amt;
        totalOrders += 1;
        const d = (o as OrderItem).date ?? (o as OrderItem).createdAt;
        if (d) {
          const key = new Date(d).toISOString().slice(0, 7);
          byMonth[key] = (byMonth[key] || 0) + amt;
        }
      }
    }

    const months = Object.keys(byMonth).sort().reverse().slice(0, 12);
    const breakdown = months.map((m) => ({ month: m, value: byMonth[m] }));

    return res.status(200).json({
      totalRevenue,
      totalOrders,
      breakdown,
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
