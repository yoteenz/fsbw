> **Lead-auditor note (post live cross-check, 2026-10-25):** this dossier was written from the repo only. Read-only live checks then changed three items (see doc 13):
> - **H2 `psa_tool_events`:** RLS **is enabled** in production. Downgraded to repo/production drift.
> - **H3 legacy order policies:** **confirmed live**. Meetings, notifications and reviews own-write policies are also live.
> - **New CRITICAL C2:** `anon` and `authenticated` hold EXECUTE on `hairstyle_analysis_grant_purchase_credits`, `_try_consume`, `_refund_consume` and `psa_try_consume_message`.

# D. Auth & Security Audit: FRONTAL SLAYER (fsbw)

Read-only review of /home/user/fsbw as of 2026-10-25. Nothing was run against Supabase, Vercel or Stripe. Every claim below comes from source and migration files. Where the real state depends on the live database or Vercel/Supabase dashboard settings, the finding is marked **conditional**.

Paths are relative to `/home/user/fsbw`.

---

## 1) Role model as implemented

There is **no roles table**. `profiles.role` exists (`supabase/migrations/001_initial_schema.sql:8`), but **no server code uses it to make an authorization decision**. A grep of `api/` shows `role` used only in mapping and stripping code: `api/_lib/profileMapping.ts:6`, `api/profile.ts:136`, `api/_lib/profilePrivilegedFields.ts:3`. Users also cannot escalate it. `PATCH /api/profile` strips `role` (`api/_lib/profilePrivilegedFields.ts:2-49`, `api/profile.ts:241`). The DB trigger `profiles_preserve_privileged_columns` sets `NEW.role := OLD.role` on UPDATE and forces `'user'|'client'` on INSERT for every JWT except `service_role` (`supabase/migrations/20260620120000_slay_tickets.sql:59-109`, which supersedes `20260604120000_security_profiles_orders_guard.sql:3-58`).

| Role / concept | Where it lives | Server-verified? | Notes |
|---|---|---|---|
| GUEST | No Supabase session | n/a | Public endpoints only. |
| Customer (`user`/`client`) | Supabase Auth user + `profiles` row (auto-created by the `handle_new_user` trigger, `20260325120000_full_app_sync.sql:121-141`) | **Yes**: JWT checked through `supabase.auth.getUser(token)` (`api/_lib/auth.ts:8-20`) | Owner scoping uses `user.id` from the JWT. |
| Premium member (3/6/12-month) | `profiles.membership_type` / `subscription_tier`, written only by the Stripe webhook (service role) | **Yes**: `getPsaPremiumProfile` reads the DB (`api/_lib/psaPremiumCheck.ts:37-75`). Columns are trigger-protected. | Gates PSA, hairstyle analysis and Slay Ticket purchase. |
| BLACK tier | `profiles.current_tier_name='BLACK'` | **Partially**: the server honours it (`psaPremiumCheck.ts:25-26`), but **no API ever writes it**. The client computes spend tier locally. | Effectively set only by manual SQL. Users cannot set it because of the trigger. |
| Affiliate | No role. Content lives in `profiles.affiliate_submitted_content` plus `pending_affiliate_submissions`. | **No**: points are computed on the client, and `affiliate_submitted_content` is **user-writable** (see M2). | Admin approve/decline is server-side and keyed on the row's `user_id` (`api/admin/pending-queue.ts:135-189`). |
| Admin | Email allow-list `ADMIN_EMAILS`, or the hardcoded defaults `admin@frontalslayer.com`, `kateena.armstrong@frontalslayer.com`, `kateenaarmstrong@gmail.com` (`api/_lib/adminAuth.ts:10-21`) | **Yes**: the JWT is verified, then its email is compared to the list (`adminAuth.ts:37-94`). It does **not** check `email_confirmed_at` (M1). | Client gate: `canAccessAdminPages` reads the localStorage email (`src/utils/adminAuth.ts` ~L583-589). `isAdminUser` also accepts the localStorage `role==='admin'` (~L575). Client-only. |
| Founder (`kateenaarmstrong@gmail.com`) | Hardcoded | **Yes** where used: `requireAdminFounder` (`adminAuth.ts:104-112`) for page-debug-config, perspective-panel-config and live-try-on batch status/step. Also a PSA premium bypass (`psaPremiumCheck.ts:32-43`), protection from deletion (`api/delete-account.ts:33-36`) and Studio World admin (`api/_lib/studioWorldAdminAccess.ts:5-22`). | The "PSA-only bypass" is keyed on the JWT-verified email, so it has the same caveat as M1. |
| Preview-only admin | `REACT_APP_PREVIEW_ADMIN_EMAILS` plus a hostname check (`src/utils/adminAuth.ts` ~L497-540) | **No**: client-only. No server equivalent exists, so the admin APIs return 403. | `isPreviewEnvironment()` returns true for any `*.vercel.app` host. Production may be `fsbw.vercel.app` (docs/ADMIN_AND_API_ENV.md:78). UI only. |
| Admin tier/subscription override | localStorage `adminTierOverride` / `adminSubscriptionOverride` (`src/utils/adminAuth.ts` ~L116-160, `src/utils/syncFromApi.ts:126-131`) | **No**: client display only. | No server override endpoint exists. |
| Studio OS portfolio owner / org roles | `ADMIN_PORTFOLIO_OWNER_EMAILS` (`api/_lib/studioWorldAdminAccess.ts`); `studio_os_org_memberships.role` OWNER/ADMIN/VIEWER (service-role-only table) | Yes (studio scope; not audited in depth) | `api/admin/studio-partner-onboarding.ts:44` checks OWNER/ADMIN. |
| Workers/staff (`src/pages/admin/workers`) | localStorage `brandJobApplications_v1` (`src/pages/admin/workers/page.tsx:233-235`) | **No**: job-applicant data stays in the browser that submitted it. | No staff role exists. |
| Admin users page (`src/pages/admin/users`) | `/api/admin/users` (list / disable / enable / password-reset) | Yes (admin allow-list) | Cannot assign roles. |

