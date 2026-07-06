import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { writeAuditLog } from '../_lib/auditLog.js';

/**
 * GET /api/admin/studio-workspace-state?workspace_id=&key=
 * PUT /api/admin/studio-workspace-state — body { workspace_id, key, value }
 *
 * Cloud source of truth for Studio OS workspace module edits (adminStudio* keys).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const workspaceId =
    typeof req.query.workspace_id === 'string'
      ? req.query.workspace_id.trim()
      : typeof req.body?.workspace_id === 'string'
        ? req.body.workspace_id.trim()
        : '';
  const stateKey =
    typeof req.query.key === 'string'
      ? req.query.key.trim()
      : typeof req.body?.key === 'string'
        ? req.body.key.trim()
        : '';

  if (!workspaceId || !stateKey) {
    return res.status(400).json({ error: 'workspace_id and key required' });
  }

  if (!stateKey.startsWith('adminStudio')) {
    return res.status(400).json({ error: 'Invalid state key' });
  }

  try {
    const supabase = getSupabaseAdmin();

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('studio_os_workspace_state')
        .select('value, updated_at')
        .eq('workspace_id', workspaceId)
        .eq('state_key', stateKey)
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ value: data?.value ?? null, updated_at: data?.updated_at ?? null });
    }

    if (req.method === 'PUT') {
      const value = req.body?.value;
      if (value === undefined) return res.status(400).json({ error: 'value required' });

      const row = {
        workspace_id: workspaceId,
        state_key: stateKey,
        value: value as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('studio_os_workspace_state')
        .upsert(row, { onConflict: 'workspace_id,state_key' })
        .select('value, updated_at')
        .single();
      if (error) return res.status(500).json({ error: error.message });

      try {
        await writeAuditLog({
          actorId: admin.id,
          actorEmail: admin.email,
          action: 'app_config.upsert',
          resourceType: 'studio_os_workspace_state',
          resourceId: `${workspaceId}:${stateKey}`,
          details: { workspace_id: workspaceId, state_key: stateKey },
        });
      } catch {
        /* ignore */
      }

      return res.status(200).json({ ok: true, value: data?.value ?? value, updated_at: data?.updated_at });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
