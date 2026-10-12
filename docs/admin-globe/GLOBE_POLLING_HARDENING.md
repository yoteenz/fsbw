# Globe polling hardening (Admin Revenue · Overview)

## Verified baseline (fsbw `master` before sprint)

| Item | Value | Source |
|------|-------|--------|
| Route | `/admin/revenue` · tab **OVERVIEW** | `src/pages/admin/revenue/page.tsx` |
| Live-presence poll | **90s** (`LIVE_GLOBE_REFRESH_MS`) | same |
| Page_view heartbeat | **60s** (`HEARTBEAT_MS`) | `src/utils/livePresenceHeartbeat.ts` |
| Realtime subscriptions | **0** (HTTP poll only) | no Supabase channel on globe |
| Order globe pillars | **localStorage** (`userOrders_*`, mock merge) | `buildRevenueOrdersList` |
| Live-presence query | up to **5000** rows, Node dedupe | `api/admin/live-presence.ts` → `livePresenceQuery.ts` |

## Client changes

- **`useAdminLivePresencePolling`** (`src/hooks/useAdminLivePresencePolling.ts`)
  - Pauses interval when `document.visibilityState === 'hidden'`
  - Debounced resume (**400ms**) on visible to avoid request storms
  - Single in-flight request; new poll aborts prior via `AbortController`
  - Exponential backoff on errors (**5s → 120s cap**); does not stack duplicate timers
  - Disabled when leaving **OVERVIEW** (`enabled: activeTab === 'OVERVIEW'`)
- **`src/pages/admin/revenue/page.tsx`**
  - Uses hook instead of raw `setInterval`
  - `getAdminLivePresence({ signal })` for cancellation
  - **Stale** banner (orange) vs **unavailable** (red); globe visuals unchanged
  - Re-fetch on `signInStateChanged` while Overview is open

## Globe experience preserved

No changes to `AdminRevenueLiveGlobe` textures, colors, rotation, or cluster interactions.
