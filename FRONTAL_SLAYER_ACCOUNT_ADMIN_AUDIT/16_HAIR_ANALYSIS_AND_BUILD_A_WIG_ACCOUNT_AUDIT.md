# 16 — Hair Analysis and Build-A-Wig: Account Integration Audit

Scope: how these features connect to customer accounts and to admin. The Build-A-Wig Atelier's immersive shell, background assets and step UI are **not** evaluated or redesigned. The recommendation logic is **not** changed. Full evidence: `appendix/F_hair_baw_slaycam.md`.

## 1. Hair Analysis

### Surfaces

| Surface | Reality |
|---|---|
| `/tools/hairstyle-analysis` | The **admin debug harness**, but any member can reach it by URL. It always renders the "KATEENA ARMSTRONG" demo analysis and consumes the member's real monthly credit. No navigation links to it. |
| PSA chat "FIND MY BEST LOOKS" | Server-gated (premium). The **response is discarded**, and the customer is told results arrive "within 24 hours". They never do. |
| Consult booking "style analysis" add-on ($20 / $60) | Paid. The selfie stays in the local order JSON. **No fulfilment path and no admin UI.** |
| `/mobile/analysis` | Placeholder slots |

### Lifecycle

| Step | Status | Evidence |
|---|---|---|
| Entitlement (subscription tier) | **Server-enforced** | `hairstyleAnalysisEntitlement.ts` |
| Credit consumption + refund on failure | **Server-enforced** (soft fail-open to in-memory limiter on DB error) | `hairstyle-analysis-generate.ts:209-245` |
| Paid credits 1 / 4 | **4-pack grants nothing** (live SQL accepts 1/3/6) | doc 13, BW-08 |
| RPC exposure | **anon/authenticated can call grant/consume/refund** (live) | doc 13 C2 |
| Result storage | **None.** The image URL lives in React state; the Fal CDN URL is temporary | `HairstyleAnalysisPreview.tsx:463-476` |
| Return to past analyses | **Impossible** | — |
| Admin visibility of usage/grants/failures | **None** | — |
| Consult generation endpoint | Sign-in only; no entitlement or quota | M9 |
| Privacy | Selfies go to Fal and OpenAI with no consent capture, no retention statement and no deletion path | — |

### Missing journeys and governance

- Customer: "My analyses" history; delivery of PSA picks; delivery of the consult add-on.
- Admin: usage and grant viewer; manual grant/adjust (also the remediation path for 4-pack buyers); a consult fulfilment queue.
- Governance: consent and retention policy for selfies; quota on every generation endpoint.

## 2. Build-A-Wig ↔ account

| Capability | Customer | Status |
|---|---|---|
| Configure (9 steps) | Works on the client; selections in **global, un-namespaced** localStorage keys | OK (same device) |
| **Save a configuration** | No entity exists. Workaround: bag → "+ LIST" (wishlist, server-synced), which freezes the price | MISSING |
| Resume | Same device only; no per-unit draft | PARTIAL |
| Duplicate | None | MISSING |
| View selected options | Cart/bag detail | OK |
| Understand pricing | Client price tables duplicated in 6+ places | PARTIAL |
| **Server price authority** | The Stripe quote charges **base + cap only** for BAW lines | **BROKEN (P0 revenue, BW-04)** |
| Add to cart | Works | OK |
| Edit from cart | **Premium-only gate**; canon says sign-in only | PARTIAL (FD-A8) |
| Find previous builds | Wishlist lists, or local order history only. **The server order has no line items or spec** | BROKEN |
| PSA → BAW prefill | Works (client) | OK |

| Capability | Admin | Status |
|---|---|---|
| Manage options | Constants in code (`src/utils/productOptions.ts`) and separate customer tables | MISSING |
| Manage pricing rules | No editor; 6+ hand-synced tables, including the server quote | MISSING |
| Manage availability | Edit-inventory writes the admin's localStorage only; no per-option availability | DISCONNECTED |
| Review custom configurations | Consult offers (Meetings → Send offer) work and are audited | OK |
| Inspect submitted orders with BAW config | Server orders carry no config | **BROKEN** |
| Resolve invalid selections | No validator anywhere (cart, quote or admin) | MISSING |

### Shared customer context (no re-entry)

There is **no hair profile entity**. Cap size (BAW step), consult head measurements (local, per user), texture/colour preferences, selfies and analysis results are each collected separately and never prefill each other. The only bridge is PSA → BAW prefill.

**Proposal (FD-A2):** a `hair_profile` (cap size/measurements, texture, colour, density, lace preference) owned by the customer, editable at **MY HAIR › PROFILE**, offered as prefill in Hair Analysis, BAW cap-size and consult booking. It is opt-in, and the customer can clear it (consent and control preserved).

## 3. Recommended treatment

| Item | Treatment | Phase |
|---|---|---|
| BAW server quote fail-closed (block Stripe for unresolved custom lines) **or** server-side BAW pricing from one catalogue | Type B, P0 | 0B → 5 |
| SQL counts 1/4; revoke anon RPC grants; manual grant tool for affected buyers | Type B, P0 | 0B |
| Server order line items with configuration snapshot | Type B/C | 1 |
| MY HAIR page (PROFILE / ANALYSES / SAVED BUILDS) + `saved_configurations` + `hairstyle_analysis_results` | Type C (new page, approval) | 5 |
| Make `/tools/hairstyle-analysis` admin-only; customer entry via MY HAIR | Type B | 5 |
| Deliver PSA picks (store and show in MY HAIR › ANALYSES; notify) | Type B | 5 |
| Consult add-on fulfilment queue in Meetings | Type B | 5 |
| Admin options/pricing editor (single catalogue consumed by client and server) | Type C | 5 (later) |
