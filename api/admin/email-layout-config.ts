import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { invalidateEmailLayoutDebugCache } from '../_lib/email/emailLayoutConfigStore.js';
import { sendEmail } from '../_lib/email/sendEmail.js';
import { renderEmailTemplate, parseEmailLayoutDebugFromBody } from '../_lib/email/renderTemplate.js';
import { coerceEmailLayoutDebugStore, EMAIL_LAYOUT_DEBUG_CONFIG_KEY } from '../_lib/email/emailLayoutConfig.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { writeAuditLog } from '../_lib/auditLog.js';

/**
 * GET /api/admin/email-layout-config — admin read of email layout debug store.
 * PUT /api/admin/email-layout-config — admin upsert full store (cross-device + production sends).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', EMAIL_LAYOUT_DEBUG_CONFIG_KEY)
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      const value = data?.value;
      if (value != null && typeof value === 'object' && !Array.isArray(value)) {
        return res.status(200).json({ config: coerceEmailLayoutDebugStore(value) });
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

  const store = coerceEmailLayoutDebugStore({ ...body, updatedAt: Date.now() });

  try {
    const supabase = getSupabaseAdmin();
    const row = {
      key: EMAIL_LAYOUT_DEBUG_CONFIG_KEY,
      value: store as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('app_config').upsert(row, { onConflict: 'key' }).select('value').single();
    if (error) return res.status(500).json({ error: error.message });
    invalidateEmailLayoutDebugCache();
    try {
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'app_config.upsert',
        resourceType: 'app_config',
        resourceId: EMAIL_LAYOUT_DEBUG_CONFIG_KEY,
        details: { key: EMAIL_LAYOUT_DEBUG_CONFIG_KEY },
      });
    } catch {
      /* ignore */
    }
    return res.status(200).json({ ok: true, config: data?.value ?? store });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
