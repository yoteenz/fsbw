import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';
import {
  isLinkExpired,
  passwordMatches,
  rowToVisionShareLink,
  type VisionShareLinkRow,
} from '../_lib/visionShareDb.js';

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

async function fetchRowBySlug(slug: string): Promise<VisionShareLinkRow | null> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase
    .from('vision_share_links')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();
  if (error) {
    if (error.code === '42P01') return null;
    throw new Error(error.message);
  }
  return (data as VisionShareLinkRow | null) ?? null;
}

async function incrementViews(row: VisionShareLinkRow): Promise<void> {
  const supabase = getSupabaseAdminServiceRole();
  const nextViews = (row.views ?? 0) + 1;
  await supabase.from('vision_share_links').update({ views: nextViews, updated_at: new Date().toISOString() }).eq('id', row.id);
  await supabase.from('vision_share_events').insert({
    share_id: row.id,
    mode_id: row.mode_id,
    event: 'view',
  });
}

/**
 * GET/POST /api/vision/share?slug=...
 * Public resolve for Vision Share links — server-persisted, works on any device.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const slugRaw =
    (typeof req.query.slug === 'string' ? req.query.slug : '') ||
    (typeof parseBody(req).slug === 'string' ? (parseBody(req).slug as string) : '');
  const slug = slugRaw.trim().toLowerCase();
  if (!slug) return res.status(400).json({ error: 'slug required' });

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const row = await fetchRowBySlug(slug);
    if (!row) {
      return res.status(404).json({ error: 'Vision link not found', migrationRequired: true });
    }

    if (isLinkExpired(row.expires_at)) {
      return res.status(410).json({ error: 'Vision link expired', expired: true });
    }

    const body = parseBody(req);
    const password =
      typeof body.password === 'string'
        ? body.password
        : typeof req.query.password === 'string'
          ? req.query.password
          : undefined;

    const requiresPassword = Boolean(row.password);
    if (requiresPassword && !passwordMatches(row.password, password)) {
      return res.status(200).json({
        requiresPassword: true,
        expired: false,
        label: row.label,
      });
    }

    const link = rowToVisionShareLink(row);
    const { password: _pw, ...publicLink } = link;

    if (req.method === 'GET' || req.method === 'POST') {
      try {
        await incrementViews(row);
        publicLink.views = (publicLink.views ?? 0) + 1;
      } catch {
        /* non-fatal */
      }
    }

    return res.status(200).json({
      requiresPassword: false,
      expired: false,
      link: publicLink,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    if (msg.includes('SUPABASE') || msg.includes('Missing SUPABASE')) {
      return res.status(503).json({ error: 'Vision Share database unavailable', migrationRequired: true });
    }
    return res.status(500).json({ error: msg });
  }
}
