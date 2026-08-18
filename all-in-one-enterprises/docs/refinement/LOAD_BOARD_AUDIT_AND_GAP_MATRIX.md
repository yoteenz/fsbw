# AIO Load Board — Codebase Audit & Feature Gap Matrix

**Sprint:** Load Board System Audit + Brokerage Intelligence Upgrade  
**Date:** 2026-08-18  
**Principle:** AIO is **the broker** — carrier-facing distribution of AIO-owned freight, not a third-party broker marketplace.

---

## Phase 0 — What exists today

### Canonical domain

| Asset | Location | Notes |
|-------|----------|-------|
| **`Load`** (single entity) | `src/dispatch/dispatchTypes.ts` | Shared by dispatch, brokerage, factoring |
| Brokerage sidecar | `src/brokerage/brokerageTypes.ts` | `BrokerageLoadFinancials` separates shipper charge vs carrier pay |
| RPM / deadhead math | `src/dispatch/dispatchCalculations.ts` | Loaded RPM + all-miles RPM (true immediate miles) |
| Margin math | `src/brokerage/brokerageCalculations.ts` | Internal brokerage gross margin |
| Rules | `src/dispatch/dispatchRules.ts`, `brokerageRules.ts` | Status transitions, factoring readiness |
| Demo store v25 | `src/demo/demoStore.ts` | **Runtime source of truth** for loads |

### Routes (existing)

| Surface | Paths | Purpose |
|---------|-------|---------|
| **Office dispatch** | `/office/dispatch/*` | Internal TMS board, create load, clients |
| **Office brokerage** | `/office/brokerage/*` | Shipper CRM, coverage, carrier network, finance |
| **Office load board integration** | `/office/integrations/load-board` | **Demo import only** — 2 static external candidates |
| **Carrier dispatch** | `/portal/dispatch/*` | Managed dispatch enrollment + assigned loads |
| **Carrier brokerage** | `/portal/brokerage/*` | Respond to **staff-sent** carrier offers |
| **Shipper** | `/shipper/*` | Request freight, quotes, shipments |
| **Carrier load board (NEW)** | `/portal/load-board/*` | **This sprint** — search AIO-published freight |

### Supabase (AIO dedicated project — not FS Website)

| Table | Status |
|-------|--------|
| `aio_dispatch_loads` | Stub — single `rate` column, not wired to app |
| `aio_brokerage_quotes/shipments` | Legacy stub |
| `aio_load_stops`, `aio_load_status_history` | Extensions |
| Planned (`FUTURE_DATA_MODEL.md`) | `aio_carrier_offers`, `aio_brokerage_load_financials`, saved searches — **not migrated** |

### Integrations

| System | Load relationship |
|--------|-------------------|
| **Factoring** | Strong — `LoadFactoringSection`, POD + rate con gates |
| **Vault** | Medium — BOL/POD/rate con document IDs on `Load` |
| **FleetCare** | No load assignment — maintenance only |
| **DriverLink** | Job matching — not freight loads |
| **External load boards** | `NOT_CONFIGURED` — demo adapter only, no scraping |

---

## Phase 1 — Feature Gap Matrix

