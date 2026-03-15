import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';

/** GET /api/admin/audit-log – list audit log entries (admin only). ?limit=50&offset=0 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
  const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10));

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return res.status(500).json({ error: error.message });
    const rows = Array.isArray(data) ? data : [];
    const list = rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      actorId: r.actor_id,
      actorEmail: r.actor_email,
      action: r.action,
      resourceType: r.resource_type,
      resourceId: r.resource_id,
      details: r.details,
      createdAt: r.created_at,
    }));
    return res.status(200).json(list);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
