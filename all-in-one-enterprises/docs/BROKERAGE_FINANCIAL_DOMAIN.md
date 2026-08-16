# All In One — Brokerage Financial Domain

**Sprint:** 10 · **Last updated:** 2026-08-15

---

## Mandatory eight-way distinction

Brokerage introduces **freight settlement concepts** that must never be collapsed with dispatch operations, carrier factoring, or Sprint 07 service billing. Mixing them causes revenue misstatement, duplicate payment risk, and role confusion.

| Concept | What it is | Who pays whom | All In One revenue? | Sprint 07 billing? |
|---------|------------|---------------|---------------------|-------------------|
| **Shipper Freight Charge** | Price quoted/accepted for moving shipper's freight | Shipper → broker (All In One when activated) | **No** (becomes margin component) | **No** |
| **Carrier Pay** | Amount offered/confirmed to carrier for haul | Broker → carrier | **No** | **No** |
| **Brokerage Gross Margin** | `confirmedShipperChargeMinor − confirmedCarrierPayMinor` | Internal spread | **Yes** (brokerage margin — **not** service invoice in Sprint 10) | **No** |
| **Shipper Invoice (`BSI-*`)** | Broker bills shipper for completed brokerage load | Shipper owes broker | **No** (A/R document) | **No** |
| **Carrier Payable** | Broker owes carrier for completed haul | Broker owes carrier | **No** (A/P document) | **No** |
| **Service Invoice (`AIO-*`)** | All In One compliance, dispatch fee, formation, etc. | Customer → All In One | **Yes** | **Yes** |
| **Dispatch Fee** | Configured fee on **dispatch** loads for enrolled carriers | Carrier → All In One | **Yes** (service revenue) | **Yes** (when invoiced) |
| **Factoring (freight invoice `HF-*`)** | Carrier receivable assistance against broker/debtor | External factor → carrier | **No** | **No** |

**Rule:** Never post shipper freight charges, carrier payables, or brokerage margin into `aio_invoices` / Sprint 07 payment records.

---

## Shipper Freight Charge

- **Entity:** `BrokerageFreightQuote.freightChargeMinor` → `BrokerageLoadFinancials.shipperChargeMinor` / `confirmedShipperChargeMinor`
- **Audience:** Shipper sees this on quotes and shipper invoices — **only** this side of the spread
- **Not:** Carrier pay, margin, dispatch fee, or All In One service fee

Quote acceptance locks shipper charge into financials at load conversion.

---

## Carrier Pay

- **Entity:** `CarrierOffer.carrierPayMinor` → `BrokerageLoadFinancials.confirmedCarrierPayMinor` + load `confirmedGrossMinor` (operational carrier freight pay on canonical load)
- **Audience:** Carrier sees on offers and payables — **never** shipper charge or margin
- **Components:** `carrierLinehaulMinor`, `carrierFuelSurchargeMinor`, `carrierAccessorialMinor` → `totalCarrierPayMinor`

On dispatch loads, **`confirmedGrossMinor`** is carrier pay with **no shipper charge** — dispatch domain only.

---

## Brokerage Gross Margin

```
grossMarginMinor = confirmedShipperChargeMinor − confirmedCarrierPayMinor
grossMarginPercent = grossMarginMinor / confirmedShipperChargeMinor × 100  (if shipper charge > 0)
```

Functions: `computeBrokerageGrossMargin()`, `computeGrossMarginPercent()` in `brokerageCalculations.ts`.

- **Office only** — `canViewGrossMargin('broker_finance' | 'broker_ops')`
- **Not** All In One service revenue until production accounting defines recognition; Sprint 10 tracks operationally in demo store
- Demo example: load `br-load-g` — $3,000 shipper / $2,500 carrier = **$500 margin**

Office Command Center and load detail show margin for brokerage staff — never on shipper or carrier portals.

---

## Shipper Invoice vs Carrier Payable

| | **Shipper Invoice (`BSI-*`)** | **Carrier Payable** |
|--|-------------------------------|---------------------|
| **Direction** | Receivable — broker bills shipper | Payable — broker owes carrier |
| **Trigger** | `isReadyToBill()` — complete + POD + booked | Load complete + approval rules |
| **Amount basis** | `confirmedShipperChargeMinor` + accessorials | `confirmedCarrierPayMinor` + accessorials − deductions |
| **Demo payment** | Status only — no live collection | `paid_future` / `scheduled_future` — staff-reported, no ACH |
| **Numbering** | `BSI-YYYY-####` | Internal id |

