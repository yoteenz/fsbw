# 11 — Security and Money Risk Register

**No fix in this register has been applied.** No migration was run, no exploit was attempted, and no payment behaviour was changed. "LIVE-CONFIRMED" means read-only catalog queries in the initial audit (2026-10-25, audit doc 13). "CODE-CONFIRMED" means a code read with `file:line`. Everything else is UNVERIFIED.

**Priority bands** (brief order): **P0A** = containment now (S0B-1 database, S0B-2 application) · **P0B** = money authority (S1, S1B) · **P1** = operational core and hardening (S2, S3) · **P2** = rewards (S4) · **P3** = later families (S5, S6).

## Summary

| ID | Risk | Severity | Confirmed | Band | Release gate | Decision |
|---|---|---|---|---|---|---|
| R-01 | Value RPCs executable with the public anon key | CRITICAL | LIVE | P0A | S0B-1 | A1 |
| R-02 | Service-role key fallback to anon, and RPC ownership across products | HIGH | CODE | P0A | S0B-1 | A1, H3 |
| R-03 | Build-A-Wig custom lines undercharged / unpriceable | CRITICAL | CODE | P0A → P0B | S0B-2, S1B | A2, E5 |
| R-04 | Legacy client write policies on orders, meetings, notifications, reviews | HIGH | LIVE | P0A | S0B-1 | A1 |
| R-05 | Slay Tickets credited without payment | CRITICAL | CODE | P0A | S0B-2 | A6 |
| R-06 | Non-Stripe CONFIRM ORDER grants premium in the browser | HIGH | CODE | P0A | S0B-2 | A3 |
| R-07 | No real order cancellation or refund; refunds and disputes ignored | HIGH | CODE | P0B | S1/S3 | C2, C4 |
| R-08 | Mock data shown as live; test orders injected into real histories | HIGH | CODE + REPRODUCED | P0A | S0B-2 | A5, F1 |
| R-09 | Booking autopay charges client-supplied card ids | HIGH (dormant) | CODE + LIVE policies | P0A | S0B-2 | A7 |
| R-10 | $60 4-comparison analysis pack grants nothing | CRITICAL | LIVE | P0A | S0B-1 | A8, E1 |
| R-11 | No server order of record | CRITICAL | CODE | P0B | S1 | A9, C4 |
| R-12 | Charged amount ≠ displayed total; no idempotency; currency mislabel | HIGH | CODE | P0B | S1 | A9 |
| R-13 | Paid deliverables never fulfilled (consult add-on, PSA picks) | HIGH | CODE | P0B | S0B-2 (pause) → S5 | A8, E6 |
| R-14 | Raw card data in app inputs; booking deposits not collected | HIGH | CODE | P0A | S0B-2 | A4, A7 |
| R-15 | Membership cancel does not stop Stripe billing | CRITICAL | CODE | P0A | S0B-2 | A4 |
| R-16 | No rewards ledger (points, vouchers, cash, codes, referral, affiliate) | HIGH | CODE | P2 | S4 | D1–D13 |
| R-17 | Shared Supabase project with SITE00 and JURNL | HIGH (process) | CODE | P0A gate | every DB sprint | H3 |
| R-18 | User-writable profile JSON (self-approve affiliate content, review flags) | MEDIUM | CODE | P1 | S0B-1 (trigger) / S5 | — |
| R-19 | Admin authentication hardening (default allow-list, confirmed email, password oracle, audit gaps) | MEDIUM | CODE + advisor | P1 | S3 | C2 |
| R-20 | Customer API hardening (body email, CORS reflection, rate limits, paid generation) | MEDIUM | CODE | P1 (part P0A) | S0B-2 / S3 | — |

Every critical blocker from the audit has a plan: CB-1 → R-11 · CB-2 → R-03 · CB-3 → R-01 · CB-4 → R-05, R-06, R-09 · CB-5 → R-04 · CB-6 → R-15, R-10 · CB-7 → R-16 · CB-8 → R-08 · CB-9 → R-13.

---

## P0A

