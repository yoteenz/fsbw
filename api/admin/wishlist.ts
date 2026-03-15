import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';

/** GET /api/admin/wishlist?user_id=uuid – get wishlist for a user (admin only). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const userId = typeof req.query.user_id === 'string' ? req.query.user_id.trim() : '';
  if (!userId) return res.status(400).json({ error: 'user_id required' });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', userId).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    const row = data as { items?: unknown } | null;
    return res.status(200).json({ items: Array.isArray(row?.items) ? row.items : [] });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
