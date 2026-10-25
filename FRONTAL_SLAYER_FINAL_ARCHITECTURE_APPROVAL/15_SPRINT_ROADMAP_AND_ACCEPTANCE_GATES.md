# 15 — Sprint Roadmap and Acceptance Gates

Each sprint is scoped so that **money, database and UI changes don't share a release** unless they are inseparable. Risk ratings: **L** / **M** / **H**. "Founder approval" lists only decisions from doc 16. Engineering details are decided inside the sprint.

---

## S0A — Founder architecture approval (planning)

| Field | Detail |
|---|---|
| Objectives | Founder selects options on board V2 (or in writing). The approval manifest (doc 20) is updated with real selections. |
| Dependencies | This package |
| Pages / components | none |
| Data / API / migrations | none |
| Acceptance | Every decision tagged *gates S1–S4* has a recorded selection. Page trees B1/C1 approved or amended. |
| Risk | L |
| Founder approval | Groups B, C and D before S2–S4. Containment does **not** wait for them: A1, H2 and H3 unblock S0B-1; A2–A8, E2 and F1 unblock S0B-2 (doc 20 `approvalRequirements`). |

## S0B-1 — Security containment: database (P0A)

| Field | Detail |
|---|---|
| Objectives | Close database-level exposure without changing product behaviour |
| Scope | (1) `REVOKE EXECUTE … FROM PUBLIC, anon, authenticated` then `GRANT … TO service_role` on **service-only** SECURITY DEFINER functions (all three grantees, because some functions still carry the PUBLIC default; doc 11 R-01) (classification in doc 11 R-02; public-by-design functions keep EXECUTE but get input validation). (2) Drop the legacy 001 write policies on `orders`, `notifications`, `reviews`, `meetings` (insert/update/delete own). (3) Add the missing `ENABLE RLS` line for `psa_tool_events` to the repo (already on live). (4) Make the profile guard trigger zero client-supplied balances on INSERT. (5) Hair-analysis grant/refund SQL accepts `1,4` (matching the app). (6) Enable leaked-password protection. |
| Dependencies | **SITE00 impact check** (doc 11 R-17) · rehearsal on a Supabase branch |
| Pages affected | none visually. Verify: PSA chat, hair analysis generate, lounge engagement, slay forecast and trend public pages still work |
| Migrations | 1 forward migration plus 1 prepared rollback migration (re-grant / re-create policies verbatim) |
| Permission implications | Clients lose direct writes they should never have had. All legitimate writes already go through service-role APIs. |
| Stripe | none |
| Tests | SQL tests: anon cannot execute service RPCs; the authenticated client cannot insert/update `orders`, `notifications`, `reviews`; it cannot update `meetings`; API smoke for every caller of the touched functions; advisor re-run = 0 anon-executable service functions |
| Acceptance | Advisor clean for service functions; all smoke tests pass; SITE00 smoke passes |
| Rollback | Apply the prepared rollback migration (restores grants and policies exactly) |
| Risk | M (shared database) |
| Founder approval | **A1** (approve the containment migration), **H3** (SITE00 coordination). H2 covers the branch rehearsal. |

## S0B-2 — Payment and value containment: application (P0A)