### R-01 — Value RPCs executable with the public anon key
- **Evidence:** LIVE `information_schema.routine_privileges` shows anon/authenticated EXECUTE on `hairstyle_analysis_grant_purchase_credits`, `hairstyle_analysis_try_consume`, `hairstyle_analysis_refund_consume`, `psa_try_consume_message`; the advisor lists 17 anon-executable SECURITY DEFINER functions including `lounge_toggle_helpful`, `lounge_record_qualified_view`, `studio_world_atomic_reserve_budget` (audit doc 13 C2). Some migrations `REVOKE … FROM PUBLIC` (e.g. `20260610120000_hairstyle_analysis_usage.sql:105-106`), but Supabase's direct anon/authenticated grants remain; the grant function has no such revoke at all.
- **Affected data:** hair-analysis paid credits and usage; PSA message quota; lounge helpful/view counts; Studio World budgets.
- **Exploitability:** trivial. One HTTPS call to `/rest/v1/rpc/<fn>` with the anon key, any `p_user_id`, any payment-intent string of 3+ characters.
- **Customer impact:** another person can burn a member's PSA quota or reset caps; ranking signals can be faked.
- **Financial impact:** unlimited paid Fal generations ($20/analysis retail) and Studio budget consumption.
- **Fix:** one migration: `REVOKE EXECUTE ON FUNCTION … FROM PUBLIC, anon, authenticated; GRANT EXECUTE … TO service_role;` for every service-only function (classification in R-02). Trigger functions may be revoked harmlessly. Public-by-design payload functions are revoked too once R-02's key check passes; otherwise they keep EXECUTE and gain input validation.
- **Migration implications:** shared database (R-17). Use a timestamp unused in **both** repos; list remote migrations first. `site00_allocate_access_credential_code` is SITE00-owned: revoke it from SITE00's repo or with SITE00's agreement.
- **Rollback:** prepared migration that re-grants exactly the revoked privileges.
- **Regression tests:** SQL as anon and as authenticated → `permission denied` for each function; API smoke for every caller (hair analysis generate, PSA chat, lounge helpful/view, slay forecast public, trend public, Studio generation); advisor shows 0 anon-executable service functions.
- **Release gate:** S0B-1. **Decision:** A1.

### R-02 — Service-role key fallback and RPC ownership
- **Evidence:** `getSupabaseAdmin()` silently falls back to `SUPABASE_ANON_KEY` when the service-role key is unset, in both repos (fsbw `api/_lib/supabase.ts:30`; SITE00 same file). No browser code in either repo calls `.rpc()` (X2 §2).
- **Classification (X2 §2):**
  - **Service-only:** hairstyle grant/consume/refund, `psa_try_consume_message`, `psa_consume_watch_if_qualified`, `lounge_toggle_helpful`, `lounge_record_qualified_view`, `lounge_engagement_ensure_summary`, `lounge_engagement_recount_summary`, `studio_world_atomic_reserve_budget`, `site00_allocate_access_credential_code` (SITE00-owned).
  - **Public by design, server-only callers:** `slay_forecast_public_broadcast_package`, `trend_intelligence_public_forecast_payload`, `trend_intelligence_public_report_signals`.
  - **Trigger:** `handle_new_user`, `profiles_preserve_privileged_columns`.
- **Affected data:** every function above; any server path that would silently run as anon after the revoke.
- **Exploitability:** not an exploit by itself. It is the reason R-01's fix could break production quietly.
- **Customer/financial impact:** if a deployment lacks the key, the revoke breaks hair analysis, PSA quotas, lounge engagement or SITE00 credential creation.
- **Fix:** before S0B-1, confirm `SUPABASE_SERVICE_ROLE_KEY` is set in FRONTAL SLAYER and SITE00 production (a founder or operator check; this sprint cannot see deployment env). Change `getSupabaseAdmin()` to fail closed (S3, ENG within audit M8).
- **Migration implications:** none by itself. It is a precondition.
- **Rollback:** n/a.
- **Regression tests:** health endpoint asserts a service-role client; unit test that the admin client throws without the key.
- **Release gate:** S0B-1 precondition. **Decisions:** A1, H3.

