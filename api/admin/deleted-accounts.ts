import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';

/** GET /api/admin/deleted-accounts – deleted accounts list (admin only). From public.deleted_accounts, most recent first. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    const supabase = getSupabaseAdminServiceRole();
    const { data, error } = await supabase
      .from('deleted_accounts')
      .select('user_id, email, first_name, last_name, deleted_at, deleted_from')
      .order('deleted_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const rows = Array.isArray(data) ? data : [];
    const deleted = rows.map((r: Record<string, unknown>) => ({
      id: r.user_id,
      email: r.email ?? '',
      firstName: r.first_name ?? '',
      lastName: r.last_name ?? '',
      deletedAt: r.deleted_at,
      deletedFrom: r.deleted_from ?? undefined,
    }));
    return res.status(200).json({ deleted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    if (/SUPABASE_SERVICE_ROLE_KEY|service role/i.test(msg)) {
      return res.status(503).json({ error: 'Deleted accounts list requires SUPABASE_SERVICE_ROLE_KEY.' });
    }
    return res.status(500).json({ error: msg });
  }
}
