# All In One — Brokerage System

**Sprint:** 10 · **Last updated:** 2026-08-15

---

## Purpose

All In One Brokerage is the **shipper-facing freight arrangement workflow** — intake, quoting, canonical load conversion, carrier coverage, booking, and brokerage-side financial tracking. It is **not** carrier dispatch, **not** Sprint 07 service billing, and **not** a licensed production broker until separately activated.

Lifecycle:

`Capability Gate → Shipper Onboarding → Shipment Request → Quote → Accepted Quote → Canonical Load → Coverage → Carrier Offer → Rate Confirmation → Booked → In Transit → POD → Complete → Shipper Invoice / Carrier Payable`

**Default capability:** `demo` (`DEFAULT_BROKERAGE_CAPABILITY` in `brokerageConfig.ts`). UI shows `DEMO_BROKERAGE_LABEL` on shipper and carrier surfaces.

---

## Dispatch ≠ Brokerage (mandatory)

| Dimension | **Dispatch** (Sprint 08) | **Brokerage** (Sprint 10) |
|-----------|--------------------------|---------------------------|
| **Primary customer** | Enrolled **carrier** | **Shipper** (freight buyer) |
| **Relationship** | All In One assists carrier with load opportunities | All In One arranges freight between shipper and carrier |
| **Load `sourceType`** | `manual`, `carrier_provided`, … | **`brokerage`** |
| **Revenue model** | All In One **dispatch fee** (service revenue) | **Brokerage gross margin** (shipper charge − carrier pay) — separate domain |
| **Enrollment** | `dispatchEnrollments` | `shipperProfiles` + capability gate |
| **Entry portal** | `/portal/dispatch` | `/shipper` (shipper) · `/portal/brokerage` (carrier offers/payables) |
| **Office hub** | `/office/dispatch` | `/office/brokerage` |
| **Carrier role** | Client receiving dispatch service | Network carrier receiving **offers** on brokerage loads |
| **Factoring** | Carrier freight invoice (`HF-*`) after dispatch load complete | Carrier may have **payables** with factoring assignment flags on brokerage loads |

Do not merge dispatch queues, metrics, or billing with brokerage. Shared artifact: **canonical `Load`** entity only.

---

## Capability gate

`BrokerageCapability`: `disabled` | `demo` | `prelaunch` | `active`

Stored in demo store as `brokerageCapability` (`BrokerageCapabilityState`):

| Field | Purpose |
|-------|---------|
| `capability` | Current mode — **default `demo`** |
| `readinessItems[]` | Activation checklist (see **`BROKERAGE_ACTIVATION.md`**) |
| `updatedAt`, `updatedByStaffId` | Audit |

When `disabled`, brokerage routes should not expose production workflows. When `demo`, all amounts and companies are fictional.

Office: `/office/brokerage/readiness` — staff review checklist before flipping to `prelaunch` / `active` (production decision only; no legal conclusions in docs).

---

## Shipper onboarding

Entity: **`ShipperProfile`** per shipper organization.

| Field | Notes |
|-------|--------|
| `organizationId` | Links to demo client / future org |
| `legalName`, `dba`, contacts, addresses | Business identity |
| `preferredFreightTypes`, `preferredEquipment`, `typicalLanes` | Ops preferences |
| `status` | `lead` · `onboarding` · `active` · `paused` · `inactive` |
| `agreementStatus` | Same enum as dispatch — `accepted` required for production |

Entry:

1. Smart Intake goal `move_freight` → shipper branch
2. `/shipper/onboarding` — profile completion (demo)
3. Office `/office/brokerage/shippers` — specialist review

Shippers use **`/shipper/*`** portal path — not carrier Road Ready % or dispatch home.

Demo shippers: **NorthStar Manufacturing** (`client-e`, active) · **Lakeview Distribution Co.** (`shipper-demo-b`, onboarding).

---

## Shipment requests

Entity: **`ShipmentRequest`**

| Field | Notes |
|-------|--------|
| `requestNumber` | `SR-YYYY-####` |
| `shipperOrganizationId` | Owner |
| `status` | See status machine below |
| Lane, equipment, commodity, weight, contacts | Intake fields |
| `documentIds[]` | Vault references |
| `assignedBrokerStaffId` | Demo: `staff-7` |
| `convertedLoadId` | Set when quote converts |

