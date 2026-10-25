# 13 — Authentication and Role Security Audit

Method: a code read of guards, `api/_lib` auth helpers, every non-studio `api/admin/*` handler and every customer, payment and cron endpoint, plus migrations. It was then **cross-checked against the live database with read-only catalog queries** (`pg_policies`, `information_schema.routine_privileges`, `pg_class.relrowsecurity`) and the Supabase security advisor on 2026-10-25. No exploit was executed and nothing was written.

Full endpoint-by-endpoint table: `appendix/D_auth_security.md`.

## 1. Bottom line

- **Admin APIs are properly protected on the server.** Every Frontal Slayer `api/admin/*` handler verifies the Supabase JWT (`supabase.auth.getUser`) and then checks the **JWT-derived** email against an allow-list before touching data (`api/_lib/adminAuth.ts:37-94`). A non-admin who forges localStorage gets past `AdminGuard` but sees only empty shells and 403s.
- **Customers cannot escalate their own role or tier.** `PATCH /api/profile` strips privileged fields, and a DB trigger freezes role, tier, points, balances and Stripe columns for non-service-role callers (`20260620120000_slay_tickets.sql:59-109`).
- **The serious exposure is in money-like and credit-like paths, and in database grants and policies.** Two findings are **CRITICAL**: one is confirmed live, the other is confirmed in code.

## 2. Roles as implemented

| Role | Real (server-verified)? | Where |
|---|---|---|
| GUEST | n/a | No session |
| CUSTOMER | **Yes** | Supabase JWT; `profiles` row |
| MEMBER (3/6/12-month premium) | **Yes** | `profiles.membership_type/subscription_tier`, written only by the Stripe webhook |
| BLACK spend tier ("premium by spend") | **Partly**: the server honours `current_tier_name='BLACK'`, but **nothing ever writes it** (0 rows live) | Client computes spend tier from localStorage |
| AFFILIATE | **No role**: a program state stored in profile JSON | — |
| SUPPORT STAFF / OPERATIONS STAFF | **Do not exist** (Workers is a static roster) | — |
| ADMIN | **Yes**: email allow-list (`ADMIN_EMAILS`, or 3 hardcoded defaults when unset) | `api/_lib/adminAuth.ts:10-21` (duplicated in `api/admin/sync-profile.ts:11-15` and `src/utils/adminAuth.ts`) |
| FOUNDER / OWNER | **Yes, by hardcoded email** | `requireAdminFounder`; PSA bypass; delete-protection |
| Preview-only admin, admin tier/subscription overrides | **No**: client display only | `src/utils/adminAuth.ts` |
| `profiles.role` | Exists; **never used for authorization** | — |

**Recommendation (FD-B2):** do not add permanent staff roles yet. Introduce one `admin_roles` table (`founder | admin | staff`) to replace the three duplicated allow-lists, and gate money-moving actions (refunds, points adjustment, comp memberships) to `founder | admin`.

## 3. Findings ranked

### CRITICAL

**C1 — Slay Tickets can be minted without payment** (code-confirmed)
- `POST /api/slay-tickets/credit-order` credits tickets from a client-supplied `orderId` and `lineItems`. It never checks that the order exists, belongs to the caller or was paid (`api/slay-tickets/credit-order.ts:55-89`; `api/_lib/slayTickets.ts:150-210`).
- The `/checkout/slay-tickets` route also skips Stripe (`productCheckoutPolicy.ts:77-84`).
- Any premium member can mint unlimited tickets, and tickets unlock Lounge, PSA and season-pass content.
- **Fix:** credit only from the Stripe webhook using server-resolved lines; remove the client-callable endpoint or make it admin-only.

**C2 — Credit and usage RPCs are executable by `anon` and `authenticated` (LIVE-CONFIRMED)** — *new; found during the live cross-check*
- In production, `EXECUTE` is granted to `anon` and `authenticated` on:
  - `hairstyle_analysis_grant_purchase_credits(p_user_id, p_payment_intent_id, p_comparison_counts)`
  - `hairstyle_analysis_try_consume(...)`
  - `hairstyle_analysis_refund_consume(...)` (also `PUBLIC`)
  - `psa_try_consume_message(...)`
- The migrations run `REVOKE ALL … FROM PUBLIC`, but on Supabase `anon` and `authenticated` hold direct grants, so that revoke does not remove access.
- The grant function has **no caller check**: it trusts `p_user_id` and any `p_payment_intent_id` of 3 or more characters.
- **Impact:** anyone holding the public anon key can call `/rest/v1/rpc/...` to grant paid hair-analysis credits to any user (every analysis is a paid Fal generation), refund consumption to reset monthly caps, or burn another member's PSA quota.
- **Not exploited during the audit.** The risk was established from catalog metadata and the function source only.
- **Fix** (a migration, which needs founder approval):
  - `REVOKE EXECUTE ON FUNCTION … FROM anon, authenticated;` for every service-only SECURITY DEFINER function.
  - Keep `GRANT … TO service_role`.
  - Re-run the advisor afterwards. It currently lists 17 anon-executable SECURITY DEFINER functions, including `lounge_toggle_helpful(p_user_id)`, `lounge_record_qualified_view(p_user_id)` and `studio_world_atomic_reserve_budget`.

### HIGH

