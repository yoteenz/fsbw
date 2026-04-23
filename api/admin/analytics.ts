import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';

type Platform = 'instagram' | 'twitter' | 'facebook' | 'tiktok';
type Source = 'menu' | 'more_ways_to_earn';

function emptyPlatformRecord(): Record<Platform, number> {
  return { instagram: 0, twitter: 0, facebook: 0, tiktok: 0 };
}

function emptyPlatformAndSource(): Record<Platform, Record<Source, number>> {
  return {
    instagram: { menu: 0, more_ways_to_earn: 0 },
    twitter: { menu: 0, more_ways_to_earn: 0 },
    facebook: { menu: 0, more_ways_to_earn: 0 },
    tiktok: { menu: 0, more_ways_to_earn: 0 },
  };
}

const PLATFORMS: Platform[] = ['instagram', 'twitter', 'facebook', 'tiktok'];
const SOURCES: Source[] = ['menu', 'more_ways_to_earn'];

/** GET /api/admin/analytics – social click aggregates + recent rows from Supabase. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const empty = {
    total: 0,
    bySource: { menu: 0, more_ways_to_earn: 0 },
    byPlatform: emptyPlatformRecord(),
    byPlatformAndSource: emptyPlatformAndSource(),
    recentEvents: [] as Array<{
      platform: Platform;
      source: Source;
      timestamp: number;
      visitorId?: string;
      userEmail?: string | null;
    }>,
  };

  if (!hasSupabaseServiceRole()) {
    return res.status(200).json(empty);
  }

  try {
    const supabase = getSupabaseAdminServiceRole();

    const { data: rows, error: aggError } = await supabase
      .from('site_analytics_events')
      .select('platform, source')
      .eq('event_type', 'social_click')
      .limit(100000);

    if (aggError) {
      console.error('[admin/analytics] aggregate', aggError.message);
      return res.status(200).json(empty);
    }

    const bySource = { menu: 0, more_ways_to_earn: 0 };
    const byPlatform = emptyPlatformRecord();
    const byPlatformAndSource = emptyPlatformAndSource();

    for (const row of rows ?? []) {
      const p = row.platform as string | null;
      const s = row.source as string | null;
      if (!p || !s) continue;
      if (!PLATFORMS.includes(p as Platform) || !SOURCES.includes(s as Source)) continue;
      const pl = p as Platform;
      const so = s as Source;
      bySource[so]++;
      byPlatform[pl]++;
      byPlatformAndSource[pl][so]++;
    }

    const total = (rows ?? []).length;

    const { data: recentRows, error: recentError } = await supabase
      .from('site_analytics_events')
      .select('platform, source, created_at, visitor_id, user_email')
      .eq('event_type', 'social_click')
      .order('created_at', { ascending: false })
      .limit(50);

    if (recentError) {
      console.error('[admin/analytics] recent', recentError.message);
    }

    const recentEvents: typeof empty.recentEvents = [];
    for (const r of recentRows ?? []) {
      const p = r.platform as string | null;
      const s = r.source as string | null;
      if (!p || !s) continue;
      if (!PLATFORMS.includes(p as Platform) || !SOURCES.includes(s as Source)) continue;
      const created = r.created_at ? new Date(r.created_at as string).getTime() : Date.now();
      recentEvents.push({
        platform: p as Platform,
        source: s as Source,
        timestamp: created,
        visitorId: (r.visitor_id as string) || undefined,
        userEmail: (r.user_email as string) || null,
      });
    }

    return res.status(200).json({
      total,
      bySource,
      byPlatform,
      byPlatformAndSource,
      recentEvents,
    });
  } catch (e) {
    console.error('[admin/analytics]', e);
    return res.status(200).json(empty);
  }
}
