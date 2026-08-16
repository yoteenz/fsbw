# Financial Reporting Model (Management)

## Terminology

| Term | Definition |
|------|------------|
| **Invoiced** | Amount billed on invoice |
| **Collected** | Payment recorded as succeeded |
| **Service Revenue** | All In One service fee component |
| **Pass-Through** | Government + third-party + tax portions |
| **Outstanding** | Invoice balance due per canonical status |

## Payment Allocation

Example: $1,250 customer payment on invoice with $600 service + $650 pass-through:

- Collected Cash: **$1,250**
- Service Fees Collected: **$600**
- Pass-Through Collected: **$650**

Implementation: `allocatePayment()` in `managementFinancial.ts` — ratio from invoice `subtotalServiceFeesMinor` and `subtotalExternalFeesMinor + taxTotalMinor`.

## Waterfall

Gross Customer Payments → Less Pass-Through → Less Refunds → **Service Fees Collected**

Not labeled as profit.

## Brokerage

Shipper Charge − Carrier Pay = **Gross Margin** (before operating expenses). Not net profit.

## Dispatch

**Carrier Gross Load Revenue** separate from **All In One Dispatch Service Fees**.

## Factoring

**Invoice Face Value Assisted** separate from **All In One factoring-related service fees** (when recorded).

## Insurance

Premium is not All In One service revenue.

## Accounting Limitations

No P&L, balance sheet, cash flow statement, GAAP recognition, or tax reporting in Sprint 17.