**Role escalation through PATCH /api/profile: not possible.** The API strips the field, and the DB trigger blocks direct PostgREST writes too. **But** several JSON columns the business relies on are still writable by the user (M2).

---

## 2) Server auth helpers

- **`api/_lib/auth.ts:8-20` `getAuthUser`**: reads `Authorization: Bearer`, then calls `createClient(SUPABASE_URL, SUPABASE_ANON_KEY).auth.getUser(token)`. That is a proper server-side JWT check against Supabase Auth, and it returns `{id,email,accessToken}`. It does **not** check `email_confirmed_at`.
- **`api/_lib/adminAuth.ts`**:
  - `getAdminEmails()` (L16-22) uses `ADMIN_EMAILS` and falls back to 3 hardcoded addresses.
  - `resolveAdminAuth` (L37-94) returns 401 when the token is missing or invalid and 403 when the email is not on the list.
  - `requireAdmin` (L97-102) is a wrapper around it.
  - `requireAdminFounder` (L104-112) allows the founder email only.
  - **The admin decision always uses the JWT-derived email, never an email from the request body.**
- **`api/admin/sync-profile.ts`** keeps its own copy of the allow-list (L11-23). The Bearer path returns **only the caller's own** profile, orders, cart and wishlist (L88-108). A legacy fallback accepts `{email,password}` in the body (L110-153): it checks the email against the allow-list, then runs `signInWithPassword` server-side, so it works as an unauthenticated password oracle for admin accounts (L1). The body email is **not** trusted to pick whose data is returned; it must authenticate.
- **`api/_lib/supabase.ts`**:
  - `getSupabaseAdmin()` (L28-35) uses the service role but **silently falls back to the anon key** when `SUPABASE_SERVICE_ROLE_KEY` is unset.
  - `getSupabaseAdminServiceRole()` (L17-25) throws if the key is unset.
  - `getSupabaseUser(token)` (L38-45) runs with the user's JWT, so RLS applies.
- **Other server secrets:**
  - `CRON_SECRET`/`EMAIL_SEND_SECRET` for `api/cron/expiring-rewards-emails.ts:6-10`.
  - `BOOKING_AUTOPAY_CRON_SECRET` for `api/booking/autopay-final-payment.ts:86-91`.
  - `EMAIL_SEND_SECRET` header for `api/email/send.ts:23-28`.
  - `STUDIO_GENERATION_WORKER_SECRET` for `api/_lib/creativeProduction/async-governed-generation.ts:686-691`. This one **fails open** when unset and `NODE_ENV !== 'production'`.
  - Stripe webhook signature via `stripe.webhooks.constructEvent` (`api/stripe/webhook.ts:328-347`). A missing signature returns 400; a missing secret returns 500.
  - HMAC-signed OAuth `state` (`api/_lib/socialTokenCrypto.ts:73-92`).
- **Rate limiting**: `api/_lib/rateLimit.ts` is an in-memory limiter per instance. It is used only by `build-a-wig-unit-image.ts`, `hairstyleAnalysisUsage.ts` and `psaUsageLimit.ts`. None of the public ingest endpoints use it.
- **Secrets in the repo**: no live secret values found in source files. `.env.example`, `.env.e2e.example` and `.env.wig-preview.example.txt` contain commented placeholder lines for keys (values not printed). A secret-pattern grep matched only the vendored `.vite/deps/@supabase_supabase-js.js` library bundle, not a credential. `VITE_CREATIVE_PREVIEW_TOKEN` is a `VITE_` variable, so it ships in the client bundle by design. It only bypasses the client route guard (`src/utils/creativePreviewMode.ts:18`); the server does not use it.

---

## 3) Endpoint authorization table

Legend:
- AUTH: `none` / `JWT` (any signed-in user) / `owner` (JWT plus scoping by `user.id`) / `admin` (JWT plus email allow-list) / `founder` / `secret` / `webhook-sig`.
- SR: whether the endpoint uses the service role.
- Isolation: whether data is scoped by the JWT's user id or by an identifier sent in the request.

### 3a. `api/admin/*`, non-studio

Every handler below calls `requireAdmin` / `resolveAdminAuth` / `requireAdminFounder` **before** any DB access and returns 401/403 when it fails. This was checked by a scripted scan that every auth call is followed by a guard, plus a manual check of the method and auth ordering. All use the service role (`getSupabaseAdmin`). Cross-customer access is by design (admin), so "isolation" is N/A.