| Feature | Status | Action |
|---------|--------|--------|
| Load search (carrier-facing) | **MISSING — BUILD** | `/portal/load-board` search + filters |
| Origin / destination | **PARTIAL** | On `Load`; search UI **BUILD** |
| Origin / destination deadhead | **PARTIAL** | Field + calc exist; search filter **BUILD** |
| Equipment type | **EXISTS — KEEP** | On `Load.equipmentType` |
| Trailer length | **MISSING — BUILD** | `LoadBoardPublication.trailerLengthFt` |
| Weight | **PARTIAL** | `Load.weight` string; filter **BUILD** |
| Full / partial | **MISSING — BUILD** | Publication metadata |
| Pickup / delivery window | **EXISTS — KEEP** | On `Load` |
| Maximum post age | **MISSING — BUILD** | From `publishedAt` |
| Advanced filtering | **MISSING — BUILD** | Hazmat, team, etc. — schema + honest disabled when no data |
| Sorting | **MISSING — BUILD** | Rate, RPM, age, match score |
| Recent searches | **MISSING — BUILD** | Demo store + UI tab |
| Saved searches | **MISSING — BUILD** | Demo store + alert-ready schema |
| Load alerts | **PARTIAL** | Notification types exist; delivery **later** |
| Load detail | **EXISTS — UPGRADE** | Dispatch/brokerage detail → carrier-safe projection |
| Load cards | **MISSING — BUILD** | Load board results cards |
| Map mode | **MISSING — BUILD** | Placeholder — no fake GPS |
| My Loads (carrier board) | **PARTIAL** | Dispatch `/portal/dispatch/loads` — extend for board bookings |
| My Trucks / Fleet | **PARTIAL** | `TruckDispatchProfile` on dispatch home — wire to search |
| Driver assignment | **EXISTS — KEEP** | Dispatch load fields |
| Dispatch assignment | **EXISTS — KEEP** | Office dispatch |
| Carrier offer | **EXISTS — UPGRADE** | Staff offers + **carrier-initiated** board offers |
| Load booking | **PARTIAL** | Dispatch accept; instant book **BUILD** (configurable) |
| Offer negotiation | **EXISTS — KEEP** | Brokerage carrier offers |
| Load status tracking | **EXISTS — UPGRADE** | Extend lifecycle doc + audit |
| POD upload | **EXISTS — KEEP** | Dispatch + vault |
| Rate confirmation | **EXISTS — KEEP** | Brokerage + dispatch |
| Carrier / shipper documents | **EXISTS — KEEP** | Vault taxonomy |
| Brokerage records | **EXISTS — KEEP** | Office brokerage |
| Factoring | **EXISTS — KEEP** | Connect via existing handoff |
| Payment tracking | **PARTIAL** | Payables demo |
| Bookkeeping | **PARTIAL** | Autopilot separate ledger |
| Profit calculations | **PARTIAL** | Margin internal; carrier estimates **BUILD** |
| Maintenance integration | **PARTIAL** | FleetCare warnings **BUILD** (when data exists) |
| Carrier verification | **EXISTS — KEEP** | `VerificationLevel` — no fake FMCSA |
| Driver credentials | **EXISTS — KEEP** | DriverLink |
| Notifications | **PARTIAL** | Event types; in-app baseline |
| Demo mode | **EXISTS — KEEP** | Isolated demo store |
| Mobile / desktop / ultrawide | **MISSING — BUILD** | Load board layout + context rails |

| Deprecated / conflicting | Action |
|--------------------------|--------|
| Third-party broker marketplace model | **Do not build** |
| Office integration demo as “the load board” | **Keep** as import path; not carrier UI |
| Single `rate` Supabase column | **Do not use** until financial split migrated |

---

## Business model (locked)

```
SHIPPER → AIO BROKERAGE → AIO LOAD BOARD → APPROVED MOTOR CARRIERS
```

- No public broker profiles or competing broker storefronts.
- `shipper_rate` / margin = **internal only** — `carrierLoadProjection.ts` strips for carrier API/views.

---

## Implementation priority (this sprint batch)

1. ✅ Audit + gap matrix (this document)
2. ✅ `src/freight/*` — domain extensions, search, score, carrier projection
3. ✅ Carrier routes `/portal/load-board/*`
4. ✅ Office **Publish to AIO Load Board** on brokerage loads
5. ⏳ Supabase migration for financial split (deferred — demo store first)
6. ⏳ Map / profit intelligence / FleetCare warnings (honest placeholders)

---

## Key file map (post-sprint)

| Path | Role |
|------|------|
| `src/freight/freightTypes.ts` | Publication, search, saved search, lifecycle types |
| `src/freight/carrierLoadProjection.ts` | Carrier-safe DTO — no shipper rate / margin |
| `src/freight/loadScoreEngine.ts` | Explainable 0–100 score |
| `src/freight/freightSearchService.ts` | Search, recent, saved |
| `src/freight/loadBoardActions.ts` | Publish, offer, save search |
| `src/pages/portal/loadboard/*` | Carrier UI |
| `src/styles/aio-load-board.css` | Load board presentation |
