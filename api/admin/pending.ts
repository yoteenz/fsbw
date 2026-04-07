import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';

type OrderItem = { status?: string; [k: string]: unknown };

function reviewPhotoCount(row: Record<string, unknown>): number {
  const p = row.photos;
  if (Array.isArray(p)) return p.length;
  const n = Number(p);
  return Number.isFinite(n) ? n : 0;
}

function reviewVideoCount(row: Record<string, unknown>): number {
  const v = row.videos;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** GET /api/admin/pending – pending counts from orders + reviews table (admin only). */
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

    let orderForms = 0;

    for (const row of rows) {
      const active = Array.isArray((row as { active_orders?: unknown[] }).active_orders) ? (row as { active_orders: OrderItem[] }).active_orders : [];
      for (const o of active) {
        const s = String((o as OrderItem).status || '').toUpperCase();
        if (s === 'AWAITING FORM') orderForms += 1;
      }
    }

    let pendingReviews = 0;
    let pendingWithPhotos = 0;
    let pendingWithVideos = 0;
    let pendingTextOnly = 0;
    try {
      const { data: revData, error: revErr } = await supabase
        .from('reviews')
        .select('photos,videos,status')
        .eq('status', 'pending')
        .limit(2000);
      if (!revErr && Array.isArray(revData)) {
        pendingReviews = revData.length;
        for (const raw of revData) {
          const r = raw as Record<string, unknown>;
          const pc = reviewPhotoCount(r);
          const vc = reviewVideoCount(r);
          if (pc > 0) pendingWithPhotos += 1;
          if (vc > 0) pendingWithVideos += 1;
          if (pc === 0 && vc === 0) pendingTextOnly += 1;
        }
      }
    } catch {
      /* reviews table missing or RLS — keep zeros */
    }

    return res.status(200).json({
      pendingReviews,
      orderForms,
      pendingReviewBreakdown: {
        total: pendingReviews,
        withPhotos: pendingWithPhotos,
        withVideos: pendingWithVideos,
        textOnly: pendingTextOnly,
      },
      pendingItems: [
        { label: 'PENDING REVIEWS', value: String(pendingReviews) },
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
