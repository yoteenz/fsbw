# All In One — Insurance System

**Sprint:** 11 · **Last updated:** 2026-08-15

---

## Purpose

All In One **Insurance** is the customer and office workflow for **commercial trucking insurance assistance** — policy records, coverage requests, partner referrals, quote coordination, certificate (COI) requests, and renewal help.

All In One is **not** a licensed insurer, underwriter, or insurance agency. It does **not** bind coverage, collect premiums, or issue Certificates of Insurance. Default mode is **`assistance`** — coordination and record-keeping only.

Lifecycle (assistance / referral / partner):

```
Capability Gate → Customer Intake / Request → Internal Review → Partner Referral (manual)
  → Partner-Reported Quotes → Customer External Selection → Policy Setup (evidence-based)
  → Active Policy Record → COI Coordination → Renewal Help
```

**Default capability:** `demo` (`DEFAULT_INSURANCE_CAPABILITY` in `insuranceConfig.ts`). UI shows `DEMO_INSURANCE_LABEL` on all insurance surfaces.

**Disclosure (canonical):** `INSURANCE_DISCLOSURE` — quote and policy information comes from licensed professionals or customer-supplied records; All In One coordinates assistance only.

---

## What All In One is NOT

| Role | Sprint 11 status |
|------|------------------|
| Insurance carrier | **No** — fictional demo carriers only |
| Underwriter | **No** |
| Licensed producer / agency | **No** — partner directory is coordination, not binding authority |
| Premium collector | **No** — `isPremiumAllInOneServiceRevenue()` always `false` |
| COI issuer | **No** — customers cannot mark COI issued (`canCustomerMarkCoiIssued()` → `false`) |
| Policy verifier (customer) | **No** — customers cannot mark policy verified (`canCustomerMarkPolicyVerified()` → `false`) |

`direct_future` operating mode exists in types but **`DIRECT_INSURANCE_ENABLED = false`**.

---

## Operating modes & capability gate

### Operating modes (`InsuranceOperatingMode`)

| Mode | Meaning |
|------|---------|
| **`assistance`** | **Default.** All In One helps organize information, requests, and referrals — no binding. |
| **`referral`** | Structured handoff to licensed partner; manual coordination in Sprint 11. |
| **`partner`** | Deeper coordination with approved partner relationship (still not binding in demo). |
| **`direct_future`** | Reserved — disabled (`DIRECT_INSURANCE_ENABLED = false`). |

### Capability gate (`InsuranceCapability`)

| Capability | Behavior |
|------------|----------|
| **`demo`** | **Default.** Fictional data; all workflows for product review. |
| **`assistance`** | Production assistance workflows when business/legal gates pass. |
| **`partner`** | Partner-reported quotes and handoffs enabled per business policy. |
| **`direct_disabled`** | Direct insurance product surface blocked (always enforced in Sprint 11). |

Stored in demo store as `insuranceCapability` (`InsuranceCapabilityState`):

| Field | Purpose |
|-------|---------|
| `capability` | Current mode — default **`demo`** |
| `operatingMode` | Current operating model — default **`assistance`** |
| `readinessItems[]` | Activation checklist (see **`INSURANCE_ACTIVATION.md`**) |
| `updatedAt`, `updatedByStaffId` | Audit |

Office: `/office/insurance/readiness` — staff review checklist before flipping capability (production decision only).

---

## Core entities

### Policies (`InsurancePolicy`)

Customer-reported or staff-entered **records** — not proof of coverage until evidence and staff workflow support verification.

| Field | Notes |
|-------|--------|
| `organizationId` | Org-scoped |
| `carrierName`, `agencyName`, `policyType` | Display / coordination |
| `policyNumber` | **Masked for customers** — full number coordinator/admin only |
| `effectiveDate`, `expirationDate` | Drives derived status |
| `status` | `pending` · `active` · `expiring_soon` · `expired` · `cancelled` · `replaced` · `unknown` |
| `verificationState` | `customer_reported` · `document_supported` · `staff_reviewed` · `partner_confirmed_future` |
| `source` | `customer_intake` · `staff_entry` · `partner_reported` · `document_import` |
| `replacesPolicyId` / `replacedByPolicyId` | Replacement chain |
| `documentIds[]` | Vault references |

