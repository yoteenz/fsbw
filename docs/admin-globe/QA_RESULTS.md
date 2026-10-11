# QA results — globe live presence hardening

Sprint: **P0.FS.ADMIN.GLOBE-LIVE-PRESENCE-QUERY-AND-POLLING-HARDENING1**

## Automated

| Check | Result |
|-------|--------|
| Typecheck | **PASS** (`tsc --noEmit` via `npm run build`) |
| Production build | **PASS** (`npm run build`) |
| Unit tests | **PASS** `npx vitest run api/_lib/livePresenceQuery.test.ts` |

## Code-level verification

| Scenario | Expected | Implementation |
|----------|----------|----------------|
| Visible tab polling | Interval fires every 90s on OVERVIEW | `useAdminLivePresencePolling` + `LIVE_GLOBE_REFRESH_MS` |
| Hidden tab | No interval; abort in-flight | `visibilitychange` clears interval + abort |
| Leave OVERVIEW | Polling disabled | `enabled: activeTab === 'OVERVIEW'` |
| Unmount | Listeners cleared | hook `useEffect` cleanup |
| Overlapping requests | One in-flight | `inFlightRef` + AbortController |
| Error backoff | No tight loop | 5s–120s backoff |
| Server rate limit | 429 after burst | 40/min/admin |
| Cache stale | `meta.stale` + orange banner | `livePresenceCache` + revenue UI |
| Admin heartbeat skip | No POST on `/admin/*` | `shouldSendLivePresenceHeartbeat` |
| Globe visual regression | None intended | No edits to `AdminRevenueLiveGlobe` |

## Manual / GUI (requires admin session + Supabase)

Not executed in cloud agent session (no founder admin credentials on preview):

- Multi-tab behavior
- Network failure recovery in browser
- Live globe visual check on device

Recommend founder QA on mobile preview: **Admin → Revenue → Overview**, background tab 2+ minutes, return and confirm single fetch (network panel) not a burst.

## Authorization

- Non-admin: client clears globe data; API returns **403** without session.