| Endpoint | Methods | Auth | Evidence | Verdict |
|---|---|---|---|---|
| activity | GET | admin | admin/activity.ts:13 | OK |
| analytics | GET | admin | admin/analytics.ts:32 | OK |
| audit-log | GET | admin | admin/audit-log.ts:13 | OK |
| booking-autopay-attempts | GET | admin | :45 | OK |
| brand-contact-inquiries | GET, PATCH | admin | :27 | OK (no audit on PATCH) |
| brand | GET | admin | :13 | OK |
| cart | GET | admin | :13 | OK |
| clients | GET | admin | :50 | OK |
| export/clients (CSV of all profile PII) | GET | admin | export/clients.ts:14-15 | OK |
| consult-quotes | POST | admin | :24 | OK |
| dashboard | GET | admin | :26 | OK |
| deleted-accounts | GET | admin | :13 | OK |
| email-layout-config | GET, PUT | admin | :20 | OK |
| generate-email-hero | POST | admin | :45 | OK |
| live-presence | GET | admin | :27 | OK |
| lounge-tv-config | PUT | admin | :22 | OK |
| meeting-client-alert | POST | admin | :34 | OK |
| meetings | GET, POST, PATCH, DELETE | admin | :32 | OK (audited) |
| membership-payments | GET | admin | :66 | OK |
| newsletter-send | POST | admin | :45 | OK (audited) |
| notifications | GET, POST | admin | :13 | OK (audited) |
| orders | GET | admin | :16 | OK |
| page-debug-config | GET, PUT | founder | :19 | OK |
| perspective-panel-config | GET, PUT | founder | :19 | OK |
| pending | GET | admin | :28 | OK |
| pending-queue | GET, PATCH (approve/decline) | admin | :49 | OK. Side effects keyed on the row's `user_id`, not on an email (:104-108, :139-143, :198). Audited (:124-131 etc.). |
| priority-messages | GET, PATCH | admin | :26 | OK (no audit on PATCH) |
| psa-chat-config | GET, PUT | admin | :18 | OK |
| psa-review | GET | admin | :19 | OK |
| referrals | GET | admin | :13 | OK (reads `referral_earnings`, which no API writes) |
| revenue | GET | admin | :20 | OK |
| reviews | GET, POST, PATCH | admin | :132 | OK (audited) |
| rewards-notify | POST | admin | :47 | OK (no audit) |
| slay-forecast-broadcast | GET, POST | admin | :52 | OK |
| social-accounts / social-posts / social-publish-log | various | admin | :35 / :40 / :12 | OK |
| social-accounts-oauth-callback | GET | HMAC-signed `state` (no Bearer, by design) | :30-33, socialTokenCrypto.ts:73-92 | OK (sig compare is not constant-time; LOW) |
| special-offer-config | PUT | admin | :22 | OK |
| sync-profile | POST | JWT + allow-list, **or** body email+password | sync-profile.ts:88-153 | OK for data; WEAK (password oracle, L1) |
| transactional-notify | POST | admin | :36 | OK (no audit) |
| trend-desk | GET, POST | admin | :33 | OK |
| users (list / ban / unban / reset) | GET, POST | admin | users.ts:14 | OK. **No audit log.** The reset link is emailed, not returned (L80-96). |
| vision-share | GET, POST, DELETE | admin | :32 | OK |
| wishlist | GET | admin | :13 | OK |
| inventory/back-in-stock-notify | POST | admin | inventory/back-in-stock-notify.ts:30 | OK |
| email/templates | GET | admin | email/templates.ts:19 | OK |

### 3b. Customer, public, payment and cron endpoints

