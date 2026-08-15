# All In One — Dispatch System

**Sprint:** 09 · **Last updated:** 2026-08-15

---

## Purpose

All In One Dispatch is the **operational system staff use to dispatch carrier clients** — not a load board, brokerage TMS, factoring ledger, or GPS tracker.

Lifecycle:

`Carrier → Truck → Dispatch Service → Load Opportunity → Load Review → Carrier Approval → Booked Load → Pickup → In Transit → Delivery → POD → Load Complete → Factoring Handoff → Performance History`

---

## Domain separation

| Division | Scope |
|----------|--------|
| Road Ready | Compliance, permits, registrations |
| **Dispatch** | Operational load assistance for enrolled carriers |
| Brokerage | Shipper–carrier arrangement (future) |
| Factoring | Receivables assistance — freight invoice + partner submission (Sprint 09) |
| Billing (Sprint 07) | All In One **service fees** only |

---

## Enrollment

- `dispatchEnrollments` per organization
- Statuses: `interested`, `onboarding`, `active`, `paused`, `suspended`, `ended`
- Agreement status: `not_required`, `pending`, `sent`, `accepted`, `expired`, `terminated`
- Entry: `/portal/dispatch` → service request via existing request system → Office review → onboarding → active

---

## Onboarding & preferences

- `/portal/dispatch/onboarding` reuses Road Ready + Fleet data (no duplicate business/truck entry)
- Operating preferences: regions, states, equipment, home base, **target** rate preferences (never guaranteed)
- Truck availability: `available`, `available_soon`, `booked`, `in_transit`, `unavailable`, `maintenance`, `home_time`, `paused`
- Next available: date + city/state per power unit

---

## Canonical load domain

See **`LOAD_DOMAIN.md`**. Single `Load` entity shared across dispatch, future brokerage/factoring.

- Identifier: `AIO-LD-YYYY-######`
- Money: integer minor units (Sprint 07)
- Offer status vs operational status are separate
- Documents: Vault (`rate_confirmation`, `bol`, `pod`) linked by `load_id`

---

## Carrier approval

- Dispatcher creates **opportunity** → sends offer → carrier **accepts or declines** (with optional structured decline reason)
- Staff do not silently accept on behalf of carrier in Sprint 08
- Booking requires accepted offer + rate confirmation review where configured

---

## Active load workflow

Operational statuses: `opportunity`, `booking_in_progress`, `booked`, `dispatched`, `en_route_pickup`, `at_pickup`, `loaded`, `in_transit`, `at_delivery`, `delivered`, `pod_needed`, `complete`, `cancelled`, `issue`

Manual status updates only — no GPS/ELD implied.

---

## Office surfaces

| Route | Purpose |
|-------|---------|
| `/office/dispatch` | Command Center — metrics, needs-load queue, board, today schedule |
| `/office/dispatch/loads` | Load list |
| `/office/dispatch/loads/new` | Create opportunity |
| `/office/dispatch/loads/:id` | Load ops — offer, book, status, docs, factoring handoff |
| `/office/dispatch/clients` | Dispatch clients |
| `/office/dispatch/clients/:id` | Client 360 |
| `/office/dispatch/brokers` | Broker directory (manual, unverified) |

---

## Customer surfaces

| Route | Purpose |
|-------|---------|
| `/portal/dispatch` | Mobile-first dispatch home |
| `/portal/dispatch/onboarding` | Operating profile |
| `/portal/dispatch/loads` | Active loads |
| `/portal/dispatch/loads/:id` | Load offer / active load / next action |
| `/portal/dispatch/history` | Completed loads + dispatch summary |

---

## Factoring handoff integration (Sprint 08 foundation · Sprint 09 workflow)

### Handoff status on load

`factoringHandoffStatus`: `not_ready`, `ready`, `submitted_future`, `not_factored`

Set by `updateFactoringHandoffStatus()` when load completes or documents attach. Ready when:

- `operationalStatus === 'complete'`
- POD linked
- Rate confirmation verified or `rateDetailsReviewed`

Sprint 08 does **not** fund or advance. Sprint 09 adds freight invoices + submissions — still **no direct funding**.

### Dispatch → factoring flow

```
Load Complete + handoff ready
  → FreightInvoice (HF-*) created from load
  → FactoringSubmission package (office specialist)
  → Manual submit to external provider
  → Provider-reported status/funding (staff entry)
```

### Surfaces

| Surface | Integration |
|---------|-------------|
| Office load detail | `LoadFactoringSection` — readiness, create invoice, link to factoring review |
| Portal load detail | Same component — carrier view of handoff + submission status |
| Office factoring | `/office/factoring/*` — command center, submission review |
| Portal factoring | `/portal/factoring/*` — enrollment, ready loads, history |

Notifications: `FACTORING_HANDOFF_READY` (dispatch) plus factoring category events on submission changes.

See **`FACTORING_SYSTEM.md`** and **`LOAD_DOMAIN.md`** (payment/factoring section).

## Dispatch billing (foundation)

Per-organization config: `percentage`, `flat_per_load`, `weekly`, `monthly`, `custom`

On load completion → `dispatchBillingEvents` (demo store). Distinct from **load gross**. See `FINANCIAL_BOUNDARIES.md`.

---

## Notifications & activity

Uses Sprint 06 Notification Engine — events include `LOAD_OFFERED`, `LOAD_BOOKED`, `POD_NEEDED`, `LOAD_COMPLETED`, `FACTORING_HANDOFF_READY`, etc.

Activity kinds in demo store audit log; customer timeline shows operational events only.

---

## Permissions (conceptual)

`dispatch.read`, `dispatch.loads.manage`, `dispatch.loads.offer`, `dispatch.clients.read`, `dispatch.billing.manage`, etc. — see `AUTHORIZATION_MATRIX.md`.

Organization-scoped: never authorize by `loadId` alone.

---

## Future adapters (not implemented)

- `LoadOpportunityProvider` — DAT, Truckstop, broker feeds
- `MappingProvider` — mileage, ETA
- `TrackingProvider` — ELD/GPS

---

## Code layout

```
src/all-in-one/dispatch/
  dispatchTypes.ts
  dispatchCalculations.ts
  dispatchRules.ts
  dispatchConfig.ts
src/all-in-one/demo/
  dispatchSeed.ts
  dispatchActions.ts
```

Demo store **v7** adds enrollments, truck profiles, loads, brokers, dispatch billing.
