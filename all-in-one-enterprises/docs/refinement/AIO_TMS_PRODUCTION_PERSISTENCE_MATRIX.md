# AIO TMS Production Persistence Matrix

**Sprint:** AIO TMS Production Persistence + Live Freight Autopilot  
**Forensic baseline commit:** `4b8032958` (competitive parity + demo autopilot)  
**Production target:** AIO Supabase `nnnljnhtmseagotvgxxt` (never `hyycomvcaqxxvyrfupes`)  
**Date:** 2026-08-26

---

## Classification Key

| Status | Meaning |
|--------|---------|
| **LIVE** | Durable Supabase table + RLS + idempotency; survives reload/multi-session |
| **DEMO** | DemoStore / localStorage / React ephemeral state only |
| **ADAPTER_READY** | Schema or service boundary exists; write path not fully wired |
| **DEFERRED_EXTERNAL** | Requires third-party provider (ELD, OCR, ACH, factor API) |
| **BLOCKED** | Cannot productionize without prerequisite migration or credential |

---

## Domain Records

### Canonical Load

| Field | Value |
|-------|-------|
| **DOMAIN** | Canonical Load |
| **CURRENT STORAGE (4b8032958)** | DemoStore `loads[]`; Supabase `aio_dispatch_loads` (existing freight migrations) |
| **TARGET STORAGE** | Supabase `aio_dispatch_loads` (extended doc refs) |
| **TABLE** | `aio_dispatch_loads` |
| **RLS REQUIRED** | Yes (existing policies) |
| **WRITE AUTHORITY** | AIO staff (internal user); carrier booking via existing offer flows |
| **READ AUTHORITY** | Org-scoped + role projections via `freightRoleViews` |
| **IDEMPOTENCY** | Load identity = UUID; no duplicate loads per business key |
| **AUDIT** | `aio_load_status_history` (existing) |
| **MIGRATION STATUS** | **LIVE** (extended columns in `20260826200000`) |

---

### Freight Autopilot (orchestration + audit)

| Field | Value |
|-------|-------|
| **DOMAIN** | Freight Autopilot state + audit |
| **CURRENT STORAGE** | DemoStore `freightAutopilotStates[]`, `freightAutopilotAuditLog[]` |
| **TARGET STORAGE** | Supabase event ledger + derived completeness/billing side effects |
| **TABLE** | `aio_freight_autopilot_events` |
| **RLS REQUIRED** | Yes — staff full; org read |
| **WRITE AUTHORITY** | Service role (server/CI); staff via authenticated API future |
| **READ AUTHORITY** | AIO staff; org members (carrier org) read-only on their loads |
| **IDEMPOTENCY** | `unique(idempotency_key)` |
| **AUDIT** | Event row = audit record (`occurred_at`, `processing_status`, `payload`) |
| **MIGRATION STATUS** | **LIVE** — `persistAutopilotOutcomeToSupabase` mirrors demo outcomes when `VITE_AIO_DATA_MODE=supabase` and load ID is UUID |

---

### Document Completeness

| Field | Value |
|-------|-------|
| **DOMAIN** | Document package completeness (RC/BOL/POD/lumper) |
| **CURRENT STORAGE** | Computed from Load fields in memory; demo override in `evaluateDocumentCompleteness` |
| **TARGET STORAGE** | Supabase snapshot + load doc ID columns |
| **TABLE** | `aio_freight_document_completeness`; load cols `rate_confirmation_document_id`, `bol_document_id`, `pod_document_id` |
| **RLS REQUIRED** | Yes |
| **WRITE AUTHORITY** | Autopilot persistence (service role) |
| **READ AUTHORITY** | Staff; org-scoped carrier read (status only, no shipper rate) |
| **IDEMPOTENCY** | Upsert on `load_id` PK |
| **AUDIT** | `computed_at`, override fields |
| **MIGRATION STATUS** | **LIVE** |

---

### Billing Package

| Field | Value |
|-------|-------|
| **DOMAIN** | BillingPackage |
| **CURRENT STORAGE** | DemoStore `billingPackages[]` |
| **TARGET STORAGE** | Supabase |
| **TABLE** | `aio_freight_billing_packages` |
| **RLS REQUIRED** | Yes — staff write; shipper org read (no carrier margin) |
| **WRITE AUTHORITY** | Autopilot when `ready_for_billing` |
| **READ AUTHORITY** | Staff; shipper org (receivable path) |
| **IDEMPOTENCY** | `unique(load_id)` + `unique(idempotency_key)` |
| **AUDIT** | Linked shipper invoice + status transitions |
| **MIGRATION STATUS** | **LIVE** |

---

### Invoice (shipper / freight)

