# 19 — Release Readiness and E2E Test Matrix

**Every test below has status NOT RUN.** This sprint is planning only: no test was written or executed, and no result is implied. Status values used later: NOT RUN → PASS / FAIL / BLOCKED, each with a link to the CI run or recording.

## 1. Test environment (precondition for any PASS)

| Requirement | Detail | Decision |
|---|---|---|
| Staging deployment | Separate Vercel project pointing at a **Supabase branch** (never the shared production project) | H2 |
| Stripe | Test mode keys, webhook endpoint on staging, test clocks for renewals | H2 |
| Accounts | GUEST · CUSTOMER (no orders) · CUSTOMER (delivered order) · MEMBER 3 / 6 / 12 · BLACK spend tier · ADMIN · FOUNDER | H2 |
| Devices | Two browsers per customer (cross-device checks) · widths 375, 448, 720, 1024, 1280, 1920 | — |
| Cross-product | SITE00 sign-in + profile sync and JURNL signup against the same Supabase branch | H3 |
| Email | Resend test domain or capture inbox | — |

## 2. Release gates

| Gate | Must be true before release | Evidence |
|---|---|---|
| S0B-1 | R-01, R-04, R-10 closed; SQL suite green; advisor 0 anon-executable service functions; SITE00 and JURNL signup and profile sync pass on the branch | SQL suite run, advisor output, smoke recording |
| S0B-2 | No client path grants value (static gate + E2E W-08, W-11, W-31, W-32); BAW interim path works (W-02); autopay off or server-resolved (W-16) | CI + E2E recordings |
| S1 | W-01 cross-device parity; webhook replay idempotent; order numbers unique; quote total = PI amount | E2E + integration |
| S1B | BAW parity over option combinations | Parity suite |
| S2 / S3 | Every page in scope at status G or H per doc 13; redirect suite green (05 CSV); every admin mutation audited | Page DoD checklist |
| S4 | Ledger invariants hold; reversals on refund; expiry job idempotent | Integration suite |
| S5 / S6 | Content, consent, referral and support workflows green | E2E |
| S7 / launch | Decision H1 launch definition met; all D1–D16 evidence attached for launch-scope pages | Release readiness review |

## 3. Workflow E2E matrix