| Endpoint | Methods | Auth | SR? | Isolation | Verdict | Evidence |
|---|---|---|---|---|---|---|
| /api/profile | GET, PATCH | JWT | No (user JWT, RLS) | `eq('id', user.id)`; `row.id/email` forced from the JWT | OK for role/tier/points. **WEAK** for the JSON reward fields (M2). | profile.ts:188-192, 241-283, 308 |
| /api/orders | GET (PUT returns 403) | JWT | No | `eq('user_id', user.id)` | OK. But see H3 for direct PostgREST writes. | orders.ts:15-37 |
| /api/wishlist | GET, PUT, POST | JWT | No | `user_id = user.id` | OK | wishlist.ts:11-16, 22-78 |
| /api/cart | GET, PUT | JWT | No | `user_id = user.id` | OK | cart.ts:11-16, 22-98 |
| /api/notifications | GET | JWT | No | `user_id = user.id` | OK | notifications.ts:16-26 |
| /api/activity | POST | JWT | No | inserts `user_id: user.id` | OK | activity.ts:9-25 |
| /api/delete-account | DELETE | JWT | Yes | deletes `user.id` only; founder protected | OK | delete-account.ts:24-36, 66-81 |
| /api/profile-image | POST | JWT | Yes | path `${user.id}/avatar.*`, `eq('id', user.id)`; mime and 2 MB checks | OK. The bucket is public, so avatars are world-readable. | profile-image.ts:33-47, 68-94 |
| /api/session-cookie | POST | JWT (to set); `{clear:true}` without auth | No | uid comes from the JWT | **WEAK**: reflects any Origin with credentials (M5) | session-cookie.ts:53-84 |
| /api/session-restore | GET | Signed cookie | No | checks refreshed user id against the cookie uid | **WEAK**: CORS reflect plus tokens in the JSON response (M5) | session-restore.ts:91-149 |
| /api/consult-quote | GET | JWT | Yes | `eq('id').eq('user_id', user.id)` | OK | consult-quote.ts:24-36 |
| /api/client/submissions | POST | JWT | Yes | rows use `user_id: user.id`, but **`email` comes from the body** for order_form and affiliate | **WEAK** (M3) | submissions.ts:32, 49, 82, 106-115, 214 |
| /api/client/priority-messages | GET, POST | JWT | No | RLS insert/select own | OK | priority-messages.ts:29, 81 |
| /api/client/back-in-stock-notify | POST | JWT | Yes | emails `user.email` only | OK | client/back-in-stock-notify.ts:18-24 |
| /api/checkout/quote | POST | none | No | Prices only | OK | checkout/quote.ts |
| /api/checkout/validate-consult-code, redeem-consult-code | POST | JWT | Yes | checks `row.user_id === user.id`, single-use `redeemed_at` | OK | redeem-consult-code.ts:27-55 |
| /api/stripe/create-checkout-session | POST | JWT | Yes | customer id read from the profile; `returnPath` must be a relative path | OK | create-checkout-session.ts:108, 143-158, 174-187 |
| /api/stripe/create-product-payment-intent | POST | JWT | Yes | server prices (`resolveCheckoutQuoteLines`). **But it trusts `body.stripeCustomerId`.** | **WEAK** (M4) | :65, 107-123, 137-163 |
| /api/stripe/webhook | POST | webhook-sig | Yes | uses `metadata.supabase_user_id` from a signed event | OK | webhook.ts:328-347 |
| /api/stripe/membership-available, product-checkout-available | GET | none | No | booleans only | OK | |
| /api/booking/appointment-meeting (adjacent) | POST | JWT | Yes | **client sends Stripe cus/pm IDs and paid/due amounts** | **HIGH** (H1) | appointment-meeting.ts:112-138, 198-226 |
| /api/booking/autopay-final-payment (cron) | POST | secret | Yes | **charges the IDs stored in `meetings.metadata`** | **HIGH** (H1) | autopay-final-payment.ts:86-105, 143-145, 206-208 |
| /api/collectibles | GET | JWT | Yes | `user.id` | OK | collectibles/index.ts:42-57 |
| /api/slay-tickets | GET | JWT | Yes | `user.id` | OK | slay-tickets/index.ts:37-50 |
| /api/slay-tickets/credit-order | POST | JWT (+ premium if pack lines) | Yes | own balance, but **trusts the client-supplied orderId and lineItems** | **CRITICAL** (C1) | credit-order.ts:55-89; _lib/slayTickets.ts:150-210 |
| /api/hairstyle-analysis-generate | POST | JWT + server premium entitlement + usage consume | Yes | `user.id` | OK | hairstyle-analysis-generate.ts:171-190 (grep offsets 27-57) |
| /api/hairstyle-analysis-usage | GET | JWT | Yes | `user.id` | OK | hairstyle-analysis-usage.ts:27-47 |
| /api/analytics/event | POST | **none** | Yes | **stores the client-supplied `userEmail`**; no rate limit | **WEAK** (M7) | analytics/event.ts:20-76 |
| /api/brand/contact-submit, faq-question-submit | POST | **none** | Yes | sends a notification to the ops inbox (not to the submitter; HTML-escaped) | **WEAK** (spam, M7) | contact-submit.ts:31-78; contactNotifyEmail.ts:13-18, 56 |
| /api/email/send (alias /api/send-email) | POST | admin or `EMAIL_SEND_SECRET`. `preview:true` needs no auth but only renders HTML. | No | recipient comes from the body (admin/secret only) | OK (LOW: preview is open, secret compare is not constant-time) | email/send.ts:23-28, 46-53, 69-81; send-email.ts |
| /api/cron/expiring-rewards-emails | GET, POST | secret | Yes | batch | OK | cron/expiring-rewards-emails.ts:6-23 |
| /api/vision/share | GET, POST | none (optional per-link password) | Yes | by slug | LOW (L3) | vision/share.ts:54-112; _lib/visionShareDb.ts:65-69 |
| /wishlist/shared/:token | (SPA) | n/a | n/a | **localStorage registry only, no server endpoint**, so nothing can leak across users | OK | src/utils/wishlistListShare.ts:86-123 |

### Appendix: Studio OS / site00 / generation endpoints (one-word verdicts, not deep-audited)

- **admin (allow-list):**
  - canonical-department-generation (+studio-world check), creative-studio-stack-authorization, context-capsule
  - environment-package-approve/events/migrate/promote/status/worker
  - experience-lab-ephemeral-authorization, founder-render-approve/generate/status
  - immune-system-health/incidents, live-try-on-batch-manifest
  - product-asset-factory-run, product-photography-generate, scene-stack-asset-cleanup
  - site00-assts, site00-production
  - studio-asset-registry, studio-builder-generate, studio-creative-intelligence, studio-foundry-generate, studio-generate-asset, studio-generation-status, studio-os-membership, studio-production-governance, studio-replace-asset, studio-virtual-production, studio-workspace-state, studio-world-experience-curation, studio-world-family-derivation
- **founder:** live-try-on-batch-status, live-try-on-batch-step.
- **admin + membership role:** studio-partner-onboarding.
- **secret (fails open if unset outside production, L2):** studio-generation-worker.
- **Outside the requested scope but notable:** `api/expert-capture/knowledge-mirror.ts:23-66` has **no auth**. It does a service-role GET and an **upsert/overwrite** of any `expert_capture_knowledge_programs` row by `programId`. This deserves its own review: unauthenticated overwrite of business records, HIGH or CRITICAL depending on how guessable the IDs are.

---

## 4) Supabase RLS

The live database state is unknown. This section reflects the migrations as written. Tables that have RLS enabled and **no** policies are reachable only through the service role, which is fine as long as the API checks auth.

