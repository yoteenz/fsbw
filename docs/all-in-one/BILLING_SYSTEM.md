# All In One — Billing System

**Sprint:** 07 · **Last updated:** 2026-08-15

---

## Purpose

Production-oriented foundation for **All In One service billing** — quotes, invoices, payments, receipts, and balance tracking. Separates **All In One service fees** from **government/third-party pass-through fees**.

Not carrier settlements, factoring, insurance premiums, or freight billing (see `FINANCIAL_BOUNDARIES.md`).

---

## Routes

| Surface | Path |
|---------|------|
| Customer Billing Center | `/all-in-one/portal/billing` |
| Customer Quotes | `/all-in-one/portal/quotes` |
| Quote detail | `/all-in-one/portal/quotes/:quoteId` |
| Invoice detail | `/all-in-one/portal/billing/invoices/:invoiceId` |
| Checkout / Pay | `/all-in-one/portal/billing/pay/:invoiceId` |
| Receipt | `/all-in-one/portal/billing/receipts/:receiptId` |
| Office Billing Center | `/all-in-one/office/billing` |
| Office Quotes | `/all-in-one/office/quotes` |
| Office Quote detail | `/all-in-one/office/quotes/:quoteId` |
| Office Invoices | `/all-in-one/office/invoices` |
| Office Invoice detail | `/all-in-one/office/invoices/:invoiceId` |
| Office Payments | `/all-in-one/office/payments` |
| Pricing Settings | `/all-in-one/office/settings/pricing` |

Legacy `/debug/all-in-one/*` aliases remain via route host.

---

## Code locations

| Module | Path |
|--------|------|
| Money (minor units) | `src/all-in-one/billing/money.ts` |
| Types | `src/all-in-one/billing/billingTypes.ts` |
| Calculator | `src/all-in-one/billing/billingCalculator.ts` |
| Service pricing config | `src/all-in-one/billing/servicePricingConfig.ts` |
| Payment provider abstraction | `src/all-in-one/billing/paymentProvider.ts` |
| Demo seed & actions | `src/all-in-one/demo/billingSeed.ts`, `billingActions.ts` |
| UI components | `src/all-in-one/components/BillingDisplay.tsx` |

---

## Money rule

All authoritative amounts use **integer minor units** (USD cents). Use `formatMoney()` for display — never float arithmetic for totals.

---

## Fee categories

| Category | Meaning |
|----------|---------|
| `service_fee` | All In One revenue for services performed |
| `government_fee` | Agency/regulatory pass-through |
| `third_party_fee` | External provider pass-through |
| `discount` | Approved credit/reduction |
| `tax` | Tax placeholder (architecture only) |

**Amount status:** `known` · `estimated` · `pending` — pending external fees are **not** treated as $0 in totals.

---

## Quote lifecycle

```
draft → sent → viewed → accepted | declined | expired | revised → converted
```

- **Versioning:** Each sent/revised quote creates an immutable `QuoteVersion`. Acceptance records exact `versionId`.
- **Revision:** Material changes create a new version; prior acceptance is cleared.
- **Send (Sprint 07):** Portal availability + in-app notification + activity — no production email unless configured.

---

## Invoice lifecycle

```
draft → issued → partially_paid | paid | past_due → void | refunded | partially_refunded
```

- Line items **snapshot** from quote version at issue time.
- Invoice numbering: `AIO-INV-YYYY-NNNNNN` (demo counters in store).
- Past due derived server-side from `due_at` + `balance_due` + status.

---

## Payment modes

| Mode | Behavior |
|------|----------|
| `demo` (default) | Simulate success/failure/cancel — no card data |
| `disabled` | "Online payment not yet available" |
| `provider` | Future Stripe/other integration |

Payment confirmation updates invoice only after provider/backend success — not URL params alone.

---

## Receipts

Issued after confirmed payment. Numbering: `AIO-RCT-YYYY-NNNNNN`. Print-friendly view at receipt route.

---

## Service request integration

`ServiceRequest.billingStatus` tracks payment separately from operational `status`:

`no_payment_required` · `quote_needed` · `awaiting_quote_acceptance` · `payment_required` · `deposit_paid` · `paid` · `payment_failed` · `balance_remaining`

On `PAYMENT_SUCCEEDED`, demo mode may set `nextStep` to ready-to-begin when configured.

---

## Notifications

Billing events use category `billing`: `QUOTE_AVAILABLE`, `INVOICE_ISSUED`, `PAYMENT_SUCCEEDED`, `PAYMENT_FAILED`, etc. Created via notification engine — not inline in billing pages.

---

## Authorization (summary)

Customers: view/accept quotes, pay invoices, view receipts — cannot edit amounts or mark paid.

Staff: quotes.create/manage, invoices.create/manage, pricing.manage, refunds restricted to admin roles (future backend).

See `AUTHORIZATION_MATRIX.md`.

---

## Demo seed (client-a default)

- **Quote A:** Authority assistance — $200 service fee, government fee pending
- **Invoice open:** BOC-3 due in 7 days
- **Paid invoice + receipt** on client-b IRP flow

---

## Known limitations (Sprint 07)

- No production payment provider credentials
- No PDF generation (print-friendly HTML only)
- No QuickBooks/accounting export
- Credits/refunds architecture only — limited UI
- Backend Supabase billing tables deferred until AIO backend activation
