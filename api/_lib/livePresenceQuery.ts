import { getSupabaseAdminServiceRole } from './supabase.js';

/** Page_view heartbeats in this window (deduped per visitor = latest point). */
export const LIVE_PRESENCE_WINDOW_MS = 24 * 60 * 60 * 1000;

export const LIVE_PRESENCE_ROW_LIMIT = 5000;

export const LIVE_PRESENCE_QUERY_TIMEOUT_MS = 12_000;

export type LivePresenceVisitorRow = {
  visitor_id: string;
  lat: number;
  lng: number;
  path: string | null;
  city?: string;
  region?: string;
  country?: string;
  lastAt: number;
};

type RawRow = {
  visitor_id: string;
  path: string | null;
  created_at: string;
  meta: unknown;
};

export function dedupeVisitorsFromRows(rows: RawRow[]): LivePresenceVisitorRow[] {
  const byVisitor = new Map<string, LivePresenceVisitorRow>();

  for (const r of rows) {
    const vid = String(r.visitor_id ?? '').trim();
    if (!vid) continue;
    const meta = (r.meta && typeof r.meta === 'object' ? r.meta : {}) as Record<string, unknown>;
    const lat = Number(meta.lat);
    const lng = Number(meta.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const created = r.created_at ? new Date(r.created_at).getTime() : Date.now();
    const existing = byVisitor.get(vid);
    if (existing && existing.lastAt >= created) continue;

    byVisitor.set(vid, {
      visitor_id: vid,
      lat,
      lng,
      path: r.path || null,
      city: typeof meta.city === 'string' ? meta.city : undefined,
      region: typeof meta.region === 'string' ? meta.region : undefined,
      country: typeof meta.country === 'string' ? meta.country : undefined,
      lastAt: created,
    });
  }

  return Array.from(byVisitor.values());
}

async function fetchRecentPageViewRows(sinceIso: string): Promise<{ rows: RawRow[]; error: string | null }> {
  const supabase = getSupabaseAdminServiceRole();
  const { data: rows, error } = await supabase
    .from('site_analytics_events')
    .select('visitor_id, path, created_at, meta')
    .eq('event_type', 'page_view')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(LIVE_PRESENCE_ROW_LIMIT);

  if (error) return { rows: [], error: error.message };
  return { rows: (rows ?? []) as RawRow[], error: null };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('live_presence_query_timeout')), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

export type LivePresenceQueryResult = {
  visitors: LivePresenceVisitorRow[];
  rowCountScanned: number;
  queryDurationMs: number;
  timedOut: boolean;
  dbError: string | null;
};

/** Loads recent page_view rows and dedupes in Node (current production path). */
export async function queryLivePresenceVisitors(): Promise<LivePresenceQueryResult> {
  const sinceIso = new Date(Date.now() - LIVE_PRESENCE_WINDOW_MS).toISOString();
  const started = Date.now();
  try {
    const { rows, error } = await withTimeout(fetchRecentPageViewRows(sinceIso), LIVE_PRESENCE_QUERY_TIMEOUT_MS);
    const queryDurationMs = Date.now() - started;
    return {
      visitors: dedupeVisitorsFromRows(rows),
      rowCountScanned: rows.length,
      queryDurationMs,
      timedOut: false,
      dbError: error,
    };
  } catch (e) {
    const queryDurationMs = Date.now() - started;
    const timedOut = e instanceof Error && e.message === 'live_presence_query_timeout';
    return {
      visitors: [],
      rowCountScanned: 0,
      queryDurationMs,
      timedOut,
      dbError: timedOut ? 'query_timeout' : e instanceof Error ? e.message : 'unknown',
    };
  }
}

/**
 * Proposed SQL-side dedupe (requires migration + index review — not enabled in production):
 *
 * SELECT DISTINCT ON (visitor_id)
 *   visitor_id, path, created_at, meta
 * FROM site_analytics_events
 * WHERE event_type = 'page_view'
 *   AND created_at >= $since
 * ORDER BY visitor_id, created_at DESC;
 *
 * Returns one row per visitor (not capped at 5000 raw rows unless a LIMIT is applied after dedupe).
 */