| Table | RLS | Policies | Assessment |
|---|---|---|---|
| profiles | on (001:80; full_app_sync:83) | select/insert/update own, under **two sets of names**: 001:86-88 and full_app_sync:98-104. No delete. | OK. The privileged-column trigger blocks escalation (slay_tickets.sql:59-109). The trigger's INSERT branch keeps client-supplied `loyalty_points`, `gift_card_balance`, `slay_ticket_balance`, `voucher_*` and `unlocked_discounts` (L11). JSON reward columns are writable (M2). |
| orders | on | select own (001:90; full_app_sync:112). **Legacy `"Users can insert own orders"` / `"Users can update own orders"` (001:91-92) are never dropped**; the guard drops only `orders_insert_own` / `orders_update_own` (20260604...:61-63). | **H3 (conditional)** |
| cart, wishlist | on | own CRUD (001:94-102; full_app_sync:106-110) | OK |
| notifications | on | select/insert/update own (001:104-106) | LOW. Users can forge "admin" notifications to themselves (L5). |
| reviews | on (002:23) | select own, **insert own with no column checks** (002:25-26) | M3. A user can insert directly with `status='published'`, `verified_purchase=true` and any `email`/`client_name`. No public read endpoint exists, so the impact is limited to admin views and moderation. |
| meetings | on (002:49) | **select/insert/update/delete own, no column checks** (002:51-54) | H1. Users can edit `status` and `metadata` (autopay Stripe IDs and amounts). |
| audit_log | on, no policies (002:71-72) | service role only | OK |
| referral_earnings | on, no policies (002:89) | service role only | OK (unused) |
| user_activity | on | insert/select own (003; 20260327210000:21-31) | OK |
| deleted_accounts | on | `for all using (false)` (004:20) | OK |
| app_config | on, no policies (20260325140000:12) | service role | OK |
| membership_payments, membership_payment_failures, booking_autopay_attempts, consult_quotes | on | select own | OK |
| site_analytics_events | on, no policies (20260330180000:25) | service role | OK. Abuse happens through the public API instead (M7). |
| pending_order_forms, pending_affiliate_submissions, pending_review_supplemental | on, no policies (20260413120000:32, 55, 82) | service role | OK |
| brand_contact_inquiries | on, no policies (20260527120000:16) | service role | OK |
| priority_messages | on | insert/select own (20260603180000:24-30) | OK |
| psa_message_usage, psa_threads, psa_messages, psa_member_context | on | select own or none | OK |
| **psa_tool_events** | **RLS NEVER ENABLED** (20260607140000_psa_tool_events.sql; no later migration enables it) | none | **H2**. Stores `user_id` plus the first 160 characters of every member's PSA chat message (`api/_lib/psaToolAnalytics.ts:22-32`). |
| hairstyle_analysis_usage, hairstyle_analysis_purchase_grants | on, no policies | service role | OK |
| slay_ticket_transactions, lounge_content_unlocks | on | select own (20260620120000:45-56) | OK. Balance changes go through the API (C1). |
| vision_share_links / events | on, no policies (20260704220000:42-43) | service role | OK |
| tutorial_progress | on | own | OK |
| psa_episode_entitlements, psa_watch_sessions, care_purchase_entitlements, season_pass_entitlements | on | select own | OK |
| collectible_definitions / education_* / user_collectibles | on | select all definitions; own rows | OK (`education_episode_completions` allows insert own) |
| lounge_engagement_* | on | public read of summaries/visible comments; own insert/update | LOW. The comment update policy does not lock `status` or `report_count`, so authors can un-hide moderated comments (20260810180000:338-341) (L4). `lounge_record_qualified_view` is executable by anon (L352), allowing view inflation. |
| trend_*, slay_forecast_* | on | `service_role` only | OK |
| studio_* / site00_* | site00 tables are enabled dynamically (`20260818143000_site00_production_os.sql:382-387`) | service role | OK (not deep-audited) |
| storage: avatars bucket (created by API with `public:true`), email-assets (public read, service write) | | | OK / by design |

Docs: `docs/SUPABASE_PROFILES_RLS.sql` matches the full_app_sync policies, and its delete policy is commented out.

---

## 5) Sensitive data exposure

- **Admin screens**: every admin data API requires a server-side admin check (section 3a). A non-admin who forges localStorage `currentUser.email` gets past `AdminGuard` but only sees UI shells and **their own browser's localStorage** mock data. The APIs return 403. No hardcoded customer PII was found in the bundle: the only personal-domain address in `src/` is the founder's.
- **Affiliate screens**: points and status are computed from the user's own data. No cross-customer exposure, but the values can be forged (M2, M6).
- **psa_tool_events (H2)**: probably the only path where an anonymous caller can read other customers' content (chat snippets) using the public anon key. Conditional on Supabase's default grants on `public`.
- **Public endpoints**:
  - `/wishlist/shared/:token` is localStorage-only (no leak, and it does not work across devices).
  - `/vision/:slug` returns only admin-authored link data, minus the password field.
  - `analytics/event` accepts an arbitrary `userEmail`, which poisons per-email analytics, and has no rate limit.
  - Brand contact and FAQ forms can be used to spam the ops inbox through Resend.
  - Email preview renders templates without auth but sends nothing.
- **Client bundle privacy (L7)**: `DEFAULT_ADMIN_EMAILS` (3 addresses) and `VITE_ADMIN_EMAILS` ship in the client JS (`src/utils/adminAuth.ts` ~L322-345). The founder Gmail address appears in 6 `src/` files. That enables admin-account enumeration and targeted phishing or password spraying (compounded by L1).
- **Browser PII**: `baw_auth_backup` (localStorage) and the **non-HttpOnly, 1-year** cookies `baw_auth_b` (slim currentUser JSON, up to ~3.8 KB) and `baw_auth_p` (email, name, birthday) (`src/utils/adminAuth.ts:87-117, 157-195`). No tokens or passwords are stored (see section 7). This is a privacy risk on shared devices and is readable by any XSS.

---

## 6) Audit logging

