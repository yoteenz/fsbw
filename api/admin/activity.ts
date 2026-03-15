import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';

/** GET /api/admin/activity?user_id=uuid – list activity for a user (admin only). Newest first. */
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

  const limit = Math.min(500, Math.max(1, parseInt(String(req.query.limit || '200'), 10)));

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_activity')
      .select('id, user_id, event_type, payload, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return res.status(500).json({ error: error.message });
    const rows = Array.isArray(data) ? data : [];
    const list = rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      userId: r.user_id,
      eventType: r.event_type,
      payload: r.payload,
      createdAt: r.created_at,
    }));
    return res.status(200).json(list);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
