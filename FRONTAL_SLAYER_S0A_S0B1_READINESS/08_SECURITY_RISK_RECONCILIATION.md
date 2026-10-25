# 08 — Security Risk Reconciliation

This reconciles the prior register (`FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL/11_SECURITY_AND_MONEY_RISK_REGISTER.md`, R-01…R-20) with three new sources:
- a **new read-only live verification on 2026-10-25** (evidence L);
- a code re-read for S0B-2 (evidence S);
- a secret scan, including a local production build (doc 12 §2).

**Planning a fix is not verifying a fix. Every risk below is still OPEN.** No containment has been applied.

Confidence scale:
- **LIVE-REVERIFIED**: catalog or function source read this sprint.
- **CODE-CONFIRMED**: file:line read, not executed.
- **INFERRED**: reasoned, not read or run.

No reproduction was attempted for any finding: no exploit, no RPC call, no write.

## 1. The six critical findings

### R-01 — Public-key access to hair-analysis credit minting
| Field | Detail |
|---|---|
| Existing behaviour | `hairstyle_analysis_grant_purchase_credits` is SECURITY DEFINER and executable by `anon` and `authenticated`. It takes any `p_user_id` and any payment-intent string of 3+ characters, and never checks `auth.uid()`. The sibling consume/refund functions (**two refund overloads**) and the PSA quota functions are equally exposed |
| Verified evidence | **LIVE-REVERIFIED 2026-10-25:** `has_function_privilege` = true for anon and authenticated; ACL shows direct grants; body read (no `auth.uid()`); advisor lint 0028 lists all 17 functions |
| Potential impact | Unlimited paid hair analyses (each is a paid Fal generation; $20 retail per analysis); monthly caps reset; PSA quotas burned; lounge engagement faked |
| Affected object / endpoint | `public.hairstyle_analysis_*` (4 signatures), `psa_*` (2), `lounge_*` (4) via `/rest/v1/rpc/*` |
| Affected users | Any member (as victim or beneficiary). Exploitation needs only the public anon key. Whether it has been exploited is **UNVERIFIED** (0 rows in `hairstyle_analysis_purchase_grants` live, so no paid grant has ever been recorded) |
| Proposed containment | M1A (doc 10): revoke from PUBLIC, anon, authenticated; grant service_role |
| Long-term repair | Default privileges so new functions are not anon-executable (cross-product; H3). Functions validate the caller where they are ever user-callable |
| Dependencies | A1a/A1b, staging (H2), H3 acknowledgement; U-01 recommended (M1A callers fail closed, so not a hard blocker) |
| Regression risks | A missed caller using the anon or user client (none found: every caller uses a fail-closed service client) |
| Validation | V1 A1/A2; staging Part B probes; hair analysis, PSA and lounge E2E; advisor 17 → 7 |
| Rollback | `M1A_ROLLBACK` (re-opens the exposure). Forward-fix preferred (doc 14 §4) |
| Required approvals | A1a (rehearse), A1b (production) |

### R-10 — Paid $60 four-comparison package grants nothing
| Field | Detail |
|---|---|
| Existing behaviour | The grant SQL accepts `IN (1, 3, 6)`; the app sells 1 ($20) and 4 ($60). **New:** a mixed 1+4 cart grants the 1, drops the 4, and marks the payment as granted, so a replay cannot repair it |
| Verified evidence | **LIVE-REVERIFIED** (function body read). App/server sizes CODE-CONFIRMED (`hairstyleAnalysisPricing.ts`, `webhook.ts:280-295`) |
| Potential impact | Customers charged $60 receive no credits; non-delivery disputes |
| Affected object / endpoint | `hairstyle_analysis_grant_purchase_credits`, 4-arg `hairstyle_analysis_refund_consume`, `api/stripe/webhook.ts` |
| Affected users | **Database: 0 grant rows** (no purchase ever recorded). **Stripe-side history UNVERIFIED** (A8, Category 4) |
| Proposed containment | M3: accept 1/3/4/6; all-or-nothing validation |
| Long-term repair | Ledger rows per grant (S4); webhook alert on `grant.ok === false` (S0B-2) |
| Dependencies | M1A first; A1a/A1b; A8 evidence for remediation |
| Regression risks | Logic change in a money function (covered by staging probes) |
| Validation | V1 A4; staging Stripe test 4-pack → credits once; mixed invalid → no grant row |
| Rollback | `M3_ROLLBACK` (re-breaks R-10; credits already granted remain) |
| Required approvals | A1a/A1b (database); A8 (remediation, once evidence exists) |

