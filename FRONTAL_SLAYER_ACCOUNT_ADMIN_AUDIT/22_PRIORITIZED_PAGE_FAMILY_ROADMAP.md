# 22 — Prioritized Page-Family Roadmap

The roadmap is organised by **page family and shared dependency**, not by individual bug. The phases follow the brief, adjusted to what the repository actually needs. There is one insertion: **Phase 0B (security and money hotfixes)** has to come before any page work, because several live paths can grant value without payment or charge the wrong amount.

Effort is in relative sizes (S / M / L / XL) for one engineer-agent sprint cadence.

---

## PHASE 0A — Page tree and information architecture approval  (S)

| Field | Detail |
|---|---|
| Routes affected | None (decision only) |
| Deliverable | Founder approves docs 05, 06 and 24 (FD-A*, FD-B*) |
| Completion standard | Approved trees are recorded in `motherboard/CORE.md`, and the doc 08 matrix is frozen as the IA contract |
| Risk | Starting Phases 2–3 without approval risks rework of navigation labels and new routes |

## PHASE 0B — Security and money hotfixes  (M)  ← **do first**

| Field | Detail |
|---|---|
| Routes affected | `/checkout/upgrade`, `/checkout/slay-tickets`, `/account/rewards` (cancel), `/account/concierge` (test-order injection), `/account/payment` (hide raw card form), `/slay-cam` (copy), BAW checkout |
| Data dependencies | Migration S0 (doc 14): revoke `anon`/`authenticated` EXECUTE on service-only SECURITY DEFINER functions; drop the legacy 001 write policies on `orders`, `meetings`, `notifications`, `reviews`; fix hair-analysis SQL counts to `1,4`; zero client balances on profile INSERT; add `psa_tool_events` RLS to the repo |
| Functional treatment | Slay-ticket credit only from the Stripe webhook. Autopay reads Stripe ids from `profiles` only. BAW lines: the server quote returns `resolved:false` and **blocks Stripe** until server pricing exists, or the founder accepts an interim manual-quote flow (FD-C3). Non-Stripe CONFIRM ORDER membership disabled in production (FD-C5). CANCEL SUBSCRIPTION opens the Stripe Customer Portal (FD-C6). Remove the concierge test-order injection for non-mock accounts. Slay Cam fabricated stats and testimonials removed or labelled (FD-C11). Leaked-password protection enabled. |
| Visual treatment | None (copy only on Slay Cam and membership cancel) |
| Components reused | Existing checkout and Stripe flows |
| Tests | Unit tests: quote resolver (BAW → unresolved), slay-ticket credit rejects unpaid, SQL count acceptance (1/4). Supabase advisor clean of anon-executable service functions. |
| Completion standard | Advisor shows 0 anon-executable service-only RPCs. No client path can grant premium, tickets, credits or digital cash. BAW checkout cannot under-charge. |
| Risks | Requires a production migration (founder approval FD-C1). Blocking BAW Stripe checkout pauses card sales of custom builds until Phase 5 pricing (FD-C3 trade-off). |

## PHASE 1 — Shared foundations: order source of truth + account context  (L)

| Field | Detail |
|---|---|
| Routes affected | `/checkout*`, `/account/orders`, `/account/concierge` (tracking), `/admin/revenue`, `/admin/pending` (forms), all `/account/*` (guard) |
| Data dependencies | **S1 `customer_orders` + `customer_order_items`**, **S2 `order_status_events`**. Server-generated order numbers. Order created at PaymentIntent creation (`pending_payment`) with server-quoted lines and the BAW configuration snapshot; the webhook flips it to `paid`. Legacy `orders` JSON kept as a read projection during migration. |
| Functional treatment | `syncOrdersFromApi` merges by id instead of overwriting. The order-form approval matches the server order id. One `AccountLayoutRoute` guard (no per-page re-sync). `AccountShell` extracted (no visual change). `signInReturnTo` keeps `#hash`. |
| Components reused | Existing order cards, stage timeline, `ConsultOfferClaimModal`, `AccountRouteGuard` logic |
| Missing components | `AccountShell`, `AccountLayoutRoute`, `StatusTimeline` (extracted) |
| Tests | API tests for order creation and webhook idempotency; a status-transition table test; a Playwright test (non-production) for checkout → order visible on a second device |
| Completion standard | A purchase on device A appears with full line items on device B and in admin. Order numbers are unique. Admin form approval changes the server order. |
| Risks | The largest change in the plan. It touches checkout (approve via FD-C2). Live production has 0 orders, so data migration risk is low. **Do it now, before launch volume.** |

