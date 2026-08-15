# All In One — Financial Boundaries

**Sprint:** 09 · **Last updated:** 2026-08-15

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
| Brokerage freight charges | Brokerage settlement model |
| Carrier payments | Settlement system |
| Shipper freight billing | Brokerage accounting |
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

## Insurance boundary

Insurance services show **Quote Required / Request Quote**. Do not collect premiums through generic billing unless licensed arrangement exists.

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

## Frontal Slayer isolation

All In One billing:

- Separate demo store (v8)
- No Frontal Slayer Supabase
- No Frontal Slayer Stripe
- No shared customer accounts or order tables
- Extraction-ready under `src/all-in-one/`
