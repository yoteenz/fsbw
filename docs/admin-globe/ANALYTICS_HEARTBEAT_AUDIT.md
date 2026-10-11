# Analytics heartbeat audit

## Ingest path

- Client: **`startLivePresenceHeartbeat()`** in `src/App.tsx` (deferred 2.5s after load)
- Implementation: **`src/utils/livePresenceHeartbeat.ts`**
- API: **`POST /api/analytics/event`** with `eventType: page_view` + `meta.lat/lng` (requires geo)
- Storage: **`site_analytics_events`** (service role insert)

## Verified intervals

| Mechanism | Interval |
|-----------|----------|
| Heartbeat | **60s** (`HEARTBEAT_MS`) |
| Globe poll | **90s** (`LIVE_GLOBE_REFRESH_MS`) |

## Findings & mitigations (this sprint)

| Risk | Audit | Mitigation |
|------|-------|------------|
| Background tabs keep sending | Previously yes (interval always on) | Pause interval when hidden; debounced tick on visible |
| Admin routes generate heartbeats | Yes — admin browsing `/admin/*` wrote page_views | **Skip** heartbeat when `pathname.startsWith('/admin')` |
| Multiple tabs duplicate events | Same `visitor_id` in localStorage → multiple rows | Expected; server dedupes for globe; **3 page_views / visitor / minute** rate limit on ingest |
| Bots / automated clients | Public POST | Per-visitor rate limit on `page_view` (429) |
| Overlapping heartbeat ticks | Possible on slow network | `tickInFlight` guard |

## Not changed (founder approval required)

- Heartbeat not disabled on storefront
- Social click analytics unchanged
- 60s interval unchanged (only visibility + admin-path skip)
