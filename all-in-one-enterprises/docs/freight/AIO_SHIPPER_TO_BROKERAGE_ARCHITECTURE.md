# AIO Shipper → Brokerage Architecture

## Operating model (locked)

```
Shipper → AIO Brokerage → AIO Office → AIO Load Board → Approved Carrier → Delivery → POD → Shipper Invoice + Carrier Payment → AIO Margin
```

AIO is the broker. No third-party broker marketplace.

## Core principle: one freight lifecycle

```
ShipmentRequest  →  BrokerageFreightQuote  →  Load (canonical)
        ↓                      ↓                    ↓
   Audit / info          Quote revisions    LoadBoardPublication
                                              CarrierOffers
                                              brokerageLoadFinancials
                                              Invoices / Payables
```

**Do not** create `shipperLoad`, `brokerageLoad`, and `carrierLoad` as separate freight records.

## Domain objects

### ShipmentRequest

- Created by shipper wizard or template duplicate
- Statuses: `draft` → `under_review` → `awaiting_shipper_approval` → `converted_to_load`
- Sidecar fields: `openInfoRequestId`, `convertedLoadId`, `assignedBrokerStaffId`

### BrokerageFreightQuote

- Versioned via `revisions[]` and `currentRevision`
- Shipper-visible: freight charge, lane summary, expiry, terms
- Hidden from shipper: target carrier rate, margin (`BrokerageQuotePricingDraftRecord`)

### Load (canonical)

- `sourceType: 'brokerage'`
- Links: `brokerageShipmentRequestId`, `brokerageQuoteId`, `shipperOrganizationId`
- Operational + financial execution uses existing dispatch / load board / factoring paths

### LoadBoardPublication

- Created in `draft` on quote acceptance
- Staff chooses distribution: hold, publish, private invite, matched carriers

## Workflow engine

**File:** `src/brokerage/brokerageWorkflow.ts`

| Function | Purpose |
|----------|---------|
| `saveShipmentRequestDraft` | Persist partial request |
| `submitShipmentRequest` | Queue for office review |
| `requestMoreInformation` / `resolveInfoRequest` | Shipper action required loop |
| `createQuoteFromRequest` | Version 1 quote + pricing draft |
| `sendBrokerageQuoteWorkflow` | Notify shipper |
| `reviseBrokerageQuote` | New revision (no silent overwrite) |
| `acceptBrokerageQuoteWorkflow` | Accept + `convertRequestToLoad` |
| `setLoadCarrierRate` | Internal carrier offer rate |
| `applyLoadDistributionStrategy` | Publish / private invite |
| `saveShipmentTemplate` / `duplicateRequestFromTemplate` | Repeat lanes |

## Role projections (security)

| Data | Shipper | Carrier | AIO staff |
|------|---------|---------|-----------|
| Shipper rate | ✓ | ✗ | ✓ |
| Carrier rate | ✗ | ✓ | ✓ |
| AIO margin | ✗ | ✗ | ✓ |
| Competing offers | ✗ | ✗ | ✓ |

Enforced in UI via `freightRoleViews` / carrier projection (Load Board Phase 2) and brokerage rules.

## Routes

### Shipper portal

- `/shipper/ship-with-aio` — wizard (new)
- `/shipper/ship-with-aio/:requestId` — edit draft / complete info
- `/shipper/requests` — request list
- `/shipper/requests/:requestId` — status + action required
- `/shipper/quotes/:quoteId` — accept / decline

### AIO Office

- `/office/brokerage/requests` — New Shipper Requests queue
- `/office/brokerage/requests/:requestId` — review + pricing workspace
- `/office/brokerage/loads/:loadId` — execution + publish (existing)

## Persistence layers

| Mode | Behavior |
|------|----------|
| Demo | `demoStore` + `brokerageWorkflow` (current sprint) |
| Supabase | Load board production tables exist; shipment request migration additive for future repository adapter |

Production must **not** silently fall back to demo data when Supabase mode is active.

## Audit trail

`brokerageAuditEvents[]` records: draft updates, submit, info requests, quote draft/send/revise, acceptance, load creation, carrier rate changes, distribution strategy.

Financial edits require explicit workflow functions — no silent mutation.

## Extension hooks (not implemented)

- Automated lane pricing
- Contract rates
- Instant book policy engine
- ELD / GPS tracking
- Invoice / payment automation