### Status machine

`draft` → `submitted` → `under_review` → `quote_pending` → `quoted` → `accepted` → `converted_to_load`

Terminal: `declined`, `cancelled`

Enforced: `canTransitionShipmentRequest()` in `brokerageRules.ts`.

Shipper creates via `/shipper/shipments/new` → `createAndSubmitShipmentRequest()`.

---

## Quotes (shipper freight charge)

Entity: **`BrokerageFreightQuote`**

| Field | Notes |
|-------|--------|
| `quoteNumber` | `BQ-YYYY-####` |
| `freightChargeMinor` | **Shipper freight charge** — what shipper pays broker |
| `revisions[]` | Immutable revision history |
| `expiresAt` | Optional expiration |
| `convertedLoadId` | After acceptance |

Statuses: `draft` · `sent` · `viewed` · `accepted` · `declined` · `expired` · `revised` · `converted`

Office creates quote from request → shipper reviews at `/shipper/quotes/:id`.

**Visibility rule:** Shippers see **freight charge only**. Carrier pay and gross margin are **never** shown on shipper surfaces (`ShipperQuoteDetailPage` prototype note).

---

## Canonical load conversion

On quote acceptance, `acceptBrokerageQuote()`:

1. Sets quote `converted`, request `converted_to_load`
2. Creates **`Load`** with `sourceType: 'brokerage'`
3. Sets `brokerageShipmentRequestId`, `brokerageQuoteId`, `brokerageCoverageStatus: 'needs_coverage'`
4. Creates **`BrokerageLoadFinancials`** — `confirmedShipperChargeMinor` from quote; carrier pay confirmed later

Load number prefix in demo: `BR-LD-YYYY-####` (brokerage loads). Dispatch loads use `AIO-LD-*`.

See **`LOAD_DOMAIN.md`** — one load record; brokerage metadata on load row + `brokerageLoadFinancials[]`.

---

## Coverage

`brokerageCoverageStatus` on load:

| Status | Meaning |
|--------|---------|
| `not_applicable` | Non-brokerage load |
| `needs_coverage` | Awaiting carrier assignment |
| `carrier_contacted` | Outreach in progress |
| `rate_negotiation` | Negotiating (future UI depth) |
| `carrier_offered` | Offer sent, awaiting response |
| `carrier_accepted` | Carrier accepted offer |
| `booked` | Rate confirmation path complete / load booked |

`coverageHistory[]` records contacted, offer_sent, declined, accepted, fall_off, note events.

Office: `/office/brokerage/coverage` — needs-coverage queue.

---

## Carrier network

Entity: **`CarrierNetworkProfile`**

Internal directory — not the same as dispatch **client enrollment**. May link to carrier `organizationId` when carrier is also an All In One portal org.

| Field | Notes |
|-------|--------|
| `usdot`, `mcNumber` | Authority identifiers |
| `authorityVerification`, `insuranceVerification` | `self_reported` → `external_verified_future` |
| `w9Status` | `missing` · `received` · `verified` |
| `status` | `prospect` · `onboarding` · `approved_internal` · `active` · `hold` · `do_not_use` · `inactive` |

Demo carriers: Heartland Freight Co., Pioneer Fleet Services, External Demo Trucking LLC, BlueLine Transport.

Office: `/office/brokerage/carriers`, `/office/brokerage/carriers/:carrierId`.

---

## Carrier offers

Entity: **`CarrierOffer`**

| Field | Notes |
|-------|--------|
| `carrierPayMinor` | **Carrier pay** offer amount |
| `revisions[]` | Rate revision history |
| `status` | `draft` · `sent` · `viewed` · `accepted` · `declined` · `withdrawn` · `expired` · `revised` |

Carrier portal: `/portal/brokerage/offers` — accept/decline via `respondCarrierOffer()`.

On accept: updates load carrier fields, `confirmedCarrierPayMinor` on financials, `brokerageCoverageStatus: 'carrier_accepted'`.

