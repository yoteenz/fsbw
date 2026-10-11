import {
  queryLivePresenceVisitors,
  type LivePresenceQueryResult,
  type LivePresenceVisitorRow,
} from './livePresenceQuery.js';

/** Short TTL — coalesce polls; not durable authority across instances. */
const FRESH_TTL_MS = 20_000;

/** Serve stale cache up to this age when DB errors/timeouts (admin still sees last good snapshot). */
const STALE_SERVE_MAX_MS = 90_000;

type CacheEntry = {
  fetchedAt: number;
  result: LivePresenceQueryResult;
};

let cache: CacheEntry | null = null;
let inFlight: Promise<LivePresenceQueryResult> | null = null;

export type LivePresenceCacheResponse = {
  visitors: LivePresenceVisitorRow[];
  visitorsNow: number;
  stale: boolean;
  cachedAt: number | null;
  cacheHit: boolean;
  inFlightCoalesced: boolean;
  queryDurationMs: number | null;
  rowCountScanned: number | null;
  timedOut: boolean;
  dbError: string | null;
};

function buildResponse(
  result: LivePresenceQueryResult,
  opts: { stale: boolean; cachedAt: number | null; cacheHit: boolean; inFlightCoalesced: boolean }
): LivePresenceCacheResponse {
  return {
    visitors: result.visitors,
    visitorsNow: result.visitors.length,
    stale: opts.stale,
    cachedAt: opts.cachedAt,
    cacheHit: opts.cacheHit,
    inFlightCoalesced: opts.inFlightCoalesced,
    queryDurationMs: result.queryDurationMs,
    rowCountScanned: result.rowCountScanned,
    timedOut: result.timedOut,
    dbError: result.dbError,
  };
}

async function runQuery(): Promise<LivePresenceQueryResult> {
  const result = await queryLivePresenceVisitors();
  const ok = !result.timedOut && !result.dbError;
  if (ok) {
    cache = { fetchedAt: Date.now(), result };
  }
  return result;
}

/**
 * Per-instance cache + in-flight dedupe. On failure, may return stale snapshot with `stale: true`.
 */
export async function getLivePresenceCached(forceRefresh = false): Promise<LivePresenceCacheResponse> {
  const now = Date.now();
  if (!forceRefresh && cache && now - cache.fetchedAt < FRESH_TTL_MS) {
    return buildResponse(cache.result, {
      stale: false,
      cachedAt: cache.fetchedAt,
      cacheHit: true,
      inFlightCoalesced: false,
    });
  }

  if (inFlight) {
    const result = await inFlight;
    const cachedAt = cache?.fetchedAt ?? null;
    const age = cachedAt != null ? now - cachedAt : 0;
    return buildResponse(result, {
      stale: age > FRESH_TTL_MS,
      cachedAt,
      cacheHit: false,
      inFlightCoalesced: true,
    });
  }

  inFlight = runQuery();
  try {
    const result = await inFlight;
    const failed = Boolean(result.timedOut || result.dbError);
    if (failed && cache && now - cache.fetchedAt <= STALE_SERVE_MAX_MS) {
      return buildResponse(cache.result, {
        stale: true,
        cachedAt: cache.fetchedAt,
        cacheHit: true,
        inFlightCoalesced: false,
      });
    }
    return buildResponse(result, {
      stale: failed,
      cachedAt: failed ? cache?.fetchedAt ?? null : cache?.fetchedAt ?? now,
      cacheHit: false,
      inFlightCoalesced: false,
    });
  } finally {
    inFlight = null;
  }
}

/** Test hook — reset module state. */
export function resetLivePresenceCacheForTests(): void {
  cache = null;
  inFlight = null;
}