**Derived status:** `derivePolicyStatusFromDates()` — expiring within **45 days** (`EXPIRING_SOON_DAYS`) → `expiring_soon`; past expiration → `expired`. Cancelled/replaced explicit statuses preserved.

**Important:** `policySelectedEqualsActive()` → **`false`**. Customer selecting a quote externally does **not** activate a policy record.

### Policy coverages & vehicles

- **`InsurancePolicyCoverage`** — `CoverageType` (auto_liability, cargo, physical_damage, general_liability, bobtail, trailer_interchange, workers_comp, occupational_accident, umbrella, other), limits/deductibles in minor units.
- **`InsurancePolicyVehicle`** — links `powerUnitId` to policy for fleet schedule review.
- **`countVehicleMismatch()`** — flags when active unit count ≠ linked units (office + portal warning).

### Requests (`InsuranceRequest`)

Numbering: **`IR-YYYY-####`** (`insuranceCounters.request`).

| `requestType` | Use |
|---------------|-----|
| `new_coverage` | First-time or expanded coverage help |
| `renewal_help` | Approaching expiration |
| `add_vehicle` / `remove_vehicle` | Fleet schedule changes |
| `certificate_request` | COI coordination |
| `coverage_question` | General question |
| `policy_update` | Record correction |
| `partner_referral` | Explicit partner path |
| `other` | Catch-all |

**Status machine** (enforced by `canTransitionRequestStatus()`):

```
draft → submitted → information_needed ↔ internal_review
  → ready_for_referral → referred → partner_review
  → quote_options_reported → customer_review
  → policy_selected_external → policy_setup → completed
  │ declined / cancelled (terminal)
```

Terminal states: `completed`, `declined`, `cancelled` — no further transitions.

Demo actions: `submitInsuranceRequest()`, `recordPartnerReferral()`, `recordInsuranceQuote()`, `selectQuoteExternal()`, `activatePolicyFromEvidence()`.

### Partners (`InsurancePartner`)

Directory of **licensed professionals for coordination** — not All In One employees acting as producers.

| Field | Notes |
|-------|--------|
| `relationshipType` | `referral` · `coordination` · `existing_agent` |
| `status` | `prospective` · `approved_relationship` · `customer_existing_agent` · `inactive` |
| `commercialTrucking` | Filter for trucking-focused partners |
| `statesServed[]` | Optional |

Demo partner: **`ins-partner-demo`** — Demo Trucking Insurance Agency LLC (fictional).

### Partner handoffs (`InsurancePartnerHandoff`)

Manual referral workflow via `manualInsurancePartnerAdapter`:

- `createReferral()` returns `MANUAL-REF-{requestId prefix}` external reference
- Status: `draft` → `ready` → `sent_manual` → … → `closed`
- **No API** in Sprint 11 — `submitApplication`, `getQuoteStatus`, `getPolicyStatus`, `requestCertificate` are typed as `never` on adapter

### Quotes (`InsuranceQuoteRecord`)

**Reported options** from partner or document — not All In One offers.

| Field | Notes |
|-------|--------|
| `insuranceCarrierName` | Third-party carrier name |
| `premiumMinor` | **Not AIO service revenue** — display only |
| `source` | **Required attribution** — see below |
| `status` | `reported` · `available` · `customer_review` · `selected` · `declined` · `expired` · `withdrawn` |

**Quote source attribution (`InsuranceQuoteSource`):**

| Source | Meaning |
|--------|---------|
| `partner_reported` | Partner communicated quote to staff/customer |
| `document_supported` | Supported by uploaded policy/quote document |
| `staff_entered_from_partner` | Staff transcription from partner communication |
| `future_api` | Reserved — `isQuoteSourceLegitimate()` guards misuse in demo |

Office UI displays: *"Premium is NOT All In One service revenue."*

### Certificates of Insurance (`InsuranceCertificate`)

