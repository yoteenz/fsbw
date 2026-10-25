# 09 — Hair Analysis and Build-A-Wig Architecture

**The Build-A-Wig Atelier and the Hairstyle Analysis visual templates are not redesigned.** This document covers ownership, persistence, pricing authority and the account/admin connections. Evidence: audit doc 16, `appendix/F`, live checks (doc 02 §5 of the audit).

## 1. Hair Analysis: target model

| Concern | Target | Today |
|---|---|---|
| Entry points | MY HAIR › ANALYSES › NEW ANALYSIS (drawer) · PSA chip "Find my best looks" · consult booking add-on | Admin harness reachable by URL; PSA result discarded; consult add-on unfulfilled |
| Entitlement | Server resolver (`hairstyleAnalysisEntitlement.ts`, keep) with eligibility per decision E1 | Server-enforced, but RPCs callable by anon (C2) |
| Credit consumption | Service-role RPC only; consume before generation, refund on failure (keep the existing logic) | Same, but in-memory fallback on DB error (fail-open). Target: **fail closed** |
| Purchase | Stripe PI → webhook → `grant_purchase_credits(counts 1,4)` | SQL accepts 1,3,6, so the 4-pack grants nothing (live) |
| Result storage | `hairstyle_analysis_results` (id, user_id, source: template/psa/consult, inputs refs, result image copied to a **private** Supabase bucket, manifest JSON of looks and matched units, status, credit source) | Not stored; temporary Fal URL only |
| History | MY HAIR › ANALYSES list + `/account/hair/analyses/:id` | none |
| Async delivery | PSA picks and consult add-on create a `pending` result; on completion → `customer_notifications` + email with the deep link | PSA promises 24h and nothing happens |
| Admin | REWARDS console › ANALYSIS CREDITS (usage, grants, failed grants, manual grant with reason) · MEETINGS › consult add-on fulfilment queue | none |
| Privacy | Consent line at upload (decision E3 wording); selfie stored privately with a retention period; deletion from SETTINGS › PRIVACY & DATA and on account deletion; vendor processing disclosed | No consent, no retention, no deletion |
| Harness | `/tools/hairstyle-analysis` admin-only (decision E2) | Customer-reachable, demo identity, consumes a credit |

**State machine for a result:** `requested → generating → ready` (→ `failed` → credit refunded), plus `delivered` once the customer has opened it.

## 2. Build-A-Wig: ownership model

| Object | Owner | Lifetime | Where it shows |
|---|---|---|---|
| In-progress selections | Browser draft (allowed per doc 06 §4), **namespaced per unit and user** (today global keys collide) | until saved, added to bag or cleared | Atelier |
| Saved build | `saved_configurations` (name, base unit, normalized options, preview image ref, **no price stored as truth**, `catalog_version`) | until deleted | MY HAIR › BUILDS; open → `/build-a-wig/<unit>/customize?build=:id` |
| Bag line | `cart` (server, versioned) with a configuration reference | until checkout | Bag |
| Purchased configuration | `customer_order_items.configuration_snapshot` (immutable) + catalogue version + server-computed price breakdown | forever | Order detail (customer and admin) |
| Price catalogue | One module (decision E5: code-defined with an admin view, or admin-editable table) used by Atelier UI, cart, server quote, special offers and consult offers | versioned | — |

### Pricing authority
- The **server computes every price.** The client only displays.
- A quote for a BAW line = base unit + cap + each option surcharge/discount from the catalogue. It is validated against allowed combinations: unit-specific colours (e.g. BLANCO colour set), curly styling set, premium-only options checked against the **server** membership.
- A saved build re-prices on open. If the catalogue changed since saving, the customer sees "price updated".

## 3. Customer journeys (target)

| Journey | Steps |
|---|---|
| Save a build | Atelier → SAVE BUILD (name) → `saved_configurations` → toast with a link to MY HAIR › BUILDS |
| Resume | MY HAIR › BUILDS → OPEN → Atelier pre-filled (any device) |
| Duplicate | BUILDS › DUPLICATE → new saved build ("NOIR — copy") |
| Edit from bag | Bag → EDIT IN BUILD-A-WIG (gate per decision E4) → Atelier → UPDATE BAG |
| Buy | Bag → checkout → server quote (full price) → PI → order with snapshot |
| See what I bought | ORDERS › ORDER DETAIL shows the configuration lines and preview |

## 4. Interim Build-A-Wig checkout (until S1B ships)

**Requirement:** no client-controlled totals and no undercharged custom orders, while the Atelier stays open and inspiring.

**Recommended interim (decision A2, option 1): "Concierge-confirmed custom quote".** It reuses the existing consult-offer system.
1. The Atelier and ADD TO BAG work as they do today. In the bag, custom lines show **"CUSTOM UNIT · FINAL PRICE CONFIRMED BY YOUR CONCIERGE"** with the estimate in gray (not a charge).
2. Checkout pays non-custom lines by card normally. Custom lines are routed to **REQUEST MY CUSTOM QUOTE**, which saves the configuration (server) and creates a quote request.
3. The admin sees the request (MEETINGS › CUSTOM QUOTES, using the existing Send Offer builder) and sends a **consult offer**: `consult_quotes.selections` + `price_breakdown`, already audited.
4. The customer gets the existing alert and email → **VIEW OFFER** → pays exactly the quoted amount, which the **server reads from `consult_quotes`** (never from the client). The offer expires per the existing 72h rule.

- **Option 2:** block card checkout for custom lines and send the customer to **Book a consultation**. Simpler, but adds friction.
- **Option 3:** keep the current behaviour. **Not acceptable:** it undercharges, so it is not recommended.

## 5. Admin connections

| Need | Where |
|---|---|
| Option catalogue, availability, prices | CATALOG & INVENTORY › BUILD-A-WIG OPTIONS & PRICING (S5) |
| Invalid selections | Rejected by the server quote with a reason; admin sees rejected attempts in the order detail or quote request |
| Review custom configurations | MEETINGS › CUSTOM QUOTES (interim) → ORDER DETAIL (after S1B) |
| Inspect submitted orders | ORDER DETAIL › items › configuration snapshot (customer and admin see the same) |
| Unit availability | `inventory_items` per unit SKU; per-option availability later (optional, decision E5) |

## 6. Shared hair context

`hair_profile` (customer-owned, opt-in): cap size or head measurements, texture, colour family, density and lace preferences, and the last selfie reference (private). It is used to **pre-fill** Hair Analysis, the Atelier cap-size step and consult booking. The customer can view, edit and clear it in MY HAIR › PROFILE, and consent is recorded (decision E3).
