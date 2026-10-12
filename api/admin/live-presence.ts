import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getLivePresenceCached } from '../_lib/livePresenceCache.js';
import { logLivePresenceMetric } from '../_lib/livePresenceMetrics.js';
import { hasSupabaseServiceRole } from '../_lib/supabase.js';
import { checkRateLimit, rateLimitResponse } from '../_lib/rateLimit.js';

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
    visitors: [] as Array<{
      visitor_id: string;
      lat: number;
      lng: number;
      path: string | null;
      city?: string;
      region?: string;
      country?: string;
      lastAt: number;
    }>,
    meta: {
      stale: false,
      analyticsUnavailable: false,
    },
  };

  if (!hasSupabaseServiceRole()) {
    return res.status(200).json({
      ...empty,
      meta: { stale: false, analyticsUnavailable: true },
    });
  }

  const adminKey = (admin.email || 'admin').toLowerCase().slice(0, 320);
  const rl = checkRateLimit(`live-presence:admin:${adminKey}`, { max: 40, windowMs: 60_000 });
  if (!rl.ok) {
    logLivePresenceMetric({
      kind: 'live_presence',
      cacheHit: false,
      stale: false,
      queryDurationMs: null,
      rowCount: null,
      visitorCount: 0,
      timeout: false,
      error: false,
      rateLimited: true,
      inFlightCoalesced: false,
    });
    rateLimitResponse(res, rl.retryAfterSec);
    return;
  }

  const forceRefresh = req.query.refresh === '1' || req.query.force === '1';

  try {
    const payload = await getLivePresenceCached(forceRefresh);
    const analyticsUnavailable = payload.stale && (payload.timedOut || Boolean(payload.dbError));

    logLivePresenceMetric({
      kind: 'live_presence',
      cacheHit: payload.cacheHit,
      stale: payload.stale,
      queryDurationMs: payload.queryDurationMs,
      rowCount: payload.rowCountScanned,
      visitorCount: payload.visitorsNow,
      timeout: payload.timedOut,
      error: Boolean(payload.dbError),
      rateLimited: false,
      inFlightCoalesced: payload.inFlightCoalesced,
    });

    res.setHeader('Cache-Control', 'private, no-store');
    if (payload.cachedAt != null) {
      res.setHeader('X-Live-Presence-Cached-At', String(payload.cachedAt));
    }
    if (payload.stale) {
      res.setHeader('X-Live-Presence-Stale', '1');
    }

    return res.status(200).json({
      visitorsNow: payload.visitorsNow,
      visitors: payload.visitors,
      meta: {
        stale: payload.stale,
        analyticsUnavailable: analyticsUnavailable && payload.stale,
        cachedAt: payload.cachedAt,
        queryDurationMs: payload.queryDurationMs,
        rowCountScanned: payload.rowCountScanned,
      },
    });
  } catch (e) {
    console.error('[admin/live-presence]', e);
    logLivePresenceMetric({
      kind: 'live_presence',
      cacheHit: false,
      stale: true,
      queryDurationMs: null,
      rowCount: null,
      visitorCount: 0,
      timeout: false,
      error: true,
      rateLimited: false,
      inFlightCoalesced: false,
    });
    return res.status(200).json({
      ...empty,
      meta: { stale: true, analyticsUnavailable: true },
    });
  }
}