### R-03 — Build-A-Wig custom lines undercharged or unpriceable
- **Evidence:** `api/_lib/pricing/resolveQuote.ts:181-205, 227-237`; a line named "WIG" is priced at $740 with options ignored; others are unresolved and card checkout is blocked (`checkout/page.tsx:6572`). The client adds option prices (e.g. +$120 colour, `page.tsx:195`). Catalogue lives in 6+ hand-synced tables.
- **Affected data:** BAW orders, revenue.
- **Exploitability:** a customer does nothing unusual. The price displayed and the price charged differ by design.
- **Customer impact:** blocked checkout or a wrong charge.
- **Financial impact:** every custom option on every custom wig (colour, length, lace, styling, add-ons) is unpaid when the line resolves.
- **Fix:** S0B-2 interim (decision A2 option 1): custom lines become "Request my custom quote" → admin consult offer → payment of the server-held amount. S1B: one catalogue module used by client and server; server prices every option (E5).
- **Migration implications:** none for the interim; S1B may add a catalogue table (E5 decides ownership).
- **Rollback:** flag returns the previous checkout behaviour (not recommended).
- **Regression tests:** quote marks custom BAW lines unresolved (interim); S1B parity test over option combinations; tampered client totals rejected.
- **Release gate:** S0B-2, then S1B. **Decisions:** A2, E4, E5.

### R-04 — Legacy client write policies
- **Evidence:** LIVE `pg_policies`: `orders` "Users can insert own orders" / "Users can update own orders"; `notifications` insert/update own; `reviews` insert own; `meetings` insert/update/delete own (from `001_initial_schema.sql`, `002_admin_gaps.sql:52-54`).
- **Affected data:** orders JSON (a customer can fabricate a DELIVERED order and unlock review eligibility), notifications, reviews (fake verified reviews), meeting metadata (feeds R-09).
- **Exploitability:** easy for any signed-in user with PostgREST and their own JWT.
- **Customer impact:** fake reviews visible to others once public display ships; self-inflicted data corruption.
- **Financial impact:** indirect via R-09 (amounts and cards in meeting metadata).
- **Fix:** drop these policies in the S0B-1 migration. No FRONTAL SLAYER browser code writes `orders` directly and `api/orders.ts` PUT is disabled; SITE00 uses none of these tables (X2 §1a).
- **Migration implications:** shared database, but no SITE00 consumer.
- **Rollback:** re-create the policies verbatim.
- **Regression tests:** as authenticated: insert/update `orders`, `notifications`, `reviews` and update/delete `meetings` → denied; booking, review and alert flows still work through the API.
- **Release gate:** S0B-1. **Decision:** A1.

### R-05 — Slay Tickets credited without payment
- **Evidence:** `api/slay-tickets/credit-order.ts:55-89`, `api/_lib/slayTickets.ts:150-210`; the checkout route skips Stripe (`productCheckoutPolicy.ts:77-84`). Dedupe is on the client `orderId`, so any new id credits again.
- **Affected data:** `profiles.slay_ticket_balance`, `slay_ticket_transactions`; ticket-unlocked Lounge, PSA and season-pass content.
- **Exploitability:** easy for any premium member (one POST per mint).
- **Customer impact:** none directly; unfair access.
- **Financial impact:** unlimited unpaid tickets (ticket pack revenue).
- **Fix:** S0B-2: disable the endpoint (410) and the pack purchase (A6). Later: Stripe PI → webhook credits server-resolved packs.
- **Migration implications:** none.
- **Rollback:** flag.
- **Regression tests:** credit-order without a succeeded PI → rejected; no client route can credit tickets.
- **Release gate:** S0B-2. **Decision:** A6.

### R-06 — Non-Stripe CONFIRM ORDER grants premium in the browser
- **Evidence:** `src/pages/checkout/page.tsx:6818-6905`; `productCheckoutPolicy.ts:77-84`. The privileged-column trigger blocks the server write, so **server gates still say STANDARD**.
- **Affected data:** localStorage membership and welcome digital cash.
- **Exploitability:** easy (one click), but limited to client-gated features.
- **Customer impact:** a customer can believe they are premium when they are not, then hit server 403s. Confusing support cases.
- **Financial impact:** client-gated benefits and a local welcome credit that could later be spent if any client-trusted spend path exists (none server-side today).
- **Fix:** disable in production builds (A3); membership only via Stripe.
- **Migration implications:** none.
- **Rollback:** flag.
- **Regression tests:** production bundle has no CONFIRM ORDER membership path; Stripe test-mode subscription still works.
- **Release gate:** S0B-2. **Decision:** A3.

