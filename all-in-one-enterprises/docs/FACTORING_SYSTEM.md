# All In One — Factoring System

**Sprint:** 10 · **Last updated:** 2026-08-15

---

## Purpose

All In One Factoring is the **carrier receivables assistance workflow** — enrollment, document packaging, freight invoice creation, specialist review, and manual partner handoff. It helps carriers organize completed-load paperwork and track **provider-reported** funding status.

**Sprint 09 does not fund, advance, or collect receivables.** All funding amounts are **staff-entered reports** from external factoring providers, labeled demo/fictional in the UI.

---

## Service modes

Configured on `FactoringProfile.serviceMode`:

| Mode | Meaning | Sprint 09 |
|------|---------|-----------|
| `factoring_assistance` | All In One helps organize submissions; carrier may use any provider | **Active** |
| `partner_factoring` | Carrier works through an approved demo partner (`fp-demo-partner`) | **Active** |
| `direct_factoring_future` | All In One as direct factor | **Disabled** (`directFactoringEnabled = false`) |

`directFactoringEnabled` in `factoringConfig.ts` must remain `false` until legal, capital, and banking structure supports direct funding. UI may show the mode label for planning only — no direct funding flows.

---

## Enrollment & profiles

Each organization has at most one **`FactoringProfile`** (`factoringProfiles[]` in demo store).

### Enrollment statuses

`not_enrolled` → `interested` → `application_started` → `documents_needed` → `under_review` → `partner_review` → `approved` → `active` · `declined` · `paused` · `ended`

### Profile fields (conceptual)

| Field | Purpose |
|-------|---------|
| `serviceMode` | Assistance vs partner vs future direct |
| `providerId` | Selected partner or carrier-existing provider |
| `hasExistingFactor` / `existingProviderName` | Carrier already factors elsewhere |
| `advanceRateBasisPoints`, `reserveBasisPoints`, `factoringFeeBasisPoints` | **Estimated** previews only — `termVerification: self_reported` in demo |
| `recourseType` | `recourse` · `non_recourse` · `modified` · `unknown` |
| `primarySpecialistStaffId` | Assigned factoring specialist (demo: `staff-6`) |

### Entry flows

1. **Public** — `/all-in-one/services/factoring` → learn + request help
2. **Portal** — `/all-in-one/portal/factoring` → home, application, ready loads, history
3. **Office** — specialist activates profile during application review

`requestFactoringHelp()` creates or updates profile to `interested`. `saveFactoringApplication()` moves to `application_started`.

---

## Providers

`FactoringProvider` records describe **external** factoring companies — not All In One bank accounts.

| Field | Notes |
|-------|-------|
| `providerType` | `partner` · `external` · `demo` |
| `status` | `prospective` · `approved_partner` · `carrier_existing_provider` · `inactive` |
| `submissionMethod` | `manual_portal` · `email` · `api_future` · `other` |
| `integrationType` | `manual` (Sprint 09) · `api_future` |

Demo seed includes **Demo Factor Partners LLC** (approved partner) and **Summit Receivables Co.** (carrier-existing external).

Future integration: `FactoringProviderAdapter` in `factoringProviderAdapter.ts` — interface only, no live API.

---

## Dispatch handoff integration

Uses Sprint 08 **`factoringHandoffStatus`** on the canonical `Load` entity — no duplicate load rows.

| Status | Meaning |
|--------|---------|
| `not_ready` | Load incomplete or missing required docs |
| `ready` | Load complete + POD + rate confirmation rules satisfied |
| `submitted_future` | Legacy Sprint 03 quick-submit path (superseded by submission entity) |
| `not_factored` | Carrier opted out (`factoringNotFactoredReason`) |

Handoff rules (`dispatchRules.ts` → `isFactoringHandoffReady`):

- `operationalStatus === 'complete'`
- POD document linked
- Rate confirmation verified **or** `rateDetailsReviewed`

`LoadFactoringSection` renders on portal dispatch load detail and office dispatch load detail when load is complete or handoff is active.

---

## Readiness & packages

`evaluateLoadFactoringReadiness()` (`factoringRules.ts`) produces:

| State | Meaning |
|-------|---------|
| `not_ready` | Load not complete |
| `missing_documents` | Complete but missing POD or handoff requirements |
| `ready` | Eligible for freight invoice / submission package |
| `submitted` | Active submission exists (UI override) |
| `processing` / `resolved` | Reserved for future automation |

