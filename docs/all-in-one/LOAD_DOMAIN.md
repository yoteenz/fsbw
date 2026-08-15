# All In One — Load Domain

**Sprint:** 08 · **Last updated:** 2026-08-15

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

Future: brokerage shipment id, factoring submission id — **references**, not copies.

---

## Source

`sourceType`: `manual`, `carrier_provided`, `broker_email_future`, `load_board_future`, `brokerage_future`

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

**Load gross is carrier freight pay — not All In One revenue.**

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

## Factoring handoff

`factoringHandoffStatus` on load — consumed by Sprint 09+ without duplicating load rows.

---

## Security

All API/backend queries must filter by `organizationId` + role. URL `loadId` alone is insufficient.
