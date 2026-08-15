# All In One — Financial Boundaries

**Sprint:** 07 · **Last updated:** 2026-08-15

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

## Factoring boundary

Factoring submissions in Office (`/office/factoring`) remain **mock review only**. Do not model advances, reserves, or debtor collections as ordinary invoices.

---

## Insurance boundary

Insurance services show **Quote Required / Request Quote**. Do not collect premiums through generic billing unless licensed arrangement exists.

---

## Dispatch / brokerage boundary

Load rates in Dispatch Center are operational previews — not All In One service invoices. Settlement belongs to later sprints.

---

## Frontal Slayer isolation

All In One billing:

- Separate demo store (v6)
- No Frontal Slayer Supabase
- No Frontal Slayer Stripe
- No shared customer accounts or order tables
- Extraction-ready under `src/all-in-one/`