**H1 — Booking autopay charges client-supplied Stripe IDs** (code-confirmed; the meetings policies are **live-confirmed**)
- `POST /api/booking/appointment-meeting` stores the customer, payment method and amounts supplied by the client in `meetings.metadata`. The hourly autopay job charges them off-session with no ownership check (`appointment-meeting.ts:112-138`; `autopay-final-payment.ts:143-145, 206-208`).
- Users can also update and delete their own meeting rows directly (live policies "Users can update own meetings" and "Users can delete own meetings").
- **Fix:** read the customer and payment method only from `profiles`, verify `pm.customer`, compute amounts on the server, and drop the user write policies on `meetings`.

**H3 — Legacy order write policies are live** (LIVE-CONFIRMED)
- `orders` still carries "Users can insert own orders" and "Users can update own orders" (from 001). The later hardening dropped differently named policies.
- A customer can therefore write their own `orders` JSON directly through PostgREST (e.g. fabricate a DELIVERED order), bypassing the API's 403.
- **Fix:** drop both policies. Do the same for `notifications` (insert/update own, live) and `reviews` (insert own, live).

**H2 (downgraded → drift)** — `psa_tool_events` has no RLS in its migration, but RLS is **enabled in production**. Add the `ENABLE ROW LEVEL SECURITY` line to the repo so a fresh environment matches.

### MEDIUM

| ID | Finding | Fix |
|---|---|---|
| M1 | The admin check does not require `email_confirmed_at`. The hardcoded default allow-list applies when `ADMIN_EMAILS` is unset. Supabase **leaked-password protection is off** (advisor). | Require a confirmed email; use an explicit `ADMIN_EMAILS` or `admin_roles`; enable leaked-password protection |
| M2 | `affiliate_submitted_content`, `user_submitted_reviews`, `signed_order_forms`, `review_supplemental_overlay` and `referral_code` are user-writable, so users can self-approve affiliate content with points. `referral_code` is not unique. | Add them to the strip list and trigger; write only through the submission/admin APIs; add a unique index |
| M3 | `/api/client/submissions` uses `email` from the request body (a branded mail relay) and hardcodes `verified_purchase: true` | Use `user.email`; derive verification from server orders |
| M4 | `create-product-payment-intent` trusts `body.stripeCustomerId` | Read it from `profiles` only |
| M5 | `session-restore` / `session-cookie` reflect any Origin with credentials, and restore returns tokens in JSON | Origin allow-list; don't return the refresh token |
| M6 | The referral program has no server ledger or validation (prior assessment items 1.2–1.4 and 4.2 are still open) | Server validation and ledger in the webhook |
| M7 | Public `analytics/event`, `brand/contact-submit` and `faq-question-submit` have no rate limit; analytics accepts any `userEmail` | Shared-store rate limit plus honeypot/Turnstile |
| M8 | Audit gaps: `admin/users` ban/unban/reset, priority-message and inquiry PATCH, `rewards-notify`, `transactional-notify` and CSV export are not logged. `writeAuditLog` swallows errors. `getSupabaseAdmin()` silently falls back to the anon key. The log is mutable. | Log every admin mutation; fail closed when the service role is missing; append-only log |
| M9 | `/api/consult-style-analysis-generate` only requires sign-in, so any user can trigger paid Fal generations | Entitlement plus quota check |
| M10 | `/account/payment` collects a raw card number and CVV in React inputs (not sent anywhere, but it widens PCI scope and trains users to type card data outside Stripe) | Replace with Stripe Elements / Customer Portal |

### LOW

- L1: `sync-profile` password fallback (a password oracle for admin emails).
- L2: studio worker secret fails open when unset outside production.
- L3: Vision Share passwords are stored in plaintext.
- L4: lounge comment authors can un-hide moderated comments.
- L5: users can insert notifications to themselves (live policy).
- L6: PII in non-HttpOnly one-year cookies `baw_auth_b` / `baw_auth_p`.
- L7: admin and founder emails ship in the client bundle.
- L8: non-constant-time secret comparisons.
- L9: no CSP or security headers, with 106 `dangerouslySetInnerHTML` uses and tokens in localStorage.
- L10: the guard trigger's INSERT branch keeps client-supplied balances.
- L11: `api/expert-capture/knowledge-mirror.ts` (**out of scope, Studio OS**) has no auth on read/overwrite; it needs its own review.

## 4. Checklist requested by the brief

| Check | Status |
|---|---|
| Route protection (client) | Present on account and admin routes. **Missing** on `/checkout/upgrade`, `/tools/hairstyle-analysis` and `/mobile/*`. Client-only by design. |
| Component permissions | Founder-only toggles and sections gated by a client email check (display only) |
| API authorization | **Strong for admin and owner-scoped CRUD.** Weak for credit/payment helpers (C1, H1, M3, M4, M9) |
| Supabase RLS | On for every scoped table. **Legacy permissive policies live** on orders, meetings, notifications and reviews (H3) |
| Sensitive data exposure | No cross-customer PII leak found through the APIs. The admin bundle exposes admin emails (L7) |
| Admin-only operations | Server-enforced. But many admin "operations" never reach the server at all (doc 11) |
| Cross-customer isolation | Good on owner endpoints (`user.id` from the JWT). **Broken in the RPC layer** (C2: `p_user_id` parameter) |
| Role-escalation protection | Good (strip list plus trigger) |
| Audit logging | Exists (`audit_log`, 56 live rows) with partial coverage (M8) |

## 5. Founder approvals required

All CRITICAL and HIGH fixes require **database migrations and changes to payment code**. Per the sprint rules none were applied. Doc 24 lists them as the first decision (FD-C1) with the recommendation to run a dedicated hotfix sprint before any page work.
