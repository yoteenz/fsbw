# Index proposal — `site_analytics_events` (live presence)

**Status: PROPOSED ONLY — not applied in this sprint.**

## Existing indexes (migration `20260330180000_site_analytics_events.sql`)

- `site_analytics_events_created_at_desc_idx` — `(created_at DESC)`
- `site_analytics_events_event_type_idx` — `(event_type)`
- `site_analytics_events_visitor_id_idx` — `(visitor_id)`

## Production snapshot (2026-10-11)

| Metric | Value |
|--------|-------|
| Total rows | ~98k |
| `page_view` rows | ~98k |
| Table size | ~37 MB |

## Actual query filters (live presence)

```sql
WHERE event_type = 'page_view'
  AND created_at >= now() - interval '24 hours'
ORDER BY created_at DESC
LIMIT 5000;
```

Current planner (EXPLAIN, production): **Index Scan** on `site_analytics_events_created_at_desc_idx` with **`Filter: event_type = 'page_view'`**.

## Proposed composite index

Supports time-range scans scoped to page views (and optional SQL `DISTINCT ON` sort keys):

```sql
-- REVIEW ONLY — do not run on production until founder approves + IO budget check
CREATE INDEX CONCURRENTLY IF NOT EXISTS site_analytics_events_page_view_created_at_idx
  ON public.site_analytics_events (event_type, created_at DESC);
```

### Benefits

- Avoids filtering `event_type` as a post-index condition when the time range is selective.
- Better alignment for `DISTINCT ON (visitor_id) … ORDER BY visitor_id, created_at DESC` if Node dedupe moves to SQL.

### Risks

- **~37 MB table today** — index build is moderate but still needs **`CONCURRENTLY`** during recovery periods.
- Duplicate coverage with single-column indexes — monitor disk headroom before shipping.

## Locking

Use **`CREATE INDEX CONCURRENTLY`** only; no blocking `CREATE INDEX` on production during IO recovery.
