# AIO TMS Competitive Parity Audit

**Sprint:** AIO TMS Competitive Parity + Freight Autopilot + Settlements + Document-to-Payment  
**Date:** 2026-08-26  
**Competitive reference:** CoreVynix TMS / FreightFlow marketing materials (feature evidence only — no branding/UI copied)  
**Codebase root:** `all-in-one-enterprises/`  
**AIO Supabase:** `nnnljnhtmseagotvgxxt` (never `hyycomvcaqxxvyrfupes`)

---

## Executive Summary

AIO already operates as a **broader transportation operating system** than a conventional carrier TMS: shipper intake → AIO brokerage → private load board → dispatch → documents → factoring → bookkeeping handoff, with explicit financial domain separation.

This sprint added **Freight Autopilot** — an auditable, idempotent orchestration layer on the canonical `Load` entity — plus document completeness, billing packages, driver settlements, carrier settlement snapshots, IFTA-readiness architecture, pre-trip → FleetCare escalation, and DriverLink applicant promotion.

**CoreVynix parity headline:** AIO now matches or exceeds document-to-payment *workflow architecture* in demo mode. Live GPS/ELD, ACH payments, OCR, and external factor APIs remain honestly deferred.

---

## Classification Key

| Status | Meaning |
|--------|---------|
| **EXISTS** | Functioning end-to-end (demo or live) |
| **PARTIAL** | Meaningful architecture; workflow incomplete |
| **MISSING** | Not implemented |
| **SUPERIOR** | AIO exceeds competitor scope |
| **NOT APPLICABLE** | Outside AIO broker operating model |
| **DEFERRED_EXTERNAL** | Requires third-party provider |

---

## Competitive Feature Matrix (Before → After)

| Feature | CoreVynix advertises | AIO Before | AIO After | Status | Evidence |
|---------|---------------------|------------|-----------|--------|----------|
| Rate con upload | Yes | PARTIAL | PARTIAL+ | PARTIAL | `uploadLoadDocument` + office UI; autopilot tracks RC |
| BOL upload | Yes | PARTIAL | PARTIAL+ | PARTIAL | Portal/office upload; autopilot checklist |
| POD upload | Yes | PARTIAL | PARTIAL+ | PARTIAL | Same; blocks billing without POD |
| Dispatch sheet | Yes | MISSING | **EXISTS** | EXISTS (template) | `freight/templates/freightDocumentTemplates.ts` dispatch_sheet |
| Tracking to driver | Yes | PARTIAL | PARTIAL | PARTIAL | Manual status + notifications; no live GPS |
| Documents by load | Yes | PARTIAL | **EXISTS** | EXISTS | Vault + load doc IDs; billing package refs |
| Auto invoice | Yes | PARTIAL (manual) | **EXISTS** | EXISTS (demo) | Autopilot idempotent invoice on doc complete |
| Factoring package | Yes | PARTIAL | **EXISTS** | PARTIAL | Readiness rules + autopilot; no live factor API |
| Carrier settlement | Yes | PARTIAL | **EXISTS** | PARTIAL | `CarrierPayable` + `carrierSettlementEngine.ts` |
| Driver settlement | Yes | MISSING | **EXISTS** | EXISTS (demo) | `driverSettlementEngine.ts` |
| Mileage / payroll | Yes | PARTIAL | **EXISTS** | PARTIAL | Load miles + PER_MILE settlement model |
| IFTA | Yes | PARTIAL | **EXISTS** | PARTIAL | `fleet/ifta/iftaReadiness.ts` — no authoritative filing from estimates |
| Applicant → driver | Yes | PARTIAL | **EXISTS** | EXISTS | `promoteApplicantToDriverProfile` |
| Pre-trip | Yes | MISSING | **EXISTS** | EXISTS (demo) | `fleet/pretrip/*` → FleetCare escalation |
| Load management | Yes | EXISTS | EXISTS | **SUPERIOR** | Unified load across brokerage/dispatch/board |
| Trucks / trailers | Yes | PARTIAL | PARTIAL | PARTIAL | `PowerUnit`, `Trailer`, dispatch profiles |
| Settlements UI | Yes | PARTIAL | PARTIAL | PARTIAL | Engine + types; full office UI deferred |
| Forms / templates | Yes | PARTIAL | **EXISTS** | PARTIAL | Dispatch, factoring checklist, settlement templates |
| API connections | Yes | PARTIAL | PARTIAL | PARTIAL | `src/integrations/*` provider-neutral adapters |
| Email/SMS tracking | Yes | MISSING | DEFERRED_EXTERNAL | DEFERRED | Notification channels stubbed `_future` |
| Live GPS / ELD | Implied | MISSING | DEFERRED_EXTERNAL | DEFERRED | Adapter-ready; manual check-in only |
| OCR document AI | Implied | MISSING | DEFERRED_EXTERNAL | DEFERRED | No fake extraction |
| ACH / payments | Implied | MISSING | DEFERRED_EXTERNAL | DEFERRED | Payable statuses `_future` |

---

## Domain Inventory

### Freight Autopilot (NEW)

| Field | Value |
|-------|-------|
| Classification | **EXISTS** (demo orchestration) |
| Files | `src/freight/autopilot/*` |
| Events | LOAD_CREATED … LOAD_FINANCIALLY_CLOSED |
| Persistence | Demo store optional arrays |
| Tests | `freightAutopilot.test.ts` (9 tests) |
| UI | `FreightAutopilotPanel` on office dispatch load detail |

