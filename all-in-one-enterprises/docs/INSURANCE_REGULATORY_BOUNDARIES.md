# All In One — Insurance Regulatory Boundaries

**Sprint:** 11 · **Last updated:** 2026-08-15

---

## Purpose

This document defines **product and documentation boundaries** for All In One Insurance. It is **not legal advice**. Business counsel must approve production operating models, disclosures, and partner arrangements before capability moves beyond **`demo`**.

---

## All In One's role

All In One Enterprises Inc. provides **business assistance software** for trucking operators — organizing information, coordinating service requests, and facilitating introductions to licensed professionals.

All In One is **not**:

- An insurance carrier
- An underwriter
- A licensed insurance producer or agency (unless and until separately licensed and documented outside this sprint)
- A substitute for a customer's agent, broker, or carrier

**Default operating mode:** **`assistance`** (`DEFAULT_INSURANCE_OPERATING_MODE`).

---

## Operating mode boundaries

| Mode | What All In One may do (product intent) | What All In One must NOT do |
|------|----------------------------------------|----------------------------|
| **`assistance`** | Help customer organize coverage needs, store customer-supplied policy info, prepare referral packages, track request status | Bind coverage; recommend specific coverage limits as legal advice; represent that AIO verified coverage without evidence workflow |
| **`referral`** | Hand off structured information to a **licensed** partner; record manual referral status | Act as producer of record; collect premium; issue COI |
| **`partner`** | Coordinate with approved partner; display **partner-reported** quotes with source attribution | Present quotes as All In One offers; omit quote source; auto-bind on selection |
| **`direct_future`** | **Disabled** (`DIRECT_INSURANCE_ENABLED = false`) | Any direct quoting, binding, or premium collection through AIO |

Capability gate defaults: **`demo`** + **`direct_disabled`** readiness item marked **complete**.

---

## No legal conclusions

The product and docs must **never**:

- State that a customer is "legally compliant" or "FMCSA compliant" based on insurance records alone
- Treat `customer_reported` or `document_supported` policy records as equivalent to a carrier's binding policy without licensed confirmation where required
- Imply Road Ready **verified** insurance status when only `self_reported` sync occurred
- Use language like "approved coverage," "certified insured," or "guaranteed limits" in customer-facing UI without attorney-approved copy

**Preferred language:**

- "Customer-reported — not independently verified"
- "Quote information provided by licensed provider where applicable"
- "All In One coordinates assistance — it does not underwrite or bind coverage"
- "Binding and premium collection are not available through All In One in this mode"

Office brokerage carrier profile: *"Insurance review needed — not a safety certification."*

---

## Premium ≠ All In One service revenue

| Amount type | Entity / field | Sprint 07 billing? | AIO revenue? |
|-------------|----------------|-------------------|--------------|
| **Insurance premium** | `InsuranceQuoteRecord.premiumMinor` | **No** | **No** — `isPremiumAllInOneServiceRevenue()` → `false` |
| **Down payment (reported)** | `downPaymentMinor` on quote record | **No** | **No** |
| **All In One assistance fee** | Sprint 07 quote/invoice (`service_fee`) | **Yes** (when explicitly quoted) | **Yes** |
| **Government / third-party fees** | Sprint 07 pass-through categories | Tracked separately | **No** (pass-through) |

**UI requirement:** Quote cards in office and portal must show quote **source** (`QUOTE_SOURCE_LABELS`) and must not present premium as an amount owed to All In One.

**Office dashboards** must not sum insurance premiums into service revenue or "collected" billing metrics.

---

## Quote source attribution (required)

Every `InsuranceQuoteRecord` must carry a **`source`**:

| Source | When to use |
|--------|-------------|
| `partner_reported` | Partner communicated quote to staff or customer |
| `document_supported` | Quote terms supported by uploaded document in Vault |
| `staff_entered_from_partner` | Staff entered from partner email/call — not customer self-entry |
| `future_api` | Reserved for licensed integration — not legitimate as standalone demo entry |

`recordInsuranceQuote()` in demo defaults new quotes to **`partner_reported`**.

Customers cannot create quote records. Selecting a quote (`selectQuoteExternal()`) sets quote `selected` and request `policy_selected_external` — **does not** activate policy (`policySelectedEqualsActive()` → `false`).

---

## Customer verification prohibitions

Enforced in `insuranceRules.ts`:

| Action | Customer allowed? |
|--------|-------------------|
| Mark policy verified | **No** — `canCustomerMarkPolicyVerified()` → `false` |
| Mark COI issued | **No** — `canCustomerMarkCoiIssued()` → `false` |
| View full policy number | **No** — masked via `maskPolicyNumber()`; full number coordinator/admin only |
| Add existing policy (intake) | **Yes** — creates `customer_reported` record pending review |
| Request COI | **Yes** — creates `requested` certificate; issuance external |
| Select quote externally | **Yes** — records customer choice; binding happens outside AIO |

Staff **`activatePolicyFromEvidence()`** sets `document_supported` and derived active status — not customer self-service.

---

## Partner & carrier relationships

- Demo partner **Demo Trucking Insurance Agency LLC** is **fictional** for product review.
- `manualInsurancePartnerAdapter` records referrals only — no application submission API.
- Customer's **existing agent** may appear as `customer_existing_agent` partner status — AIO coordinates, does not replace agent of record.

---

## Brokerage & dispatch cross-domain

- **Brokerage** may **read** carrier insurance summary via `getBrokerageCarrierInsurance()` for operational awareness — not a substitute for shipper-required COI.
- **Dispatch** and **factoring** do not collect or store insurance premiums.
- COI for a load may reference `loadReference` — issuance still external.

---

## Regulatory review checklist item

Production readiness requires **`legal_review`** and related checklist items in **`INSURANCE_ACTIVATION.md`** before capability leaves `demo`. Software completion does not imply regulatory authorization.

---

## Related docs

- **`INSURANCE_SYSTEM.md`** — workflows and entities
- **`INSURANCE_ACTIVATION.md`** — readiness checklist
- **`FINANCIAL_BOUNDARIES.md`** — billing separation
- **`ROAD_READY_SYSTEM.md`** — verification vs self-report
