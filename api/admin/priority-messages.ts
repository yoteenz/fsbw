import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

/** GET /api/admin/priority-messages — list inbox rows. PATCH — update status. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (!hasSupabaseServiceRole()) {
    return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY required' });
  }

  const supabase = getSupabaseAdminServiceRole();

  if (req.method === 'GET') {
    const status = typeof req.query?.status === 'string' ? req.query.status : undefined;
    let q = supabase
      .from('priority_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) {
      const hint =
        error.message.includes('priority_messages') || error.code === '42P01'
          ? 'Run supabase/migrations/20260603180000_priority_messages.sql'
          : undefined;
      return res.status(500).json({ error: error.message, hint });
    }
    return res.status(200).json({ messages: data ?? [] });
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    if (!id) return res.status(400).json({ error: 'id required' });
    if (!['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'status must be new | read | archived' });
    }
    const { data, error } = await supabase
      .from('priority_messages')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ ok: true, message: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