**Visibility rule:** Carriers see **carrier pay only**. Shipper charge and margin hidden (`CarrierBrokerageOffersPage` note).

---

## Rate confirmations

Entity: **`BrokerageRateConfirmation`**

| Field | Notes |
|-------|--------|
| `templateLabel` | Demo: `DEVELOPMENT TEMPLATE — NOT FOR PRODUCTION USE` |
| `carrierPayMinor` | Locked amount on confirmation |
| `status` | `not_sent` · `sent` · `accepted` · `declined` · `expired` |

Vault integration: rate con document ids on load (same pattern as dispatch). Sprint 10 demo uses template label gate — not attorney-approved production PDF.

---

## Booking & operations

Brokerage loads reuse dispatch **operational status** axis: `opportunity` → … → `complete` / `cancelled` / `issue`.

Manual status updates in demo — no GPS/ELD. BOL/POD via Vault document ids on load.

Issues: **`BrokerageIssue`** — types include `carrier_fell_off`, `pod_issue`, `rate_dispute`, etc. Demo: open POD issue on `br-load-e`.

---

## Financial model (overview)

Separate entities — see **`BROKERAGE_FINANCIAL_DOMAIN.md`**:

| Entity | Numbering | Purpose |
|--------|-----------|---------|
| `BrokerageLoadFinancials` | per `loadId` | Shipper charge vs carrier pay vs margin |
| `BrokerageShipperInvoice` | `BSI-YYYY-####` | Bill **shipper** for freight |
| `CarrierPayable` | internal id | Owed to **carrier** — `paid_future` / `scheduled_future` only in demo |
| `BrokerageAccessorial` | per load, per side | Shipper or carrier accessorial workflow |

Sprint 10: **no live ACH/wire**, no shipper payment collection through Sprint 07 billing for freight charges.

Office finance: `/office/brokerage/finance`.

---

## Permissions (conceptual)

Visibility helpers in `brokerageRules.ts`:

| Role | Shipper charge | Carrier pay | Gross margin |
|------|----------------|-------------|--------------|
| `shipper` | ✓ | — | — |
| `carrier` | — | ✓ | — |
| `broker_ops` / `broker_finance` | ✓ | ✓ | ✓ |

See **`AUTHORIZATION_MATRIX.md`** and **`BROKERAGE_SECURITY.md`**.

---

## Demo scenarios (v9 seed)

| Load | Scenario |
|------|----------|
| `BR-LD-2026-0001` | Converted from quote — **needs coverage** |
| `BR-LD-2026-0002` | **Coverage** — declined offer + pending Heartland offer |
| `BR-LD-2026-0003` | Carrier **accepted** — rate con sent |
| `BR-LD-2026-0004` | **In transit**, booked |
| `BR-LD-2026-0005` | **POD needed** — open customer-visible issue |
| `BR-LD-2026-0006` | **Complete** — ready to bill |
| `BR-LD-2026-0007` | Complete — **shipper invoice issued**, carrier payable approved ($500 margin demo) |
| `BR-LD-2026-0008` | Complete — payable with **factoring assignment on file**, payment destination protected |

Shipment requests: under review (NorthStar) · quoted pending shipper (Lakeview) · converted (Detroit→Nashville).

---

## Routes

### Shipper portal (`/all-in-one/shipper/*`)

| Route | Purpose |
|-------|---------|
| `/shipper` | Home — requests, quotes metrics |
| `/shipper/onboarding` | Shipper profile onboarding |
| `/shipper/shipments` | Active shipments (brokerage loads) |
| `/shipper/shipments/new` | New shipment request |
| `/shipper/shipments/:loadId` | Shipment detail + status |
| `/shipper/quotes` | Freight quotes list |
| `/shipper/quotes/:quoteId` | Review / accept quote |
| `/shipper/billing` | Shipper invoices |
| `/shipper/billing/:invoiceId` | Invoice detail |

### Carrier portal — brokerage slice (`/all-in-one/portal/brokerage/*`)

For carriers in the **brokerage network** (distinct from `/portal/dispatch`):

