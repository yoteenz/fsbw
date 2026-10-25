# X2 — Cross-project DB dependencies, Stripe authority map, route consumers

This was read-only research of the code in `/home/user/fsbw` (FS) and `/home/user/SITE00`. Both use Supabase project `hyycomvcaqxxvyrfupes`. I did not query the live database, so statements about grants and policies come from migration files only. Any change made directly in production outside those files is unknown.

---

## 1. Cross-project tables and objects (SITE00 vs FRONTAL SLAYER)

### 1a. Shared objects that SITE00 reads or writes

| Object | SITE00 usage (file:line) | Client / role | Owned by | Impact of the planned FS containment |
|---|---|---|---|---|
| `auth.users` (signup) | `src/utils/auth/site00CreateAccountActions.ts:130` `signUp` with `display_name` metadata. `src/projects/jurnl/runtime/state/supabaseAuthAdapter.ts:35` (JURNL) `signUp` with `first_name`/`last_name` and **no `emailRedirectTo`**. Also signIn, OTP and reset in `src/utils/auth/site00SignInActions.ts:118,174,219,235` | browser anon key | Supabase Auth (shared) | **Every SITE00 or JURNL signup fires FS `on_auth_user_created` → `handle_new_user()`** (fsbw `supabase/migrations/20260325120000_full_app_sync.sql:121-141`: inserts `profiles(id,email)` ON CONFLICT DO NOTHING). Then `profiles_guard_privileged_columns` runs its INSERT branch (`20260620120000_slay_tickets.sql:59+`). **If you change the INSERT branch of the profiles trigger, every SITE00 and JURNL signup is affected.** If the new branch raises an error or writes to a new table that fails (FK or RLS), Supabase Auth aborts the signup ("Database error saving new user") for **all three products**. The project-level Site URL, redirect allow-list and "Confirm signup" email template are also shared. JURNL signup has no redirect, so it falls back to the project Site URL. |
| `public.profiles` | `api/profile.ts:202` (GET), `:260` (select), `:307` (**upsert, user JWT**). `api/_lib/site00Projects/clientProjectOwnerIdentity.ts:25` (select by email, admin client) | `getSupabaseUser(token)` (RLS) / `getSupabaseAdmin()` | FS | SITE00 `api/profile.ts` is a **fork of the FS profile API**. `toProfileRow` (`api/profile.ts:131-172`) writes FS commerce columns: `membership_type`, `subscription_tier`, `loyalty_points`, `gift_card_balance`, `voucher_list`, `digital_cash_history`, `referral_code`, `user_submitted_reviews`, `signed_order_forms` and others. It is called on **every SITE00 sign-in and account creation** (`src/utils/auth/site00SignInActions.ts:93`, `site00CreateAccountActions.ts:83`, `src/site00/components/auth/useSite00SignInBootstrap.ts:67`, `Site00AccountRouteGuard.tsx:208`). It relies on the FS profile RLS policies ("Users can read/insert/update own profile", fsbw `001_initial_schema.sql:86-88`, plus `profiles_*` policies) and on the FS privileged-column trigger. **If FS drops or renames any of these columns (for example moving loyalty or wallet to `loyalty_ledger`/`wallet_ledger`), SITE00 profile PATCH breaks with an unknown-column error** (signin swallows it via `.catch`, but the profile sync fails). Unguarded JSONB columns (`user_submitted_reviews`, `signed_order_forms`, `affiliate_submitted_content`, `review_supplemental_overlay`, `saved_addresses`) are writable through SITE00 as well. |
| `public.user_activity` | `api/activity.ts:24` insert (user JWT) | RLS `user_activity_insert_own` (fsbw `20260327210000_user_activity.sql:21`) | FS | Not in the drop list, so it is safe. Separately, the SITE00 client sends `{event, meta}` (`src/utils/api.ts:174`) but the server requires `eventType`, so these inserts already return 400. |
| `public.audit_logs` (plural) | `api/_lib/auditLog.ts:19` (from `api/profile.ts:326`) | admin | **Does not exist.** FS has `audit_log` (fsbw `002_admin_gaps.sql:57`) | The write fails silently today. If FS creates an `audit_logs` table later, SITE00 starts writing into it. |
| Storage bucket `live-preview` (`STUDIO_ASSETS_BUCKET`) | `api/_lib/site00Assts/storage.ts:3` and about 15 call sites; `api/_lib/studioBuilderGeneration.ts:9,410-425` (may **createBucket**) | service role | Shared with FS (`fsbw api/_lib/studioAssetGeneration.ts:5`) | Shared bucket namespace. Not affected by the containment. |
| RPC `site00_allocate_access_credential_code` | `api/_lib/site00AccessCredentials/service.ts:219-221` | `getSupabaseAdmin()`, which **falls back to `SUPABASE_ANON_KEY`** when the service-role key is missing (`api/_lib/supabase.ts:30`) | Defined in **SITE00** migration `20260820000000_site00_access_credentials.sql:75` (SECURITY DEFINER, no GRANT or REVOKE) | Safe to revoke from anon/authenticated **if SITE00 production sets `SUPABASE_SERVICE_ROLE_KEY`**. Otherwise admin credential creation breaks. FS never calls it, and **it is not in any fsbw migration**, so an FS migration that revokes it acts on a SITE00-owned object. Coordinate the change, or make SITE00 own the revoke. |
| Studio World API (indirect) | `api/_lib/studioWorld/httpClient.ts`, `contract.ts:6-10` → `STUDIO_WORLD_API_BASE` `/external/v1/campaigns/*` | HTTP + API key | FS `api/studio-world/v1/campaigns.ts` | Indirect only. That endpoint does not call `studio_world_atomic_reserve_budget`. |
| SITE00-only tables in the shared schema | about 230 `site00_*` tables; `jurnl_user_snapshots`, `jurnl_record_files`, `jurnl_mutation_idempotency` (`20261006103000_jurnl_production_persistence.sql`, FK → `auth.users`); `fs_product_visual_assets`, `fs_product_master_heroes`, `fs_product_asset_bindings`, `fs_build_a_wig_visual_variants` (`20260826031500_fs_product_visual_assets.sql`, FS-named but **created and owned by SITE00**, not referenced by fsbw code) | | SITE00 | `jurnl_*` rows cascade-delete when auth users are deleted. FS account deletion (`api/delete-account.ts`) would wipe JURNL data for a shared identity. |

