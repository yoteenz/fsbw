import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminFounder } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { writeAuditLog } from '../_lib/auditLog.js';

const CONFIG_KEY = 'page_debug_overrides';

/**
 * GET /api/admin/page-debug-config — founder read of page debug override store.
 * PUT /api/admin/page-debug-config — founder upsert full store (cross-device sync).
 * Body shape: `{ store: Record<pagePath, DebugPageConfig>, updatedAt: number }`
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const founder = await requireAdminFounder(req);
  if (!founder) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from('app_config').select('value').eq('key', CONFIG_KEY).maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      const value = data?.value;
      if (value != null && typeof value === 'object' && !Array.isArray(value)) {
        return res.status(200).json({ config: value });
      }
      return res.status(200).json({ config: null });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        actorId: founder.id,
        actorEmail: founder.email,
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