## PHASE 2 — Customer account core  (M)

| Field | Detail |
|---|---|
| Routes affected | `/account` (overview), `/account/orders`, **new `/account/orders/:orderId`**, `/account/settings`, `/account/shipping`, `/account/payment`, `/account/alerts`, `/account/consult-offer` (retire), `/wishlist` |
| Data dependencies | S1/S2 (Phase 1), S11 `customer_notifications`, `profiles.saved_addresses` (exists), Stripe Customer Portal / SetupIntent, S12 preferences |
| Visual treatment | **Type A:** overview status panels (doc 21) inside the existing glass vocabulary; consistent back targets; ≥44px targets |
| Functional treatment | **Type B:** addresses persisted; payment methods via Stripe (raw card inputs removed); birthday editable once; alerts read state on the server; one sign-out implementation; LEAVE A REVIEW eligibility from server DELIVERED; notification toggles enforced by senders |
| Components reused | Hub card grid, alert-row typography, `ConfirmationModal`, `PageActionsBelowCard` |
| Missing components | `EmptyState`, `ErrorState`/toast, `/api/account/overview` |
| Tests | Unit tests for overview aggregation; Playwright on mobile (390) for overview, order detail, settings save |
| Completion standard | The brief §31 completeness definition for every Phase 2 page |
| Risks | Overview panels are a visible change (design gate 2) |

## PHASE 3 — Admin operational core  (L)

| Field | Detail |
|---|---|
| Routes affected | `/admin/dashboard` (Command Center), **new `/admin/orders`, `/admin/orders/:orderId`, `/admin/clients/:userId`, `/admin/inventory`**, `/admin/clients/*`, `/admin/pending`, `/admin/meetings*`, `/admin/backend`, `/admin/alerts`, `/admin/users` and `/admin/audit` (fold) |
| Data dependencies | S1/S2, S3 `order_refunds`, S6 `admin_roles` + audit before/after, S14 inventory/waitlist |
| Visual treatment | Admin menu drawer (design gate 4); Command Center layout (gate 1); wide shell at ≥1024px (gate 3); remove all mock merges and fixtures |
| Functional treatment | Status, tracking and refund through server APIs with audit. Real customer disable (from users). Meetings edit fixed. Approvals with error handling, no seeded forms. Server inventory driving storefront sold-out. Command Center queues (doc 20). |
| Components reused | `AdminHubPageShell` → `AdminPageShell`, `AdminHubTabBar`, `StatsCard`, `ConfirmationModal`, existing client-detail tabs (extracted) |
| Missing components | `AdminDetailLayout`, `GlassDrawer`, `/api/admin/orders` (write), `/api/admin/command-center`, `/api/admin/inventory` |
| Tests | API tests for every admin mutation (auth + audit row). Playwright admin spec against a seeded non-production project. |
| Completion standard | Every admin action changes server state that the customer sees. Zero fabricated numbers. Every mutation writes `audit_log`. |
| Risks | Removing mock data will make the admin look empty. That is expected and honest (0 live orders). |

## PHASE 4 — Membership and rewards  (L)