### Document Completeness Engine (NEW)

| Field | Value |
|-------|-------|
| Classification | **EXISTS** |
| Files | `documentCompleteness.ts`, `freightDocumentTypes.ts` |
| Behavior | RC/BOL/POD required; lumper when accessorial approved; staff override with audit |

### Document-to-Payment / Billing Package (NEW)

| Field | Value |
|-------|-------|
| Classification | **EXISTS** (demo) |
| Files | `billingPackageTypes.ts`, `freightAutopilotService.ts`, `freightAutopilotActions.ts` |
| Idempotency | One billing package per load; no duplicate invoices |

### Dispatch Package (NEW)

| Field | Value |
|-------|-------|
| Classification | **EXISTS** (driver-safe projection) |
| Files | `dispatchPackage.ts` |
| Privacy | No shipper rate or AIO margin in driver package |

### Driver Settlement Engine (NEW)

| Field | Value |
|-------|-------|
| Classification | **EXISTS** (demo) |
| Files | `src/settlements/driverSettlementEngine.ts` |
| Models | PER_MILE, PERCENTAGE, FLAT_LOAD, etc. |
| Payment execution | **DEFERRED_EXTERNAL** |

### Carrier Settlement / Payable (ENHANCED)

| Field | Value |
|-------|-------|
| Classification | **PARTIAL → EXISTS** (logic) |
| Files | `carrierSettlementEngine.ts`, existing `CarrierPayable` |
| Separation | Distinct from driver compensation |

### IFTA Readiness (NEW)

| Field | Value |
|-------|-------|
| Classification | **PARTIAL** |
| Files | `src/fleet/ifta/iftaReadiness.ts` |
| Rule | Estimated map/load miles ≠ verified jurisdiction mileage |

### Pre-Trip (NEW)

| Field | Value |
|-------|-------|
| Classification | **EXISTS** (demo) |
| Files | `src/fleet/pretrip/*` |
| Integration | Defects escalate to FleetCare tickets |

### DriverLink Promotion (ENHANCED)

| Field | Value |
|-------|-------|
| Classification | **PARTIAL → EXISTS** |
| Files | `promoteApplicantToDriverProfile` in `driverlinkActions.ts` |
| Rule | Hire action required — never auto-approve on upload alone |

### Location Directory (NEW types)

| Field | Value |
|-------|-------|
| Classification | **PARTIAL** |
| Files | `src/freight/locations/freightLocationDirectory.ts` |
| UI | Not wired — data model ready |

### Exception Center (NEW)

| Field | Value |
|-------|-------|
| Classification | **EXISTS** (demo) |
| Files | `freightExceptionTypes.ts`, autopilot service |
| Examples | MISSING_POD, BILLING_BLOCKED |

### Load Board + Brokerage (EXISTING — REUSED)

| Field | Value |
|-------|-------|
| Classification | **SUPERIOR** |
| Deep live validation | `.github/workflows/aio-supabase-production-validate.yml` |
| Tests | `freightGoldenPath.test.ts`, RLS, storage |

---

## AIO Differentiators (vs CoreVynix materials)

1. **AIO is the broker** — no third-party broker marketplace; private load board under AIO Office control.
2. **Financial domain separation** — shipper charge, carrier pay, AIO margin enforced in `brokerageRules.ts` + `freightRoleViews.ts`.
3. **Bookkeeping handoff** — idempotent brokerage → bookkeeping (`brokerageBookkeepingHandoff.ts`).
4. **Platform breadth** — Smart Intake, Road Ready, Vault, FleetCare, DriverLink, Client Portal, AIO Office in one OS.
5. **Freight Autopilot** — auditable automation with blocked states and exceptions, not silent UI state.

---

## Remaining Gaps (Honest)

| Gap | Severity | Notes |
|-----|----------|-------|
| Live GPS / ELD tracking | P2 | Adapter boundary only |
| SMS/email delivery confirmation | P3 | In-app notifications work |
| OCR / document extraction | P2 | No fake OCR |
| External factoring API | P2 | Manual submission states |
| ACH / carrier payout execution | P1 for full TMS parity | Statuses `_future` |
| Supabase persistence for autopilot | P2 | Demo-first this sprint |
| Full settlements office UI | P2 | Engine complete |
| Authoritative IFTA quarterly filing | P2 | Requires verified ELD/fuel feeds |

---

## Legitimate CoreVynix Evaluation

**Reason to purchase CoreVynix:** Only if AIO needed a standalone carrier-focused TMS immediately without investing in live ELD/GPS/payment integrations — **not recommended** given AIO's broker-first architecture and existing freight stack.

**API conversation warranted:** Optional, only to understand ELD/telematics adapter patterns — **not** for platform replacement.

---

## Test Evidence

- `src/freight/autopilot/freightAutopilot.test.ts` — 9 passing tests
- Covers: document completeness, billing idempotency, blocked billing without POD, driver settlement idempotency, IFTA honesty, pre-trip → FleetCare, carrier financial privacy, DriverLink promotion

---

## Production Readiness (Platform TMS function)

**NOT READY** for claiming full TMS parity with live GPS, payments, and Supabase-backed autopilot persistence.

**READY** for demo/prototype validation of document-to-payment automation and competitive workflow architecture.

---

*This document is updated at sprint completion. Re-run forensic audit after live Supabase wiring and ELD integration sprints.*
