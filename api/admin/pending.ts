import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';

type OrderItem = { status?: string; [k: string]: unknown };

/** GET /api/admin/pending – pending counts from orders (admin only). */
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

    let pendingReviews = 0;
    let orderForms = 0;

    for (const row of rows) {
      const active = Array.isArray((row as { active_orders?: unknown[] }).active_orders) ? (row as { active_orders: OrderItem[] }).active_orders : [];
      for (const o of active) {
        const s = String((o as OrderItem).status || '').toUpperCase();
        if (s === 'AWAITING FORM') orderForms += 1;
      }
    }

    return res.status(200).json({
      pendingReviews: pendingReviews || 0,
      orderForms,
      pendingItems: [
        { label: 'PENDING REVIEWS', value: String(pendingReviews || 0) },
        { label: 'ORDER FORMS', value: String(orderForms) },
        { label: 'TIER UPGRADES', value: '0' },
        { label: 'AFFILIATE REQUESTS', value: '0' },
        { label: 'REFUND REQUESTS', value: '0' },
        { label: 'SYSTEM ALERTS', value: '0' },
      ],
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