| Field | Notes |
|-------|--------|
| `certificateHolderId` | Broker, shipper, facility, other |
| `status` | `requested` → `processing` → `issued` \| `rejected` \| `expired` \| `cancelled` |
| `source` | Quote source enum or `customer_request` |
| `documentId` | Vault reference when issued |
| `loadReference` | Optional brokerage/dispatch context |

Customers **request** COIs; staff/partner/authorized source **issues**. Portal cannot self-issue.

### Issues (`InsuranceIssue`)

Operational flags: missing docs, expiring policy, vehicle coverage review, partner info needed, etc.

Statuses: `open` · `waiting_on_customer` · `waiting_on_partner` · `staff_review` · `resolved`.

---

## Road Ready integration

`syncInsuranceToRoadReady(orgId, store)` runs on policy changes and on demo store v11 migration for **client-b** and **client-c**.

| Target | Behavior |
|--------|----------|
| `roadReadyProfiles[].insurance` | Sets `hasInsurance`, `carrierName`, `expirationDate` when active policy passes `isPolicyActiveForRoadReady()` |
| `roadReadyItems` (`commercial_insurance`) | Maps derived policy status to item `status` + `verificationStatus` |

**`isPolicyActiveForRoadReady()`** — active, expiring_soon, or pending with `staff_reviewed` verification.

**Brokerage cross-check:** `getBrokerageCarrierInsurance()` on carrier network profile — read-only summary; `brokerageInsuranceReviewNeeded()` when expiring/expired or customer-reported only.

See **`ROAD_READY_SYSTEM.md`**, **`BROKERAGE_SYSTEM.md`**.

---

## Routes

### Customer portal (`/all-in-one/portal/insurance/*`)

| Route | Page | Purpose |
|-------|------|---------|
| `/portal/insurance` | Insurance Home | Metrics, current coverage, policy list, empty-state CTAs |
| `/portal/insurance/request` | Request / Add Existing | New help request or `?existing=1` policy intake |
| `/portal/insurance/requests/:requestId` | Request detail | Status, partner-reported quotes, external selection |
| `/portal/insurance/policies/:policyId` | Policy detail | Masked policy number, coverages, vehicles |
| `/portal/insurance/certificates` | COI list | |
| `/portal/insurance/certificates/new` | Request COI | |
| `/portal/insurance/renewals` | Renewal help | Expiring policies + renewal records |

Public catalog: `/all-in-one/services/insurance` — service detail (consultation pricing mode).

### Office Command Center (`/all-in-one/office/insurance/*`)

| Route | Purpose |
|-------|---------|
| `/office/insurance` | Metrics dashboard |
| `/office/insurance/requests` | All requests |
| `/office/insurance/requests/:requestId` | Referral, record quote, internal notes |
| `/office/insurance/policies` | Policy list + activate from evidence |
| `/office/insurance/partners` | Partner directory |
| `/office/insurance/certificates` | COI request queue |
| `/office/insurance/renewals` | Expiring policies |
| `/office/insurance/readiness` | Capability + checklist |

Default portal org: `portalClientId` (**client-a**). Switch org in demo store to exercise scenarios.

---

## Demo scenarios A–I (demo store v11)

