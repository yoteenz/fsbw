# Live presence API hardening

Endpoint: **`GET /api/admin/live-presence`** (`api/admin/live-presence.ts`)

## Authorization

Unchanged: **`requireAdmin(req)`** — 403 when not admin. No public exposure of visitor geo.

## Rate limiting

- **40 requests / minute / admin email** (per serverless instance)
- Uses `api/_lib/rateLimit.ts` (best-effort in-memory)
- **429** + `Retry-After` when exceeded

## In-flight dedupe + cache (non-durable)

Module: **`api/_lib/livePresenceCache.ts`**

| Control | Value |
|---------|-------|
| Fresh TTL | 20s |
| Stale serve max | 90s (on DB timeout/error) |
| In-flight coalescing | Single shared promise |

Cache is **not** authoritative across instances or restarts — only reduces duplicate DB reads on the same instance.

## Query timeout

- **12s** hard cap (`LIVE_PRESENCE_QUERY_TIMEOUT_MS`)
- On timeout/error: return last good snapshot with `meta.stale: true` when available

## Response shape (backward compatible)

```json
{
  "visitorsNow": 0,
  "visitors": [],
  "meta": {
    "stale": false,
    "analyticsUnavailable": false,
    "cachedAt": 1730000000000,
    "queryDurationMs": 120,
    "rowCountScanned": 5000
  }
}
```

Headers: `Cache-Control: private, no-store`, optional `X-Live-Presence-Stale`, `X-Live-Presence-Cached-At`.

## Observability

Structured log line: **`[live-presence/metrics]`** JSON with duration, row count, cache hit, stale, timeout, error, rate limit — **no** emails, tokens, or full `meta` payloads.

## Query module

- **`api/_lib/livePresenceQuery.ts`** — fetch up to 5000 recent `page_view` rows (24h window), dedupe in Node.
- SQL-side **`DISTINCT ON (visitor_id)`** documented as **proposed** only (see `PERFORMANCE_COMPARISON.md`).