| Field | Value |
|-------|-------|
| **DOMAIN** | Automatic invoice generation |
| **CURRENT STORAGE** | DemoStore `brokerageShipperInvoices[]`, `freightInvoices[]` |
| **TARGET STORAGE** | Existing authoritative tables (no duplicate invoice system) |
| **TABLE** | `aio_brokerage_shipper_invoices` (unique `load_id` pre-existing); factoring `freightInvoices` demo-only |
| **RLS REQUIRED** | Yes (existing shipper invoice RLS) |
| **WRITE AUTHORITY** | Autopilot via `ensureShipperInvoiceRow` |
| **READ AUTHORITY** | Shipper sees shipper invoice; carrier/driver do NOT see shipper amount |
| **IDEMPOTENCY** | `unique(load_id)` on shipper invoices |
| **AUDIT** | Invoice row + billing package link |
| **MIGRATION STATUS** | **LIVE** (brokerage path); asset-based freight invoice remains **DEMO** until factoring table wired |

---

### Driver Settlement

| Field | Value |
|-------|-------|
| **DOMAIN** | DriverSettlement + adjustments |
| **CURRENT STORAGE** | DemoStore `driverSettlements[]` |
| **TARGET STORAGE** | Supabase |
| **TABLE** | `aio_driver_settlements`, `aio_driver_settlement_adjustments` |
| **RLS REQUIRED** | Yes — staff write; org read (no cross-driver) |
| **WRITE AUTHORITY** | Autopilot on doc-complete + driver assigned |
| **READ AUTHORITY** | Staff; carrier org (own drivers); driver must NOT see shipper/margin |
| **IDEMPOTENCY** | `unique(idempotency_key)` where key = `driver-settlement:{loadId}:{driverId}` |
| **AUDIT** | Adjustment rows preserve type/amount/reason/source/createdBy/createdAt |
| **MIGRATION STATUS** | **LIVE** — APPROVED ≠ PAID enforced in schema check constraint |

---

### Carrier Settlement

| Field | Value |
|-------|-------|
| **DOMAIN** | Carrier payable / settlement snapshot |
| **CURRENT STORAGE** | DemoStore `carrierPayables[]` + `carrierSettlementEngine` projection |
| **TARGET STORAGE** | Supabase (separate from driver) |
| **TABLE** | `aio_carrier_settlements` |
| **RLS REQUIRED** | Yes — carrier org read own settlement only |
| **WRITE AUTHORITY** | Autopilot on brokerage doc-complete |
| **READ AUTHORITY** | Staff; carrier org (payable only — no shipper rate/margin) |
| **IDEMPOTENCY** | `unique(load_id)` + `unique(idempotency_key)` |
| **AUDIT** | Lifecycle status + approval/paid timestamps |
| **MIGRATION STATUS** | **LIVE** |

---

### Freight Exception (Exception Center)

| Field | Value |
|-------|-------|
| **DOMAIN** | FreightException |
| **CURRENT STORAGE** | DemoStore `freightExceptions[]` |
| **TARGET STORAGE** | Supabase |
| **TABLE** | `aio_freight_exceptions` |
| **RLS REQUIRED** | Yes |
| **WRITE AUTHORITY** | Autopilot; auto-resolve on POD upload |
| **READ AUTHORITY** | Staff; org members |
| **IDEMPOTENCY** | Partial unique index: one OPEN per `(load_id, exception_type)` |
| **AUDIT** | `resolved_at`, `resolved_by`, `resolution` |
| **MIGRATION STATUS** | **LIVE** — MISSING_POD auto-resolves when POD present |

---

### Dispatch Package

| Field | Value |
|-------|-------|
| **DOMAIN** | DispatchPackage |
| **CURRENT STORAGE** | Deterministic projection via `buildDispatchPackage()` — no persistence |
| **TARGET STORAGE** | Snapshot table for historical correctness |
| **TABLE** | `aio_dispatch_package_snapshots` |
| **RLS REQUIRED** | Yes — staff |
| **WRITE AUTHORITY** | Staff on dispatch issue (future wire) |
| **READ AUTHORITY** | Staff; driver-safe fields only in `package_json` |
| **IDEMPOTENCY** | `unique(load_id, version_number)` |
| **AUDIT** | `generated_at`, `generated_by` |
| **MIGRATION STATUS** | **ADAPTER_READY** — schema + RLS; snapshot write not yet called from UI |

---

### Pre-Trip Inspection + FleetCare

| Field | Value |
|-------|-------|
| **DOMAIN** | PreTripInspection → FleetCare defect |
| **CURRENT STORAGE** | DemoStore `pretripInspections[]`; FleetCare tickets in demo store |
| **TARGET STORAGE** | Supabase |
| **TABLE** | `aio_pretrip_inspections` (+ existing `aio_fleetcare_tickets`) |
| **RLS REQUIRED** | Yes |
| **WRITE AUTHORITY** | Driver/staff submit (future API) |
| **READ AUTHORITY** | Staff; org safety roles |
| **IDEMPOTENCY** | `unique(idempotency_key)` where not null |
| **AUDIT** | `fleetcare_ticket_id` linkage |
| **MIGRATION STATUS** | **ADAPTER_READY** — schema exists; demo `pretripService.ts` not yet mirrored to Supabase |

---

### IFTA Readiness