| Test | Workflow | Sprint | Accounts | Verification (from doc 04) | Authoritative record checked | Prior defects | Status |
|---|---|---|---|---|---|---|---|
| W-01 | Standard product purchase | S1 | Customer + Admin | E2E: test-mode card → order row with items and sequence number; replayed webhook creates no duplicate; second browser shows the same order | customer_orders + customer_order_items written by the webhook on payment_intent.succeeded; order number from a DB sequence | BW-01, BW-22 | NOT RUN |
| W-02 | Build-A-Wig custom purchase | S0B-2 (interim) → S1B | Customer + Admin | E2E: build with colour/length/lace add-ons → charged amount equals the server quote; tampered client total rejected (unit test on resolveQuote) | saved_configurations (build spec) + customer_orders with the server-priced line and frozen spec snapshot | BW-04 | NOT RUN |
| W-03 | Customer order cancellation | S1 | Customer + Admin | E2E: request → admin approve → Stripe test refund exists → customer sees CANCELLED + refund line | support_requests (type=cancellation) linked to order; order status unchanged until admin decides | BW-03 | NOT RUN |
| W-04 | Refund (full or partial) | S1 | Customer + Admin | E2E: partial refund → Stripe test refund amount matches → loyalty_ledger reversal rows exist → balances recomputed | order_refunds row (amount, reason, stripe_refund_id) + order status REFUNDED/PARTIALLY_REFUNDED; ledger reversals for points/cash/vouchers earned or used | BW-03 | NOT RUN |
| W-05 | Fulfilment and production status | S1/S3 | Customer + Admin | E2E: admin advances to IN PRODUCTION → customer timeline updates in another session; illegal jump rejected | customer_orders.status + order_status_events (canonical vocabulary per C4) | BW-02, BW-21 | NOT RUN |
| W-06 | Shipping and tracking | S1 | Customer + Admin | E2E: add tracking → customer order detail shows link; DELIVERED enables review button (closes BW-19) | order shipment fields (carrier, tracking, shipped_at) + status SHIPPED; delivered_at when DELIVERED | BW-02 | NOT RUN |
| W-07 | Saved addresses and payment methods | S2 | Customer + Admin | E2E: address saved on device A visible on device B after sign-in sync; payment page contains no raw card inputs (static check) | customer_addresses (proposed) ; cards only in Stripe (customer id on profile) | BW-18 | NOT RUN |
| W-08 | Membership subscription purchase | S0B-2 / S1 | Customer (standard → member) | E2E: test-mode subscription → server gates return the tier; CONFIRM ORDER absent in production build | profiles.membership_* written by webhook + membership_events row (unique Stripe event id); welcome credit as wallet_ledger entry per D3 | BW-05 | NOT RUN |
| W-09 | Membership upgrade | S2 | Customer (standard → member) | E2E: 3→12 upgrade in test mode → tier 12, refund line exists | membership_events (from/to tier) + profile tier; proration/refund recorded | — | NOT RUN |
| W-10 | Membership renewal (and failed renewal) | S2 | Customer (standard → member) | Stripe test clock: advance → renewal event recorded once; failed card → banner + email | membership_events; profile period_end; anniversary points by scheduled job per D11 | — | NOT RUN |
| W-11 | Membership cancellation | S0B-2 | Customer (standard → member) | E2E: cancel → Stripe test subscription has cancel_at_period_end=true; no further invoice after test-clock advance | Stripe subscription cancel_at_period_end + membership_events | BW-06 | NOT RUN |
| W-12 | Hairstyle analysis credit purchase | S0B-1 | Member + non-member | E2E: buy 4 → 4 credits; SQL accepts pack size 4; anon cannot call grant RPC | hairstyle_analysis_credit purchases (paid credits FIFO) keyed by Stripe event id | BW-08 | NOT RUN |
| W-13 | Hairstyle analysis redemption | S0B-1 / S5 | Member + non-member | E2E: run → credit decremented once, result persisted, failure path restores credit | hairstyle_analysis_results (proposed) + usage row; selfie in private bucket per E3 | — | NOT RUN |
| W-14 | Consultation booking | S0B-1 / S2 | Customer + Admin | E2E: book → meeting row; direct client insert into meetings denied by RLS | meetings row (server-written only) | — | NOT RUN |
| W-15 | Consultation cancellation / reschedule | S2 | Customer + Admin | E2E: request → admin reschedule → customer sees new time | support_requests + meetings status on admin decision | — | NOT RUN |
| W-16 | Consultation add-ons (style analysis, autopay final payment) | S0B-2 / S5 | Customer + Admin | E2E: add-on purchase creates a deliverable task visible to admin; autopay rejects a client-supplied foreign payment method | consult add-on deliverable row linked to meeting; autopay attempts table (exists) | BW-09 | NOT RUN |
| W-17 | Points earning | S4 | Member + Admin | Integration: paid order → one ledger row with multiplier per tier; replayed webhook → no second row | loyalty_ledger (unique reason/source) | BW-13 | NOT RUN |
| W-18 | Points redemption | S4 | Member + Admin | Integration: redeem beyond balance rejected; concurrent redeem cannot overspend (row lock) | loyalty_ledger negative entry (reserved → committed) | BW-13 | NOT RUN |
| W-19 | Voucher issue and redemption | S4 | Member + Admin | E2E: issued voucher appears on second device; applying it reduces server quote; refund restores it | customer_vouchers (available → reserved → used/expired) | BW-14 | NOT RUN |
| W-20 | Digital cash and gift card load/redeem | S4 | Member + Admin | E2E: admin creates code → customer redeems on another device → balance; second redeem rejected | gift_card_codes (hashed) + wallet_ledger | BW-12 | NOT RUN |
| W-21 | Slay Challenge progress and completion | S4 | Member + Admin | Integration: fire qualifying events → phase transitions per D1 thresholds; other user unaffected | slay_challenge_progress per user/cycle/tier | BW-17 | NOT RUN |
| W-22 | Slay Challenge reward claim | S4 | Member + Admin | E2E: claim once succeeds; second claim rejected; ledger row present | reward_claims + ledger entry or fulfilment task | BW-17 | NOT RUN |
| W-23 | Referral qualification and credit | S6 | Member + Admin | E2E: friend order reaches D8 status → one credit; refund → reversal; self-referral rejected | referral_earnings + wallet_ledger entry (amount per D8; NOT implemented automatically) | BW-15 | NOT RUN |
| W-24 | Birthday and anniversary rewards | S4 | Member + Admin | Integration: job twice for same period → one entry | loyalty_ledger / wallet_ledger / reward_claims | — | NOT RUN |
| W-25 | Affiliate content submission and approval | S6 | Customer (delivered order) + Admin | E2E: submit → approve → ledger row at canonical amount; cap respected; body email ignored | content_submissions + loyalty_ledger on approval (caps per D6) | BW-16 | NOT RUN |
| W-26 | Slay Cam submission and feature | S0B-2 (copy) / S5 | Customer (delivered order) + Admin | E2E: submission without consent rejected; featured row appears in /slay-cam | content_submissions (kind slay_cam, featured flag) | BW-24 | NOT RUN |
| W-27 | Review submission and moderation | S5 | Customer (delivered order) + Admin | E2E: non-delivered order cannot review; published review shows on product page (F3) | reviews / content_submissions (verified_purchase derived) | BW-19, BW-20 | NOT RUN |
| W-28 | Support inquiry and reply | S6 | Customer + Admin | E2E: customer message → admin reply → customer sees reply on second device | support_requests + messages | BW-23 | NOT RUN |
| W-29 | Inventory and sold-out | S3 | Admin + second shopper | E2E: admin sets 0 → second browser sees sold out; restock → waitlist email | inventory_items + inventory_movements; stock_waitlist | BW-11 | NOT RUN |
| W-30 | Promo code creation and use | S4 | Admin + second shopper | E2E: code created on admin device works for a customer elsewhere; limit enforced | promo_codes + redemption rows | BW-12 | NOT RUN |
| W-31 | Mock and test data isolation | S0B-2 | Customer + Admin | Static: no mock imports in production bundle; E2E: visiting Concierge adds no orders | n/a (removal) | BW-25 | NOT RUN |
| W-32 | Slay Ticket purchase | S0B-2 | Member + Admin | Integration: credit-order without paid PI rejected | slay ticket ledger written by webhook only | BW-07 | NOT RUN |
| W-33 | Account deletion and data export | S2 | Customer + Admin | E2E: delete → cannot sign in; orders retained anonymised; SITE00 tables untouched | deleted account record; content anonymised; ledgers retained (financial) | — | NOT RUN |
| W-34 | Wishlist save, lists and share | S2 | Customer (2 devices) | E2E: shared token readable signed-out; revoked token 404 | wishlist tables (server) | — | NOT RUN |
| W-35 | PSA "Find my best looks" picks delivery | S0B-2 (pause/relabel) → S5 | Member + non-member | E2E: request picks → result persisted and visible in MY HAIR on a second device; no "24 hours" promise without a delivery path | hairstyle_analysis_results (kind=psa_picks) linked to the PSA thread; selfie per E3 retention | BW-10 | NOT RUN |