### R-08 — Mock data shown as live; test orders injected into real histories
- **Evidence:** `/account/concierge` adds test orders whenever `userOrders_<email>` exists (reproduced in the audit sweep; audit BW-25); admin pages use picsum and `mock-image.png` placeholders and fabricated metrics; Slay Cam stats and named testimonials are fabricated (audit docs 14 §4, 17).
- **Affected data:** customer order history (local), admin dashboards.
- **Exploitability:** happens to every signed-in customer who visits Concierge.
- **Customer impact:** orders they never placed appear; trust damage; possible support and chargeback confusion.
- **Financial impact:** indirect (trust, mistaken refunds).
- **Fix:** S0B-2: remove injection; mocks only behind a non-production flag (A5); Slay Cam stats removed or labelled (F1); one-off client cleanup of injected local orders on next visit.
- **Migration implications:** none (localStorage only).
- **Rollback:** flag.
- **Regression tests:** static gate: no mock imports in the production bundle; E2E: visiting Concierge adds no orders; admin shows empty states, not fabricated numbers.
- **Release gate:** S0B-2. **Decisions:** A5, F1.

### R-09 — Booking autopay charges client-supplied card ids
- **Evidence:** `api/booking/appointment-meeting.ts:112-138, 201-205` stores client `bookingStripeCustomerId`, `bookingStripePaymentMethodId`, `bookingFinalDueUsd`; `autopay-final-payment.ts:143-145, 203-208` charges them off-session with **no idempotency key**. Meetings write policies are live (R-04). **Dormant today:** Vercel cron sends GET with `CRON_SECRET`; the endpoint requires POST and `BOOKING_AUTOPAY_CRON_SECRET` (X2 §3d).
- **Affected data:** meeting metadata, Stripe charges.
- **Exploitability:** medium (needs a valid Stripe customer and PM pairing), and only once the cron runs or someone with the secret calls it.
- **Customer impact:** wrong amount or wrong card charged; concurrent runs can double-charge.
- **Financial impact:** disputes and refunds.
- **Fix:** read customer and PM from `profiles`; verify `pm.customer`; compute amounts server-side; idempotency key `meeting_id:final`; keep the cron off until verified (A7). Fix the cron mismatch **after** the inputs (ENG-08).
- **Migration implications:** dropping meetings write policies (R-04).
- **Rollback:** autopay flag off.
- **Regression tests:** foreign PM rejected; client amount ignored; two concurrent runs → one charge.
- **Release gate:** S0B-2. **Decision:** A7.

### R-10 — $60 4-comparison analysis pack grants nothing
- **Evidence:** LIVE SQL accepts comparison counts `1,3,6` only (`…paid_credits.sql:185`); the app sells 1 and 4 (canon: MEMORY 2026-06-12). The webhook logs the failure only.
- **Affected data:** `hairstyle_analysis_purchase_grants`, usage.
- **Exploitability:** not an attack; every 4-pack buyer is affected.
- **Customer impact:** paid $60, received no credits.
- **Financial impact:** owed credits or refunds per buyer. **Count UNVERIFIED** (read-only Stripe query in S0B-2, decision A8).
- **Fix:** S0B-1 SQL accepts the app's pack sizes; A8 remediation list.
- **Migration implications:** function replacement in the shared DB (FRONTAL SLAYER-owned).
- **Rollback:** previous function body.
- **Regression tests:** webhook with a 4-pack PI → 4 credits; replay → still 4.
- **Release gate:** S0B-1. **Decisions:** A8, E1.

