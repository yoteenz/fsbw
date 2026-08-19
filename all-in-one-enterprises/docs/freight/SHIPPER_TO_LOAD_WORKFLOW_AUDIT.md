# Shipper → Load Workflow Audit (Phase 0)

**Sprint:** AIO Direct Shipper → Brokerage → Load Board Automation  
**Date:** 2026-08-19  
**Rule:** One canonical `Load` — no duplicate freight domain.

## Executive summary

AIO already had a **demo brokerage domain** (shipment requests, quotes, loads, financials, load board publications). This sprint **extends and connects** that domain rather than rebuilding the Load Board or creating parallel load entities.

| Area | Pre-sprint state | Target | Action taken |
|------|------------------|--------|--------------|
| Shipper entry | One-click demo submit on `/shipper/shipments/new` | Structured wizard + drafts/templates | `ShipFreightRequestWizard`, routes |
| Request persistence | `ShipmentRequest` in demo store + seed | Same model, workflow engine | `brokerageWorkflow.ts` |
| Office intake | Per-shipper CRM list + manual quote button | Dedicated **New Shipper Requests** queue | `BrokerageRequestPages` |
| Quote versioning | Revisions array on `BrokerageFreightQuote` | Versioned, no silent overwrite | Workflow + staff workspace |
| Load creation | Inline `convertQuoteToLoad` in actions | `convertRequestToLoad` copies all request fields | Centralized in workflow |
| Load board | Phase 2 publications/offers | Distribution strategy after acceptance | `applyLoadDistributionStrategy` |
| Financial split | `brokerageLoadFinancials` | Shipper vs carrier rates preserved | Unchanged; wired at conversion |
| Production DB | Load board tables in AIO Supabase | Shipment request tables (additive) | Migration file (optional apply) |

## Current shipper action → data object → target flow

### 1. Ship with AIO / Request quote

| Shipper action | Current object | Target workflow | Migration/refactor |
|----------------|----------------|-----------------|-------------------|
| Open wizard | — | `ShipmentRequest` draft | New UI |
| Save draft | — | `status: draft` | `saveShipmentRequestDraft` |
| Submit | `createAndSubmitShipmentRequest` (one-click) | `status: under_review` | Wizard + `submitShipmentRequest` |
| Save template | — | `ShipmentRequestTemplate` | `saveShipmentTemplate` |
| Repeat from template | — | New draft, dates cleared | `duplicateRequestFromTemplate` |

### 2. Office review

| Staff action | Current object | Target workflow | Migration/refactor |
|--------------|----------------|-----------------|-------------------|
| See new requests | Shipper CRM only | `getPendingShipperRequests` queue | New office routes |
| Assign | `assignedBrokerStaffId` on request | Same | `assignRequestToStaff` |
| Request info | — | `BrokerageInfoRequest` | `requestMoreInformation` |
| Price | Manual dollars in CRM button | Pricing draft + margin preview | Staff workspace |
| Quote | `createBrokerageQuote` | Versioned quote + pricing draft record | `createQuoteFromRequest` |
| Send quote | `sendBrokerageQuote` | Status + shipper notification | `sendBrokerageQuoteWorkflow` |

### 3. Shipper quote acceptance

| Shipper action | Current object | Target workflow | Migration/refactor |
|----------------|----------------|-----------------|-------------------|
| View quote | `ShipperQuoteDetailPage` | Same (shipper rate only) | Existing |
| Accept | `acceptBrokerageQuote` | Locks revision, creates load | `acceptBrokerageQuoteWorkflow` |

### 4. Brokered load → load board

| Staff action | Current object | Target workflow | Migration/refactor |
|--------------|----------------|-----------------|-------------------|
| Load record | `Load` (`sourceType: brokerage`) | Same canonical load | `convertRequestToLoad` |
| Financials | `brokerageLoadFinancials` | Shipper charge + carrier pay | Auto on conversion |
| Set carrier rate | Manual on load detail | `setLoadCarrierRate` + audit | Workflow |
| Publish / invite | `publishLoadToBoard` | Strategy selector | `applyLoadDistributionStrategy` |
| Offers / booking | Phase 2 load board | Unchanged | Reuse existing |

### 5. Execution → invoice → margin

| Stage | Object | Status |
|-------|--------|--------|
| Dispatch / POD | `Load` + documents | Existing dispatch + vault |
| Shipper invoice | `brokerageShipperInvoices` | `createShipperInvoiceFromLoad` (existing) |
| Carrier payable | `carrierPayables` | Existing |
| Margin | `brokerageLoadFinancials` | Computed; staff-only view |

## Duplicate entry removed

Fields entered **once** on shipper wizard and copied forward:

- Origin / destination (city, state, zip, company)
- Pickup / delivery dates and windows
- Equipment, commodity, weight, instructions
- Shipper reference / PO

**Not** copied blindly on templates: dates, rates, carrier assignment, documents.

## Gaps / future work

- Supabase repository adapter for shipment requests (demo workflow complete first)
- Document upload step in wizard (UI stub — `documentIds` ready)
- Full exception workspace UI (types exist elsewhere; connect in follow-up)
- Automated lane pricing / market rates (extension hooks only — no fake data)
- E2E Playwright scenario for full demo lifecycle

## Key files (pre-existing)

- `src/brokerage/brokerageTypes.ts` — domain types
- `src/demo/brokerageSeed.ts` — demo seed data
- `src/demo/brokerageActions.ts` — legacy actions (quote accept delegates to workflow)
- `src/freight/loadBoardActions.ts` — publication
- `src/dispatch/dispatchTypes.ts` — canonical `Load`
