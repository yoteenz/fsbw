# Performance comparison — live presence aggregation

## Paths compared

| Path | Description | Rows to client | Dedupe location |
|------|-------------|----------------|-----------------|
| **A (shipped)** | `ORDER BY created_at DESC LIMIT 5000` + Node Map dedupe | Up to 5000 raw rows over the wire (Supabase client) | Node (`dedupeVisitorsFromRows`) |
| **B (proposed)** | `DISTINCT ON (visitor_id) … ORDER BY visitor_id, created_at DESC` | One row per unique visitor in window | Postgres |

## Accuracy

- **A** returns latest geo per visitor **only if** that visitor’s latest heartbeat appears in the newest 5000 rows globally. Under heavy traffic, older visitors may drop off the cap — known limitation.
- **B** returns every visitor with at least one heartbeat in the window (no 5000 cap on raw events before dedupe), subject to query cost.

## Planner notes (production EXPLAIN, read-only)

**Path A** (current):

- Index Scan on `site_analytics_events_created_at_desc_idx`
- Filter `event_type = 'page_view'`

**Path B** (proposed SQL):

- Unique + Sort on `(visitor_id, created_at DESC)` after same index scan + filter (planner snapshot; re-run after composite index).

## Recommendation

- **Keep Path A** for this sprint — lower risk, matches existing behavior, 90s poll + server cache already cuts QPS.
- Revisit **Path B** after composite index + load test on staging when `page_view` volume grows enough that the 5000 cap skews `visitorsNow`.

## Network / latency

- Path A: payload scales with min(5000, events in 24h) × row width — dominant cost today.
- Path B: payload scales with unique visitors — often smaller under high repeat heartbeats, but SQL sort cost can exceed Node dedupe for large windows.

**Do not deploy a more expensive SQL plan solely to shrink payload** without measured planner + latency benchmarks on staging.