### R-05 — Slay Tickets issued without verified payment
| Field | Detail |
|---|---|
| Existing behaviour | `/checkout/slay-tickets` skips Stripe. `POST /api/slay-tickets/credit-order` credits packs counted from **client-supplied** line items, with no payment proof. Dedupe is per client `orderId`, so every new id credits again. The balance update is read-modify-write (not atomic) |
| Verified evidence | CODE-CONFIRMED (`api/slay-tickets/credit-order.ts:40-95`, `api/_lib/slayTickets.ts:68-215`). Live: **0 rows** in `slay_ticket_transactions` |
| Potential impact | Unlimited free tickets → Lounge, PSA and season-pass content unlocked without payment |
| Affected object / endpoint | `api/slay-tickets/credit-order.ts`; `profiles.slay_ticket_balance`; `slay_ticket_transactions` |
| Affected users | Premium members can mint (premium check only). No transaction recorded to date (live count 0) |
| Proposed containment | S0B-2 #5: endpoint returns 410 for purchases; client call removed; packs "return soon" |
| Long-term repair | Packs sold as Stripe PaymentIntents; webhook credits from server-resolved packs; atomic ledger |
| Dependencies | A6 (engineering default); `COMMERCE_CONTAINMENT` flag |
| Regression risks | Earned-ticket path (currently disabled by a cutoff date) must stay unaffected |
| Validation | Integration: credit-order without a paid PaymentIntent → 410; balance and history still render |
| Rollback | Flag off (re-opens R-05) |
| Required approvals | None beyond the A6 default (the founder may object) |

### R-15 — Membership cancellation does not stop Stripe billing
| Field | Detail |
|---|---|
| Existing behaviour | CANCEL SUBSCRIPTION writes `autoRenewMembership:false` to localStorage only. The server column is privileged (trigger reverts user writes). There is no portal, no `cancel_at_period_end:true`, and no `subscriptions.cancel` anywhere |
| Verified evidence | CODE-CONFIRMED (`membership/page.tsx:1145-1177`; grep of `api/` and `src/`). Live: **0 profiles with a Stripe subscription id, 0 PREMIUM** |
| Potential impact | A member is told they cancelled and is billed again: chargebacks, a consumer-protection exposure |
| Affected object / endpoint | Membership page; Stripe subscriptions; `profiles.auto_renew_membership` |
| Affected users | **None in the database today** (0 subscriptions). Stripe dashboard history UNVERIFIED |
| Proposed containment | S0B-2 #3: Stripe Customer Portal (A4 option 1), or in-app cancel at period end |
| Long-term repair | `membership_events` history; billing page (S4) |
| Dependencies | A4 (founder; constrained by the established billing policy, MEMORY 2026-04-04) |
| Regression risks | Portal plan-change defaults conflict with the founder's upgrade/downgrade policy → configure the portal for cancel only, keep plan changes in-app |
| Validation | Stripe test clock: cancel → `cancel_at_period_end` → no renewal invoice → STANDARD |
| Rollback | Flag hides the portal button (re-opens R-15) |
| Required approvals | **A4** |

### R-03 — Build-A-Wig checkout omits custom option pricing (**corrected**)
| Field | Detail |
|---|---|
| Existing behaviour | **Correction:** the prior register said custom BAW lines were "unresolved → card blocked". Code shows BAW lines carry catalogue unit names, so the server prices them at **base + cap only** and the card checkout **succeeds**. Colour, length, density, lace, hairline, styling and add-ons are never sent to the server. Consult-offer lines are undercharged the same way |
| Verified evidence | CODE-CONFIRMED (`src/pages/build-a-wig/page.tsx:4722-4848`; `src/utils/checkoutQuote.ts:40-55`; `api/_lib/pricing/resolveQuote.ts:77-96, 181-204`) |
| Potential impact | Every customised unit is undercharged by the full value of its options (e.g. +$120 colour) |
| Affected object / endpoint | `/api/checkout/quote`, `/api/stripe/create-product-payment-intent`, the mobile `/checkout` and the desktop `/desktop/acquisition` (same component) |
| Affected users | Every BAW buyer paying by card. Live database: **0 order rows** (no completed webhook order recorded) |
| Proposed containment | S0B-2 #1: server detects custom lines → `resolved:false`; "REQUEST MY CUSTOM QUOTE" → consult offer with a server-held amount. The Atelier stays fully usable |
| Long-term repair | S1B: one catalogue module shared by client and server; the server prices every option (E5, engineering default) |
| Dependencies | **A2** (founder: which interim path); one additive column on `consult_quotes` |
| Regression risks | Stock PDP lines wrongly flagged as custom (needs the PDP id-prefix sweep) |
| Validation | Parity test: no BAW line reaches a PaymentIntent without a server-held amount; stock PDP lines still pay |
| Rollback | Flag (re-opens the undercharge) |
| Required approvals | **A2** |