| Route | Purpose |
|-------|---------|
| `/portal/brokerage` | Offers + active brokerage loads summary |
| `/portal/brokerage/offers` | Accept/decline carrier offers |
| `/portal/brokerage/loads/:loadId` | Assigned brokerage load |
| `/portal/brokerage/payments` | Carrier payables status |

### Office Command Center (`/all-in-one/office/brokerage/*`)

| Route | Purpose |
|-------|---------|
| `/office/brokerage` | Metrics — coverage, quotes, in transit, POD, ready to bill, issues |
| `/office/brokerage/readiness` | Capability + activation checklist |
| `/office/brokerage/shippers` | Shipper directory |
| `/office/brokerage/shippers/:shipperId` | Shipper 360 + requests |
| `/office/brokerage/loads` | Brokerage load list |
| `/office/brokerage/loads/:loadId` | Load ops — coverage, financials, invoice |
| `/office/brokerage/coverage` | Needs-coverage queue |
| `/office/brokerage/carriers` | Carrier network |
| `/office/brokerage/carriers/:carrierId` | Carrier profile |
| `/office/brokerage/finance` | Shipper invoices + carrier payables |

Public: `/all-in-one/services/brokerage` — service catalog detail.

---

## Notifications

Category: **`brokerage`**. Event types include:

`SHIPMENT_REQUEST_SUBMITTED`, `BROKERAGE_QUOTE_AVAILABLE`, `BROKERAGE_QUOTE_ACCEPTED`, `BROKERAGE_LOAD_NEEDS_COVERAGE`, `BROKERAGE_LOAD_BOOKED`, `BROKERAGE_POD_NEEDED`, `BROKERAGE_POD_RECEIVED`, `BROKERAGE_READY_TO_BILL`, `SHIPPER_INVOICE_ISSUED`

See **`NOTIFICATION_SYSTEM.md`**.

---

## Factoring cross-reference

Dispatch/factoring **`FreightInvoice` (`HF-*`)** remains the **carrier receivable** document when a carrier factors a broker debtor.

Brokerage **`CarrierPayable`** may set `factoringAssignmentOnFile` + `paymentDestinationProtected` — fraud-sensitive; see **`BROKERAGE_SECURITY.md`**.

Do not conflate `BSI-*` shipper invoices with `HF-*` freight invoices or Sprint 07 service invoices.

---

## Insurance cross-reference (Sprint 11)

Carrier network profiles display read-only insurance summary via `getBrokerageCarrierInsurance()`:

- Auto liability / cargo flags from `InsurancePolicyCoverage`
- `reviewNeeded` when policy expiring, expired, or customer-reported only
- **Not** a shipper COI — brokerage loads may still require separate certificate workflow

Warning copy: *"Insurance review needed — not a safety certification."*

Brokerage **`authorityVerification`** / **`insuranceVerification`** on carrier profiles remain separate self-report fields — insurance module does not auto-sync into those fields in Sprint 11.

See **`INSURANCE_SYSTEM.md`**, **`INSURANCE_REGULATORY_BOUNDARIES.md`**.

---

## Code layout

```
src/all-in-one/brokerage/
  brokerageTypes.ts
  brokerageConfig.ts
  brokerageRules.ts
  brokerageCalculations.ts
  brokerageRules.test.ts
  brokerageCalculations.test.ts
src/all-in-one/demo/
  brokerageSeed.ts
  brokerageActions.ts
src/all-in-one/pages/shipper/ShipperPortalPages.tsx
src/all-in-one/pages/portal/brokerage/BrokeragePortalPages.tsx
src/all-in-one/office/pages/BrokeragePages.tsx
```

Demo store **v9** — migration from v8 adds full brokerage entity graph. See **`DEBUG_ARCHITECTURE.md`**.

---

## Related docs

- **`BROKERAGE_FINANCIAL_DOMAIN.md`** — shipper charge vs carrier pay vs margin
- **`BROKERAGE_SECURITY.md`** — fraud, visibility, org isolation
- **`BROKERAGE_ACTIVATION.md`** — production readiness checklist
- **`DISPATCH_SYSTEM.md`** — dispatch distinction
- **`LOAD_DOMAIN.md`** — canonical load
- **`FINANCIAL_BOUNDARIES.md`** — revenue boundaries