- **There is a server-side audit log**: table `public.audit_log` (002_admin_gaps.sql:57-72, service-role only) with writer `api/_lib/auditLog.ts:35-56` and reader `GET /api/admin/audit-log`.
- **Covered**: profile.update (self), pending order-form/affiliate/review-supplemental approve+decline (`admin/pending-queue.ts:124, 159, 219, 295`), review publish/reject, meetings create/update/delete, meeting client alert, notification create, newsletter send, consult quote create, app_config upserts (email layout, lounge TV, special offer, PSA chat, page-debug, perspective panel), social connect/post actions, vision share create, live-try-on batch step, context-capsule export, studio workspace state.
- **Not covered**:
  - `admin/users.ts` ban/unban/password-reset (security-relevant)
  - `admin/priority-messages` PATCH, `admin/brand-contact-inquiries` PATCH, `admin/rewards-notify`, `admin/transactional-notify`, `inventory/back-in-stock-notify`
  - self-service `delete-account`, which writes to `deleted_accounts` and so is partially covered
  - Slay Ticket credits, which have their own ledger `slay_ticket_transactions`
  - booking autopay, which has its own `booking_autopay_attempts`
- **Tier overrides and inventory edits** are client-only (localStorage), so no server action exists to audit.
- **Weaknesses**:
  - `writeAuditLog` swallows all errors (L53-55).
  - `getSupabaseAdmin()` falls back to the anon key, and with no audit_log policies every insert then fails silently.
  - The table is not append-only. Anyone holding the service role can edit or delete rows, and nothing makes the log tamper-evident.

---

## 7) Session handling

- **Two cookie designs.**
  - `api/session-cookie.ts` / `api/session-restore.ts` use `baw_session_rt` (HttpOnly, SameSite=Lax, Secure on https, 30 days). It holds an **HMAC-signed but not encrypted** payload `{rt: refresh_token, uid, iat}`.
  - `api/_lib/sessionCookie.ts` (`baw_ss`, AES-GCM encrypted) is **dead code**; it is not imported anywhere.
- **Session fixation**: low risk. Setting the cookie needs a valid Bearer access token in a header (session-cookie.ts:76-77). Restore checks that the refreshed `data.user.id === payload.uid` (session-restore.ts:127-130). Cross-site login CSRF is blocked in practice because browsers reject SameSite=Lax `Set-Cookie` on cross-site subresource responses.
- **However (M5)**: both endpoints set `Access-Control-Allow-Origin: <request Origin>` **with** `Access-Control-Allow-Credentials: true` (session-restore.ts:92-94, session-cookie.ts:54-56). session-restore returns `access_token` and `refresh_token` in JSON (L139-148). SameSite=Lax is the **only** thing stopping any website from reading a visitor's tokens. Any same-site subdomain XSS, or a browser that treats the cookie as SameSite=None, leads to full account takeover.
- **Rotation**: the cookie is rotated on each restore (L133-137). Sign-out clears it fire-and-forget (`src/utils/adminAuth.ts` `clearAppAuth`) and calls `supabase.auth.signOut()`.
- **`baw_auth_backup`**: holds `{isSignedIn, currentUser}` with the password stripped (`persistAuthBackup`, `src/utils/adminAuth.ts:157-195`). No access or refresh tokens were found in currentUser or the backup (grep of `syncFromApi.ts` and `adminAuth.ts`). The Supabase SDK itself keeps tokens in localStorage, which is the default behaviour.
- **Passwords**: a one-time sanitizer `sanitizeStoredAuthPasswords()` runs at boot (`src/main-app-boot.ts:65`; `src/utils/authPasswordSanitize.ts:49-80`) and strips legacy plaintext `password` from currentUser, registeredUsers and the backup. No current code path was found that writes passwords to storage. The server-side `sync-profile` password fallback (L1) receives passwords but does not store them.
- **No CSP or security headers** in `vercel.json` or `index.html`, and there are 106 `dangerouslySetInnerHTML` uses. Because tokens live in localStorage, any XSS means account takeover (L9).

---

## 8) Prior assessments: status

**docs/SECURITY_HARDENING.md (2026-06):**

| Item | Status now |
|---|---|
| build-a-wig image requires JWT plus rate limit | Present (`checkRateLimit` used in `api/build-a-wig-unit-image.ts`) |
| PATCH /api/profile strips privileged fields | **Fixed**, plus the DB trigger |
| PUT /api/orders returns 403 | **Fixed** at the API. **The DB is only partly fixed**: the legacy 001 write policies are not dropped (H3). |
| PSA health probe requires admin | Not re-verified (out of scope) |
| Stripe server-priced product checkout | **Present**: `resolveCheckoutQuoteLines`; the client-supplied `bcfBundleDealListSubtotal` is declared but unused. New issue: the `stripeCustomerId` body field is trusted (M4). |
| Priority messages | Present, with RLS own policies |

**docs/REFERRAL_AFFILIATE_REWARDS_SECURITY_ASSESSMENT.md:**

| Item | Status now |
|---|---|
| 1.1 Own referral code | Client-side only (`src/pages/checkout/page.tsx`). There is **no server referral logic** (no API writes `referral_earnings`; grep for "referr" in `api/` finds nothing). |
| 1.2 Guest/multi-account, 1.3 first purchase client-only, 1.4 no revocation on cancel, 4.2 no server referral validation | **Still open**. Referral credit lives in localStorage (`src/utils/orderFormDeclineCancelRefund.ts:69-155`, `src/pages/admin/referrals/page.tsx:48-68`). Because `digital_cash_history` is trigger-protected, forged credits **do not persist server-side**. They are display-only, but the program has no authoritative ledger (M6). |
| 2.1 Affiliate content status and points forgeable | **Partly addressed**. A server approval queue now exists (`pending_affiliate_submissions` + `admin/pending-queue`). But `profiles.affiliate_submitted_content` is still **user-writable** through PATCH /api/profile and direct PostgREST, so a user can set `status:'approved'` and `points` on their own entries without an admin (M2). |
| 2.2 No server approval workflow | **Fixed** (pending-queue approve/decline with audit). |
| 3.1/3.2 Loyalty points client-computed | **Server column protected**: `loyalty_points` is trigger-guarded. Points derived from affiliate content and orders are still computed on the client. |
| 4.1 All state in localStorage | **Mostly migrated**: profiles, orders, cart, wishlist and queues are in Supabase. Referral, affiliate points, worker applications and tier overrides remain local. |