**SITE00 does not use:** `orders`, `notifications`, `meetings`, `reviews`, `app_config`, `site_analytics_events`, `audit_log`, `cart`, `wishlist`, or any of the 15 FS RPCs (I checked all of `src/ api/ server/ shared/ scripts/ supabase/`; the only `.rpc(` call in SITE00 is the one above). SITE00 admin auth is an email allow-list (`api/_lib/adminAuth.ts:10-21`) and does not use `profiles.role` or `admin_roles`.

**Legacy policies (b):** SITE00 depends on **none** of the policies FS plans to drop (orders, notifications, meetings, reviews). Within FS, no `src/` code writes `orders` directly. `api/orders.ts:20-25` disables PUT, so dropping "Users can insert/update own orders" is safe. Those two policies, plus `orders_insert_own`/`orders_update_own` created in `20260325120000_full_app_sync.sql:113-118` and dropped in `20260604120000_security_profiles_orders_guard.sql`, currently let any logged-in user rewrite their own `orders` JSONB through PostgREST. The meetings policies ("Users can insert/update/delete own meetings", `002_admin_gaps.sql:52-54`) are **security-relevant to Stripe**: `api/booking/autopay-final-payment.ts` charges `meetings.metadata.bookingFinalDueUsd` to `metadata.bookingStripeCustomerId`/`PaymentMethodId`, and a user can write that metadata directly.

**Proposed new tables (c):** there are **no name collisions** in either repo for any of the 22 names (customer_orders … stock_waitlist). I used a word-boundary grep over src, api, supabase and scripts in both repos.

### 1b. Migration directory overlap and drift (same project, two migration histories)

- fsbw has 82 files in `supabase/migrations`. SITE00 has 63 files in `supabase/migrations`. fsbw also carries `site00-standalone/supabase/migrations` (8 files).
- **8 identical versions in both repos** (byte-identical): 20260817103000, 20260817143000, 20260817160000, 20260817180000, 20260818143000, 20260818153000, 20260818180000, 20260818190000 (`site00_*`).
- **6 version collisions with different content:**

| version | fsbw | SITE00 |
|---|---|---|
| 20260820140000 | studio_virtual_production_os | site00_marketing_engagements |
| 20260820160000 | studio_vp_campaign_pilot_external | site00_marketing_deliverable_links |
| 20260820180000 | studio_world_production_governance | site00_production_orchestration |
| 20260820190000 | **studio_world_governance_enforcement** (defines `studio_world_atomic_reserve_budget`) | site00_reconciliation_sprint02 |
| 20260820200000 | studio_vp_nia_identity_lock | site00_evolve_marketing_os |
| 20260826123000 | site00_design_bridge (creates `site00_design_change_requests`) | site00_design_control_plane_bridge (creates `site00_managed_projects`) |

  `supabase_migrations.schema_migrations` is keyed by version, so `supabase db push` or `migration list` from either repo will see the other repo's version as applied-but-missing or as a conflict. The FS agents apply migrations with MCP `apply_migration`, which records names too. **Any new FS containment migration must use a timestamp that neither repo has used, and you should list remote migrations first.** Expect `db diff`/`db pull` from either repo to show the other product's objects as drift.
- fsbw code still reads and writes about 39 `site00_*` tables (`api/_lib/site00Production/**`, `api/_lib/site00Assts/**`, `api/admin/site00-*.ts`, `api/site00/*.ts`), so both repos write to the same tables.

---

## 2. RPC classification

Every FS caller is server-side (`api/**`). **No browser code calls `.rpc()`** (no hits in fsbw `src/`). The "public" features reach these functions through `/api/*` endpoints that use a service-role client (or `getSupabaseAdmin()`, which falls back to the anon key when `SUPABASE_SERVICE_ROLE_KEY` is unset; fsbw `api/_lib/supabase.ts:30`).

**Critical technical note:** apart from the trend and lounge functions, the migrations only `GRANT EXECUTE ... TO service_role`, and **no migration in either repo contains a REVOKE**. Postgres grants EXECUTE to `PUBLIC` by default, and Supabase default privileges also grant anon and authenticated. So today every function below is callable by anyone holding the anon key at `/rest/v1/rpc/<fn>`, with caller-supplied `p_user_id`. The containment must run `REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC, anon, authenticated;` followed by `GRANT ... TO service_role;`. **Revoking from anon and authenticated alone leaves the PUBLIC grant in place.**

