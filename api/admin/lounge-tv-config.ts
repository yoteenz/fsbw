import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { writeAuditLog } from '../_lib/auditLog.js';

const CONFIG_KEY = 'lounge_tv_admin';

/**
 * PUT /api/admin/lounge-tv-config — upsert lounge TV content JSON (admin only).
 * Body: full LoungeTvAdminConfig object.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const body = typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body) ? req.body : null;
  if (!body) return res.status(400).json({ error: 'JSON object body required' });

  try {
    const supabase = getSupabaseAdmin();
    const row = {
      key: CONFIG_KEY,
      value: body as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('app_config').upsert(row, { onConflict: 'key' }).select('value').single();
    if (error) return res.status(500).json({ error: error.message });
    try {
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'app_config.upsert',
        resourceType: 'app_config',
        resourceId: CONFIG_KEY,
        details: { key: CONFIG_KEY },
      });
    } catch {
      /* ignore */
    }
    return res.status(200).json({ ok: true, config: data?.value ?? body });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