## 4. Non-workflow suites

| Suite | Content | Sprint | Status |
|---|---|---|---|
| SQL / RLS | anon and authenticated cannot execute service RPCs; cannot write orders, notifications, reviews, meetings; privileged columns ignored on INSERT and UPDATE | S0B-1 | NOT RUN |
| Static gates | No mock imports in production bundle; no card-number inputs outside Stripe Elements; no client code writes membership, tickets, credits, cash or points; no new `localStorage` keys for server-owned data (doc 06) | S0B-2, then every sprint | NOT RUN |
| Redirects | Every REDIRECT/CONSOLIDATE row in 05 CSV lands on its target with query and hash preserved; every email and stored deep link resolves | S2/S3 | NOT RUN |
| Page Definition of Done | D1–D16 per page (doc 13) | S2–S6 | NOT RUN |
| Visual regression | Gates G1–G5 (doc 12): screenshots at the listed widths compared with the approved current pages | S2–S6 | NOT RUN |
| Accessibility | 44px targets, semantic buttons for the 135 non-semantic clickables, focus ring #EB1C24, contrast | S2/S3 | NOT RUN |
| Cross-product smoke | SITE00 sign-in + profile sync, JURNL signup, FRONTAL SLAYER signup | every DB sprint | NOT RUN |
| Reconciliation | Nightly Stripe ↔ orders and ledger ↔ cached balances produce zero unexplained mismatches over 7 days on staging | S1/S4 | NOT RUN |

## 5. Coverage of prior broken workflows

Every audit broken workflow (BW-01…BW-25) maps to at least one test above:

| BW | Tests |
|---|---|
| BW-01 | W-01 |
| BW-02 | W-05, W-06 |
| BW-03 | W-03, W-04 |
| BW-04 | W-02 |
| BW-05 | W-08 |
| BW-06 | W-11 |
| BW-07 | W-32 |
| BW-08 | W-12 |
| BW-09 | W-16 |
| BW-10 | W-35 |
| BW-11 | W-29 |
| BW-12 | W-20, W-30 |
| BW-13 | W-17, W-18 |
| BW-14 | W-19 |
| BW-15 | W-23 |
| BW-16 | W-25 |
| BW-17 | W-21, W-22 |
| BW-18 | W-07 |
| BW-19 | W-27 |
| BW-20 | W-27 |
| BW-21 | W-05 |
| BW-22 | W-01 |
| BW-23 | W-28 |
| BW-24 | W-26 |
| BW-25 | W-31 |
