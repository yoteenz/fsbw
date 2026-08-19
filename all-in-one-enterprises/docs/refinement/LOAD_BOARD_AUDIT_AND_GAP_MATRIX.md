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
SHIPPER → AIO BROKERAGE → AIO OFFICE → AIO LOAD BOARD → APPROVED MOTOR CARRIERS
```

- No public broker profiles or competing broker storefronts.
- `shipper_rate` / margin = **internal only** — `carrierLoadProjection.ts` + `freightRoleViews.ts` enforce authorized views.
- Dispatch **External Freight Broker Contacts** = contact rolodex for dispatch clients (not platform broker accounts).
- Portal **AIO Freight** = staff-sent offers + assigned loads; **Load Board** = search published AIO freight.
- Office **Authorized Freight Source Import** = future provider adapter — normalize into AIO-owned loads, not a broker marketplace.

---

## Architecture addendum (2026-08-18)

**Authoritative rule:** Build AIO's brokerage operating system and private carrier distribution network — not "a marketplace where brokers find carriers."

| Concept | Implementation |
|---------|----------------|
| Single Load entity | `dispatch/dispatchTypes.ts` → `Load` |
| Role-specific views | `freight/freightRoleViews.ts` (staff / shipper / carrier) |
| Architecture canon | `freight/freightArchitecture.ts` |
| Financial separation | Shipper rate · Carrier rate · AIO gross margin — never interchangeable |
| Office control center | `/office/brokerage` — operational KPI dashboard + structured load workspace |
| Carrier distribution | `/portal/load-board` — carrier-safe projection only |

**Audit — no third-party broker marketplace found.** Existing "broker" naming mapped as:

| Found | Resolution |
|-------|------------|
| `carrierNetworkProfiles` | Approved **motor carriers** — KEEP |
| `shipperProfiles` | AIO shipper CRM — KEEP |
| Portal `/portal/brokerage` | Renamed **AIO Freight** — staff offers to carriers |
| Dispatch `brokerContacts` | Renamed **External Freight Broker Contacts** — dispatch rolodex, not AIO brokers |
| Office integrations load board | Clarified as **freight source import** adapter |
| `officeStaff` role `Broker` | AIO internal brokerage staff — KEEP |


1. ✅ Audit + gap matrix (this document)
2. ✅ `src/freight/*` — domain extensions, search, score, carrier projection
3. ✅ Carrier routes `/portal/load-board/*`
4. ✅ Office **Publish to AIO Load Board** on brokerage loads
5. ✅ Supabase migration for financial split (`20260819120000_aio_freight_load_board_production.sql`) — **committed; apply to AIO project when ref configured**
6. ✅ Map mode (real geo / city cache — no fake GPS)
7. ✅ FleetCare maintenance warnings (real odometer/ticket data only)
8. ✅ FreightRepository demo/supabase abstraction
9. ✅ In-app freight notifications + saved-search alert dedupe
10. ⏳ RLS live integration tests (requires AIO Supabase staging)
11. ⏳ Office publish wired to Supabase repository in backend mode

---

## Phase 2 — Production hardening (2026-08-19)

| Feature | Status |
|---------|--------|
| Financial split persistence | **MIGRATION READY** — `aio_brokerage_load_financials` + legacy status |
| Carrier offers persistence | **MIGRATION READY** — `aio_carrier_offers` + RLS |
| Publication persistence | **MIGRATION READY** — `aio_load_board_publications` |
| Saved / recent searches | **MIGRATION READY** + demo + supabase repository |
| Status history | **MIGRATION READY** — extended `aio_load_status_history` |
| FreightRepository | **COMPLETE** — demo + supabase adapters |
| Map mode | **COMPLETE** — stored/cached coordinates, last-known truck labels |
| FleetCare warnings | **COMPLETE** — threshold + ticket signals |
| In-app notifications | **COMPLETE** — dedupe + load-board event types |
| Saved-search alerts | **COMPLETE** — server match on publish (demo + supabase) |
| Carrier-safe projection | **COMPLETE** — unchanged contract |
| Demo isolation | **COMPLETE** — no production fallback on query failure |
| Mobile / desktop / ultrawide | **COMPLETE** — nav, context rail, card caps |

Docs: `docs/freight/FREIGHT_SUPABASE_PRODUCTION_MODEL.md`, `docs/freight/LOAD_BOARD_PRODUCTION_HARDENING_REPORT.md`

---

## Phase 3 — Final QA & feature closure (2026-08-19)

| Feature | Final status |
|---------|----------------|
| Shipper request → quote → load (demo) | **COMPLETE** |
| Office New Shipper Requests queue | **COMPLETE** |
| Financial separation / carrier privacy | **COMPLETE** — 35 automated tests |
| Load board search/filters/cards | **COMPLETE** |
| Recent + saved searches | **COMPLETE** |
| Saved search alerts | **COMPLETE** — alert toggle fixed in final QA |
| Load score + RPM math | **COMPLETE** |
| Map mode (city cache) | **COMPLETE** — DEFERRED external: live GPS |
| FleetCare warnings | **COMPLETE** |
| Carrier offers (submit) | **COMPLETE** |
| Counteroffer (load board office) | **DEFERRED — FUTURE ENHANCEMENT** |
| Instant book / duplicate booking | **DEFERRED — CONFIGURATION REQUIRED** |
| Sort UI | **DEFERRED — FUTURE ENHANCEMENT** (engine exists) |
| Full lifecycle UI on brokerage page | **DEFERRED — FUTURE ENHANCEMENT** |
| Exceptions / accessorials UI | **DEFERRED — FUTURE ENHANCEMENT** |
| POD/vault on brokerage detail | **DEFERRED — FUTURE ENHANCEMENT** |
| Factoring on brokerage detail | **COMPLETE — CONFIGURATION REQUIRED** (dispatch path intact) |
| Bookkeeping handoff from freight | **IMPLEMENTED — CONFIGURATION REQUIRED** (idempotent handoff; live apply blocked) |
| Supabase shipper/brokerage workflow | **IMPLEMENTED — CONFIGURATION REQUIRED** (shipper repo live; staff office demo; migrations not applied live) |
| Live RLS tests | **IMPLEMENTED — CONFIGURATION REQUIRED** (suite skips without AIO creds) |
| Freight i18n (en/es) | **DEFERRED — FUTURE ENHANCEMENT** |
| Ultrawide polish | **COMPLETE — CONFIGURATION REQUIRED** (acceptable baseline) |

**Production readiness (Phase 3 closure):** **READY FOR PRODUCTION CONFIGURATION** (see `AIO_FREIGHT_FEATURE_CLOSURE_REPORT.md`).

**Bugs fixed in final QA:** matched_carriers mis-publish; saved-search alert toggle.

Docs: `AIO_FREIGHT_FINAL_QA_MATRIX.md`, `AIO_FREIGHT_FEATURE_CLOSURE_REPORT.md`, `freightGoldenPath.test.ts`.

---

## Phase 4 — Production configuration (2026-08-19)

| Item | Status |
|------|--------|
| Shipper Supabase repository + UI wiring | **COMPLETE** (code) |
| RLS policies + shipper-safe views migration | **COMPLETE** (SQL file; live apply blocked) |
| Bookkeeping handoff (idempotent) | **COMPLETE** (code + demo tests) |
| Live RLS integration tests | **BLOCKED** — no AIO Supabase credentials |
| Staging golden path (real persistence) | **BLOCKED** |
| Production build | **PASS** |
| Demo isolation regression | **PASS** |

**Production readiness (Phase 4):** **NOT READY TO DEPLOY — BLOCKERS REMAIN** until AIO Supabase is connected, migrations applied, RLS verified, and staging golden path passes. See `AIO_FREIGHT_PRODUCTION_CONFIGURATION_REPORT.md`.

**Core feature connectivity:** Code path is **PRODUCTION-CONNECTED** in supabase mode; **live validation pending**.

Docs: `AIO_FREIGHT_PRODUCTION_CONFIGURATION_CHECKLIST.md`, `AIO_FREIGHT_PRODUCTION_CONFIGURATION_REPORT.md`, `src/shipper/*`, `20260819150000_aio_shipper_rls_bookkeeping_handoff.sql`.

---

## Key file map (post-sprint)

| Path | Role |
|------|------|
| `src/freight/freightTypes.ts` | Publication, search, saved search, lifecycle types |
| `src/freight/freightRoleViews.ts` | Staff / shipper / carrier authorized views from one Load |
| `src/freight/freightArchitecture.ts` | Operating model constants and disclosures |
| `src/freight/loadScoreEngine.ts` | Explainable 0–100 score |
| `src/freight/freightSearchService.ts` | Search, recent, saved |
| `src/freight/loadBoardActions.ts` | Publish, offer, save search |
| `src/freight/demoFreightRepository.ts` | Demo Store adapter |
| `src/freight/supabaseFreightRepository.ts` | Supabase production adapter |
| `src/freight/fleetcareLoadIntelligence.ts` | Maintenance warnings (real data only) |
| `src/freight/freightNotifications.ts` | In-app freight event delivery |
| `src/pages/portal/loadboard/*` | Carrier UI |
| `src/shipper/*` | Shipper Supabase/demo repository + portal hooks |
| `src/brokerage/brokerageBookkeepingHandoff.ts` | Idempotent freight → AIO internal books |
| `src/styles/aio-load-board.css` | Load board presentation |