| Scenario | Org | What to demo |
|----------|-----|--------------|
| **A — New help, no policy** | **client-a** (Summit Ridge) | Empty Insurance Center → submit `IR-2026-0001` (`new_coverage`, submitted). Portal default. |
| **B — Expiring + COI issued** | **client-b** (Heartland) | `pol-b-active` expiring in ~21 days; issued COI `cert-b-coi`; open issue `policy_expiring`. Road Ready synced. |
| **C — Replacement chain** | **client-c** (Pioneer Fleet) | `pol-c-expiring` + active `pol-c-active-new` replaces `pol-g-replaced`; 3/3 vehicles on active policy. Road Ready synced. |
| **D — Incomplete intake** | **client-d** (BlueLine) | `IR-2026-0002` `information_needed`; issue `vehicle_coverage_review` waiting on customer. |
| **E — COI processing (shipper)** | **client-e** (NorthStar) | `cert-i-processing` COI request; holder `ch-broker-demo`. Shipper org — not carrier Road Ready %. |
| **F — Partner review** | **client-f** (Delta Haul) | `IR-2026-0003` `partner_review`; handoff `ih-f-1` `sent_manual`. |
| **G — Quote comparison** | **client-g** (RidgeLine) | `IR-2026-0004` `customer_review`; two `partner_reported` quotes (`iqr-g-1`, `iqr-g-2`). |
| **H — Readiness gate** | Office `/readiness` | Capability `demo`, operating mode `assistance`; checklist all `missing` except `direct_disabled` **complete**. |
| **I — Road Ready sync** | **client-b**, **client-c** | On v10→v11 migration, `syncInsuranceToRoadReady` updates `commercial_insurance` item from active/expiring policy evidence. |

Demo partner: **`ins-partner-demo`**. Counters seed: 4 requests, 4 policies, 2 certificates.

---

## Notifications

Category: **`insurance`**. Event types (see `notificationTypes.ts`):

`INSURANCE_REQUEST_SUBMITTED`, `INSURANCE_INFORMATION_NEEDED`, `INSURANCE_REQUEST_READY_FOR_REFERRAL`, `INSURANCE_REFERRED`, `INSURANCE_PARTNER_UPDATE`, `INSURANCE_QUOTE_REPORTED`, `INSURANCE_POLICY_RECORDED`, `INSURANCE_POLICY_EXPIRING`, `INSURANCE_POLICY_EXPIRED`, `INSURANCE_POLICY_REPLACED`, `INSURANCE_COI_REQUESTED`, `INSURANCE_COI_ISSUED`, `INSURANCE_COI_ACTION_NEEDED`, `INSURANCE_RENEWAL_STARTED`, `INSURANCE_RENEWAL_COMPLETED`, `INSURANCE_ROAD_READY_IMPACT`

Demo implementation: `insuranceActions.ts` → `buildNotification()` with deep links to portal/office insurance routes.

See **`NOTIFICATION_SYSTEM.md`**.

---

## Vault & renewals

- Policy and COI records link **`documentIds[]`** / **`documentId`** to Vault — upload ≠ verification.
- Insurance renewal type in Renewal Center; portal shortcut at `/portal/insurance/renewals`.
- Expiring policies surface in Insurance Home metrics and office renewals queue.

See **`DOCUMENT_VAULT_SYSTEM.md`**, **`RENEWAL_SYSTEM.md`**.

---

## Billing boundary

All In One **service fees** for insurance assistance (when quoted) use Sprint 07 billing — **`consultation`** / **`manual_billing`** pricing mode on `commercial-auto-liability`.

**Insurance premiums** on `InsuranceQuoteRecord.premiumMinor` are **never** Sprint 07 invoice line items.

See **`FINANCIAL_BOUNDARIES.md`**, **`BILLING_SYSTEM.md`**.

---

## Code layout

```
src/all-in-one/insurance/
  insuranceTypes.ts
  insuranceConfig.ts
  insuranceRules.ts
  insuranceCalculations.ts
  insurancePartnerAdapter.ts
  insuranceCalculations.test.ts
src/all-in-one/demo/
  insuranceSeed.ts
  insuranceActions.ts
src/all-in-one/pages/portal/insurance/InsurancePortalPages.tsx
src/all-in-one/office/pages/InsurancePages.tsx
```

Demo store **v11** — migration v10→v11 adds full insurance graph. See **`DEBUG_ARCHITECTURE.md`**.

---

## Related docs

- **`INSURANCE_REGULATORY_BOUNDARIES.md`** — assistance vs referral; no legal conclusions
- **`INSURANCE_DATA_SECURITY.md`** — policy numbers, org isolation
- **`INSURANCE_ACTIVATION.md`** — software vs business readiness
- **`ROAD_READY_SYSTEM.md`** — profile sync
- **`FINANCIAL_BOUNDARIES.md`** — premium ≠ service revenue
