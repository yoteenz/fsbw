# Load Board Production Hardening Report

**Sprint:** Phase 2 — Supabase persistence, Map, FleetCare, Notifications  
**Date:** 2026-08-19  
**Spatial Architecture Review:** SKIPPED — extending existing carrier load board surfaces; no new departments.

---

## Delivered

### Database (additive migration)

- File: `supabase/migrations/20260819120000_aio_freight_load_board_production.sql`
- Financial split table + revision history
- Carrier offers, publications, saved/recent searches, alert dedupe
- Carrier-safe view + staff financial view
- RLS policies (financials staff-only; offers org-scoped)
- **Migration status:** committed to repo; apply to **AIO dedicated Supabase** when `AIO_SUPABASE_PROJECT_REF` is configured (not applied from this cloud session)

### Repository abstraction

- `freightRepositoryTypes.ts` — `FreightRepository` interface
- `demoFreightRepository.ts` — Demo Store adapter (unchanged domain)
- `supabaseFreightRepository.ts` — Production Supabase adapter
- `freightRepository.ts` + `useFreightRepository.ts` — factory/hook
- `loadBoardSessionFilters.ts` — active filter session bridge (demo + supabase)

### Load Board UI

- Pages refactored to repository (controlled error on Supabase failure — **no demo fallback**)
- Map mode: `LoadMapPanel.tsx` — real city/stored coordinates, **LAST KNOWN LOCATION** truck labels
- FleetCare warnings on load detail when truck selected + real odometer/PM data
- Ultrawide context rail + card max-width caps in CSS
- Maintenance attention badges on cards

### Notifications

- Extended `notificationTypes.ts` with load-board event types
- `freightNotifications.ts` — in-app delivery, dedupe keys
- Saved-search alerts on publish (`freightSavedSearchAlerts.ts`)

### FleetCare intelligence

- `fleetcareLoadIntelligence.ts` — odometer threshold, open urgent tickets, out-of-service/hold
- Optional truck fields on `TruckDispatchProfile` (odometer, last known location)
- Demo seed: Unit 01 near PM threshold for QA

### Tests

- `freightProduction.test.ts` — carrier-safe projection, geocoding, FleetCare warning, dedupe, repository smoke
- Existing `freight.test.ts` — unchanged pass (11 tests)

---

## Demo / production isolation

| Mode | Data source | Mutations |
|------|-------------|-----------|
| Demo | Demo Store v25 | Local only |
| Supabase | AIO project tables | RLS-enforced; auth required |

---

## Remaining gaps

1. **Apply migration** to AIO Supabase staging/production when project ref available
2. **RLS integration tests** against live project (`test:rls-staging` script)
3. **Office publish workflow** — still calls demo `publishLoadToBoard` directly; wire `FreightRepository.publishLoad` in supabase office mode
4. **Email/SMS/push** notification channels — types exist; not configured
5. **Paid geocoding provider** — not integrated; city cache + stored lat/lng only
6. **Bookkeeping/factoring regression** — manual QA recommended after migration apply + first production loads

---

## Files touched (summary)

- `src/freight/*` — repository, notifications, geocoding, FleetCare, mappers, tests
- `src/pages/portal/loadboard/*` — repository wiring, map panel
- `src/styles/aio-load-board.css` — map, error, ultrawide
- `src/dispatch/dispatchTypes.ts` — optional truck maintenance/location fields
- `src/notifications/notificationTypes.ts` — freight events
- `docs/freight/*` — this report + production model
