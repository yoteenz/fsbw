# All In One — Financial Boundaries

**Sprint:** 11 · **Last updated:** 2026-08-15

---

## What Sprint 07 handles

| Category | Sprint 07 billing |
|----------|-------------------|
| All In One service fees | Yes — quotes, invoices, payments |
| Government / agency fees (pass-through) | Yes — tracked separately, not revenue |
| Third-party fees (pass-through) | Yes — tracked separately |
| Tax (placeholder) | Architecture only |
| Credits / discounts on service fees | Architecture + demo credits |
| Deposits / partial payments | Architecture foundation |

---

## What Sprint 07 does NOT handle

| Category | Future system |
|----------|---------------|
| Factoring advances | Dedicated factoring ledger |
| Factoring fees / reserves / recourse | Factoring domain |
| Insurance premiums | Licensed agency workflow |
| Dispatch carrier settlements | Operations/financial sprint |
| Brokerage freight charges | **Sprint 10** — `BrokerageLoadFinancials` + `BSI-*` (demo; no live collection) |
| Carrier payments | **Sprint 10** — `CarrierPayable` (demo statuses only; no ACH) |
| Shipper freight billing | **Sprint 10** — shipper invoices distinct from Sprint 07 service billing |
| Payroll | HR/payroll system |
| General ledger / GAAP accounting | Accounting integration |

---

## Revenue vs pass-through

**Office dashboards must distinguish:**

- **All In One Service Revenue** — `service_fee` line items
- **External / Pass-Through** — `government_fee`, `third_party_fee`
- **Gross Collected** — sum of payments (includes pass-through held on behalf of clients/agencies)

Government money collected for filing is **not** All In One revenue in reporting summaries.

---

## Factoring boundary (Sprint 09)

See **`FREIGHT_RECEIVABLES_DOMAIN.md`** for the mandatory five-way distinction.

| Concept | Sprint 07 billing? | Notes |
|---------|-------------------|-------|
| **Load gross** (`confirmedGrossMinor`) | No | Operational carrier freight pay |
| **Freight invoice** (`HF-*`) | No | Carrier bills broker/debtor — `FreightInvoice` entity |
| **Factoring submission** (`submittedAmountMinor`) | No | Workflow case to external provider |
| **Provider reported funding** (`reportedAdvanceMinor`, etc.) | No | Staff-entered provider report — not AIO payment |
| **All In One service invoice** | **Yes** | Sprint 07 quotes/invoices/payments only |

Factoring in Office (`/office/factoring`) is **assistance + manual partner handoff**. Do not model advances, reserves, or debtor collections as ordinary service invoices or payment records.

`directFactoringEnabled = false` — no direct funding, no bank account storage.

---

## Insurance boundary (Sprint 11)

See **`INSURANCE_REGULATORY_BOUNDARIES.md`** and **`INSURANCE_SYSTEM.md`**.

| Concept | Sprint 07 billing? | Notes |
|---------|-------------------|-------|
| **Insurance premium** (`InsuranceQuoteRecord.premiumMinor`) | **No** | Partner-reported display only — `isPremiumAllInOneServiceRevenue()` → `false` |
| **Down payment (reported)** | **No** | On quote record — not checkout |
| **All In One assistance fee** | **Yes** (when quoted) | Sprint 07 `service_fee` — `consultation` / `manual_billing` on insurance SKUs |
| **Policy record** | **No** | Operational/compliance record — not an invoice |

Insurance services show **Quote Required / Consultation** on catalog. Do **not** collect premiums through Sprint 07 checkout. Quote cards must show **source attribution** (`partner_reported`, `document_supported`, etc.).

Customer **selecting a quote externally** does not create a paid invoice or active policy in AIO billing.

---

## Dispatch / brokerage boundary

### Load gross vs All In One dispatch fee (Sprint 08)

| Concept | Meaning | All In One revenue? |
|---------|---------|---------------------|
| **Load Gross** | Carrier freight pay for the movement | **No** |
| **All In One Dispatch Fee** | Configured service fee (% or flat per load) | **Yes** (service revenue) |
| **Carrier Gross After Dispatch Fee** | Load gross minus dispatch fee — operational preview only | **No** (not profit; excludes fuel, insurance, driver pay, etc.) |
| **Brokerage Revenue** (future) | Freight margin under brokerage authority | Separate domain |
| **Carrier Settlement** (future) | Pay carrier net of deductions | Separate domain |
| **Factoring Funding** (future) | Advance against receivable | Separate domain |

Office metrics like **Gross Load Value Managed** count carrier load gross under management — **not** company revenue.

Dispatch billing events (`dispatchBillingEvents`) record the **dispatch fee** only. Sprint 07 invoice cadence may aggregate weekly/monthly per config.

Load rates in Dispatch are operational — not All In One service invoices unless billed as dispatch fees via billing module.

Settlement belongs to later sprints.

---

## Brokerage boundary (Sprint 10)

See **`BROKERAGE_FINANCIAL_DOMAIN.md`** for the mandatory eight-way distinction.

| Concept | Sprint 07 billing? | Notes |
|---------|-------------------|-------|
| **Shipper freight charge** | No | `BrokerageFreightQuote.freightChargeMinor` — shipper-facing |
| **Carrier pay** | No | `CarrierOffer` / `confirmedCarrierPayMinor` — carrier-facing |
| **Brokerage gross margin** | No | Office-only; not service invoice line items in Sprint 10 |
| **Shipper invoice (`BSI-*`)** | No | Broker A/R to shipper — separate from `AIO-*` service invoices |
| **Carrier payable** | No | Broker A/P to carrier — `paid_future` demo only |
| **Dispatch fee** | **Yes** | Dispatch loads only — never on `sourceType: 'brokerage'` |
| **Freight invoice (`HF-*`)** | No | Carrier factoring receivable (Sprint 09) — may reference broker debtor |
| **All In One service invoice** | **Yes** | Sprint 07 only |

**Dispatch ≠ Brokerage:** Dispatch fee revenue comes from enrolled carriers on dispatch loads. Brokerage margin comes from shipper charge minus carrier pay on brokerage loads. Never aggregate dispatch metrics with brokerage margin in revenue reporting.

No shipper freight payment or carrier disbursement through Sprint 07 Stripe demo in Sprint 10.

---

## Frontal Slayer isolation

All In One billing:

- Separate demo store (v11)
- No Frontal Slayer Supabase
- No Frontal Slayer Stripe
- No shared customer accounts or order tables
- Extraction-ready under `src/all-in-one/`
