import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';
import { normalizeSlug, rowToVisionShareLink, type VisionShareLinkRow } from '../_lib/visionShareDb.js';
import { writeAuditLog } from '../_lib/auditLog.js';

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

/**
 * GET /api/admin/vision-share?workspaceId=frontal-slayer
 * POST /api/admin/vision-share — create link
 * DELETE /api/admin/vision-share?slug=creative
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  let supabase;
  try {
    supabase = getSupabaseAdminServiceRole();
  } catch (e) {
    return res.status(503).json({ error: e instanceof Error ? e.message : 'Database unavailable' });
  }

  if (req.method === 'GET') {
    const workspaceId =
      typeof req.query.workspaceId === 'string' && req.query.workspaceId.trim()
        ? req.query.workspaceId.trim()
        : undefined;

    let query = supabase.from('vision_share_links').select('*').eq('active', true).order('created_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);

    const { data, error } = await query;
    if (error) {
      if (error.code === '42P01') return res.status(200).json({ links: [], migrationRequired: true });
      return res.status(500).json({ error: error.message });
    }

    const links = ((data ?? []) as VisionShareLinkRow[]).map(rowToVisionShareLink);
    return res.status(200).json({ links });
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    const slug = normalizeSlug(typeof body.slug === 'string' ? body.slug : '');
    const modeId = typeof body.modeId === 'string' ? body.modeId.trim() : '';
    const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId.trim() : 'frontal-slayer';
    const label = typeof body.label === 'string' ? body.label.trim() : slug;

    if (!slug || !modeId) return res.status(400).json({ error: 'slug and modeId required' });

    const row = {
      slug,
      mode_id: modeId,
      workspace_id: workspaceId,
      label: label || slug,
      password: typeof body.password === 'string' && body.password.trim() ? body.password.trim() : null,
      expires_at: typeof body.expiresAt === 'string' && body.expiresAt ? body.expiresAt : null,
      autoplay: body.autoplay !== false,
      presenter_mode: body.presenterMode === true,
      self_guided: body.selfGuided !== false,
      active: true,
      created_by: admin.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vision_share_links')
      .upsert(row, { onConflict: 'slug' })
      .select('*')
      .single();

    if (error) {
      if (error.code === '42P01') return res.status(503).json({ error: 'Run vision_share_links migration', migrationRequired: true });
      return res.status(500).json({ error: error.message });
    }

    try {
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'vision_share.create',
        resourceType: 'vision_share_link',
        resourceId: slug,
        details: { modeId, workspaceId },
      });
    } catch {
      /* ignore */
    }

    return res.status(200).json({ link: rowToVisionShareLink(data as VisionShareLinkRow) });
  }

  if (req.method === 'DELETE') {
    const slug = normalizeSlug(typeof req.query.slug === 'string' ? req.query.slug : '');
    if (!slug) return res.status(400).json({ error: 'slug required' });

    const { error } = await supabase
      .from('vision_share_links')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('slug', slug);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