---

## 9) Findings ranked by severity, with recommended fixes (no code changes made)

### CRITICAL

**C1. Slay Tickets can be credited without payment.** `POST /api/slay-tickets/credit-order` (`api/slay-tickets/credit-order.ts:55-89`) credits tickets from client-supplied `orderId` and `lineItems` (`api/_lib/slayTickets.ts:150-210`). It never checks that the order exists, belongs to the caller, or was paid. Idempotency is per `orderId`, which the attacker chooses.
- **Today**: any premium member can mint unlimited "purchased" tickets, for example with `[{name:'SLAY TICKET', quantity:9999}]` and a fresh orderId.
- **Before the 2026-08-09 cutoff, or if the env override re-enables it**: any signed-in user could mint "earned" tickets with fake wig lines (`src/content/education/commerce/slayTicketEconomyPolicy.ts:10-13`; `slayTickets.ts:53-66`).
- **Impact**: tickets are spent server-side on lounge content, PSA episodes and season pass (`lounge-tv/unlock.ts`, `psaEntitlements.ts`, `seasonPassEntitlements.ts`).
- **Fix**: credit only from the Stripe webhook (`payment_intent.succeeded` with server-resolved lines in metadata). Otherwise verify `orderId` against the user's server `orders` row or Stripe PI, and recompute lines server-side. Remove the client-callable endpoint or restrict it to admin.

### HIGH

**H1. Booking autopay charges client-supplied Stripe IDs and amounts.** `POST /api/booking/appointment-meeting` stores these body values in `meetings.metadata`: `bookingStripeCustomerId`, `bookingStripePaymentMethodId`, `bookingFinalDueUsd` and "paid" amounts (`api/booking/appointment-meeting.ts:112-138, 198-226`). The hourly autopay job then charges `customer` and `payment_method` from that metadata off-session, for the stored amount (`api/booking/autopay-final-payment.ts:99-105, 143-145, 206-208`). Nothing checks that those IDs belong to `meetings.user_id`. Meetings RLS also lets users insert or update their own rows directly, including `status` and `metadata` (002_admin_gaps.sql:51-54).
- **Impact**: (a) if a victim's `cus_`/`pm_` IDs are known, their card can be charged for someone else's booking; (b) users can understate the final balance or claim deposits were paid.
- **Fix**:
  - Take the customer and PM only from `profiles` (webhook-written), and verify `pm.customer === profile.stripe_customer_id` through the Stripe API.
  - Compute the amounts due server-side.
  - Drop the user INSERT/UPDATE/DELETE policies on `meetings`, or lock the columns with a trigger.