| Field | Detail |
|---|---|
| Objectives | Stop value creation without payment, undercharging, fake success on money actions, and fake data shown to customers |
| Scope | (1) Slay Tickets: credit **only** from the Stripe webhook; until then, disable pack purchase (A6). (2) Booking autopay: read the customer and payment method from `profiles` and verify ownership; compute amounts on the server; keep the cron off until verified (A7). (3) BAW: server quote marks custom lines `resolved:false`; checkout blocks card payment for them and offers the interim **"Request your custom quote"** path (A2, doc 09 §4). (4) Disable non-Stripe CONFIRM ORDER membership in production (A3). (5) CANCEL SUBSCRIPTION → Stripe Customer Portal (A4). (6) Remove the Concierge test-order injection; mock and seed paths only behind `?demo=1` on non-production (A5). (7) Slay Cam fabricated stats → removed or labelled (F1). (8) `/account/payment` hides raw card inputs (shows "managed securely at checkout"). (9) `consult-style-analysis-generate` requires entitlement and quota. (10) `create-product-payment-intent` ignores the client `stripeCustomerId`. (11) `client/submissions` uses the JWT email and stops hardcoding `verified_purchase`. (12) Checkout shows only discounts the server quote applies (R-12). (13) The `points_earned` email is stopped or made truthful until the ledger exists (R-16). (14) Pause or relabel the consult style-analysis add-on and PSA picks promise (E6, R-13). (15) Read-only remediation lists for A8 (4-pack buyers, billed-after-cancel members, undelivered add-ons). |
| Dependencies | A2–A7, F1 selections |
| Pages affected | checkout (upgrade, slay tickets, BAW lines), rewards (cancel), concierge, payment, slay-cam, admin dashboard / clients / meetings / pending / reviews / revenue (mock removal) |
| API | `stripe/webhook` (ticket crediting), `slay-tickets/credit-order` (removed or admin-only), `booking/*`, `checkout/quote`, `stripe/create-product-payment-intent`, `consult-style-analysis-generate`, `client/submissions`, new `stripe/portal-session` |
| Stripe | Customer Portal configuration (cancel at period end); ticket packs as PaymentIntents with server line metadata |
| Tests | Unit: quote marks BAW unresolved; ticket credit requires a succeeded PI; autopay rejects a foreign PM. E2E (Stripe test mode): cancel via portal → webhook → STANDARD at period end. Grep gate D9. E2E W-02 (interim), W-08, W-11, W-16, W-26 (copy), W-31, W-32 (doc 19). |
| Acceptance | No client path grants premium, tickets, credits or cash; no undercharge; no fake data in production builds |
| Rollback | Feature flags per item (env-driven), default to the safe state |
| Risk | M |
| Founder approval | A2, A3, A4, A5, A6, A7, A8 (remediation), E2, F1 |

## S1 — Order of record and shared data foundation (P0B)

| Field | Detail |
|---|---|
| Objectives | A server order record with items, status events, idempotent webhook processing and server order numbers |
| Scope | Tables `customer_orders`, `customer_order_items`, `order_status_events`, `stripe_webhook_events`. Checkout creates a `pending_payment` order at PI creation from **server-quoted lines** (including the configuration snapshot); the webhook marks it paid. Order-form approval matches server ids. `syncFromApi` becomes read-through (no overwrite of server truth; local caches only). Legacy `orders` JSON written as a projection until S2/S3 switch readers. |
| Dependencies | S0B-1, decision C4 |
| Pages affected | Data only; existing orders, concierge and admin pages switch reads in S2/S3 |
| API | `POST /api/checkout/intent` (or extend `create-product-payment-intent`), `GET /api/orders` v2, `GET /api/orders/:id`, admin `GET/PATCH /api/admin/orders` |
| Migrations | Additive tables + sequence; no destructive change |
| Stripe | PI metadata carries `order_id`; idempotency keys `order_id:create` |
| Tests | Webhook replay idempotency; concurrent webhook + approval; order number uniqueness; parity (line totals = PI amount) |
| Acceptance | A purchase on device A shows identical items on device B and in admin (staging E2E W-01) |
| Rollback | Readers still use the JSON projection; disable new writes behind a flag |
| Risk | H (checkout path) |
| Founder approval | A9 (additive schema), C4 (statuses and SLAs) |

## S1B — Build-A-Wig price authority (P0B, parallel to S1)

| Field | Detail |
|---|---|
| Objectives | One option and price catalogue consumed by the Atelier UI, cart, server quote and admin |
| Scope | Extract the catalogue (today 6+ hand-synced tables) into one module used by client and server; the server validates option combinations (including premium-only options); the quote prices BAW lines fully; lift the S0B-2 block |
| Dependencies | E5 (catalogue ownership), E4 (edit gate) |
| Pages affected | **No visual change to the Atelier**; prices shown must equal what the server charges |
| Tests | Exhaustive or sampled parity: client total == server total for option combinations; invalid combinations rejected |
| Acceptance | Custom BAW card checkout re-enabled with server totals |
| Risk | H (revenue) |
| Founder approval | E4, E5 |

## S2 — Customer account core (P1)