Creating shipper invoice: `createShipperInvoiceFromLoad()` — duplicate protection per load.

---

## Service Invoice vs Brokerage documents

| Document | Payee | Payer | Example |
|----------|-------|-------|---------|
| **Service Invoice** | All In One Enterprises Inc. | Carrier, shipper, or fleet customer | Permitting fee, dispatch fee invoice |
| **Shipper Invoice (`BSI-*`)** | Broker (All In One when activated) | Shipper | Freight charge for BR-LD load |
| **Freight Invoice (`HF-*`)** | Carrier | Broker/debtor | Carrier factoring receivable |

A shipper may receive **both** a `BSI-*` freight invoice (brokerage) and an **`AIO-*`** service invoice (e.g. brokerage setup assistance) — separate entities, separate ledgers.

---

## Dispatch Fee vs Brokerage Margin

| | **Dispatch Fee** | **Brokerage Gross Margin** |
|--|------------------|----------------------------|
| **Service** | Dispatch (Sprint 08) | Brokerage (Sprint 10) |
| **Customer** | Enrolled carrier | Implicit in shipper↔carrier spread |
| **Recorded in** | `dispatchBillingEvents` → Sprint 07 invoice | `brokerageLoadFinancials` |
| **Revenue to AIO** | Yes — **service fee** | Yes — **freight margin** (future GL) |
| **Shown to carrier** | Yes (fee disclosure) | No — carrier sees pay only |

A carrier can be a **dispatch client** and a **brokerage network carrier** — still separate financial streams per load `sourceType`.

---

## Factoring boundary

Three factoring touchpoints — do not merge:

1. **Dispatch load complete** → carrier creates **`FreightInvoice` (`HF-*`)** against broker debtor (Sprint 09)
2. **Brokerage `CarrierPayable`** → `factoringAssignmentOnFile` + `paymentDestinationProtected` when carrier assigns receivable/payable rights (Sprint 10 demo flag)
3. **Provider reported funding** → external; never Sprint 07 payment

**Factoring advance** pays **carrier** from **debtor payment** — not shipper invoice collection and not brokerage margin recognition.

When `paymentDestinationProtected === true`, carrier payable edits require elevated controls — see **`BROKERAGE_SECURITY.md`**.

---

## Accessorials

`BrokerageAccessorial` with `side: 'shipper' | 'carrier'`:

- Approved accessorials adjust invoice/payable totals separately per side
- `sumApprovedAccessorials()` in calculations
- Status workflow: `reported` → `approved` / `denied` → `billed_future` / `paid_future`

Do not silently increase `confirmedGrossMinor` or shipper charge without approval (same invariant as dispatch loads).

---

## Reporting boundaries (Office)

Separate dashboard metrics:

1. **Brokerage Gross Margin (managed)** — sum of margin on complete brokerage loads
2. **Shipper A/R outstanding** — sum of `BrokerageShipperInvoice.balanceMinor`
3. **Carrier A/P pending** — sum of open `CarrierPayable.totalPayableMinor`
4. **Dispatch fee revenue** — Sprint 07 billing only
5. **Factoring pipeline** — submissions / reported funding — informational only
6. **Gross Load Value Managed (dispatch)** — carrier gross under dispatch — **not** brokerage shipper charges

---

## Code references

| Concept | Type | Demo store key |
|---------|------|----------------|
| Shipper charge / carrier pay / margin | `BrokerageLoadFinancials` | `brokerageLoadFinancials[]` |
| Shipper invoice | `BrokerageShipperInvoice` | `brokerageShipperInvoices[]` |
| Carrier payable | `CarrierPayable` | `carrierPayables[]` |
| Shipper quote | `BrokerageFreightQuote` | `brokerageFreightQuotes[]` |
| Service invoice | `Invoice` | `invoices[]` |
| Freight invoice (factoring) | `FreightInvoice` | `freightInvoices[]` |
| Dispatch fee event | `DispatchBillingEvent` | `dispatchBillingEvents[]` |

---

## Related docs

- **`FREIGHT_RECEIVABLES_DOMAIN.md`** — load vs HF-* vs factoring submission
- **`FINANCIAL_BOUNDARIES.md`** — Sprint 07 scope
- **`BROKERAGE_SYSTEM.md`** — workflow
- **`FACTORING_SYSTEM.md`** — carrier receivables assistance