### Package checklist (`REVIEW_CHECKLIST_ITEMS`)

Load Complete · Rate Confirmation Present · POD Present · Freight Invoice Created · Amount Matches Confirmed Load · Broker/Debtor Identified · Provider Selected · Required Documents Present

`isPackageComplete()` gates submission creation. Amount mismatch triggers internal **`FactoringIssue`** (`invoice_amount_mismatch`) — does not block package creation.

---

## Freight invoices

**Not** All In One service invoices. See **`FREIGHT_RECEIVABLES_DOMAIN.md`**.

| Field | Notes |
|-------|-------|
| `invoiceNumber` | `HF-YYYY-####` from `factoringCounters.freightInvoice` |
| `loadId` | Canonical load reference |
| `debtorName` | From load broker name |
| `amountMinor` | Defaults to `load.confirmedGrossMinor` |
| Document refs | Rate con, BOL, POD vault ids copied at creation |

Statuses: `draft` · `issued` · `void` · `paid_future`

One non-void freight invoice per load. Created via `createFreightInvoiceFromLoad()` when load is complete with confirmed gross > 0.

Print view: `/all-in-one/portal/factoring/invoices/:invoiceId`

---

## Submissions & lifecycle

`FactoringSubmission` links **one freight invoice** to **one provider** for review.

### Status lifecycle

```
draft → documents_needed → ready → submitted → provider_review
  → additional_information_needed → approved → funding_pending → funded → closed
Branches: declined · disputed · cancelled
```

Transitions enforced by `canTransitionSubmissionStatus()`. **`funded` and `closed` lock financial edits** (`isSubmissionFundedLocked`).

### Reported funding (not actual funding)

When staff sets status to `funded`, optional fields:

- `reportedAdvanceMinor`
- `reportedReserveMinor`
- `reportedFeeMinor`

These are **provider-reported placeholders** for demo UX — not ledger postings.

### Duplicate protection

`findDuplicateSubmission()` blocks a second active submission for the same `freightInvoiceId`. Active = any status except `declined`, `cancelled`, `closed`.

### Timeline

Each submission maintains `timeline[]` with `visibility: customer | internal`. Customer portal shows customer-visible events only.

---

## Issues

`FactoringIssue` tracks blockers separate from submission status.

| Type | Example |
|------|---------|
| `missing_pod` | POD not on file |
| `missing_rate_confirmation` | Rate con missing |
| `invoice_amount_mismatch` | Invoice ≠ confirmed gross |
| `debtor_info_needed` | Broker/debtor incomplete |
| `provider_additional_info` | Provider requested docs |
| `duplicate_invoice` | Duplicate submission attempt |
| `submission_rejected` | Provider declined package |
| `funding_delay` | Reported delay |
| `rate_dispute` | Rate disagreement |
| `document_quality` | Illegible scan |
| `other` | Catch-all |

Issue statuses: `open` · `waiting_on_carrier` · `waiting_on_provider` · `under_review` · `resolved`

`customerActionRequired` drives portal "Action Needed" metrics and notifications.

---

## Debtor accounts

`DebtorAccount` — broker/debtor directory per organization (demo seed). Verification: `unverified` → `carrier_provided` → `staff_reviewed` → `provider_verified_future`.

Not a credit bureau integration in Sprint 09.

---

## Permissions (conceptual)

See **`AUTHORIZATION_MATRIX.md`** and **`FACTORING_SECURITY.md`**.

| Actor | Capabilities |
|-------|--------------|
| Carrier (portal) | Request help, complete application, view own submissions/issues, create freight invoice from ready load |
| Factoring specialist (office) | Review packages, create submissions, submit to provider (manual), update status, record reported funding, create issues |
| Dispatcher | Read handoff status on load detail; no submission financial edits |
| Support | Read-only factoring views |

All queries must filter by `organizationId`. Never authorize by submission id alone.

---

## Demo scenarios (clients A–G)

| Client | Scenario |
|--------|----------|
| **A** | Interested only — not yet active |
| **B** | Active partner factoring; ready loads in dispatch |
| **C** | Submission in `provider_review` |
| **D** | Submission needs carrier action (`additional_information_needed` + issue) |
| **E** | Approved, `funding_pending` |
| **F** | `funded` with reported advance/reserve |
| **G** | Uses existing external factor (Summit Receivables) |