### R-11 — No authoritative server-side order record
| Field | Detail |
|---|---|
| Existing behaviour | The detailed order lives only in the buyer's browser (`order-N`). The webhook appends a generic `order-pi-…` row (no line items; charge currency recorded as USD) into a JSON array by read-modify-write. Admin fulfilment edits live in the admin's localStorage. Order numbers collide across browsers |
| Verified evidence | CODE-CONFIRMED (`recordProductOrderFromPaymentIntent.ts:35-62`; `checkout/page.tsx:2795-2832`). **LIVE: 0 rows in `orders`** |
| Potential impact | Lost orders, unfulfillable custom builds, unreconcilable revenue |
| Affected object / endpoint | `orders` table, webhook, every order surface in **both** customer experiences and in admin |
| Affected users | All future buyers. No server order recorded to date |
| Proposed containment | Not containable by S0B-1/S0B-2 beyond M2 (stopping customer writes to `orders`). Real fix in S1 |
| Long-term repair | S1: `customer_orders` + items + status events + DB-sequence order numbers (additive; A9 is an engineering default) |
| Dependencies | C4 (founder: stage vocabulary and SLAs) |
| Regression risks | Checkout path changes (high). Staged behind a flag with a JSON projection kept |
| Validation | Cross-device and cross-experience parity (mobile `/account/orders`, the desktop Penthouse "My Orders" panel, admin orders) |
| Rollback | Readers fall back to the JSON projection |
| Required approvals | C4 (founder); A9 (default) |

## 2. HIGH and MEDIUM findings, reconciled

| ID | Finding | Prior | This sprint | Status | Containment owner |
|---|---|---|---|---|---|
| R-02 | Service-role fallback to anon | HIGH | Confirmed in both repos; 78 FS files and 99 SITE00 files use the fallback helper. Client bundle clean | OPEN; U-01 open | Doc 12; M1B blocked on it |
| R-04 | Legacy customer write policies | HIGH | **LIVE-REVERIFIED** (8 policies). No client or SITE00 consumer | OPEN | M2 |
| R-06 | Non-Stripe CONFIRM ORDER premium | HIGH | CODE-CONFIRMED; the server stays STANDARD | OPEN | S0B-2 #9 |
| R-07 | No real refund/cancel | HIGH | Unchanged | OPEN | S1/S3 |
| R-08 | Mock data / injected test orders | HIGH | **Scope corrected:** reaches every signed-in customer, normally on first Concierge visit. Mock bag enabled on any `*.vercel.app` host or via a production query parameter | OPEN | S0B-2 #7 |
| R-09 | Autopay uses client card ids | HIGH (dormant) | Still dormant (cron GET vs POST, wrong secret name). Meetings write policies LIVE-REVERIFIED | OPEN | M2 + S0B-2 #6 |
| R-12 | Charge ≠ displayed total; no idempotency | HIGH | Unchanged. Plus `stripeCustomerId` written to `profiles` via service role from client input (Correction 4) | OPEN | S0B-2 #6; S1 |
| R-13 | Unfulfilled paid deliverables | HIGH | Consult add-on is **not even charged** (the bookings route skips Stripe); PSA picks discarded | OPEN | S0B-2 #4; S5 |
| R-14 | Raw card inputs; deposits not collected | HIGH | Unchanged; founder dummy PAN constant ships in the client bundle (masked) | OPEN | S0B-2 / A4 / A7 |
| R-16 | No rewards ledger | HIGH | Unchanged; the voucher wipe is confirmed (`account/page.tsx:402-407`) | OPEN | S4 (wipe fix in S0B-2 #7) |
| R-17 | Shared Supabase project | HIGH (process) | **Expanded:** remote history interleaved with apply-time versions; SITE00 CI tests run against production; an out-of-band profile trigger exists | OPEN | Doc 11 |
| R-18 | User-writable profile JSON | MEDIUM | Unchanged; the fix touches the cross-product trigger | OPEN; **BLOCKED** until a SITE00/JURNL smoke test can run | Later DB sprint |
| R-19 | Admin auth hardening | MEDIUM | Leaked-password protection still off (advisor) | OPEN | S3; Auth setting needs H3 |
| R-20 | Customer API hardening | MEDIUM | Unchanged | OPEN | S0B-2 / S3 |

## 3. New findings this sprint

| ID | Finding | Severity | Confidence | Next step |
|---|---|---|---|---|
| N-01 | `trg_log_profile_changes` (AFTER UPDATE on `profiles`, SECURITY INVOKER, mutable search_path) inserts into `profile_debug_log` (RLS on, no policies). It is in neither repo. INFERRED: user-token profile updates (FS and SITE00 `api/profile.ts`) could fail | MEDIUM (availability) | LIVE (definition); impact INFERRED | Staging test; identify owner (U-21) |
| N-02 | `CREATIVE_PRODUCTION_AUTH_SECRET` falls back to a prefix of the service-role key, then to a hardcoded dev string | MEDIUM | CODE-CONFIRMED | Engineering default (doc 12 §5) |
| N-03 | `productCheckoutPolicy` fails **open**: if the availability call errors, checkout runs client-only | HIGH | CODE-CONFIRMED | S0B-2 §0 (fail closed) |
| N-04 | The hair-analysis legacy 2-arg refund overload is separately exposed | Part of R-01 | LIVE | M1A covers it |
| N-05 | Advisor ERROR on 2 SITE00 tables with RLS disabled | SITE00 | LIVE | SITE00 hand-off (doc 11 §5) |
| N-06 | Remote migration versions do not match repo filenames; `db push` from either repo is unsafe | Process | LIVE | Doc 11 §3.6 rule |
