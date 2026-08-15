# All In One — Load Domain

**Sprint:** 10 · **Last updated:** 2026-08-15

---

## Canonical ownership

There is **one load record per real-world movement**. Do not create parallel `dispatch_loads`, `factoring_loads`, or `brokerage_loads` tables for the same shipment.

Type: `Load` in `src/all-in-one/dispatch/dispatchTypes.ts`

---

## Identity

| Field | Notes |
|-------|--------|
| `id` | Internal UUID |
| `loadNumber` | Public identifier `AIO-LD-YYYY-######` — server/demo counter, not array length |
| `organizationId` | **Required** for all queries and authorization |

---

## Relationships

| Field | Links to |
|-------|----------|
| `dispatchEnrollmentId` | Dispatch service enrollment |
| `powerUnitId`, `trailerId`, `primaryDriverId` | Fleet (Road Ready) |
| `assignedDispatcherStaffId` | Office staff |
| `brokerContactId` / broker fields | Broker directory or inline manual entry |
| Vault documents | `rateConfirmationDocumentId`, `bolDocumentId`, `podDocumentId` |

Future: additional brokerage metadata — **reference**, not copy.

Sprint 09: factoring links via `freightInvoices[].loadId` and `factoringSubmissions[].loadId` — not embedded on load row.

Sprint 10: brokerage links on load row + `brokerageLoadFinancials[]` sidecar:

| Field | Purpose |
|-------|---------|
| `sourceType: 'brokerage'` | Marks brokerage-arranged movement |
| `shipperOrganizationId` | Shipper org |
| `brokerageShipmentRequestId` | Originating `ShipmentRequest` |
| `brokerageQuoteId` | Accepted `BrokerageFreightQuote` |
| `brokerageCoverageStatus` | Coverage workflow state |
| `brokerageCarrierNetworkProfileId` | Assigned network carrier |
| `brokerageCarrierOrganizationId` | Carrier portal org when linked |

---

## Source

`sourceType`: `manual`, `carrier_provided`, `broker_email_future`, `load_board_future`, **`brokerage`**

- **`brokerage`** — created from accepted shipper quote (Sprint 10). Uses shipper charge + carrier pay financial model. Not a dispatch enrollment load.
- Dispatch loads remain `manual`, `carrier_provided`, etc. — never mixed in brokerage office queues without explicit filter.

No provider-specific fields on the core model.

---

## Status model (two axes)

**Offer status:** `draft`, `awaiting_carrier`, `accepted`, `declined`, `expired`, `withdrawn`

**Operational status:** `opportunity` → … → `complete` / `cancelled` / `issue`

Invariants (enforced in `dispatchRules.ts`):

- Declined offer cannot book without new offer flow
- Completed load not on active board
- Factoring `ready` requires POD + completion rules
- Requested accessorials do not increase `confirmedGrossMinor` until approved

---

## Financial fields (minor units)

| Field | Meaning |
|-------|---------|
| `linehaulMinor`, `fuelSurchargeMinor`, `accessorialMinor` | Components |
| `grossMinor` | Entered/calculated gross |
| `confirmedGrossMinor` | After approved accessorials |
| `accessorials[]` | Detention, layover, TONU, lumper, other |

**Load gross on dispatch loads is carrier freight pay — not All In One revenue.**

On **`sourceType: 'brokerage'`** loads, `confirmedGrossMinor` tracks **carrier pay**; shipper charge lives in `brokerageLoadFinancials.confirmedShipperChargeMinor`. See **`BROKERAGE_FINANCIAL_DOMAIN.md`**.

Rate revisions stored in `rateRevisions[]` — no silent overwrites.

---

## Documents

Category: `dispatch`. Types: Rate Confirmation, BOL, POD, Other.

Stored in Vault; load holds document id references.

---

## Timeline vs audit

- `timeline[]` on load — operational events; `visibility: customer | internal`
- Demo `activity[]` — broader audit including billing, enrollment, staff events

---

## Payment & factoring (completed loads)

### Handoff status (Sprint 08 → 09)

`factoringHandoffStatus` on load — **readiness signal only**, no funding on load row.

| Status | Meaning |
|--------|---------|
| `not_ready` | Incomplete or missing POD / rate confirmation rules |
| `ready` | `isFactoringHandoffReady()` — eligible for freight invoice + submission |
| `submitted_future` | Legacy quick-submit flag (prefer submission entity) |
| `not_factored` | Carrier opted out |

Updated automatically on load completion and document attach (`dispatchActions.ts` → `updateFactoringHandoffStatus`).

### Sprint 09 factoring workflow (same load record)

1. Load reaches `operationalStatus: complete` with handoff `ready`
2. Carrier or specialist creates **`FreightInvoice`** (`HF-*`) from load — amount defaults to `confirmedGrossMinor`
3. Specialist creates **`FactoringSubmission`** linking invoice + provider
4. Manual submit to provider → status timeline + **reported funding** fields (external)

UI: `LoadFactoringSection` on `/portal/dispatch/loads/:id` and `/office/dispatch/loads/:id`.

**Load gross ≠ freight invoice ≠ factoring advance.** See **`FREIGHT_RECEIVABLES_DOMAIN.md`**.

---

## Security

All API/backend queries must filter by `organizationId` + role. URL `loadId` alone is insufficient.