### R-14 — Raw card data in app inputs; booking deposits not collected
- **Evidence:** `/account/payment` collects card number and CVV in React inputs (`payment/page.tsx:215-283`; audit M10); the bookings checkout uses a client card form that accepts a "founder dummy PAN" (`checkoutCardValidation.ts:27-74`) and never calls Stripe (`productCheckoutPolicy.ts:77-84`).
- **Affected data:** card data in the browser (not sent anywhere per code read), meeting deposits.
- **Exploitability:** not an exploit; a compliance and trust risk.
- **Customer impact:** trained to type card data outside Stripe; deposits shown as paid but not collected.
- **Financial impact:** uncollected deposits; PCI scope.
- **Fix:** S0B-2 hides raw inputs ("managed securely at checkout"); A4 Stripe portal or Elements; deposits through Stripe or "pay at consultation" (A7).
- **Migration implications:** none.
- **Rollback:** n/a (removal).
- **Regression tests:** static check: no card-number inputs outside Stripe Elements; booking deposit creates a PI or is clearly marked unpaid.
- **Release gate:** S0B-2. **Decisions:** A4, A7.

### R-15 — Membership cancel does not stop Stripe billing
- **Evidence:** `membership/page.tsx:1150-1175` sets a local flag; no endpoint sets `cancel_at_period_end` or calls `subscriptions.cancel`; no customer portal (X2 §3a).
- **Affected data:** Stripe subscriptions, membership state.
- **Exploitability:** not an attack; every cancelling member is affected.
- **Customer impact:** told they cancelled; billed again at renewal. Chargebacks likely.
- **Financial impact:** refunds, disputes, fees.
- **Fix:** Stripe Customer Portal (A4 option 1) in S0B-2; read-only query lists members who pressed cancel and were billed afterwards (A8).
- **Migration implications:** none.
- **Rollback:** n/a.
- **Regression tests:** Stripe test clock: cancel → `cancel_at_period_end=true` → no invoice after period end → STANDARD on `subscription.deleted`.
- **Release gate:** S0B-2. **Decisions:** A4, A8.

### R-17 — Shared Supabase project with SITE00 and JURNL
- **Evidence (X2 §1):**
  - Every SITE00 and JURNL signup fires FRONTAL SLAYER's `handle_new_user` and the privileged-columns trigger's INSERT branch. An error there makes Supabase Auth reject signups for **all three products**.
  - SITE00 `api/profile.ts` (a fork) upserts FRONTAL SLAYER commerce columns (`loyalty_points`, `gift_card_balance`, `voucher_list`, …) on every SITE00 sign-in. Dropping or renaming them breaks SITE00 profile sync.
  - 6 migration versions collide with different content between the repos (20260820140000/160000/180000/190000/200000, 20260826123000); 8 are byte-identical. Both repos write ~39 `site00_*` tables.
  - `jurnl_*` rows cascade-delete with `auth.users`; FRONTAL SLAYER account deletion would wipe JURNL data for a shared identity.
  - Auth Site URL, redirect allow-list and email templates are shared; JURNL signup sends no redirect URL.
  - SITE00 uses none of `orders`, `notifications`, `meetings`, `reviews`; no proposed table name collides.
- **Affected data:** auth, profiles, migrations history, JURNL.
- **Exploitability:** not an attack; an operational blast-radius risk.
- **Customer impact:** a FRONTAL SLAYER migration can stop signups or profile sync in other products.
- **Financial impact:** indirect.
- **Fix (process rules for every DB sprint):** never drop or rename `profiles` columns (ENG-04); trigger changes are no-throw and tested against SITE00 and JURNL signup; fresh migration timestamps after listing remote migrations; rehearsal on a Supabase branch (H2); SITE00 smoke test; account deletion must not cascade into other products' data (W-33).
- **Migration implications:** all of them.
- **Rollback:** each migration ships with its rollback.
- **Regression tests:** SITE00 sign-in + profile sync, JURNL signup, FRONTAL SLAYER signup on the branch before production.
- **Release gate:** S0B-1 and every later DB sprint. **Decision:** H3.

---

## P0B

