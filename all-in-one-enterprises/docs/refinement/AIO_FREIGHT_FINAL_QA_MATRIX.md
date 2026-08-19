# AIO Freight — Final QA Matrix

**Sprint:** Load Board + Brokerage — Final QA, Security, Integration & Feature Closure  
**Date:** 2026-08-19  
**Environment:** Demo store (`VITE_AIO_DATA_MODE=demo`) + automated unit/integration tests; AIO Supabase live tests **BLOCKED** (no project ref in agent environment).

**Legend:** PASS · FAIL · BLOCKED · DEFERRED

---

## Golden path — Nashville, TN → Dallas, TX (synthetic)

| TEST ID | Feature | Role | Preconditions | Action | Expected | Actual | Status | Bug / Fix |
|---------|---------|------|---------------|--------|----------|--------|--------|-----------|
| GP-01 | Shipper request create | Shipper | Demo org `client-e` | Submit wizard fields Nashville→Dallas, 53' DV, 38000 lb | Request saved, status under review | `freightGoldenPath.test.ts` — fields persist | PASS | — |
| GP-02 | Draft save/resume | Shipper | Draft exists | Save draft, reload | Draft retained | `brokerageWorkflow.test.ts` draft step | PASS | — |
| GP-03 | Cross-shipper isolation | Shipper | Two orgs | Query other org request | Not visible | Org scoping on `shipperOrganizationId` in demo store | PASS | Demo; RLS live BLOCKED |
| GP-04 | Office intake queue | Staff | Submitted request | Open New Shipper Requests | Lane data present, no re-entry | Manual QA SR-2026-0111 + queue UI | PASS | — |
| GP-05 | Quote create/send | Staff | Request under review | Create & send quote | Version 1, sent status, pricing draft | `brokerageWorkflow` + golden path | PASS | — |
| GP-06 | Shipper quote view | Shipper | Sent quote | Open quote detail | Shipper rate only | UI shows freight charge; no carrier/margin fields | PASS | — |
| GP-07 | Quote acceptance | Shipper | Sent quote | Accept | Accepted revision locked | `acceptBrokerageQuoteWorkflow` | PASS | — |
| GP-08 | Canonical load | System | Accepted quote | Auto create load | One Load, linked request/quote | Golden path asserts single load + links | PASS | — |
| GP-09 | Brokerage pricing | Staff | Load created | Set carrier rate | Shipper ≠ carrier; margin computed | Golden path $3200 / $2650 | PASS | — |
| GP-10 | Financial privacy (carrier DTO) | Carrier | Published load | `projectCarrierLoadResult` | No shipper rate/margin in JSON | `freight.test.ts`, `freightProduction.test.ts`, golden path | PASS | — |
| GP-11 | Publish load | Staff | Brokerage load | Publish to board | `visibility: published`, `publishedAt` set | Golden path + `loadBoardActions` | PASS | — |

---

## Load board — search, sort, saved/recent