Demo banner: **`DEMO · Fictional providers, amounts, and funding for review only`**

---

## Routes

Legacy `/debug/all-in-one/*` redirects to `/all-in-one/*`.

### Customer portal

| Path | Purpose |
|------|---------|
| `/all-in-one/portal/factoring` | Factoring home + metrics |
| `/all-in-one/portal/factoring/application` | Enrollment application |
| `/all-in-one/portal/factoring/ready` | Loads ready to package |
| `/all-in-one/portal/factoring/submissions/:submissionId` | Submission detail + timeline |
| `/all-in-one/portal/factoring/history` | Past submissions |
| `/all-in-one/portal/factoring/invoices/:invoiceId` | Freight invoice print view |
| `/all-in-one/portal/dispatch/loads/:id` | Load detail + `LoadFactoringSection` |

### Office

| Path | Purpose |
|------|---------|
| `/all-in-one/office/factoring` | Command Center + pipeline metrics |
| `/all-in-one/office/factoring/submissions` | Submissions list |
| `/all-in-one/office/factoring/submissions/:submissionId` | Review checklist, status actions, reported funding |
| `/all-in-one/office/factoring/clients` | Enrolled carriers |
| `/all-in-one/office/factoring/clients/:clientId` | Profile + submission history |
| `/all-in-one/office/factoring/providers` | Provider directory |
| `/all-in-one/office/dispatch/loads/:id` | Dispatch ops + factoring handoff section |

### Public

| Path | Purpose |
|------|---------|
| `/all-in-one/services/factoring` | Marketing / service overview |

---

## Code layout

```
src/all-in-one/factoring/
  factoringTypes.ts          # Domain types
  factoringRules.ts          # Readiness, duplicates, status transitions
  factoringCalculations.ts   # Estimated advance/reserve/fee (labeled ESTIMATED)
  factoringConfig.ts         # Labels, pipeline columns, directFactoringEnabled
  factoringProviderAdapter.ts # Future partner API interface
  factoringRules.test.ts
  factoringCalculations.test.ts
src/all-in-one/demo/
  factoringSeed.ts           # Demo providers, profiles, submissions
  factoringActions.ts        # Demo mutations + notifications
src/all-in-one/components/factoring/
  LoadFactoringSection.tsx
src/all-in-one/pages/portal/factoring/
  FactoringPortalPages.tsx
  FreightInvoicePrintPage.tsx
src/all-in-one/office/pages/
  FactoringPages.tsx
```

Demo store **v8** — migration from v7 adds factoring entities. See **`DEBUG_ARCHITECTURE.md`**.

---

## Brokerage cross-reference (Sprint 10)

Factoring remains **carrier receivables assistance**. Brokerage adds separate **shipper billing** and **carrier payables**:

| Document | Sprint | Purpose |
|----------|--------|---------|
| `FreightInvoice` (`HF-*`) | 09 | Carrier bills **broker/debtor** — factoring submission input |
| `BrokerageShipperInvoice` (`BSI-*`) | 10 | Broker bills **shipper** — not factored through Sprint 09 workflow |
| `CarrierPayable` | 10 | Broker owes carrier — may set `factoringAssignmentOnFile` |

When All In One acts as broker (future `active` capability), the **debtor** on carrier `HF-*` invoices may be All In One — factoring handoff rules still apply on **`confirmedGrossMinor`** for the carrier haul.

**Dispatch ≠ Brokerage:** Factoring handoff on load detail applies to **carrier** completed loads (dispatch or brokerage-assigned carrier). Shipper invoices (`BSI-*`) do not create factoring submissions in Sprint 10.

See **`BROKERAGE_FINANCIAL_DOMAIN.md`** and **`BROKERAGE_SYSTEM.md`**.

---

## Related documentation

- **`FREIGHT_RECEIVABLES_DOMAIN.md`** — Load vs freight invoice vs submission vs funding vs service invoice
- **`FACTORING_SECURITY.md`** — Sensitive data boundaries
- **`DIRECT_FACTORING_FUTURE.md`** — Unimplemented direct-factoring checklist
- **`FINANCIAL_BOUNDARIES.md`** — Revenue vs receivables
- **`DISPATCH_SYSTEM.md`** — Handoff from completed loads
- **`LOAD_DOMAIN.md`** — Canonical load + handoff field