### R-07 — No real order cancellation or refund
- **Evidence:** admin cancel/refund rewrites admin localStorage (`admin/clients/page.tsx:3825-3858`); no refund endpoint; no `charge.refunded` or dispute handler; admin pending hardcodes "REFUND REQUESTS 0" (`api/admin/pending.ts:99`).
- **Affected data:** orders, Stripe charges, ledgers.
- **Exploitability:** n/a (missing capability).
- **Customer impact:** told "cancelled and refunded"; no money returned.
- **Financial impact:** disputes; manual Stripe dashboard refunds leave the app wrong.
- **Fix:** S1/S3 refund endpoint with idempotency, `order_refunds`, `charge.refunded` handler, ledger reversals; ADMIN/FOUNDER thresholds (C2); customer cancellation requests (W-03).
- **Migration implications:** additive tables.
- **Rollback:** flag hides the refund action; Stripe dashboard remains the fallback.
- **Regression tests:** W-03, W-04 (doc 19).
- **Release gate:** S1 (schema), S3 (admin action). **Decisions:** C2, C4.

### R-11 — No server order of record
- **Evidence:** the webhook appends a generic order (`productName:'STRIPE CHECKOUT'`, `items:1`, no lines) by read-modify-write of `orders.active_orders` JSON (`recordProductOrderFromPaymentIntent.ts:35-62`); the rich order lives in one browser (`order-N`) and is overwritten by sync; ids differ; order numbers collide (audit BW-01, BW-21, BW-22).
- **Affected data:** every order, fulfilment, review eligibility, revenue.
- **Exploitability:** n/a.
- **Customer impact:** orders missing on other devices; no tracking; reviews unreachable.
- **Financial impact:** fulfilment errors; unreconcilable revenue.
- **Fix:** S1 per doc 07 §4.
- **Migration implications:** additive tables + sequence; JSON kept as a projection.
- **Rollback:** readers fall back to the JSON projection.
- **Regression tests:** W-01, W-05, W-06.
- **Release gate:** S1. **Decisions:** A9, C4.

### R-12 — Charged amount ≠ displayed total; no idempotency; currency mislabel
- **Evidence:** server quote charges list price and ignores vouchers, gift balance, digital cash, loyalty, tip, shipping and tax (`resolveQuote.ts:210`; X2 §3c); no `idempotencyKey` on any Stripe call; webhook records the charge-currency amount as USD (`recordProductOrderFromPaymentIntent.ts:47,62`); `body.stripeCustomerId` trusted (`create-product-payment-intent.ts:137`).
- **Affected data:** charges, order totals, reporting.
- **Exploitability:** low (customer is overcharged vs display, not undercharged, except via R-03).
- **Customer impact:** charged more than shown when a discount is displayed.
- **Financial impact:** refunds/disputes; wrong revenue in non-USD.
- **Fix:** S0B-2: stop displaying discounts the server does not apply, and ignore client `stripeCustomerId`; S1: quote applies reservations; idempotency keys; separate currency fields (ENG-02, ENG-10).
- **Migration implications:** additive.
- **Rollback:** flags.
- **Regression tests:** parity test (quote total = PI amount); tamper test.
- **Release gate:** S0B-2 (containment), S1. **Decision:** A9.

### R-13 — Paid deliverables never fulfilled
- **Evidence:** consult style-analysis add-on ($20/$60) has no fulfilment path (`consultStyleAnalysisInputs.ts` has no callers); PSA "FIND MY BEST LOOKS" picks are discarded by the client (`PsaSelfieStyleAnalysisPanel.tsx:56-70`); `/api/consult-style-analysis-generate` only requires sign-in (M9).
- **Affected data:** consult orders, PSA picks.
- **Exploitability:** M9: any signed-in user can trigger paid generations.
- **Customer impact:** paid and received nothing; "ready within 24 hours" never arrives.
- **Financial impact:** owed refunds or delivery (count UNVERIFIED, A8); generation costs.
- **Fix:** S0B-2 pause sale of the add-on or label it "delivered at your consultation" (E6) and add entitlement/quota to the generate endpoint; S5 fulfilment queue in MEETINGS and persisted picks in MY HAIR.
- **Migration implications:** S5 additive tables.
- **Rollback:** flag.
- **Regression tests:** W-16; generate endpoint returns 403 without entitlement.
- **Release gate:** S0B-2 (pause), S5. **Decisions:** A8, E6.

---

## P1