| Function | Defined (fsbw migration:line) | Current grants in migrations | FS callers (file:line → client) | SITE00 calls? | Class | Notes |
|---|---|---|---|---|---|---|
| hairstyle_analysis_grant_purchase_credits | 20260610140000_hairstyle_analysis_paid_credits.sql:153 | service_role (+PUBLIC default) | api/_lib/hairstyleAnalysisUsage.ts:161 (`getSupabaseAdminServiceRole`) ← webhook.ts:288 | no | **SERVICE-ONLY** | Takes `p_user_id` and `p_payment_intent_id`. Anon can mint paid credits with any string PI id. Highest priority. |
| hairstyle_analysis_try_consume | 20260610140000…:20 (orig 20260610120000:17) | service_role | hairstyleAnalysisUsage.ts:64 (service role) | no | SERVICE-ONLY | |
| hairstyle_analysis_refund_consume | 20260610140000…:105 | service_role | hairstyleAnalysisUsage.ts:140 (service role) | no | SERVICE-ONLY | Anon can refund any user's usage. |
| psa_try_consume_message | 20260605120000_psa_message_usage.sql:19 | service_role (:106) | api/_lib/psaUsageLimit.ts:70 (service role) | no | SERVICE-ONLY | |
| psa_consume_watch_if_qualified | 20260809103000_psa_episode_entitlements.sql:62 | service_role (:131) | api/_lib/psaEntitlements.ts:307 ← api/psa-today/watch-session.ts:29,91 (`serviceSupabase`, service key) | no | SERVICE-ONLY | |
| lounge_toggle_helpful | 20260810180000_lounge_content_engagement.sql:246 | **authenticated** (:353) | api/_lib/loungeEngagement.ts:161 ← api/lounge-tv/engagement/helpful.ts:54 (service key) | no | SERVICE-ONLY (in practice) | Takes `p_user_id` with no `auth.uid()` check, so any logged-in user can toggle helpful as anyone. The browser uses `/api/lounge-tv/engagement/helpful` (`src/utils/loungeEngagementApi.ts:90`), so revoking is safe. |
| lounge_record_qualified_view | …lounge_content_engagement.sql:167 | **anon, authenticated** (:352) | loungeEngagement.ts:133 ← api/lounge-tv/engagement/qualified-view.ts:53 (service key) | no | SERVICE-ONLY (in practice) | Anon can inflate view counts. The browser goes through `/api/...` (`loungeEngagementApi.ts:68`). |
| lounge_engagement_ensure_summary | …:111 | PUBLIC default | none direct; `PERFORM` inside recount (:137) and toggle (:264) | no | SERVICE-ONLY (internal) | The definer context covers the nested calls, so revoking is harmless. |
| lounge_engagement_recount_summary | …:127 | service_role (:354) | loungeEngagement.ts:320,355,423 (passed service client) | no | SERVICE-ONLY | |
| handle_new_user | 20260325120000_full_app_sync.sql:121 (orig 20250314000000:15) | PUBLIC default | trigger `on_auth_user_created` | indirectly (all SITE00 and JURNL signups) | **TRIGGER** | Trigger firing does not check EXECUTE, so revoking is harmless. **Changing its body affects SITE00 and JURNL.** |
| profiles_preserve_privileged_columns | 20260620120000_slay_tickets.sql:59 (orig 20260604120000:3) | PUBLIC default | trigger `profiles_guard_privileged_columns` | indirectly (SITE00 `/api/profile` upsert) | **TRIGGER** | Revoking is harmless. INSERT-branch changes affect SITE00 and JURNL signups and SITE00 profile upserts. |
| studio_world_atomic_reserve_budget | 20260820190000_studio_world_governance_enforcement.sql:29 (**that version collides with SITE00's 20260820190000**) | PUBLIC default | api/_lib/productionGovernance/atomic-reserve.ts:45 ← executeGovernedProduction.ts:218 ← gateway-hook.ts:49,91 ← creativeProduction/generation-gateway.ts:347 (`getSupabaseAdmin`) | no (SITE00 reaches Studio World only over HTTP) | SERVICE-ONLY | Anon can reserve or burn any org's budget. Needs the service-role key in FS production (the webhook already requires it). |
| site00_allocate_access_credential_code | **SITE00** 20260820000000_site00_access_credentials.sql:75 | PUBLIC default | none in FS | **yes**: SITE00 api/_lib/site00AccessCredentials/service.ts:219 (`getSupabaseAdmin`, anon fallback) | SERVICE-ONLY | SITE00 owns this function. Low impact (it only burns sequence numbers). Revoke in SITE00's migrations, or coordinate with SITE00. |
| slay_forecast_public_broadcast_package | 20260812010000_slay_forecast_weekly_generation_v2.sql:100 (orig 20260811220000:180) | **anon, authenticated, service_role** (:163) | api/_lib/slayForecastBroadcast/packages.ts:228 ← api/slay-forecast-broadcast/public.ts:20-21 (`getSupabaseAdmin`). Browser: src/trend-intelligence/useSlayForecastBroadcastPackage.ts:19 → `/api/slay-forecast-broadcast/public` | no | **PUBLIC-BY-DESIGN** (data), but only the server calls it | Filters `status='published'` (:105-107). Revoking anon is safe only if the service key is set. Otherwise keep the grant and validate the slug length and format. |
| trend_intelligence_public_forecast_payload | 20260811210000_trend_intelligence_v1.sql:438 | anon, authenticated, service_role (:524) | api/_lib/trendIntelligence/service.ts:579 ← api/trend-intelligence/public.ts:17-22. Also generatePsaBrief service.ts:533 ← api/admin/trend-desk.ts:146, api/admin/slay-forecast-broadcast.ts:75,228. Browser: src/trend-intelligence/resolveForecastIntelligence.ts:40 | no | PUBLIC-BY-DESIGN (server-only callers) | Same as above. Filters published content. |
| trend_intelligence_public_report_signals | …trend_intelligence_v1.sql:480 | anon, authenticated, service_role (:525) | service.ts:590 ← api/trend-intelligence/public.ts:26. Browser: src/trend-intelligence/resolveTrendReportIntelligence.ts:21 | no | PUBLIC-BY-DESIGN (server-only callers) | Same as above. |

**Conclusion:** if both `SUPABASE_SERVICE_ROLE_KEY` values are confirmed in production, revoking all 16 functions from `PUBLIC, anon, authenticated` breaks **no browser feature** in FS or SITE00. The only checks needed are the service-key presence (both repos' `getSupabaseAdmin()` silently use the anon key otherwise) and SITE00's ownership of `site00_allocate_access_credential_code`.

---

## 3. Stripe authority map (fsbw)

### 3a. Every Stripe API call in `api/**`
Stripe is imported in only 4 files.

| File:line | Call | Purpose |
|---|---|---|
| api/stripe/create-checkout-session.ts:176 | customers.create | Creates a membership customer (metadata `supabase_user_id`) and writes `profiles.stripe_customer_id` (:181) |
| :198 | subscriptions.retrieve | Existing subscription for an upgrade or downgrade |
| :249-252 | subscriptionSchedules.retrieve/create/update | Downgrade at period end |
| :308 | subscriptions.update | Upgrade (`billing_cycle_anchor:'now'`, `proration_behavior:'none'`) |
| :68, :76 | invoices.list, paymentIntents.retrieve | Finds the last paid charge |
| :323, :327 | charges.retrieve, **refunds.create** | Prorated refund on upgrade. **This is the only refund anywhere in the code.** |
| :376 | checkout.sessions.create (mode `subscription`) | New membership |
| api/stripe/create-product-payment-intent.ts:154 | customers.create | Only when `savePaymentMethodForFuture`, which **no client sends** |
| :170 | paymentIntents.create | Product cart |
| api/booking/autopay-final-payment.ts:203 | paymentIntents.create (`off_session`, `confirm:true`) | Booking final balance |
| api/stripe/webhook.ts:31,121 | subscriptions.retrieve | |
| :343 | webhooks.constructEvent | Signature verification |

**Idempotency keys: none** on any Stripe call (`grep idempotencyKey api/stripe api/booking` finds only the meeting-row dedupe in `appointment-meeting.ts`/`consult-meeting.ts`). There is **no customer portal** (`billingPortal` has no hits). There is **no cancellation endpoint**: nothing sets `cancel_at_period_end:true` or calls `subscriptions.cancel`, and `auto_renew_membership` is privileged and only mirrored from Stripe. There is **no refund endpoint** for products or bookings, and **no `charge.refunded` or `charge.dispute.*` handler**. Admin pending hard-codes "REFUND REQUESTS 0" (`api/admin/pending.ts:99`).

### 3b. Webhook events (`api/stripe/webhook.ts:349-371`)

| Event | Handler | Writes |
|---|---|---|
| checkout.session.completed | :23 (only `mode==='subscription'`) | `profiles` stripe_customer_id, stripe_subscription_id/status, membership_type=PREMIUM, subscription_tier (from session metadata), auto_renew, period_end, purchased_at (:45-59). Sends email `membership_welcome` (:65) |
| invoice.paid | :102 | `profiles` tier, period_end, auto_renew, status by `stripe_subscription_id` (:139). Inserts `membership_payments` (:156). Dedupe relies on the `stripe_invoice_id UNIQUE` constraint (`20260327120000_stripe_membership.sql:21`) and ignores 23505 |
| invoice.payment_failed | :175 | `profiles.last_payment_failure_at`. Inserts `membership_payment_failures` (no unique constraint, so Stripe retries create duplicate rows) |
| customer.subscription.updated | :220 | `profiles` status, auto_renew, period_end. **Tier is not updated**, so a downgrade that takes effect through the schedule is only picked up on `invoice.paid` |
| customer.subscription.deleted | :299 | `profiles` → STANDARD, clears subscription fields |
| payment_intent.succeeded | :236 | (1) If `metadata.booking_autopay_enroll==='true'`, writes `profiles.stripe_customer_id`/`stripe_default_payment_method_id` (never triggered, because the client never enrolls). (2) If `purpose==='product_order'`, calls `appendOrderFromProductPaymentIntent` (api/_lib/recordProductOrderFromPaymentIntent.ts:35), which does a read-modify-write of the `orders.active_orders` JSONB (not atomic). Dedupe is by `stripePaymentIntentId` inside the JSON. The order is generic (`productName:'STRIPE CHECKOUT'`, `items:1`, **total = amount in charge currency treated as USD**, :47,62). It sends `order_confirmed`, `payment_received` and `points_earned` emails, but **does not credit any loyalty points**. (3) Parses `metadata.hairstyle_analysis_grants` and calls `grantHairstyleAnalysisPurchaseCredits` (RPC, idempotent on the PI id through the PK `hairstyle_analysis_purchase_grants.stripe_payment_intent_id`) |
| (no other events) | default ignore | Ignored: `payment_intent.payment_failed`, `charge.refunded`, disputes, `checkout.session.expired`, and the `purpose:'booking_final_payment'` PI (the autopay endpoint records that itself) |

The runtime is Node (`config = { maxDuration: 60 }`, :8). **`docs/STRIPE_MEMBERSHIP_SETUP.md` §7 claims the Edge runtime, which is stale.** Events are not stored, and there is no `event.id` dedupe table.

### 3c. Checkout flows

| Flow | Client route | Server endpoint | Amount source | Metadata | Webhook records | Order of record |
|---|---|---|---|---|---|---|
| **Membership subscription** | `/account/rewards` → `/checkout/upgrade` (`src/pages/checkout/page.tsx:1263` `createStripeMembershipCheckoutSession`; `src/utils/api.ts:316`) | POST /api/stripe/create-checkout-session | **Server**: Stripe Price ID per tier (`STRIPE_PRICE_ID_*`, api/_lib/stripeMembership.ts) | session + subscription_data: `supabase_user_id`, `subscription_tier`. `client_reference_id`=user | checkout.session.completed, invoice.paid, payment_failed, subscription.updated/deleted → `profiles` and `membership_payments` | `profiles` subscription columns and `membership_payments`. Upgrade or downgrade of an existing subscription is applied **synchronously** in the endpoint (:197-373), including the refund. The in-app "CONFIRM ORDER" on `/checkout/upgrade` (non-Stripe) only changes localStorage, because the privileged trigger blocks the server write |
| **Product cart (unit wigs, hairstyle analysis)** | `/checkout` (`page.tsx:6552-6593` → `src/utils/productCheckoutStripe.ts:40` → `api.ts:369`) | POST /api/checkout/quote (preview), POST /api/stripe/create-product-payment-intent | **Server** `resolveCheckoutQuoteLines` (api/_lib/pricing/resolveQuote.ts:210). Unit price comes from the name map (:77-85, NOIR 740 … WIG 740) plus a cap surcharge. FX via fxRates. **It ignores vouchers, gift-card balance, digital cash, loyalty, tip, shipping and tax**, so the charge differs from the total the client displays (the doc admits this) | purpose=product_order, supabase_user_id, user_email, usd_total_cents, charge_currency, charge_amount_minor, fx_rate, fx_as_of, line_count, booking_autopay_enroll, hairstyle_analysis_grants. **No line items** | payment_intent.succeeded → `orders` JSONB generic row and hairstyle credits | Split: the client builds a detailed `newOrder` in **localStorage** (page.tsx:2795-2832, id `order-${n}`), while the server gets a generic `order-pi-…` row from the webhook. The two IDs differ. `/api/orders` PUT is disabled. **The body field `stripeCustomerId` is accepted without an ownership check** (create-product-payment-intent.ts:137) |
| **Hairstyle analysis purchase** | `/tools/hairstyle-analysis` → `HairstyleAnalysisPreview` → `appendHairstyleAnalysisToLocalCart` (src/utils/hairstyleAnalysisPurchase.ts:22) → `/checkout` | same PI endpoint | Server `resolveHairstyleAnalysis` (resolveQuote.ts:141) | `hairstyle_analysis_grants` JSON | Credits through the RPC (idempotent on the PI id) | `hairstyle_analysis_purchase_grants` and usage tables |
| **Bookings / consult deposits** | `/checkout/bookings` | **No Stripe.** `shouldRunStripeProductPayment` returns `run:false` for the bookings route (src/utils/productCheckoutPolicy.ts:77-84). Meetings are written by POST /api/booking/appointment-meeting and /api/booking/consult-meeting | Client card form (legacy, "founder dummy PAN" allowed: src/utils/checkoutCardValidation.ts:27-74). The server quote supports `booking-appointment`/`booking-consult` ($40) but is not used on this route | n/a | none | `meetings` row (+metadata), plus the localStorage order. **The deposit is not collected through Stripe** |
| **Booking autopay final payment** | consent checkbox at checkout (page.tsx:5333, 6666-6673; it requires a saved Stripe customer and PM that nothing in the UI creates) | POST /api/booking/autopay-final-payment (Bearer `BOOKING_AUTOPAY_CRON_SECRET`) | **The client-supplied `bookingFinalDueUsd`, `bookingStripeCustomerId` and `bookingStripePaymentMethodId`**, stored in `meetings.metadata` (appointment-meeting.ts:129-137, 201-205) | purpose=booking_final_payment, meeting_id, supabase_user_id. **No idempotency key** | none (the endpoint writes `booking_autopay_attempts` and `meetings.metadata` itself) | `booking_autopay_attempts` and `meetings.metadata`. Concurrent runs can double-charge. Every hourly run inserts a `skipped` attempt row for each non-ready meeting |
| **Gift card** | `/checkout/gift-card` (src/utils/giftCardCheckout.ts:47) | **None.** Policy `run:false` (productCheckoutPolicy.ts:80). The quote rejects `gift-card` (resolveQuote.ts:255) | client | n/a | n/a | localStorage only. `gift_card_balance` is privileged and no server path credits it. **No codes and no ledger.** `/account/load-card` is also client-only |
| **Slay tickets** | `/tools/slay-tickets` → `/checkout/slay-tickets` | **No Stripe** (policy `run:false`). After "payment", the client calls POST /api/slay-tickets/credit-order (page.tsx:2881 → api/slay-tickets/credit-order.ts:85 → api/_lib/slayTickets.ts:150) | **Client lineItems.** The server counts purchased packs from the client lines **with no payment verification** | n/a | n/a | `profiles.slay_ticket_balance` and `slay_ticket_transactions` (dedupe on client `orderId`+type, so any new orderId credits again). **Free-ticket vulnerability.** |
| **Special offer** | `/checkout` with `isSpecialOffer` lines | Product PI path | The server ignores `isSpecialOffer` and prices by name (list price) or leaves the line unresolved. A cart with an unresolved line is blocked ("CANNOT BE PAID BY CARD YET", page.tsx:6572) | — | — | localStorage |
| **BCF bundles** | `/checkout` | Product PI path | `bcfBundleDeal` is always unresolved (resolveQuote.ts:227-237), so **card checkout is blocked** whenever Stripe is required. If Stripe is unavailable or legacy is allowed, it goes through the client-only order | — | — | localStorage |
| **Build-A-Wig custom lines** | `/checkout` | Product PI path | Unresolved unless the name exactly matches the catalog. If the name is "WIG" it is priced at $740, ignoring customizations (the client adds +$120 colour, page.tsx:195) | — | — | localStorage |

Product checkout runs through Stripe only when `/api/stripe/product-checkout-available` reports a secret key and a publishable key, and `ALLOW_LEGACY_CHECKOUT` is not set (api/stripe/product-checkout-available.ts:26-34). Otherwise the whole checkout is a client-side simulation.

### 3d. Doc claims vs code
- **CHECKOUT_SERVER_QUOTE.md:** accurate about unresolved BCF, BAW and gift card. It understates two things: hairstyle-analysis lines are now resolved, and the PI charges list price with no discounts, while the client shows discounted totals. Its "webhook appends order … idempotent" is true, but the order has no line items and uses the wrong currency.
- **STRIPE_MEMBERSHIP_SETUP.md:** the event list matches the code. Two claims are stale: "Edge runtime" (it is Node), and "client cannot PATCH stripe ids" (true, and the DB trigger also blocks it). It does not mention the synchronous upgrade/downgrade/refund path or the lack of cancellation or a portal.
- **BOOKING_AUTOPAY_SETUP.md:** claims the PI endpoint "accepts `savePaymentMethodForFuture`" (true, server-side), but **no client sends it**. The doc's own "Important current limitation" admits that the booking UI doesn't use Stripe. Its cron claim is wrong: **Vercel cron issues GET** and attaches `Authorization: Bearer $CRON_SECRET`, but the endpoint requires **POST** and checks **`BOOKING_AUTOPAY_CRON_SECRET`** (autopay-final-payment.ts:81-91). So the cron in vercel.json gets 405 or 401 and **autopay never runs automatically**.

### 3e. vercel.json crons
- `0 * * * *` → `/api/booking/autopay-final-payment`. As above, it is effectively dead: wrong method and wrong secret name.
- `0 14 * * *` → `/api/cron/expiring-rewards-emails`. Accepts GET/POST, checks `CRON_SECRET || EMAIL_SEND_SECRET` (api/cron/expiring-rewards-emails.ts:6-18). Works if `CRON_SECRET` is set.

---

## 4. Route consumers

Counts come from a scan of literal route strings (`'…'`, `"…"`, `` `…` ``, `${origin}…`, `.com…`) in fsbw `src/` (IN-APP), `api/_lib/email` + `api/email` (EMAIL), `api/_lib/psa*` (PSA), other `api/` files, `docs/` + `motherboard/`, and `scripts/`/`public/` (excluding tests). All route definitions are in `src/App.tsx`. Admin child routes are relative (`<Route path="users">` under `/admin`, App.tsx:1303+).

**Permanent deep links:**
- **Customer emails** build their CTA as `SITE_URL || https://fsbw.vercel.app` (`api/_lib/email/brandAssets.ts:7-11`) plus `defaultCtaPath` from `api/_lib/email/templateRegistry.ts`, or a caller-supplied `ctaUrl`. Every email header also links `/account/rewards` (`emailHeaderNavLinks.ts:13`), and the support link is `/account/concierge#priority-messages` (`emailSupportLinks.ts:4`).
- **Stored notification and alert `actionRoute` values** are persisted in DB JSON, so old rows keep the old paths: `api/admin/consult-quotes.ts:97-105` (`/account/orders?orderNumber=…&consultOffer=1`), `api/admin/meeting-client-alert.ts:84` and `api/booking/autopay-final-payment.ts:52` (`/account/notifications`).
- **PSA:** the route catalog is `api/_lib/psaKnowledge.ts:44-56` and becomes part of model instructions. Tool outputs carry `upgradePath`/`path` (`psaTools.ts:853`, `psaFeatureGates.ts:87,115`, `psaOrderTracking.ts:138`, `psaResponseUi.ts:112`). PSA chat history persists these strings (`psa_chat_threads`/`psa_tool_events`). Client-side PSA nudges and quick replies live in `src/utils/psaProactiveNudgeCatalog.ts`, `psaQuickReplyNavigation.ts` and `psaRouteDisplay.ts`.

| ROUTE | IN-APP CONSUMERS (count; key files) | EMAIL CONSUMERS | PSA / OTHER | NOTES |
|---|---|---|---|---|
| /account | 106; accountAlertsCatalog.ts, pages/account/notifications, signInReturnTo.ts, account sub-pages (back links) | templateRegistry.ts:296 `digital_cash_update` | psaKnowledge.ts:48; launch-integrity-auditor config.mjs:22; docs ROUTE_SURFACE_CATALOG:118, PRODUCT_WIRING_MAP:178 | Hub. Heavily linked |
| /account/concierge | 24; desktop-lobby/ZoneLoungeReveal.tsx(5), accountAlertsCatalog.ts(3), pages/orders/page.tsx(3) | templateRegistry.ts:399 `birthday_reward` | psaKnowledge.ts:49; docs EMAIL_SYSTEM.md:69 | |
| /account/concierge#order-tracking | 1 built dynamically: pages/orders/page.tsx:4101 `?orderId=…#order-tracking`; anchor handled at pages/account/concierge/page.tsx:2255-2257, id at :3885 | — | — | Keep the anchor id if the page moves |
| /account/concierge#priority-messages | handler pages/account/concierge/page.tsx:2266-2268, id :3521 | **emailSupportLinks.ts:4 (support link in every email that renders it)** | docs EMAIL_SYSTEM.md:69 | **Permanent email deep link** |
| /account/rewards | 62; accountAlertsCatalog.ts(6), tutorial-os tours (mansionTourV2, vouchersWalkthrough, pageRegistry), checkout/page.tsx(4), PsaAssistantWidget.tsx:609, BuildWig gates, ExtensionsBoutiqueShopPanel | **templateRegistry.ts:35 welcome, :230 points_earned, :244 points_redeemed, :257 points_expiring, :380 membership_welcome, :390 tier_upgraded; emailHeaderNavLinks.ts:13 (every email header); templateCatalog.ts:125** | psaFeatureGates.ts:87,115; psaOrderTracking.ts:138; psaTools.ts:853 (upgradePath); psaKnowledge.ts:50; api/client/priority-messages.ts:37,57; docs STRIPE_MEMBERSHIP_SETUP:52, PSA_SETUP:33 | **The most-embedded customer route.** Membership upgrade entry point |
| /account/collectibles | 6; RewardsRoomCertificationWall.tsx(2), penthouseSuiteDashboardData.ts, pages/account/page.tsx | — | — | |
| /account/referrals | 7; accountAlertsCatalog.ts(2), penthouseSuiteDashboardData, account/page, notifications, tutorial pageRegistry | templateRegistry.ts:283 `referral_redeemed` | psaKnowledge.ts:52 | |
| /account/affiliate | 7; same pattern as referrals | **templateRegistry.ts:306,316,330,343,353,367 (6 affiliate_* templates)** | psaKnowledge.ts:53; docs ROUTE_SURFACE_CATALOG:126 | |
| /account/alerts | 11; App.tsx(2 incl. redirect), psaProactiveNudgeCatalog.ts(2), pages/account/consult-offer(2), penthouseSuiteDashboardData, psaProactiveNudges.ts | — | config.mjs:27 | |
| /account/notifications | 3; desktop-notifications/DesktopNotificationsProductionLayer.tsx(2) | **templateRegistry.ts:451 meeting_reschedule, :463 meeting_cancel** | **Stored actionRoute: api/admin/meeting-client-alert.ts:84, api/booking/autopay-final-payment.ts:52**; motherboard/CORE.md:26 | Persisted in notification JSON |
| /account/consult-offer | 2; App.tsx, utils/consultOfferFromQuote.ts | — (the consult email points to /account/orders?consultOffer=1) | — | |
| /account/orders | 48; psaProactiveNudgeCatalog.ts(10), accountAlertsCatalog.ts(6), orderAccountAlerts.ts(5), psaQuickReplyNavigation.ts(4), reviews/leave-review-order(4) | **templateRegistry.ts:111 order_received, :124 order_confirmed, :137 order_processing, :147 order_shipped, :160 out_for_delivery, :172 delivered, :185 delayed, :208 payment_received, :220 partially_shipped, :439 consult_offer_sent** (fired from the webhook via recordProductOrderFromPaymentIntent and orderLifecycle.ts) | **Stored actionRoute + email ctaUrl: api/admin/consult-quotes.ts:97-98,144** `/account/orders?orderNumber=…&consultOffer=1`; docs EMAIL_SYSTEM:40 | **Top order deep link. The query params `orderNumber` and `consultOffer` must keep working** |
| /orders | 10; psaProactiveNudgeCatalog.ts(6), psaRouteDisplay.ts(2), App.tsx | — | **psaResponseUi.ts:112 (order card `path:'/orders'`), psaFeatureGates.ts:120 (prompt), psaKnowledge.ts:51**; config.mjs; docs PSA_SETUP:36 | PSA uses `/orders` while emails use `/account/orders`. Keep both as aliases |
| /account/orders/:id/review | 2; App.tsx, pages/orders/page.tsx | — | — | |
| /account/reviews | 2; App.tsx, account/page.tsx | — | — | |
| /account/shipping | 7; accountAlertsCatalog.ts(4), account/page, notifications | — | — | |
| /account/payment | 2; App.tsx, account/page.tsx | — | config.mjs:28 | |
| /account/settings | 9; App.tsx, accountAlertsCatalog, penthouseSuiteDashboardData, signInReturnTo, **utils/auth/site00SignInActions.ts** (FS copy of SITE00 code) | **templateRegistry.ts:101 password_changed, :477 account_login_alert, :486 profile_updated, :495** | config.mjs:23 | |
| /account/load-card | 3; App.tsx, penthouseSuiteDashboardData, account/page | — | — | Client-only gift-card loading |
| /wishlist | 60 (52 files; product pages and headers); psaRouteDisplay, psaProactiveNudgeCatalog, wishlist/lists page | templateRegistry.ts:429 `wishlist_price_drop` | psaKnowledge.ts:47; public/studio-world/fsbw-composer-page-registry.json | |
| /wishlist/lists | 8; wishlistListItemDetails.ts(2), wishlist/lists page(2), WishlistItemThumb, psaRouteDisplay | — | — | |
| /wishlist/shared/:token | 4; utils/wishlistListShare.ts(2) (builds share URLs), AddToListModal | — | — | **Share links are sent outside the app and are permanent** |
| /tools/hairstyle-analysis | 3; App.tsx, constants/psaConfig.ts, design-dna-canon | — | docs STYLE_ANALYSIS, HAIRSTYLE_ANALYSIS_TEMPLATES, PSA_SETUP:272 (11 doc refs) | The purchase flow enters /checkout from here |
| /slay-cam | 6; ZoneLoungeReveal(2), ShopMobileMenuShopTab, ZonePortals, account/page | — | — | |
| /checkout/upgrade | 16; checkout/page.tsx(7), account/membership/page.tsx(4), utils/api.ts(2), usePremiumSubscriptionUpgrade.ts | — | **Server default `returnPath` + Stripe success/cancel URLs: api/stripe/create-checkout-session.ts:143-149** | **Stripe success_url `/checkout/upgrade?stripe=success&session_id=…`. In-flight sessions return here, so keep the path until old sessions expire** |
| /tools/slay-tickets | 16; checkout/page.tsx(4), pages/tools(4), tools/slay-tickets(3), ShopMobileMenuToolsTab, slayTicketPacks.ts | — | — | |
| /mobile/profile, /mobile/concierge, /mobile/rewards, /mobile/analysis | 3-4 each; MobileBottomNav.tsx, routes/MobileMansionRoutes.tsx; vision-engine/tourScript.ts (concierge); mobile/home (rewards); mobile/penthouse (analysis) | — | — | Internal only |
| /desktop/account | 4; App.tsx, desktopDebugRegistry, desktopCommerceRoutes.ts, perspectivePanelDebug | — | — | Internal only |
| /admin/users | 0 links (route only, App.tsx:3052) | api/admin/users.ts:93 sends a reset email with `ctaUrl: resetLink` (not an admin route) | — | URL-only. Orphan |
| /admin/audit | 0 links (App.tsx:3062) | — | docs ROUTE_SURFACE_CATALOG:163 | Orphan |
| /admin/analytics | 0 links (App.tsx:3037) | — | docs ROUTE_SURFACE_CATALOG:162 | Orphan |
| /admin/notifications | 0 links (App.tsx:3057) | — | — | Orphan |
| /admin/alerts | 1; pages/admin/components/AdminHeader.tsx | — | — | |
| /admin/marketing/offers | 1; pages/admin/special-offer/page.tsx | — | — | |
| /admin/referrals | 1; pages/admin/dashboard/page.tsx | — | — | |
| /admin/revenue/edit-inventory | 2; admin/revenue/page.tsx, admin/alerts/page.tsx | — | — | |
| /admin/revenue/view-waitlist | 1; admin/revenue/page.tsx | — | — | |
| /admin/revenue/fulfilled-orders | 1; admin/revenue/page.tsx | — | — | |
| /admin/clients/account | 0 links; App.tsx:1326 is a redirect to /admin/clients/overview (App.tsx:1004); comment at admin/clients/page.tsx:799 | — | — | Legacy redirect only |
| /admin/headquarters | 12; studio-os-core/studio-world/route-registry.ts(3), CommandDock.tsx, studio-world-atlas/catalog.ts, application/routes.ts | — | api/_lib/creativeProduction/studio-os-server.bundle.js:2934 (bundled); public/studio-os/world-graph/graph.json; 11 studio-os docs | Studio OS hub |
| /admin/meetings/schedule | 0 literal links (App.tsx:1338) | — | — | Probably reached through relative navigation |
| /admin/reviews | 5; admin/clients(2), StatsCard, admin/pending, admin/dashboard | — | — | |
| /admin/pending | 9; admin/clients(2), admin/messages(2), StatsCard, admin/reviews, admin/alerts, DesignGenomePanels | — | config.mjs:36; docs | |

**SITE00 route note:** SITE00 has its own route tree, and its src/api/shared code has no hard-coded links to the FS domain (`grep frontalslayer.com|fsbw.vercel.app` finds only a host check in `src/utils/desktopPreview.ts:19-24`). So the FS route migration does not break SITE00 links. I did not separately audit whether SITE00 uses `/account/*` paths of its own.