| Field | Detail |
|---|---|
| Routes affected | `/account/rewards` (tabs), `/account/load-card`, `/account/collectibles`, Concierge gifts, **new `/admin/rewards`**, checkout redemption |
| Data dependencies | S4 ledgers (points, wallet, vouchers, gift/promo codes, tier view), S5 `membership_events`, S13 `slay_challenge_progress`; founder decisions FD-R1…R14 |
| Functional treatment | Ledger-backed balances; real REDEEM; vouchers issued and consumed server-side; server gift-card codes; spend tier written server-side; Slay Challenge progress driven by real events and advancing the **existing 3-phase PNG art**; membership billing history; admin adjustments (audited, founder-gated per FD-B3) |
| Visual treatment | Type A: tabs within the existing rewards page; no new art |
| Tests | Ledger property tests (balance = sum); idempotency of grants; Playwright redeem flow |
| Completion standard | Doc 15 §6 |
| Risks | Business-rule decisions are required first (FD-R*). Don't start Phase 4 without them. |

## PHASE 5 — Hair Analysis, Build-A-Wig and community  (L)

| Field | Detail |
|---|---|
| Routes affected | **New `/account/hair`**; `/tools/hairstyle-analysis` (admin-only); PSA selfie panel; BAW edit gate; `/account/reviews`; `/account/orders/:id/review`; `/admin/pending` (+ SLAY CAM, reported comments); `/admin/reviews`; `/slay-cam`; wishlist lists/shared; `/admin/inventory` BAW options |
| Data dependencies | S8 saved configurations + wishlist lists, S9 analysis results, S10 content submissions + storage bucket, S12 hair profile; single BAW option/price catalogue consumed by client and server quote |
| Functional treatment | Persist and show analyses; deliver PSA picks; consult add-on fulfilment queue; save/duplicate/resume builds; server BAW pricing (lifts the Phase 0B block); public reviews with consent; Slay Cam submission → moderation → feature/MVP; reported-comment queue |
| Visual treatment | MY HAIR page in the account language (design gate 6). **No change to the BAW Atelier shell.** |
| Tests | Quote parity test (client price == server price for every option combination sampled); upload size/type tests; moderation state machine tests |
| Risks | Consent wording needs founder approval (FD-C8). BAW pricing parity across 6 existing tables. |

## PHASE 6 — Affiliate, referral, marketing and support  (M)

| Field | Detail |
|---|---|
| Routes affected | `/account/affiliate`, `/account/referrals`, `/admin/rewards` (referrals tab), `/admin/messages` (INBOX reply), `/admin/marketing` (tab consolidation, customer notifications), `/admin/brand` (real overview), `/admin/brand/edit/*` (server-persisted copy), `/admin/workers`, `/admin/trend-desk` and `/admin/slay-forecast-broadcast` (re-skin) |
| Data dependencies | S4 ledger, S7 `support_requests`, S15 referrals |
| Functional treatment | Affiliate approval credits the canonical points with server caps and duplicate prevention; server referral validation, credit and revocation; inbox reply and threads (customer sees replies in Concierge and MY REQUESTS); FAQ from the server table; job applications server-side |
| Tests | Caps and duplicate-award tests; referral self-use / first-purchase tests |
| Risks | Referral and affiliate amounts are founder decisions (FD-R9, FD-R10) |

## PHASE 7 — Responsive polish, QA and end-to-end tests  (M)

| Field | Detail |
|---|---|
| Scope | All approved pages at 390 / 768 / 1440 / 2560 (doc 19); keyboard and focus; ≥44px targets; remove nested scroll boxes; admin table internal scroll; Desktop Penthouse reading the same server data |
| Tests | Playwright mobile + desktop projects for every page in docs 09/10 (non-production Supabase branch); axe accessibility pass (`@axe-core/playwright` is already a SITE00 pattern) |
| Completion standard | Every page reaches **COMPLETE_AND_VERIFIED** per the brief §31 definition |

---

## Sequencing summary

```
0A IA approval ─┐
0B Security & money hotfixes ─→ 1 Order truth + account context ─┬→ 2 Customer core ─┐
                                                                 └→ 3 Admin core ─────┼→ 4 Rewards ─→ 6 Affiliate/Marketing/Support
                                                                                      └→ 5 Hair/BAW/Community
                                                                                                    └────────→ 7 QA (continuous, final pass)
```

Phases 2 and 3 can run in parallel after Phase 1. Phase 5's BAW pricing can start any time after 0B, because it is independent of orders.