| Field | Value |
|-------|-------|
| **DOMAIN** | IFTA mileage readiness |
| **CURRENT STORAGE** | Pure function `iftaReadiness.ts` — no state |
| **TARGET STORAGE** | N/A (projection from loads + ELD when available) |
| **TABLE** | None required this sprint |
| **RLS REQUIRED** | N/A |
| **WRITE AUTHORITY** | N/A |
| **READ AUTHORITY** | Staff |
| **IDEMPOTENCY** | N/A |
| **AUDIT** | Honest labeling: estimated ≠ verified |
| **MIGRATION STATUS** | **DEFERRED_EXTERNAL** (ELD/GPS for authoritative jurisdiction miles) |

---

### Location Directory

| Field | Value |
|-------|-------|
| **DOMAIN** | FreightLocationDirectory |
| **CURRENT STORAGE** | DemoStore `freightLocations[]` (optional) |
| **TARGET STORAGE** | Supabase |
| **TABLE** | `aio_freight_locations` |
| **RLS REQUIRED** | Yes — org-scoped |
| **WRITE AUTHORITY** | Staff |
| **READ AUTHORITY** | Org members |
| **IDEMPOTENCY** | Standard UUID PK |
| **AUDIT** | `updated_at` |
| **MIGRATION STATUS** | **ADAPTER_READY** — schema; UI/directory write not wired |

---

### DriverLink Promotion

| Field | Value |
|-------|-------|
| **DOMAIN** | Applicant → DriverProfile |
| **CURRENT STORAGE** | DemoStore `driverApplications[]`, `driverProfiles[]` |
| **TARGET STORAGE** | Existing `aio_driverlink_*` tables (prior migration `20260817200000`) |
| **TABLE** | DriverLink schema (pre-existing) |
| **RLS REQUIRED** | Yes (existing) |
| **WRITE AUTHORITY** | Staff hire action only — NOT document upload |
| **READ AUTHORITY** | Staff; applicant self |
| **IDEMPOTENCY** | Application status gate prevents duplicate promotion |
| **AUDIT** | DriverLink activity log (demo); Supabase activity future |
| **MIGRATION STATUS** | **LIVE** (DriverLink tables) + **DEMO** (promotion orchestration in demo store until supabase hire API wired) |

---

### Bookkeeping Handoff

| Field | Value |
|-------|-------|
| **DOMAIN** | Brokerage → bookkeeping obligation |
| **CURRENT STORAGE** | DemoStore + Supabase (pre-existing) |
| **TARGET STORAGE** | `aio_brokerage_bookkeeping_handoffs` |
| **TABLE** | `aio_brokerage_bookkeeping_handoffs` (existing) |
| **RLS REQUIRED** | Yes (existing) |
| **WRITE AUTHORITY** | `handoffBrokerageLoadToBookkeeping` — idempotent by load+revision |
| **READ AUTHORITY** | AIO internal bookkeeping staff |
| **IDEMPOTENCY** | Unique handoff key per load revision |
| **AUDIT** | Handoff row + revision |
| **MIGRATION STATUS** | **LIVE** (pre-existing); invoked from autopilot actions |

---

## Stateful Objects Inventory (4b8032958 — proved, not assumed)

| Object | Storage before sprint | Storage after sprint |
|--------|----------------------|---------------------|
| `freightAutopilotStates` | DemoStore | Demo + `aio_freight_autopilot_events` (supabase mode) |
| `freightAutopilotAuditLog` | DemoStore | Demo + event ledger |
| `billingPackages` | DemoStore | Demo + `aio_freight_billing_packages` |
| `freightExceptions` | DemoStore | Demo + `aio_freight_exceptions` |
| `driverSettlements` | DemoStore | Demo + `aio_driver_settlements` |
| Carrier settlement projection | DemoStore `carrierPayables` | Demo + `aio_carrier_settlements` |
| Document completeness | In-memory from Load | `aio_freight_document_completeness` |
| Pre-trip inspections | DemoStore | Demo only (**ADAPTER_READY** table) |
| Dispatch package | Ephemeral function | **ADAPTER_READY** snapshot table |
| Freight locations | DemoStore optional | **ADAPTER_READY** table |
| IFTA readiness | Pure function | No persistence (by design) |

---

## Service Layer

| Layer | Path | Mode |
|-------|------|------|
| Demo orchestration | `freightAutopilotService.ts`, `freightAutopilotActions.ts` | DEMO |
| Supabase writes | `supabaseFreightAutopilotPersistence.ts` | LIVE (service role) |
| Production bridge | `freightAutopilotPersistence.ts` | LIVE when supabase mode + UUID load |
| UI panel read | `useFreightAutopilotPanel` + `supabaseFreightAutopilotRepository` | **LIVE** (supabase mode) / DEMO (demo mode) |

---

## Migration File

`supabase/migrations/20260826200000_aio_tms_freight_autopilot_production.sql`

**Apply mechanism:** Existing phone-triggerable workflow `.github/workflows/aio-supabase-production-validate.yml` → `supabase db push --linked` (applies full migration chain, not isolated DDL).

**Note:** AIO project must have prior freight migrations applied before this migration succeeds. Empty projects receive the full chain via CI `db push`.

---

*Matrix produced at Phase 0 forensics. Update after each persistence wiring sprint.*
