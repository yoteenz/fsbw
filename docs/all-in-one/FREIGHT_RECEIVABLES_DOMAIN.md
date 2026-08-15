# All In One — Freight Receivables Domain

**Sprint:** 09 · **Last updated:** 2026-08-15

---

## Mandatory distinction

All In One operates **five separate financial concepts**. Mixing them in UI, reporting, or database design causes revenue misstatement, duplicate funding risk, and customer confusion.

| Concept | What it is | Who pays whom | All In One revenue? |
|---------|------------|---------------|---------------------|
| **Load** | Operational freight movement record | Broker/shipper pays **carrier** (future settlement) | **No** |
| **Freight Invoice** | Carrier's invoice **to broker/debtor** for a completed load | Debtor owes **carrier** | **No** |
| **Factoring Submission** | Document package sent to a **factoring provider** for review | Provider may advance against receivable (external) | **No** (assistance fee possible later — not Sprint 09) |
| **Provider Funding** | **Reported** advance/reserve/fee from external factor | Provider pays **carrier** (outside All In One) | **No** |
| **All In One Service Invoice** | Bill for compliance, dispatch, formation, etc. | Customer pays **All In One** | **Yes** (service fees only) |

**Rule:** Never post factoring advances, freight invoice balances, or load gross into `aio_invoices` / Sprint 07 billing.

---

## Load (operational)

- Entity: `Load` in `dispatch/dispatchTypes.ts`
- Money field: `confirmedGrossMinor` — **carrier freight pay**, not an invoice issued by All In One
- Lifecycle: dispatch operational statuses through `complete`
- Factoring link: `factoringHandoffStatus` — readiness signal only

A load is **not** a bill. It is the movement that **may later** support a freight invoice.

---

## Freight Invoice (carrier receivable document)

- Entity: `FreightInvoice` in `factoring/factoringTypes.ts`
- Numbering: `HF-YYYY-####`
- Tied to: exactly one `loadId`, one `organizationId` (carrier)
- Debtor: broker name / future `DebtorAccount`
- Amount: typically equals `load.confirmedGrossMinor` at creation
- Documents: references Vault ids (rate con, BOL, POD) — not copies

Statuses: `draft` · `issued` · `void` · `paid_future`

**Freight invoices are carrier↔debtor paperwork.** All In One assists creation and storage; All In One is not the payee on this document.

---

## Factoring Submission (workflow case)

- Entity: `FactoringSubmission`
- Links: `freightInvoiceId` + `providerId` + `loadId`
- Purpose: package review, specialist workflow, partner handoff tracking
- Amount field: `submittedAmountMinor` — **invoice face amount submitted**, not funding sent

Statuses track **review workflow**, not cash movement: `submitted` → `provider_review` → `approved` → `funding_pending` → `funded`

One active submission per freight invoice (duplicate protection in `factoringRules.ts`).

---

## Provider Funding (reported, external)

- Fields on submission: `reportedAdvanceMinor`, `reportedReserveMinor`, `reportedFeeMinor`
- Source: staff manual entry simulating **provider confirmation** — Sprint 09 has no bank integration
- Labeling: UI and docs must say **"reported"** or **"provider reported"**, not "paid by All In One"

Funding does **not** create:

- Sprint 07 payment records
- Receipts
- All In One invoice line items
- General ledger entries

Future: optional read-only sync from partner webhooks into a dedicated factoring ledger table.

---

## All In One Service Invoice (Sprint 07 billing)

- Entity: `Invoice` in billing domain
- Numbering: All In One invoice numbers (not `HF-*`)
- Payee: **All In One Enterprises Inc.**
- Line items: `service_fee`, `government_fee`, `third_party_fee`

Examples: dispatch fee aggregation, permitting service fee, formation package.

**Never** use service invoices to represent broker freight pay or factoring advances.

---

## Relationship diagram

```
Load (operational)
  │
  ├── confirmedGrossMinor          ← carrier freight pay (not AIO revenue)
  │
  └── FreightInvoice (HF-*)        ← carrier bills debtor
        │
        └── FactoringSubmission    ← package to external provider
              │
              └── reportedAdvanceMinor / reserve / fee   ← provider→carrier (external)
```

Parallel track (unrelated):

```
ServiceRequest → Quote → Invoice (AIO-*) → Payment → Receipt
  └── All In One service revenue only
```

---

## UI labeling requirements

| Surface | Correct label | Avoid |
|---------|---------------|-------|
| Portal factoring metrics | "Reported Funded" | "Paid", "Deposited" |
| Office submission detail | "Reported advance (provider)" | "All In One payment" |
| Dispatch load detail | "Load gross" / "Confirmed gross" | "Invoice total" (unless freight invoice exists) |
| Billing center | "Service invoice" | "Freight invoice" |

---

## Reporting boundaries

Office dashboards must separate:

1. **Gross Load Value Managed** — sum of load `confirmedGrossMinor` (operational)
2. **Submissions in pipeline** — count/amount of `submittedAmountMinor` (workflow)
3. **Reported funded volume** — sum of `reportedAdvanceMinor` where status = `funded` (informational)
4. **All In One service revenue** — Sprint 07 billing only

---

## Code references

| Concept | Primary type | Demo store key |
|---------|--------------|----------------|
| Load | `Load` | `loads[]` |
| Freight Invoice | `FreightInvoice` | `freightInvoices[]` |
| Submission | `FactoringSubmission` | `factoringSubmissions[]` |
| Service Invoice | `Invoice` | `invoices[]` |

See **`FINANCIAL_BOUNDARIES.md`** for revenue vs pass-through rules.