| Field | Detail |
|---|---|
| Objectives | Account shell, guard, overview, order detail, appointments, settings completion, alerts on the server |
| Pages | `/account`, `/account/orders` (+ detail, review, appointments tab), `/account/settings` (+ shipping, payment, MY REQUESTS if S6 table is pulled forward), `/account/alerts`, `/account/consult-offer` (redirect) |
| Components | `AccountShell`, `AccountLayoutRoute`, `StatusTimeline`, `EmptyState`/`ErrorState` |
| Data / API | `/api/account/overview`, `customer_notifications`, `saved_addresses` PATCH, Stripe SetupIntent/portal for payment methods |
| Tests | D1–D16 for each page; E2E W-01, W-06, W-07, W-14, W-15, W-33, W-34 (doc 19) |
| Acceptance | All S2 pages reach G on staging, with the targeted ones at H |
| Rollback | Route-level flags; old pages remain until the switch |
| Risk | M |
| Founder approval | B1, B3, B5, B8, G1, G4 |

## S3 — Admin operational core (P1)

| Field | Detail |
|---|---|
| Objectives | Admin menu, wide shell, Command Center, Orders and detail, customer detail, approvals hardening, meetings fix, server inventory, redirects for folded routes, roles and audit |
| Pages | dashboard, orders (+ detail), pending, reviews, clients (+ detail, deleted), meetings (+ schedule), inventory, backend; redirects for the 10 folded URLs |
| Data / API | Admin orders mutations (status, tracking, refund via Stripe), `order_refunds`, `inventory_*`, `admin_roles`, `audit_log` before/after, `/api/admin/command-center` |
| Stripe | Refunds API with idempotency; `charge.refunded` webhook |
| Tests | API auth and audit for every mutation; E2E W-03, W-04, W-05, W-06, W-29 (doc 19) |
| Acceptance | Every admin action changes server state that the customer sees; zero fabricated numbers |
| Risk | H (refunds) |
| Founder approval | C1, C2, C3, C5, G2, G3 (C4 is already required by S1) |

## S4 — Membership, rewards and Slay Challenge (P2)

| Field | Detail |
|---|---|
| Objectives | Ledgers and every reward with a server grant and redemption event |
| Scope | `loyalty_ledger`, `wallet_ledger`, `customer_vouchers`, `promo_codes`, `gift_card_codes`, `membership_events`, `slay_challenge_progress`, tier view; REDEEM; billing history; admin rewards console; Slay Challenge progress driving the existing 3-phase art |
| Dependencies | S1, decisions D1–D5 and D9–D13, B4 |
| Tests | Ledger invariants (balance = sum), idempotent grants, reversal on refund, expiry job, E2E W-08…W-11, W-17…W-22, W-24, W-30 (doc 19) |
| Risk | H (value) |
| Founder approval | B4, D1, D2, D3, D4, D5, D9, D10, D11, D12, D13 |

## S5 — Hair Analysis, Build-A-Wig and community (P3)

My Hair page; analysis results persistence and PSA picks delivery; consult add-on fulfilment queue; saved builds; admin BAW options/pricing tab; reviews storage bucket, consent and public display; Slay Cam submission → moderation → MVP; reported-comments queue; server wishlist lists and share tokens. **Founder approval:** B2, D7, E1, E3, E6, F2–F5, G4. **Tests:** E2E W-12, W-13, W-16, W-26, W-27, W-35 (doc 19). **Risk:** M.

## S6 — Affiliate, marketing, customer service and operational integrations (P3)

`content_submissions` for affiliate with ledger posting, caps and duplicate prevention; server referrals with reversal; `support_requests` with inbox reply, MY REQUESTS and concierge thread; marketing tab consolidation; server-persisted copy editors; team applications; real brand metrics; Trend Desk and PSA Broadcast re-skin. **Founder approval:** B7, D6, D8, G5. **Tests:** E2E W-23, W-25, W-28 (doc 19). **Risk:** M.

## S7 — Responsive, accessibility, security regression and complete E2E (gate)

| Field | Detail |
|---|---|
| Scope | Staging Supabase branch with seeded accounts (customer standard, customer premium, admin, founder); the doc 19 matrix in full at 390/768/1440/2560; axe; security regression (advisor, RLS tests, RPC grants, auth tests per endpoint) |
| Acceptance | Launch gate H1 satisfied: every launch-critical page at **H** |
| Founder approval | H1 (launch definition), H2 (staging environment) |