**H2. `psa_tool_events` has no RLS.** `supabase/migrations/20260607140000_psa_tool_events.sql` creates it without enabling RLS. It holds `user_id`, `thread_id` and the first 160 characters of each member's PSA chat message (`api/_lib/psaToolAnalytics.ts:22-32`). With Supabase's default `public` grants it can be read, inserted into and deleted with the public anon key. This would become CRITICAL if snippets contain PII.
- **Fix**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` with no policies, `REVOKE ALL ... FROM anon, authenticated`. Then audit the live DB with `select relname from pg_class where relrowsecurity=false and relnamespace='public'::regnamespace`.

**H3 (conditional). Legacy orders write policies were never dropped.** `001_initial_schema.sql:91-92` creates "Users can insert own orders" and "Users can update own orders". The 2026-06 guard drops only `orders_insert_own` and `orders_update_own` (`20260604120000...:61-63`). If 001 was applied to production, clients can still write their own `orders` JSONB through PostgREST, bypassing the PUT 403. Fabricated delivered orders would then feed order-form approval, PSA order tracking and client rewards.
- **Fix**: check `pg_policies` for `orders`, and drop both policy name sets. Do the same review for `notifications` and `reviews`.

### MEDIUM

**M1. Admin identity is an email check without verifying the email is confirmed.**
- `getAuthUser` and `resolveAdminAuth` (`api/_lib/auth.ts:8-20`, `api/_lib/adminAuth.ts:76-87`) do not check `email_confirmed_at`.
- The hardcoded default allow-list (`adminAuth.ts:10-14`, duplicated in `sync-profile.ts:11-15`) applies whenever `ADMIN_EMAILS` is unset.
- The client has `signOutIfSessionEmailUnconfirmed` (`src/utils/supabase.ts:176-188`), which suggests unconfirmed sessions are possible.
- The docs say "Confirm email" is ON, but if it is ever off, or an OAuth provider returns unverified emails, then anyone who registers an unclaimed allow-listed address (for example `admin@frontalslayer.com`) gets full admin.
- **Fix**: require `email_confirmed_at`. Prefer a user-ID allow-list or `app_metadata.role` set by the service role. Set `ADMIN_EMAILS` explicitly, remove the defaults, and make sure every listed address is registered.

**M2. Reward-relevant profile JSON is writable by the user.** `affiliate_submitted_content`, `user_submitted_reviews`, `signed_order_forms`, `review_supplemental_overlay` and `referral_code` are in neither the API strip list nor the DB trigger (`api/_lib/profilePrivilegedFields.ts`; `api/profile.ts:116-118, 155, 169-172`; trigger in `20260620120000_slay_tickets.sql:86-108`). Users can self-approve affiliate content and set points, and can set someone else's referral code (no unique constraint).
- **Fix**: add these to the trigger and the strip list. Allow writes only through `/api/client/submissions` and the admin queue. Add a unique index on `referral_code`. Compute affiliate points server-side.

**M3. Submissions and reviews trust client-supplied identity.**
- `/api/client/submissions` uses the body's `email` for the order_form and affiliate kinds (`submissions.ts:49, 82`) and emails the `affiliate_content_pending` template to that address (`:106-115`). That turns the endpoint into a branded mail relay to arbitrary recipients. It also sets `verified_purchase: true` for every review (`:214`).
- Reviews RLS lets users insert directly with any status, email or name (002:26).
- **Fix**: always use `user.email`. Derive `verified_purchase` from server orders. Drop the reviews insert policy, or add a `WITH CHECK (status='pending' AND email = auth.jwt()->>'email' AND verified_purchase = false)`.

**M4. The product payment intent trusts `body.stripeCustomerId`** (`api/stripe/create-product-payment-intent.ts:137-138`). It writes the value to the caller's profile through the service role (`:155-163`) and attaches the PI to that customer. That allows cross-customer linkage if a `cus_` ID is known.
- **Fix**: ignore the client value and read it from `profiles` only.

**M5. Session endpoints reflect any Origin with credentials** (`session-restore.ts:92-94`, `session-cookie.ts:54-56`). Token theft is blocked only by SameSite=Lax.
- **Fix**: allow-list the production and preview origins, and drop `*` fallbacks. Consider not returning `refresh_token` in the restore body. Encrypt the cookie, or switch to the existing AES-GCM `baw_ss` helper.

**M6. The referral program has no server ledger.** All checks and credits are client-side. `referral_earnings` is never written, and prior-assessment items 1.2-1.4 and 4.2 are still open.
- **Fix**: validate the referral code, check referrer ≠ buyer and enforce first purchase in the Stripe webhook. Write `referral_earnings` there, and reverse it on refund.

**M7. Public ingest endpoints are open to abuse.** `analytics/event` (any `userEmail`, no rate limit), and `brand/contact-submit` and `faq-question-submit` (no rate limit or captcha; they cost Resend sends).
- **Fix**: use a shared-store rate limiter (KV or Upstash), add a honeypot or Turnstile, and ignore `userEmail` unless a JWT is present.

**M8. Audit coverage and integrity gaps.** Ban, unban and reset in `admin/users.ts`, plus several admin PATCH/notify endpoints, are not logged. `writeAuditLog` fails silently, and the anon-key fallback in `getSupabaseAdmin` would drop every write.
- **Fix**: log all admin mutations. Make `getSupabaseAdmin` throw when the service role is missing. Make the log append-only (revoke UPDATE/DELETE, or ship it to an external sink).

### LOW

**L1. `sync-profile` password fallback** (`api/admin/sync-profile.ts:110-131`) is an unauthenticated password oracle for admin emails, with no rate limit. Fix: remove it, since the Bearer path is enough.

**L2. The studio generation worker secret fails open** when unset and `NODE_ENV !== 'production'` (`async-governed-generation.ts:686-691`). Fix: fail closed.

**L3. Vision Share** stores passwords in plaintext, compares them non-constant-time, has no rate limit and uses human-readable slugs (`api/_lib/visionShareDb.ts:65-69`). Fix: hash the password, rate-limit, and use random slugs for protected links.

**L4. Lounge comment authors can un-hide moderated comments** (`20260810180000...:338-341`). Fix: add `status = 'visible'` and an unchanged `report_count` to `WITH CHECK`, or use a trigger. `lounge_record_qualified_view` is executable by anon, so views can be inflated.

**L5. Users can insert and update their own `notifications`** (`001:105-106`), which lets them spoof admin notices to themselves. Fix: make it select-only.

**L6. PII sits in non-HttpOnly 1-year cookies** (`baw_auth_b`, `baw_auth_p`) and in the localStorage backup. Fix: shorten the lifetime, minimise fields (no birthday), and rely on the HttpOnly server cookie.

**L7. Admin and founder emails ship in the client bundle.** Fix: remove `DEFAULT_ADMIN_EMAILS` and `VITE_ADMIN_EMAILS` from the client and use a server `/api/me` admin flag for UI gating.

**L8. Secret and HMAC comparisons** in email/send, cron, the OAuth state check and the worker secret are not constant-time. Unauthenticated email preview rendering is acceptable.

**L9. No CSP or security headers.** Combined with 106 `dangerouslySetInnerHTML` uses and tokens in localStorage, any XSS means account takeover. Fix: add a CSP, `X-Frame-Options`/`frame-ancestors`, HSTS and `Referrer-Policy` in `vercel.json`.

**L10. The privileged-column trigger's INSERT branch** keeps client-supplied balances: `loyalty_points`, `gift_card_balance`, `slay_ticket_balance`, vouchers and discounts (`20260620120000_slay_tickets.sql:70-84`). This is only reachable if no profile row exists, because the signup trigger normally creates one. Fix: zero these on INSERT for non-service-role callers.

**L11. Operations notes.**
- The autopay endpoint is POST-only (`autopay-final-payment.ts:81`) and expects `BOOKING_AUTOPAY_CRON_SECRET`. Vercel Cron sends GET with `CRON_SECRET`, so the scheduled job likely returns 405/401 and never runs. Verify this in the Vercel logs.
- `api/_lib/sessionCookie.ts` is dead code.
- The public `avatars` bucket makes profile photos world-readable by URL.

**Out of scope but flagged:** `api/expert-capture/knowledge-mirror.ts` allows unauthenticated read and overwrite of any expert knowledge program by `programId` through the service role. It needs a Studio OS review; this is likely HIGH.
