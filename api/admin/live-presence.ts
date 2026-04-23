import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';

const LIVE_WINDOW_MS = 5 * 60 * 1000;

type VisitorRow = {
  visitor_id: string;
  lat: number;
  lng: number;
  path: string | null;
  city?: string;
  region?: string;
  country?: string;
  lastAt: number;
};

/** GET /api/admin/live-presence — recent page_view heartbeats with geo (admin only). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const empty = {
    visitorsNow: 0,
    visitors: [] as VisitorRow[],
  };

  if (!hasSupabaseServiceRole()) {
    return res.status(200).json(empty);
  }

  try {
    const supabase = getSupabaseAdminServiceRole();
    const sinceIso = new Date(Date.now() - LIVE_WINDOW_MS).toISOString();

    const { data: rows, error } = await supabase
      .from('site_analytics_events')
      .select('visitor_id, path, created_at, meta')
      .eq('event_type', 'page_view')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      console.error('[admin/live-presence]', error.message);
      return res.status(200).json(empty);
    }

    const byVisitor = new Map<string, VisitorRow>();

    for (const r of rows ?? []) {
      const vid = String(r.visitor_id ?? '').trim();
      if (!vid) continue;
      const meta = (r.meta && typeof r.meta === 'object' ? r.meta : {}) as Record<string, unknown>;
      const lat = Number(meta.lat);
      const lng = Number(meta.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      const created = r.created_at ? new Date(r.created_at as string).getTime() : Date.now();
      const existing = byVisitor.get(vid);
      if (existing && existing.lastAt >= created) continue;

      byVisitor.set(vid, {
        visitor_id: vid,
        lat,
        lng,
        path: (r.path as string) || null,
        city: typeof meta.city === 'string' ? meta.city : undefined,
        region: typeof meta.region === 'string' ? meta.region : undefined,
        country: typeof meta.country === 'string' ? meta.country : undefined,
        lastAt: created,
      });
    }

    const visitors = Array.from(byVisitor.values());
    return res.status(200).json({
      visitorsNow: visitors.length,
      visitors,
    });
  } catch (e) {
    console.error('[admin/live-presence]', e);
    return res.status(200).json(empty);
  }
}