### R-18 — User-writable profile JSON columns
- **Evidence:** `affiliate_submitted_content`, `user_submitted_reviews`, `signed_order_forms`, `review_supplemental_overlay`, `referral_code` are writable by the user (audit M2); `referral_code` not unique. SITE00 `api/profile.ts` can write them too (X2 §1a).
- **Affected data:** affiliate approvals with points, review flags, referral codes.
- **Exploitability:** easy with the user's own JWT.
- **Customer/financial impact:** self-approved affiliate content; points only matter once redemption exists (S4).
- **Fix:** add to the privileged-column strip list and trigger (S0B-1, no column drops); move to `content_submissions` (S5/S6); unique referral index (S6).
- **Migration implications:** trigger body change: R-17 rules apply (no-throw, SITE00 tested).
- **Rollback:** previous trigger body.
- **Regression tests:** user PATCH of these columns is ignored; SITE00 profile sync still succeeds.
- **Release gate:** S0B-1 (trigger), S5/S6.

### R-19 — Admin authentication hardening
- **Evidence:** audit M1 (no `email_confirmed_at` check; 3 hardcoded default admins when `ADMIN_EMAILS` unset; leaked-password protection off per advisor), L1 (`api/admin/sync-profile.ts` password fallback acts as an oracle for admin emails), M8 (several admin mutations not audit-logged; `writeAuditLog` swallows errors; log mutable).
- **Affected data:** admin access, audit trail.
- **Exploitability:** low to medium.
- **Customer/financial impact:** unauthorised admin action would be hard to trace.
- **Fix:** S0B-1 enables leaked-password protection; S3 `admin_roles` (C2), confirmed-email check, explicit allow-list, remove the password fallback, log every admin mutation, append-only audit.
- **Migration implications:** additive `admin_roles`; SITE00 has its own allow-list and does not use `profiles.role` (X2 §1a).
- **Rollback:** allow-list remains as fallback during transition.
- **Regression tests:** unconfirmed email → 403; every admin mutation writes an audit row.
- **Release gate:** S3. **Decision:** C2.

### R-20 — Customer API hardening
- **Evidence:** M3 (`/api/client/submissions` trusts the body email; hardcodes `verified_purchase: true`), M4 (`stripeCustomerId` trusted; see R-12), M5 (`session-restore`/`session-cookie` reflect any Origin with credentials; restore returns tokens), M7 (no rate limits on public analytics, contact and FAQ endpoints), M9 (see R-13).
- **Affected data:** email relay abuse, review integrity, sessions.
- **Exploitability:** medium (M5 needs a malicious site and a victim session).
- **Fix:** S0B-2 for M3, M4, M9; S3 for M5 (origin allow-list, no refresh token in JSON) and M7 (shared rate limit + honeypot/Turnstile).
- **Migration implications:** none.
- **Rollback:** per-endpoint flags.
- **Regression tests:** cross-origin restore rejected; body email ignored; rate limit returns 429.
- **Release gate:** S0B-2 / S3.

---

## P2

### R-16 — No rewards ledger
- **Evidence:** points have no ledger and no server writer; REDEEM is a stub (`membership/page.tsx:1624-1636`); vouchers wiped for non-founders (`account/page.tsx:397-408`); gift/promo codes in admin localStorage; referral credit computed in the buyer's browser; affiliate approval writes `points ?? 100` to profile JSON (audit BW-12…BW-17). The webhook sends a `points_earned` email but credits nothing (X2 §3b).
- **Affected data:** every reward balance.
- **Exploitability:** low while redemption is a stub; rises the moment any redemption ships without a ledger.
- **Customer impact:** promised rewards never arrive; emails claim points that do not exist.
- **Financial impact:** liability is undefined until rules (D1–D13) are decided.
- **Fix:** S4 ledgers per doc 08 §2. **Until S4, do not ship any redemption path**, and stop the `points_earned` email or make it truthful (S0B-2, part of A5).
- **Migration implications:** additive; cached balance columns stay (R-17, ENG-04).
- **Rollback:** ledger writes behind a flag; balances fall back to cached columns.
- **Regression tests:** ledger invariants; W-17…W-24, W-30.
- **Release gate:** S4. **Decisions:** D1–D13, B4.