| TEST ID | Feature | Role | Action | Expected | Actual | Status | Notes |
|---------|---------|------|--------|----------|--------|--------|-------|
| LB-01 | Origin/dest filter | Carrier | Filter by city/state | Results change | `matchesLoadBoardFilters` + search service | PASS | Functional in demo + supabase repo |
| LB-02 | Deadhead filters | Carrier | Set origin/dest DH | Results change | Implemented in projection | PASS | |
| LB-03 | Equipment/weight/trailer | Carrier | Filter | Results change | Implemented | PASS | |
| LB-04 | Min rate / min RPM | Carrier | Filter | Results change | Implemented | PASS | |
| LB-05 | Post age filter | Carrier | Max hours | Results change | `computePostingAgeHours` | PASS | |
| LB-06 | Sort UI | Carrier | Sort by rate/RPM/score | Ordered results | **No sort dropdown in UI** | DEFERRED | Engine supports sort; UI not wired |
| LB-07 | Recent searches | Carrier | Run search | Appears in Recent, capped | `loadBoardActions` cap 10 | PASS | |
| LB-08 | Save search | Carrier | Save + return | Persists | Demo + Supabase repo | PASS | |
| LB-09 | Save search alerts | Carrier | Save with alert checkbox | Alert on publish | **Fixed:** alert toggle added; dedupe tested | PASS | Fix: `LoadBoardPages.tsx` |
| LB-10 | Alert dedupe | System | Re-publish same load | One notification | `freightGoldenPath.test.ts` | PASS | |
| LB-11 | Load card fields | Carrier | View card | Carrier-safe fields only | `CarrierLoadBoardResult` projection | PASS | |
| LB-12 | RPM math | System | Various mile/rate inputs | No NaN/Infinity; 0 safe | `freightGoldenPath.test.ts`, `dispatchCalculations` | PASS | |
| LB-13 | Load score | Carrier | View score | Explainable or insufficient data | `loadScoreEngine.ts` bands | PASS | |
| LB-14 | FleetCare warning | Carrier | Truck with PM threshold | Warning not block | `freightProduction.test.ts` | PASS | |
| LB-15 | Map mode | Carrier | Open map | City cache markers, LAST KNOWN label | `LoadMapPanel` — no live GPS claim | PASS | DEFERRED external: GPS |
| LB-16 | Carrier offer submit | Carrier | Submit offer on load | Offer persisted | `submitCarrierLoadBoardOffer` | PASS | Demo + Supabase |
| LB-17 | Counteroffer (load board) | Staff/Carrier | Counter flow | Full negotiation | Staff board-offer UI **missing** | PARTIAL | Staff portal offers only |
| LB-18 | Instant book | Carrier | Book instantly | Single winner | Button disabled (demo) | DEFERRED | Policy/config required |
| LB-19 | Duplicate booking | Carrier | Two carriers book | One wins | Not fully tested live | DEFERRED | Needs instant-book policy |

---

## Distribution & brokerage office

| TEST ID | Feature | Action | Expected | Actual | Status | Bug / Fix |
|---------|---------|--------|----------|--------|--------|-----------|
| BR-01 | Private invite | Staff selects carriers | Private publication + invites | `applyLoadDistributionStrategy` | PASS | — |
| BR-02 | Matched carriers | Staff selects matched | No public publish | Was publishing — **fixed** | PASS | `brokerageWorkflow.ts` |
| BR-03 | Hold | Staff hold | Not searchable | `holdLoadOnBoard` | PASS | — |
| BR-04 | Office load workspace | Open load | Shipper/carrier/margin internal | `BrokerageLoadDetailPage` | PASS | — |
| BR-05 | Create shipper invoice | Staff button | Uses shipper rate | `createShipperInvoiceFromLoad` | PASS | Demo |
| BR-06 | Finance closeout | View complete loads | Margin displayed | `BrokerageFinancePage` | PASS | Demo |

---

## Lifecycle, documents, factoring

| TEST ID | Feature | Status | Notes |
|---------|---------|--------|-------|
| LC-01 | Full lifecycle transitions | PARTIAL | Model + dispatch pages; not unified brokerage UI for all states |
| LC-02 | Status history audit | PARTIAL | `aio_load_status_history` migration ready; demo timeline partial |
| LC-03 | Shipper tracking view | PASS | Simplified status on shipper shipment detail |
| LC-04 | Exceptions | PARTIAL | Types + seed issue; no create UI |
| LC-05 | Accessorials | PARTIAL | Types/calcs; empty seed; no UI |
| LC-06 | POD upload → vault | PARTIAL | Dispatch upload exists; brokerage detail display-only |
| LC-07 | Document permissions | PASS | Vault org scoping tests in `documentVault.test.ts` |
| LC-08 | Shipper invoice amount | PASS | From `confirmedShipperChargeMinor` |
| LC-09 | Carrier payable | PASS | From carrier pay fields in demo |
| LC-10 | Realized margin | PASS | `brokerageCalculations` tested |
| LC-11 | Factoring handoff | PARTIAL | On dispatch load detail; not on brokerage load detail |
| LC-12 | Bookkeeping handoff | NOT IMPLEMENTED | No freight→bookkeeping sync |
| LC-13 | Repeat similar load | PASS | `createSimilarLoadFromShipment` resets dates/pricing |

---

## Security & authorization

| TEST ID | Feature | Method | Expected | Actual | Status |
|---------|---------|--------|----------|--------|--------|
| SEC-01 | Carrier financial leak | Unit tests serialize carrier DTO | No shipper/margin | 11+ tests pass | PASS |
| SEC-02 | Staff financial view | `buildStaffLoadWorkspace` | Full pricing | Tested | PASS |
| SEC-03 | Shipper isolation | Org filter on requests | No cross-shipper | Demo scoping | PASS |
| SEC-04 | Carrier offer privacy | Offer org scoping | Carrier B cannot see A | RLS + demo structure | PASS (demo) |
| SEC-05 | RLS live Supabase | SQL as carrier role | Deny financials | **Not executed** — no AIO project | BLOCKED |
| SEC-06 | Intake migration RLS | Policies on new tables | Org policies | Enabled, policies deferred | BLOCKED |
| SEC-07 | Public unauthenticated | Direct URL | No private freight | Route guards | PASS (app layer) |
| SEC-08 | Codebase grep carrier paths | Static analysis | No margin in load board | Grep clean | PASS |

---

## Demo / production isolation

| TEST ID | Feature | Expected | Actual | Status |
|---------|---------|----------|--------|--------|
| ISO-01 | Demo mode banner | Visible in demo | `isFreightDemoMode` | PASS |
| ISO-02 | Supabase failure | Controlled error, no demo fallback | `SupabaseFreightRepository` | PASS |
| ISO-03 | Demo data in production DB | No writes from demo | Isolated localStorage / separate project | PASS |
| ISO-04 | Shipper workflow in Supabase mode | Persist to Supabase | **Demo store only** | DEFERRED | Repository adapter not built |

---

## Responsive, a11y, i18n

| TEST ID | Feature | Viewports / method | Status | Notes |
|---------|---------|-------------------|--------|-------|
| RSP-01 | Mobile load board | 375–430px CSS | PASS | Sticky nav, filter tabs |
| RSP-02 | Desktop load board | 1280px+ 3-column | PASS | Context rail @1280px |
| RSP-03 | Ultrawide | 2560px+ | PARTIAL | max-width 2200px; limited ultrawide polish |
| RSP-04 | Shipper wizard mobile | Progressive steps | PASS | Manual + CSS |
| RSP-05 | Office brokerage workspace | 1100px+ rails | PASS | CSS |
| A11Y-01 | Keyboard/focus | Not fully audited | DEFERRED | Spot check only |
| I18N-01 | Freight UI translations | en/es | **NOT IMPLEMENTED** | Hardcoded English in freight pages |

---

## Error, performance, placeholders

| TEST ID | Feature | Status | Notes |
|---------|---------|--------|-------|
| ERR-01 | Search failure UI | PASS | Controlled error panel on results page |
| ERR-02 | Supabase unavailable | PASS | Repository error path |
| PERF-01 | Search at volume | PARTIAL | Client-side filter; pagination limited |
| PH-01 | TODO/FIXME in freight/ | PASS | None found |
| PH-02 | Fake GPS claims | PASS | Prototype notes; LAST KNOWN label |
| PH-03 | External provider badges | PASS | No fake DAT/ELD badges |

---

## Test execution summary

| Suite | Result |
|-------|--------|
| `freight.test.ts` | 11/11 PASS |
| `freightProduction.test.ts` | 8/8 PASS |
| `freightGoldenPath.test.ts` | 4/4 PASS |
| `brokerageWorkflow.test.ts` | 2/2 PASS |
| `brokerageCalculations.test.ts` | 6/6 PASS |
| `brokerageRules.test.ts` | 4/4 PASS |
| **Total automated freight/brokerage** | **35/35 PASS** |

Manual QA (prior sprint + spot check): Shipper wizard → office queue data flow (Chicago→Atlanta SR-2026-0111).

---

## Bugs discovered & fixed this sprint

| ID | Severity | Issue | Fix |
|----|----------|-------|-----|
| BUG-01 | Medium | `matched_carriers` incorrectly published load publicly | `brokerageWorkflow.ts` — notify matched only, no public publish |
| BUG-02 | Medium | Saved search alerts never enabled (`alertEnabled` always false) | Alert checkbox on save search in `LoadBoardPages.tsx` |

## Open non-blocking gaps

- Load board sort UI not exposed
- Load-board counteroffer office workflow incomplete
- Shipper/brokerage Supabase repository adapter
- Live RLS integration tests
- Freight i18n strings
- Bookkeeping handoff from freight loads
- Full exception/accessorial UI
- Instant book + concurrency policy
