> **Lead-auditor note:** live read-only checks found 0 rows in `orders`, 9 profiles, 0 non-zero `loyalty_points`, and 0 `referral_earnings`. Legacy 001 write policies are confirmed live. The live grant function accepts counts `1,3,6` only. See doc 02 §5 and doc 13.

# E — Data Architecture Audit: Customer Account + Admin (FRONTAL SLAYER / fsbw)

Read-only audit of `/home/user/fsbw` (migrations, api/, src/). No Supabase calls were made; "live DB" state is unknown — everything below is what the repo says. Where migrations conflict, the effective schema depends on which files were actually applied.

---

## 0. Headline findings (most important first)

1. **Orders have no real server source of truth.** `public.orders` is ONE row per user holding two JSON arrays (`active_orders`, `past_orders`) (`supabase/migrations/001_initial_schema.sql:38-46`, `20260325120000_full_app_sync.sql:70-77`). The only server writer that creates orders is the Stripe webhook, and it writes a **stub**: `productName: 'STRIPE CHECKOUT'`, placeholder image, `items: 1`, `status: 'PAID'`, no line items, no address, no shipping (`api/_lib/recordProductOrderFromPaymentIntent.ts:59-74`). The real order (line items, BAW options, status `PREPARING`/`PLACED`, order number) is built in the browser and written only to `localStorage userOrders_<email>` (`src/pages/checkout/page.tsx:2729-2832`).
2. **Server sync overwrites the rich local order with the stub.** `syncOrdersFromApi()` replaces `userOrders_<email>` wholesale with the GET /api/orders result (`src/utils/syncFromApi.ts:164-182`), and `syncAllFromApi()` runs on account route guard, lobby, app boot, sign-in (`src/components/AccountRouteGuard.tsx:93`, `src/App.tsx:1167`, `src/main-app-boot.ts:43`, etc.). Client order ids (`order-${n}`, `checkout/page.tsx:2797`) never match server ids (`order-pi-<pi>`, `recordProductOrderFromPaymentIntent.ts:59`), so nothing merges.
3. **Admin order status / tracking / cancel are written only to the ADMIN'S browser localStorage.** Tracking edits call `patchOrderInUserOrders()` → `localStorage` (`src/pages/admin/revenue/page.tsx:688-717`, `src/utils/orderTracking.ts:88-115`); the "client notification" for the tracking update is also written into the admin browser (`orderTracking.ts:118-170`). Admin "CANCEL ORDER … CANCELLED AND REFUNDED" only rewrites admin localStorage — no API, no Stripe refund (`src/pages/admin/clients/page.tsx:3826-3851`). PUT /api/orders is hard-disabled (`api/orders.ts:20-25`) and there is no admin order-update endpoint (`api/admin/orders.ts` is GET-only).
4. **Verified: admin revenue/inventory numbers = the admin's own browser storage.** `buildRevenueOrdersList()` iterates `localStorage.key(i)` for `userOrders_*` (`src/utils/adminRevenueStats.ts:130-149`); `getDepletedInventory()` starts from hardcoded `STARTING_INVENTORY` (10 per SKU, `adminRevenueStats.ts:38-60`) and subtracts those local orders, or returns `adminInventoryOverride` from localStorage (`:174-213`). On exception it returns 4 hardcoded fake orders (`:150-170`). Worse: the **storefront** uses the same functions to decide sold-out for shoppers (`src/utils/productInventoryAvailability.ts:58-74`, consumed by unit PDPs, cart, wishlist, `ProductInventorySync`), so each shopper sees stock computed from *their own* browser — effectively always in stock. `motherboard/CORE.md:64` documents this as intended.
5. **Rewards economy is client-computed and cannot persist.** `loyaltyPoints`, `giftCardBalance`, `voucherList`, `digitalCashHistory`, `currentTierName`, etc. are stripped from PATCH /api/profile (`api/_lib/profilePrivilegedFields.ts:2-46`) and frozen by the DB trigger (`20260604120000_security_profiles_orders_guard.sql`, `20260620120000_slay_tickets.sql`), but **no server code ever increments them** (only `recordProductOrderFromPaymentIntent.ts:22` *reads* `loyalty_points` for an email; `has_made_first_purchase` set on first insert only, `:117-120`). The UI computes tier and points from local orders (`src/pages/account/membership/page.tsx:448-473`), writes them to `currentUser` localStorage, and its patch calls (e.g. load-card `giftCardBalance`, `src/pages/account/load-card/page.tsx:383-410`) are silently discarded server-side. Referral $20 credits are written to the referrer's record inside the *buyer's* browser `registeredUsers` (`checkout/page.tsx:6946-6998`); `referral_earnings` table is never written by any API (only read by `api/admin/referrals.ts`).
6. **Business records stored as client-writable JSON blobs on `profiles`**: `user_submitted_reviews`, `affiliate_submitted_content`, `signed_order_forms`, `review_supplemental_overlay` are NOT privileged (writable via PATCH /api/profile, `api/profile.ts:169-172`) and the service-role submission endpoint lets the client overwrite them wholesale (`api/client/submissions.ts:97-104` affiliate, `:246-255` `profile_reviews`). A client can mark its own affiliate content `approved` with points, or its signed form `adminApproved: true`.
7. **Mock data merged into real admin data for the founder (the primary admin).** Admin clients page merges `getMockClientsForAyoteenz()` (mock1..mock17@test.com, fake spend/orders) into the live client list and persists them into `registeredUsers` (`src/pages/admin/clients/page.tsx:909-923`, `:942-951` — the latter branch is not even founder-gated), the dashboard does the same (`src/pages/admin/dashboard/page.tsx:347-357`) and silently falls back to a full mock dashboard on any API error (`:405-410`). Meetings hub/dashboard always merge deterministic mock meetings for every admin (`src/pages/admin/meetings/AdminMeetingsHub.tsx:891-919`, `dashboard/page.tsx:741-751`). Revenue page shows hardcoded "QUARTERLY $89K/$95K/$112K", "PROFIT MARGIN 35%", "INVESTMENT RETURN 18%", payment method mix (`src/pages/admin/revenue/page.tsx:1396-1421`, `:1593-1598`).
8. **Paid hair-analysis results are not persisted anywhere**; result URL lives only in React state (`src/components/hairstyle-analysis/HairstyleAnalysisPreview.tsx:463-472`), server only tracks counters (`hairstyle_analysis_usage`). Also a **credit-count mismatch**: webhook/app use comparison counts `1|4` (`api/stripe/webhook.ts:283-286`, `api/_lib/hairstyleAnalysisUsage.ts:56`) but the SQL grant/refund functions only accept `1,3,6` (`20260610140000_hairstyle_analysis_paid_credits.sql:131,186`) → 4-pick purchases return `invalid_counts` and grant nothing (unless the live DB has a newer function).

---

## 1. TABLE INVENTORY (Customer Account + Admin scope)

Legend: RLS = enabled? Pol = client policies (none = service-role only).

### 1.1 `profiles` — one row per auth user (PK `id` → `auth.users.id` ON DELETE CASCADE)
Migrations: `001_initial_schema.sql:5-35`, `20250314000000_create_profile_on_signup.sql`, `20260325120000_full_app_sync.sql:9-45`, `20260326120000_normalize_profile_placeholders.sql`, `20260326180000_ensure_profiles_columns.sql`, `20260327120000_stripe_membership.sql:4-9`, `20260328120000_stripe_payment_failures.sql:3-5`, `20260403203000_profiles_stripe_default_payment_method.sql`, `20260413120000_pending_admin_queues.sql:7-9`, `20260414100000_profiles_review_supplemental_overlay.sql`, `20260604120000_security_profiles_orders_guard.sql` (guard trigger), `20260620120000_slay_tickets.sql:3-4` (+ trigger update).
RLS on; select/insert/update own (both 001 and full_app_sync policy sets may coexist). BEFORE INSERT/UPDATE trigger `profiles_guard_privileged_columns` freezes privileged columns for non-service-role.

All columns grouped by purpose:

| Group | Columns | Notes |
|---|---|---|
| Identity | `id`, `email` (NOT NULL in 001 only), `role`, `first_name`, `last_name`, `birthday` (text), `profile_image`, `created_at`, `updated_at` | `role` guarded but **unused for authorization** (admin = email allowlist) |
| Contact / social | `phone_number`, `facebook`, `instagram`, `youtube`, `tiktok`, `twitter` | |
| Addresses | `default_address` jsonb, `shipping_address` jsonb, `saved_addresses` jsonb | No addresses table |
| Membership / subscription (Stripe mirror) | `membership_type`, `subscription_tier`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_subscription_status`, `auto_renew_membership`, `subscription_period_end`, `subscription_purchased_at`, `last_payment_failure_at`, `stripe_default_payment_method_id` | Written by `api/stripe/webhook.ts` (service role); authoritative |
| Tier / spend | `current_tier_name` | Guarded; **no server writer**; no spend column |
| Loyalty / points | `loyalty_points` (integer in 001/ensure, numeric in full_app_sync) | Guarded; **no server writer** |
| Vouchers / rewards / digital cash | `gift_card_balance`, `unlocked_discounts`, `voucher_list`, `voucher_history`, `digital_cash_history`, `welcome_discount_tiers_credited_by_period`, `has_made_first_purchase`, `slay_ticket_balance` | All guarded. Only `slay_ticket_balance` (api/_lib/slayTickets.ts:121) and `has_made_first_purchase` have server writers; `voucher_list/history` only read by `api/_lib/email/expiringRewardsScan.ts:68` |
| Referral | `referral_code` | client-writable |
| Slay challenge | — none — | localStorage only |
| Hair analysis usage | — none on profile — | see `hairstyle_analysis_usage` |
| Affiliate | `affiliate_submitted_content` jsonb `{orderId:{photos,videos,socials}}` | client-writable blob |
| Reviews | `user_submitted_reviews` jsonb[], `review_supplemental_overlay` jsonb | client-writable blobs; overlay exists to support **mock review ids** ("2","3") per its own migration comment |
| Signed forms | `signed_order_forms` jsonb[] | client-writable blob incl. `adminApproved` flag |
| Preferences | `notification_newsletter`, `notification_sales`, `notification_order_tracking` | Only 3 prefs; currency, animations etc. are localStorage |
| Admin overrides | — none — | founder tier/subscription overrides are localStorage (`adminTierOverride`, `adminSubscriptionOverride`, `src/utils/adminAuth.ts:446-455`) |

API: `api/profile.ts` (GET/PATCH with user JWT), `api/admin/sync-profile.ts`, `api/admin/clients.ts:58`, `api/admin/dashboard.ts:33`, `api/admin/export/clients.ts`, `api/stripe/*`, `api/client/submissions.ts`, `api/_lib/pendingQueueHandlers.ts`, `api/_lib/slayTickets.ts`, `api/delete-account.ts`, email triggers. UI: every account page via `syncProfileFromApi` → `currentUser` localStorage; admin Clients/Dashboard.

### 1.2 Addresses — no table; `profiles.*_address` jsonb (above). UI: account settings/addresses, checkout.

### 1.3 `orders` — ONE row per user (UNIQUE user_id), line items = JSON inside JSON
Migrations: `001_initial_schema.sql:38-46` (has `email NOT NULL`), `20260325120000_full_app_sync.sql:70-77` (no email column), `20260604120000_security_profiles_orders_guard.sql:61-63` (drops `orders_insert_own/update_own`).
Columns: `id`, `user_id`→auth.users, `[email]`, `active_orders` jsonb[], `past_orders` jsonb[], `updated_at`. Line items: optional `lineItems` array inside each order object (client-built `buildPersistedLineItemsFromCart`, checkout:2796); server stub has none.
RLS on; select own. **If 001 was applied, its policies "Users can insert own orders"/"Users can update own orders" (`001:91-92`) are NOT dropped by the security migration** (which drops differently-named policies) → client JWT may still write orders directly via PostgREST.
Writers: `api/_lib/recordProductOrderFromPaymentIntent.ts` (webhook), `api/_lib/pendingQueueHandlers.ts:205-260` (order-form approve/decline). Readers: `api/orders.ts`, `api/admin/{orders,revenue,dashboard,pending,sync-profile}.ts`, `api/_lib/{psaMemberContext,psaTools,careEntitlements}.ts`.
UI: Orders page, Concierge, Account overview, Admin Clients/Revenue/Pending — **all via localStorage `userOrders_*`**, not the API directly.

### 1.4 `cart` — one row per user, `items` jsonb, `version` int (optimistic lock)
`001:50-56`, `full_app_sync:56-62`, `20260415120000_cart_version.sql`. RLS own (FOR ALL). API `api/cart.ts` (409 on version conflict), `api/admin/cart.ts`. BAW configurations live only as cart line objects. UI shopping bag/checkout (localStorage `cartItems` is primary, cloud is merged union).

### 1.5 `wishlist` — one row per user, `items` jsonb
`001:60-66`, `full_app_sync:63-69`. RLS own. `api/wishlist.ts`, `api/admin/wishlist.ts`. **Named lists (`userLists`, `userLists_<email>`) and shared lists (`wishlistSharedListsByToken`) are localStorage-only** (`src/components/AddToListModal.tsx:6-46`, `src/utils/wishlistListShare.ts:4-36,113`) → share links only resolve in the owner's browser. `savedForLater` also local-only.

### 1.6 Memberships / subscription events
- `membership_payments` (`20260327120000_stripe_membership.sql:17-35`): invoice ledger, UNIQUE `stripe_invoice_id`, FK `profiles(id)`, `kind in (initial, renewal)`. RLS select own. Writer `api/stripe/webhook.ts:156`; reader `api/admin/membership-payments.ts`.
- `membership_payment_failures` (`20260328120000:10-28`). Same pattern.
- No subscription lifecycle/event table (upgrade, downgrade, cancel, reactivate only mutate profile columns, `webhook.ts:135-139, 302-308`). Local cache `adminMembershipPayments` (`src/utils/membershipPayments.ts`).

### 1.7 Rewards / points ledger
- **No loyalty-points ledger.** Points = `profiles.loyalty_points` (never written) + affiliate JSON points + spend computed client-side (`membership/page.tsx:470-473`).
- `slay_ticket_transactions` (`20260620120000_slay_tickets.sql:9-29`): proper ledger (type earned/used/purchased/adjusted/expired, unique per order). RLS select own. Writers `api/_lib/slayTickets.ts:137`, `api/_lib/seasonPassEntitlements.ts`. Balance duplicated on `profiles.slay_ticket_balance` with read-modify-write (`slayTickets.ts:112-121`). **`api/slay-tickets/credit-order.ts:64-80` credits tickets from client-supplied `orderId` + `lineItems` with no payment/order verification.**
- `referral_earnings` (`002_admin_gaps.sql:75-89`): service-only; **never written**.

### 1.8 Challenges — none in DB. Slay Challenge progress is global (not even per-user) localStorage `slayChallengeTier1Progress/Tier2Progress/…Reward/SelectedCycle/ProgressCycle` (`src/pages/account/concierge/page.tsx:1219-1353`). `user_collectibles.source_type` allows `'slay-challenge'` but nothing writes it.

### 1.9 Entitlements (healthy, server-authoritative)
`psa_episode_entitlements` + `psa_watch_sessions` (`20260809103000`), `care_purchase_entitlements` (+`configuration_snapshot`, `20260809120000`, `20260809190000`) — derived from DELIVERED orders read out of `orders` JSON (`api/_lib/careEntitlements.ts:56-63`, so it inherits the stub-order problem), `season_pass_entitlements` (`20260809150000`), `lounge_content_unlocks` (`20260620120000`). All RLS select-own, service writes.

### 1.10 Hairstyle analysis
`hairstyle_analysis_usage` (PK user_id; month counter + `paid_credit_queue int[]`) and `hairstyle_analysis_purchase_grants` (PK stripe PI id) (`20260610120000`, `20260610140000`); RPCs `hairstyle_analysis_try_consume/refund_consume/grant_purchase_credits` (service_role only). Writer `api/_lib/hairstyleAnalysisUsage.ts`. **No results/history table** (result returned by `api/hairstyle-analysis-generate.ts:234-241`, not stored). Count mismatch 1|4 vs 1|3|6 (see 0.8).

### 1.11 Saved BAW configurations — no table. Only cart/wishlist line objects + many `selected*`/`edit*`/`customize*` localStorage keys; `care_purchase_entitlements.configuration_snapshot` is the only server-side config snapshot.

### 1.12 Affiliates & content submissions
- `pending_affiliate_submissions` (`20260413120000:47-60`): kind photo/video/social, status pending/approved/declined, payload jsonb. RLS on, no policies. Writer `api/client/submissions.ts:94`; admin `api/admin/pending-queue.ts:136-185`.
- Approved state lives in `profiles.affiliate_submitted_content` JSON (approve sets `points: 100` in JSON only, `pendingQueueHandlers.ts:140`; no loyalty credit).
- Slay Cam / content submissions: no dedicated table.

### 1.13 Referrals — `profiles.referral_code` + unused `referral_earnings`. Validation/ownership lookup uses `registeredUsers` in the buyer's localStorage (`checkout/page.tsx:2118-2140, 6948-6998`). Account referrals page reads `referralEarnings` localStorage (`src/pages/account/referrals/page.tsx:92,121,185`).

### 1.14 Reviews
- `reviews` (`002:5-21`, + `video_urls` `20260413120000:91`, `client_profile_photo_url` `20260407120000`, `videos int` `20260407140000`, `verified_purchase` `20260408120000`). status pending/published/rejected. RLS: select own, insert own **with no WITH CHECK on status** (`002:26`) → direct PostgREST insert can set `published`.
- `api/client/submissions.ts:191-243` inserts with **`verified_purchase: true` hardcoded** (`:214`) and mirrors into `profiles.user_submitted_reviews`. Admin `api/admin/reviews.ts`, `api/admin/pending-queue.ts:231-255`.
- `pending_review_supplemental` (`20260413120000:66-88`) for post-publish media, keyed by `client_review_key` (local review id).

### 1.15 Pending queues
`pending_order_forms` (`20260413120000:18-34`), `pending_affiliate_submissions`, `pending_review_supplemental` — all RLS on with no policies (service only). Read/decide via `api/admin/pending-queue.ts`; side effects `api/_lib/pendingQueueHandlers.ts`. Order-form approve patches the order **by id inside orders JSON** (`pendingQueueHandlers.ts:188-232`); since the form's `orderId` comes from the local order (`src/pages/shop/order-form/page.tsx:706`, ids `order-N`) and server orders are `order-pi-…`, `changed=false` → **silent no-op**. Admin pending page additionally reads `userOrders_*` locally (`src/pages/admin/pending/page.tsx:122,199`). `api/admin/pending.ts:33-41` counts "AWAITING FORM" order statuses that no server code ever writes → always 0.

### 1.16 `consult_quotes` (`20260402210000:19-35`, `redeemed_at` `20260403140000`). user_id FK, discount_code, expires_at. RLS select own. APIs `api/admin/consult-quotes.ts`, `api/consult-quote.ts`, `api/checkout/{validate,redeem}-consult-code.ts`. UI booking/orders/concierge (+ local `consultOfferSnapshot` copy on orders).

### 1.17 Slay tickets — see 1.7. UI Lounge TV, checkout.

### 1.18 Collectibles / certifications
`collectible_definitions`, `education_episode_completions` (client insert-own allowed), `education_certifications`, `user_collectibles` (`20260809180000`). Writer `api/_lib/educationCertifications.ts`; `api/collectibles/index.ts`. Local progress caches `lounge_season_progress_v1`, `lounge_care_progress_v1` (not user-scoped keys).

### 1.19 Notifications / alerts
`notifications` (`001:70-76`): ONE row per user, `items` jsonb array. RLS select/insert/update own (`001:104-106`) → clients can forge their own notification items. Server writers do read-modify-append (`api/admin/notifications.ts:44-59`, `api/admin/consult-quotes.ts:111-129`, `api/admin/meeting-client-alert.ts:94-112`, `api/booking/autopay-final-payment.ts:42`). GET only for client (`api/notifications.ts`); **read state is local** (`notifications_<email>`, `alertsPageViewed_*`, `acc_*`). Most account alerts (order received, tracking, deposits) are generated and stored only in localStorage (`src/utils/orderAccountAlerts.ts`, `orderTracking.ts:118`).

### 1.20 Messages / support
- `priority_messages` (`20260603180000`): member → concierge/PSA, status new/read/archived, `related_order_id` text. RLS insert/select own. APIs `api/client/priority-messages.ts`, `api/admin/priority-messages.ts`, PSA tool. Local cache `adminPriorityMessagesByClient`.
- `brand_contact_inquiries` (`20260527120000`): public contact form, status new/read, `order_number` text. Service only. `api/brand/contact-submit.ts`, `api/admin/brand-contact-inquiries.ts`. FAQ questions (`adminBrandFaqQuestions`) and job applications (`brandJobApplications_v1`) are **localStorage only**.
- PSA chat: `psa_threads`, `psa_messages`, `psa_member_context`, `psa_tool_events`, `psa_message_usage` (`20260605…`–`20260607…`) — server-authoritative.

### 1.21 Meetings / bookings
`meetings` (`002:30-47`, + `category`, `metadata`, status +`pending` `20260402210000:1-17`). RLS: users can **update and delete** own meetings (`002:53-54`). APIs `api/admin/meetings.ts`, `api/booking/{appointment,consult}-meeting.ts`. `booking_autopay_attempts` (`20260403200000`) FK meetings. Admin UI merges mock + API + `adminMeetingsScheduled` local rows (see §4).

### 1.22 `app_config` (`20260325140000`): key/value jsonb, service only. Keys used: special offer, lounge TV, PSA chat, email layout, page debug, perspective panel, context capsule, studio-institute invites (`api/admin/*-config.ts`, `api/special-offer-config.ts`, `api/lounge-tv-config.ts`, `api/psa-chat-config.ts`). Good pattern; admin UI caches to localStorage (`specialOfferAdminConfig`, `src/pages/admin/special-offer/page.tsx:95-123`).

### 1.23 `site_analytics_events` (`20260330180000`): visitor_id, user_email, event_type, platform, meta. Service only. `api/analytics/event.ts`, `api/admin/analytics.ts`, `api/admin/live-presence.ts`. Plus `user_activity` (`003_user_activity.sql` AND `20260327210000_user_activity.sql` — duplicate definitions) via `api/activity.ts`, `api/admin/activity.ts`; local backup `baw_activity_local_backup`.

### 1.24 Admin roles — **no table.** Email allowlists duplicated in `api/_lib/adminAuth.ts:9-20`, `api/admin/sync-profile.ts:11-15`, `src/utils/adminAuth.ts` (+ founder-only `FOUNDER_PRIVILEGED_ADMIN_EMAIL`). `profiles.role` set to 'admin' by client payload (`src/utils/syncFromApi.ts:629-631`) but stripped/frozen server-side.

### 1.25 Audit / activity logs
`audit_log` (`002:57-71`, service only). Writer `api/_lib/auditLog.ts` (swallows errors). Logged actions: profile.update (details `{updated:true}` only, `api/profile.ts:328-335`), meetings, notifications, reviews, pending-queue decisions, app_config, newsletter, consult quotes, social. **Not logged:** order status/tracking/cancel/refund (no server path), loyalty/voucher/gift-card adjustments, membership changes from webhook, client submissions.

### 1.26 `deleted_accounts` (`004`), service only, via `api/delete-account.ts`, `api/admin/deleted-accounts.ts`. (Doc `docs/ADMIN_DASH_VS_SUPABASE.md` still says "no dedicated table yet" — stale.) Local `deletedUsers`, `blockedCredentials` also used by admin clients.

### 1.27 Waitlist — none in DB. `unitStockNotifyWaitlist_v1` localStorage (`src/utils/unitStockNotify.ts`), processed in whichever browser fires the inventory event, then POSTs `api/inventory/back-in-stock-notify.ts` which **requires admin** → a shopper's waitlist entry is only actioned if it happens to be in the admin's browser.

### 1.28 Inventory — none in DB. `STARTING_INVENTORY` constant + local `adminInventoryOverride` (§3).

### 1.29 Other customer-relevant tables (healthy): `tutorial_progress` (`20260704180000`, client upsert-own), `vision_share_links/events`, `lounge_engagement_*` (`20260810180000`).

---

## 2. JSON-BLOB ANTI-PATTERNS

| Blob | Location | Holds | Who writes | Risk |
|---|---|---|---|---|
| `orders.active_orders` / `past_orders` | `orders` (1 row/user) | Every order + nested line items, status, tracking, form flags | Webhook (stub), pending-queue handlers | **Critical.** No order PK, no line-item rows, no status history; full-array read-modify-write in webhook & handlers (`recordProductOrderFromPaymentIntent.ts:48-104`, `pendingQueueHandlers.ts:210-232`) → concurrent webhook + admin approval can lose writes; admin aggregates must scan every user's JSON (`api/admin/revenue.ts:25-35`, `dashboard.ts:34-66`); idempotency by scanning arrays for `stripePaymentIntentId`. If 001 policies remain, client can rewrite it. |
| `profiles.user_submitted_reviews` | profiles | Client copy of reviews + moderation + supplemental media state | client PATCH /api/profile; `submissions.ts` (`review`, `profile_reviews` overwrite) ; admin handlers | Duplicates `reviews` table; client can set `moderationStatus`/`supplementalContentStatus: approved`; ID linkage by string id. |
| `profiles.affiliate_submitted_content` | profiles | Per-order photos/videos/socials with status & points | client PATCH; `submissions.ts:97-104` overwrites with client-sent object; admin handler sets approved/points | Points/approval forgeable; no ledger; admin cannot query across customers except by scanning profiles; base64/preview payloads may bloat the row. |
| `profiles.signed_order_forms` | profiles | Signed authorization snapshots incl. `adminApproved` | client PATCH; admin handler | Legal-ish record editable by customer; duplicates `pending_order_forms.payload`; no immutable signed copy. |
| `profiles.review_supplemental_overlay` | profiles | Supplemental media status for review ids not in user list (catalog/mock ids) | handlers + client | Exists to support mock review rows (`20260414100000` comment) — schema shaped by demo data. |
| `profiles.voucher_list`, `voucher_history`, `digital_cash_history`, `unlocked_discounts`, `welcome_discount_tiers_credited_by_period` | profiles | Wallet / voucher state | **nobody server-side** (guarded) | Monetary state with no ledger and no writer; UI values are local-only and diverge per browser. |
| `profiles.saved_addresses` etc. | profiles | Address book | client PATCH | Acceptable short-term; no validation/ids. |
| `notifications.items` | notifications (1 row/user) | All server notifications | admin APIs (read-append), client insert/update allowed by 001 RLS | No per-item id/read state on server; race on append; client-forgeable. |
| `cart.items`, `wishlist.items` | 1 row/user | Cart/wishlist lines incl. full BAW config | client | OK for cart (has version lock); wishlist has none; BAW configs not queryable. |
| `hairstyle_analysis_usage.paid_credit_queue int[]` | | Purchased credits FIFO | RPC | No per-credit provenance beyond grants table. |

Common risks: no ledger/audit trail, last-write-wins races (every handler does select→mutate→update without row lock or version), admin cannot filter/aggregate (e.g. "all orders awaiting form"), and blobs are client-writable for non-privileged columns.

---

## 3. LOCALSTORAGE AS SOURCE OF TRUTH

(Literal-key counts from grep across src: `currentUser` 216 refs, `cartItems` 149, `registeredUsers` 104, `editingCartItem` 94, `userOrders_` 29 call sites in 37 files.)

| Key | Holds | Written by | Read by | Synced to server? | Risk |
|---|---|---|---|---|---|
| `userOrders_<email>` | Full order objects (line items, status, tracking, form flags) | checkout `page.tsx:2832`; admin revenue/clients/pending (`orderTracking.ts:88`, `admin/clients/page.tsx:3848`); `syncOrdersFromApi` (overwrite) | Orders, Concierge, Account, Membership (tier/points), Referrals, Affiliate, admin Clients/Revenue/Pending/Dashboard, storefront stock | **No** (PUT /api/orders → 403; `putOrders` in `pushCartWishlistToCloud.ts:76-87` is dead). Server→client overwrite only | **Critical** — order truth is per-browser; admin edits invisible to customers; customer orders invisible to admin unless in same browser |
| `currentUser` | Entire profile incl. loyaltyPoints, giftCardBalance, vouchers, tier, savedPaymentMethods (last4), slayTicketBalance | sync, checkout, load-card, membership, payment, etc. | everywhere | Partially (non-privileged fields via PATCH; privileged silently dropped) | High — UI shows balances server never has |
| `registeredUsers` | Local "user DB" (legacy auth, referral owner lookup, admin client list incl. mock clients) | sign-in, checkout referral credit, admin clients | checkout referral validation, admin clients | No | High — referral credits/lookup only work in-browser; mock clients persisted here |
| `lastOrderNumber`, `orderConfirmations`, `pendingOrder_<provider>` | Order number counter & confirmation codes | checkout `:2984-2999, 3042-3069` | checkout/confirm | No | High — every browser starts at #001 → duplicate order numbers across customers |
| `lastKnownTier_<email>` | Spend tier | membership `:873` | `getEffectiveTierName` (`adminAuth.ts:446-450`) | No | Medium — tier affects checkout pricing |
| `adminTierOverride`, `adminSubscriptionOverride` | Founder test overrides | membership page | adminAuth, syncFromApi `:120-131` | No | Low (founder only) but masks real tier |
| `adminInventoryOverride` | Manual inventory counts | `admin/revenue/edit-inventory/page.tsx:21` | `getDepletedInventory` | No | **Critical** — admin's edits never reach shoppers |
| `unitStockNotifyWaitlist_v1` | Back-in-stock waitlist | shopper PDP modal | `unitStockNotify.ts` | No (email send needs admin) | High — waitlist lost |
| `wishlistItems` | Wishlist | many | many | Yes (`/api/wishlist`) | Low |
| `userLists`, `userLists_<email>` | Named wishlist lists | AddToListModal, wishlistListShare | wishlist lists page, stock alerts | No | Medium |
| `wishlistSharedListsByToken` | Shared list registry | `wishlistListShare.ts:34` | `wishlist/shared/page.tsx` | No | High — share links broken for recipients |
| `cartItems`, `cartCount`, `serverCartVersion` | Cart | many | many | Yes (`/api/cart`, versioned) | Low |
| `savedForLater` | Saved-for-later lines (BAW configs) | shopping bag | shopping bag | No | Medium |
| `editingCartItem`, `selected*`, `edit*`, `customize*`, `lastAddedConfiguration` | In-progress BAW build state | BAW pages | BAW pages | No | Low (ephemeral) but no "saved builds" |
| `subscriptionUpgrade`, `isSubscriptionUpgrade`, `membershipShowPremiumView` | Pending membership upgrade cart line | membership `:1104`, hook | checkout `:909` | No (Stripe is SoT after pay) | Low |
| `specialOfferAdminConfig`, `specialOffer` | Special offer config | admin special-offer, dashboard seed (`dashboard/page.tsx:1085`) | concierge `:1394` | Yes via `app_config` (cache) | Low; dashboard seeds a default locally |
| `slayChallengeTier1Progress`, `…Tier2Progress`, `…Tier1Reward`, `…Tier2Reward`, `…CurrentTierIndex`, `…SelectedCycle`, `…ProgressCycle`, `slayChallengeAdminStage` | Slay Challenge progress/reward choice | concierge `:1328-1353` | concierge | No; **not user-scoped** | High — progress lost cross-device and bleeds between accounts on one browser |
| `referralEarnings`, `referralEarnings_<email>`, `referralNewActivity_*`, `referralLastSeenCount_*`, `referralCodeUsedCredentials`, `userReferralCode_*` | Referral ledger/flags | checkout `:6978-6998` | referrals page, admin | No (`referral_earnings` table unused) | High — money-like credit |
| `affiliateSubmittedContent_<email>`, `userAffiliatePhotos_/Videos_/Socials_/Tags_/Reviews_`, `affiliateSeen_` | Affiliate content | affiliate page | affiliate page, membership points | Partly (profile JSON + pending table) | Medium |
| `adminPendingMockAffiliate_v1`, `adminPendingMockReviews_v1` | Local pending queues | **customer** affiliate page `:1529` / review modal `:192` | admin pending page | No (dual-written alongside API) | Medium — local queue items only visible in same browser |
| `signedOrderFormsByEmail`, `lastOrderAuthorizationFormDraft*` | Signed forms | order form, admin | orders, admin pending | Partly (profile JSON + pending table) | Medium |
| `userSubmittedReviews_<email>`, `reviewSubmitted_*`, `accountReviewsSupplementalOverlay_v1_*` | Reviews mirror | reviews pages | reviews | Partly | Medium |
| `notifications_<email>`, `alertsPageViewed_*`, `acc_*`, `settingsAlert_*`, `shippingAddressAlert_*`, `cardSeen_*`, `orderStatusSeen_*`, `conciergeOrderSeen_*` | Account alerts + read state | many | notifications page, account | Server items merged in (`account/notifications/page.tsx:573`), read state no | Medium |
| `savedCards_<email>` / `currentUser.savedPaymentMethods` | Card brand/last4/expiry | payment page `:248-276` | payment, checkout | No (separate from Stripe PM) | Medium — duplicate of `stripe_default_payment_method_id` concept |
| `adminBrandPromoCodes`, `adminBrandGeneratedDiscountOrders` | Admin-created promo / gift barcodes + ledger | admin brand (`src/utils/adminBrandCodes.ts:22-47,111-127`) | **checkout + load-card on shopper browsers** | No | **Critical** — admin codes don't exist on customers' browsers; gift-card loading uses local codes |
| `adminPriorityMessagesByClient`, `adminBrandContactInquiries`, `adminBrandFaqQuestions`, `brandJobApplications_v1` | Admin inbox caches / FAQ / jobs | admin + brand pages | admin | Messages & inquiries yes (tables); FAQ & jobs **no** | Medium |
| `adminMeetingsScheduled` | Admin-created meetings | `adminMeetingsMock.ts:554-566` | meetings hub, dashboard | No (API exists for meetings) | Medium |
| `adminOrderIssuesByClient`, `admin_accounting_receipts`, `adminMembershipPayments` | Order issues, receipts (dataURL images), membership cache | admin pages | admin | No / cache | Medium (receipts as data URLs can exceed quota) |
| `deletedUsers`, `blockedCredentials` | Deleted/blocked clients | admin clients | admin clients, sign-in | Partly (`deleted_accounts`) | Medium — "block client" is browser-local |
| `loungeContentUnlocks_*`, `lounge_season_progress_v1`, `lounge_care_progress_v1`, `loungeTvWatchProgress` | Lounge caches | lounge | lounge | Yes (entitlement/completion tables) | Low; keys not user-scoped |
| `pendingProfilePatch_v1` | Retry queue for profile PATCH | `profileSyncQueue` | same | Yes (eventually) | Low |

### 3.1 Verification: admin revenue/inventory reflect only the admin's browser — **CONFIRMED**
- `src/utils/adminRevenueStats.ts:1-4` (doc comment): "Orders are read from localStorage userOrders_*".
- `buildRevenueOrdersList()` `:130-149` loops `localStorage.key(i)` for `userOrders_` prefixes. Admin browser only contains: the admin's own orders, any customer orders synced while that customer signed in on this browser, seeded test orders (`mockSignedOrderFormForApproval.ts` pending-test orders), and admin-made edits.
- `getDepletedInventory()` `:204-260`: override from local `adminInventoryOverride` else `STARTING_INVENTORY` (hardcoded 10 per wig SKU, packaging counts, 500 gift-card slots) minus those orders. Server stub orders (`productName: 'STRIPE CHECKOUT'`) would not even map to a SKU.
- Consumers: `src/pages/admin/revenue/page.tsx:586,768`, `revenue/accounting-report/page.tsx:56-61`, `revenue/edit-inventory/page.tsx:11-21`, `revenue/fulfilled-orders`, `revenue/fraud-analysis`, `src/utils/adminAccountingSpreadsheet.ts:217,234`, admin dashboard (`dashboard/page.tsx:20`), **and shopper-facing** `src/utils/productInventoryAvailability.ts:58-74` → `src/pages/units/*`, `src/pages/wavy/*`, `CartDropdown`, `WigStockPrice`, `shopping-bag`, `wishlistStockAlerts`.
- Mixed sources on one page: Revenue overview totals come from `GET /api/admin/revenue` (server JSON stubs, `revenue/page.tsx:1013`) while product/inventory/fulfillment tabs use local orders — two different revenue universes on the same screen.

---

## 4. MOCK / SEED / HARDCODED DATA presented as live

| file:line | What | Shown to | Risk |
|---|---|---|---|
| `src/pages/admin/clients/page.tsx:330-360` + `:909-923` | 17 mock clients (mock1..17@test.com) with fake spend/orders merged into client list and **persisted into `registeredUsers`** | Founder (`isAyoteenzAdminAccount`) | High — real admin sees fake clients/tier counts |
| `src/pages/admin/clients/page.tsx:942-951` | Same merge inside the API-success branch with **no founder check** | Any admin email | High |
| `src/pages/admin/clients/page.tsx:436-…, 1137-1180` | `getMockOrdersForClient` generates orders, tracking numbers (`9405…`), discount codes, gift cards for mock clients | Any admin viewing mock client | Medium |
| `src/pages/admin/dashboard/page.tsx:347-357` | Mock clients merged into dashboard client list (tier counts) | Founder | High |
| `src/pages/admin/dashboard/page.tsx:405-410` (+ `:134-263`) | On any API exception, entire dashboard silently replaced by `buildMockDashboardData()` | Any admin | High — outage looks like healthy business |
| `src/pages/admin/dashboard/page.tsx:741-751` | `generateMockMeetingsForRange` merged into "completed meetings" KPI | Any admin | High |
| `src/pages/admin/meetings/AdminMeetingsHub.tsx:891-919` | Deterministic mock meetings + founder demo consult meetings (#331/#340/#341) merged with API meetings | Any admin (demos: any admin email) | High |
| `src/pages/admin/revenue/page.tsx:1396-1421` | QUARTERLY Q1 $89K / Q2 $95K / Q3 $112K; PROFIT MARGIN 35%, CASH FLOW POSITIVE, DEBT RATIO LOW, INVESTMENT RETURN 18% | Any admin | High — fabricated financials |
| `src/pages/admin/revenue/page.tsx:1593-1598` | Payment method mix 68/22/8/2% (labelled "PLACEHOLDER") | Any admin | Medium |
| `src/pages/admin/revenue/page.tsx:1386-1390` | Fallback "LAST MONTH $0" when breakdown empty | Any admin | Low |
| `src/utils/adminRevenueStats.ts:150-170` | 4 fake orders on parse error | Any admin + storefront stock | Medium |
| `src/utils/adminRevenueStats.ts:38-60` | `STARTING_INVENTORY` hardcoded (10/SKU, packaging counts) | Admin + shoppers | High |
| `src/pages/admin/pending/page.tsx:780` → `src/utils/mockSignedOrderFormForApproval.ts:362-…` | Seeds fake users (`pending.forms.test.alpha/beta@preview.local`) + pending order forms + orders into localStorage, **ungated** (runs for any admin in production) | Any admin | Medium |
| `src/utils/adminAuth.ts:417-500` (`isMockDataAccount`, `isMockProfileChromeActive`, `BAW_FOUNDER_SEED_MOCK_ORDER_IDS`) | Founder sees seeded orders (`test-order-1..5`, `kateena-1..3`, …) on Orders (`src/pages/orders/page.tsx:437-1110`), mock tier bar/points (membership `:737-752`), mock reviews (`account/reviews/page.tsx:42-127,261`), mock affiliate rows | Founder only (toggle "VIEW AS CLIENT") | Medium — founder's own account numbers are not trustworthy for QA |
| `src/pages/orders/page.tsx:437-460` | `buildFounderDemoConsultOrder331` injected for founder admin | Founder | Low |
| `src/utils/shoppingBagMockCart.ts:98-177`, `src/App.tsx:1063` | Mock cart seeded for guests | Dev/preview always; production only with `?shoppingBagMock=1` | Low |
| `src/utils/adminGlobeMockPresence.ts:372-430` | Mock globe visitors/orders | Opt-in flag only | Low |
| `api/_lib/recordProductOrderFromPaymentIntent.ts:63-66` | Server order uses placeholder `productName 'STRIPE CHECKOUT'`, `productImage '/assets/natural front.png'`, `items: 1` | All customers & admin | High — the only server order record is placeholder content |
| `api/client/submissions.ts:214` | `verified_purchase: true` for every review | Public reviews | High — false "verified" badge |
| `api/client/submissions.ts:233` | Review thumbnail always `/assets/natural front.png` | Customer | Low |
| `api/_lib/pendingQueueHandlers.ts:140` | Affiliate approval defaults `points: 100` | Customer | Medium |
| `supabase/migrations/20250314000000_create_profile_on_signup.sql:39` | Welcome `gift_card_balance = 10` — superseded by later `handle_new_user` in `full_app_sync` (inserts id/email only); client sends 10 (`syncFromApi.ts:624`) but it's stripped | All | Medium — UI shows $10 that DB doesn't hold |
| `src/pages/account/affiliate/page.tsx:371-382` | Legacy mock delivered orders "Mock: earned 400 pts" | Founder (mock account) | Low |

---

## 5. DUPLICATE / OBSOLETE / CONFLICTING

**Duplicate concepts**
- Reviews: `reviews` table vs `profiles.user_submitted_reviews` vs `review_supplemental_overlay` vs `pending_review_supplemental` vs localStorage `userSubmittedReviews_*` + `adminPendingMockReviews_v1`.
- Signed order forms: `pending_order_forms.payload` vs `profiles.signed_order_forms` vs `signedOrderFormsByEmail` localStorage.
- Affiliate content: `pending_affiliate_submissions` vs `profiles.affiliate_submitted_content` vs `affiliateSubmittedContent_<email>` + `adminPendingMockAffiliate_v1`.
- Slay tickets: `profiles.slay_ticket_balance` vs `slay_ticket_transactions` sum (no reconciliation).
- Payment methods: `profiles.stripe_default_payment_method_id` vs `currentUser.savedPaymentMethods/defaultPaymentMethod` vs `savedCards_<email>`.
- Order status for forms: `orders[].status 'AWAITING FORM'` (counted by `api/admin/pending.ts:40`, `dashboard.ts:72`) vs `pending_order_forms.status`.
- Tier: `profiles.current_tier_name` (never written) vs `lastKnownTier_*` vs computed spend.
- Meetings: `meetings` table vs `adminMeetingsScheduled` localStorage vs generated mocks.
- Admin allowlist duplicated in 3 places (`api/_lib/adminAuth.ts:9-13`, `api/admin/sync-profile.ts:11-15`, `src/utils/adminAuth.ts`).
- `user_activity` created twice (`003_user_activity.sql`, `20260327210000_user_activity.sql`) with different policy/index names → both sets can coexist.
- `handle_new_user()` defined twice with different bodies (`20250314000000` copies metadata + $10; `20260325120000_full_app_sync.sql:126-147` inserts only id/email) — the later one wins on a fresh apply, losing signup metadata in the trigger.

**Conflicting migrations**
- `profiles.loyalty_points`: `integer` (`001:27`, `20260326180000:26`) vs `numeric NOT NULL` (`20260325120000:36`). `gift_card_balance` nullable vs NOT NULL. `profiles.email` NOT NULL (001) vs nullable (full_app_sync).
- `orders.email NOT NULL` exists only in 001; webhook insert omits email (`recordProductOrderFromPaymentIntent.ts:109-114`) → **first-order insert fails if 001 was applied**.
- Policy-name drift: 001 policies ("Users can insert own orders", "Users can update own orders", "Users can insert/update own notifications", "Users can update/delete own meetings", "Users can insert own reviews") are not dropped by later hardening (`20260604…:61-63` drops only `orders_insert_own/update_own`).
- Security guard INSERT branch (`20260604…:13-26`, `20260620…:80-95`) normalizes membership/role but **keeps client-supplied `loyalty_points`, `gift_card_balance`, `voucher_list`, `has_made_first_purchase`, `slay_ticket_balance`** on INSERT (only coalesces nulls) — a direct PostgREST insert (e.g. after profile deletion) could seed balances.
- Hair-analysis comparison counts: app `1|4` vs SQL `1|3|6`.

**Written but never read / read but never written**
- Never written (server): `referral_earnings` (read by `api/admin/referrals.ts`), `profiles.loyalty_points`, `current_tier_name`, `voucher_list`, `voucher_history`, `unlocked_discounts`, `digital_cash_history`, `welcome_discount_tiers_credited_by_period`, `gift_card_balance` (except via 20250314 trigger if active), order status `'AWAITING FORM'`.
- Never consumed meaningfully: `orders[].stripeCurrency/paymentProvider` (stub), `user_collectibles.source_type 'slay-challenge'|'reward'|'promotion'` values, `meetings.metadata` mostly, `profiles.role` (for authz).
- Dead client code: `putOrders()` (`src/utils/api.ts:680-695`) called from `pushCartWishlistToCloud.ts:87` always 403.
- Stale docs: `docs/ADMIN_DASH_VS_SUPABASE.md` (says no deleted_accounts / analytics tables), `docs/SUPABASE_SCHEMA_SYNC.md` ("authenticated users can read/write … orders"), `docs/CROSS_BROWSER_SYNC.md` ("profile data stored in localStorage per browser"), `docs/BACKEND_SYNC_REQUIREMENTS.md:13` ("Orders … localStorage. No server record") — the last is, in practice, still accurate.

---

## 6. ORDER DATA — end to end

**Creation**
1. Client prices cart; Stripe path: `POST /api/stripe/create-product-payment-intent` resolves server quote from lines (`api/stripe/create-product-payment-intent.ts:107-125`) and stores only totals + `line_count` + hair-analysis grants in PI metadata (`:176-190`) — **line items are not persisted server-side**.
2. On client success, `persistUserOrderAfterCheckoutAfterCartSaved` builds the real order (`checkout/page.tsx:2706-2845`): id `order-${lastOrderNumber+1}` from **per-browser counter** (`:2984`), random 6-char confirmation (`:2986-2999`), status `PLACED` (digital/booking) or `PREPARING` (physical), `lineItems`, gift card applied, booking/consult metadata → `localStorage userOrders_<email>`; also local account alert, `hasMadeFirstPurchase` local, slay-ticket credit call (`:2878-2898`).
3. `pushLocalUserOrdersAfterCheckout` only PATCHes `hasMadeFirstPurchase` (stripped) and re-syncs profile (`src/utils/checkoutOrderServerSync.ts:8-25`).
4. Stripe webhook `payment_intent.succeeded` → `appendOrderFromProductPaymentIntent` appends stub order with status `PAID` (`api/stripe/webhook.ts:266-276`, `recordProductOrderFromPaymentIntent.ts:59-104`), fires order_confirmed/payment_received/points_earned emails (points email shows a balance the DB never accumulates, `:20-28`).
5. Redirect providers (PayPal etc.) store `pendingOrder_<provider>` locally (`checkout/page.tsx:3042`); no server order at all.

**Storage**: `orders` JSON (stub) + `localStorage userOrders_<email>` (rich) — divergent; the next `syncOrdersFromApi` replaces local with stub.

**Status values observed**
- Server writes: `PAID` (webhook), `CONFIRMED` (from `PLACED` on form approval), `CANCELED` (form decline) (`pendingQueueHandlers.ts:218-252`).
- Client/admin writes/reads: `PLACED`, `PREPARING`, `CONFIRMED`, `SHIPPED_TO_HUB`, `IN_TRANSIT`, `PROCESSING`, `CUSTOMIZING`, `FINALIZING`, `SHIPPED`, `DELIVERED`, `COMPLETE`, `CANCELED`/`CANCELLED`, plus admin/mock `AWAITING FORM`, `IN PROGRESS`, `UNFULFILLED`, `COMPLETED` (`src/utils/orderTracking.ts:172-224`, `adminRevenueStats.ts:155-160`). No enum/check constraint anywhere. `PAID` is not in `statusMap` → renders as stage 0.

**Tracking fields** (JSON only): `trackingNumber`, `trackingCarrier`, `trackingTimelineShiftDays`, `adminTrackingStageOverride`, `trackingStageNotes`, `trackingStage`, `deliveredAt`, `canceledAt` (`orderTracking.ts:54-66`). Written only by admin UI into admin localStorage (`admin/revenue/page.tsx:704-717`); a shipping email is sent (`:731-740`) so the customer gets a tracking email but their account page never shows it.

**Who can update**: Server: webhook + pending-queue handlers (service role). Clients: none via API; possibly via PostgREST if 001 policies are live. Admin: no API — local only.

**Time-computed on client**: Yes.
- Consult orders: `PLACED`→`PROCESSING` after 2h, `COMPLETE` after 72h (`src/utils/consultOrderLifecycle.ts:1-10`, `src/utils/digitalOrderFulfillment.ts:33-60`).
- Physical orders: progress bar/next-stage ETA from `order.date` + `processingTime` ("6-8 WEEKS") + `trackingTimelineShiftDays` (`src/pages/account/concierge/page.tsx:2324-2330, 2407, 4432`).
- 24-hour cancel window computed from `placedAt` (`src/pages/orders/page.tsx:575-583`).
- Tier/points spend from `order.date` parsed as `M-D-YYYY` (`membership/page.tsx:448-466`) — server stub `date` is ISO, so server-recorded orders don't count toward spend.

**Conclusion**: There is no server-side source of truth for order content, status, tracking, or cancellation. Payment existence (Stripe PI) is the only authoritative fact.

---

## 7. PROPOSED ADDITIVE SCHEMA REPAIRS (descriptive only; no SQL written to repo)

Principles: additive tables, keep existing JSON columns as read-compat mirrors during migration, RLS select-own + service-role writes, every mutation through an API that also writes `audit_log`. Don't duplicate working tables (`membership_payments`, `slay_ticket_transactions`, entitlements, `consult_quotes`, `priority_messages`, `pending_*`, `app_config`, `site_analytics_events` stay).

1. **`customer_orders`** (+ **`customer_order_items`**) — *needed for: Orders, Concierge tracking, Account overview, Admin Clients/Revenue/Pending/Dashboard, storefront inventory, Care entitlements, PSA order tools.*
   `customer_orders`: id uuid PK, user_id FK, order_number (server sequence, unique), confirmation_code, status (check enum), fulfillment_type (physical/digital/booking/consult), subtotal/discount/tax/shipping/total_cents, currency, stripe_payment_intent_id UNIQUE, payment_provider, shipping_address jsonb snapshot, requires_order_form bool, order_form_status, placed_at, canceled_at, delivered_at, legacy_json_id text (to map `order-N`/`order-pi-…`), metadata jsonb.
   `customer_order_items`: id, order_id FK, line_no, sku/product_name, product_type, quantity, unit_price_cents, configuration_snapshot jsonb (BAW options), image_url.
   Create at PI creation (status `pending_payment`) with the server quote lines; webhook flips to `paid`. Keeps `orders` JSON as a projection until UI migrates.
2. **`order_status_events`** (history + tracking) — *needed for: Concierge/Orders timeline, admin tracking editor, emails, audit.* id, order_id FK, from_status, to_status, stage_index, tracking_number, carrier, note (client-visible), internal_note, actor_id, actor_type (admin/system/webhook), notify_client bool, created_at. Plus `customer_orders.current_tracking_number/carrier` denormalized. Replaces admin-localStorage `patchOrderInUserOrders`.
3. **`order_refunds`** (small) — *needed for: admin Cancel Order ("cancelled and refunded"), order-form decline.* id, order_id, stripe_refund_id, amount_cents, reason, actor_id, status, created_at.
4. **`loyalty_ledger`** (points) + **`wallet_ledger`** (digital cash/gift card) + **`customer_vouchers`** — *needed for: Membership/Rewards page, Checkout (points/vouchers/gift card), Load Card, Referrals, Affiliate, admin rewards-notify.*
   `loyalty_ledger`: id, user_id, delta int, reason (purchase/affiliate_content/social_tag/review/referral/adjustment/expiry/reversal), source_type, source_id (order/submission id, unique per reason+source for idempotency), period_key ("2026-H2"), actor_id, created_at. Balance = sum (keep `profiles.loyalty_points` as trigger-maintained cache).
   `wallet_ledger`: same shape for USD cents (gift card load, referral $20, checkout redemption, refund). `gift_card_codes` (code hash, value_cents, status, redeemed_by, redeemed_at) replaces `adminBrandPromoCodes` gift barcodes; `promo_codes` (code, type percent/amount, limits, active window, created_by) replaces local admin promo codes.
   `customer_vouchers`: id, user_id, voucher_type (birthday/welcome/tier/service COLOR/HAIRLINE/STYLING), value, status (available/used/expired), issued_reason, expires_at, used_order_id. Replaces `voucher_list/voucher_history/unlocked_discounts` blobs.
   Spend tier: server view/materialized `customer_tier_periods` (user_id, period_key, spend_cents, tier) computed from `customer_orders`; writes `profiles.current_tier_name`.
5. **`membership_events`** — *needed for: Membership page history, admin membership/payments, churn reporting.* id, user_id, stripe_event_id UNIQUE, event_type (activated/renewed/upgraded/downgraded/cancel_scheduled/canceled/payment_failed/reactivated), from_tier, to_tier, period_end, raw jsonb, created_at. Written by webhook beside existing profile updates (keeps `membership_payments` as invoice ledger).
6. **`admin_users` / `admin_roles`** + enrich **`audit_log`** — *needed for: every admin page, audit page.* `admin_roles(user_id PK, role enum founder/admin/staff, scopes text[], created_by)` to replace 3 hardcoded allowlists. Add `before`/`after` jsonb (or `diff`) and `ip`, `user_agent` columns to `audit_log`; log order, ledger, refund, promo, inventory, membership changes.
7. **`support_requests`** (+ `support_messages`) — *needed for: Concierge/contact, admin Messages/Alerts.* Unify `brand_contact_inquiries`, FAQ questions (`adminBrandFaqQuestions`), job applications (`brandJobApplications_v1`), order issues (`adminOrderIssuesByClient`) as typed rows: id, user_id nullable, email, kind (contact/faq/job/order_issue/priority), order_id FK nullable, status (new/open/waiting/resolved/archived), priority, assigned_to, body, attachments jsonb, timestamps. Keep `priority_messages` (or view over this table).
8. **`saved_configurations`** — *needed for: Build-A-Wig "save my build", Saved for Later, wishlist lists, PSA BAW drafts, shared lists.* id, user_id, name, base_unit/sku, configuration jsonb (normalized option keys), price_snapshot_cents, preview_image_url, source (baw/cart/psa), created_at, updated_at. Plus `wishlist_lists` (id, user_id, name, share_token UNIQUE, is_public, updated_at) and `wishlist_list_items` (list_id, saved_configuration_id or sku, added_at) to replace `userLists*` and `wishlistSharedListsByToken`.
9. **`hairstyle_analysis_results`** — *needed for: Hair analysis page / PSA "Find my best looks" history / consult deliverables.* id, user_id, tier, comparison_count, consume_source (monthly/paid/admin), stripe_payment_intent_id nullable, input_photo_url, inspo_url, result_image_url (copied into Supabase storage, not just fal CDN), manifest jsonb (top match + looks), prompt, status (succeeded/failed/refunded), created_at. Also fix SQL count whitelist to match app tiers (1|4).
10. **`content_submissions`** (Slay Cam / affiliate / review media as rows) — *needed for: Affiliate page, Reviews supplemental, admin Pending, loyalty_ledger source.* id, user_id, kind (photo/video/social_link/review_media/slay_cam), order_id FK nullable, review_id FK nullable, media_url / link, platform, status, decline_reason, points_awarded, reviewed_by, reviewed_at. `pending_affiliate_submissions`/`pending_review_supplemental` can become views/filters on this; approval writes `loyalty_ledger`. Retire `affiliate_submitted_content` / `review_supplemental_overlay` writes from clients.
11. **`customer_notifications`** (row per notification) — *needed for: Account → Alerts, notification badges, order tracking notes, consult quote alerts, meeting alerts.* id, user_id, type, title, body, action_route, related_order_id, read_at, created_at, created_by. Keep `notifications.items` as legacy read until migrated; read state moves server-side.
12. **`customer_preferences`** — *needed for: Settings, Orders page animation toggle, currency, newsletter.* user_id PK, currency, locale, ordersPageAnimations, marketing channels jsonb, updated_at (or extend existing `notification_*` columns into a single jsonb). Low priority.
13. **`slay_challenge_progress`** — *needed for: Concierge Slay Challenge, collectibles.* user_id, cycle_key, tier_index, tasks jsonb (purchase/review/socialTag…), reward_choice, completed_at; completion writes `user_collectibles(source_type='slay-challenge')` and/or `loyalty_ledger`.
14. **`inventory_items`** + **`inventory_movements`** + **`stock_waitlist`** — *needed for: Admin Revenue → Products/Inventory/Edit Inventory, storefront sold-out, back-in-stock emails.* `inventory_items(sku PK, kind unit/packaging/gift_card, on_hand int, low_threshold)`, `inventory_movements(id, sku, delta, reason sale/restock/adjust/cancel, order_id, actor_id, created_at)`, `stock_waitlist(id, email, user_id, sku, created_at, notified_at)`. Public read endpoint for stock status.
15. **`referral_events`** (or start writing existing `referral_earnings`) — *needed for: Referrals page, checkout referral validation, admin Referrals.* Reuse `referral_earnings` (add `referrer_user_id`, `referred_user_id`, `order_id uuid FK`) and validate codes server-side via `profiles.referral_code` unique index; credit via `wallet_ledger`.

Also (non-table) repairs: drop/rename legacy 001 policies on `orders`, `notifications`, `reviews`, `meetings`; tighten guard trigger INSERT branch to zero balances; add `WITH CHECK (status = 'pending')` on review inserts; remove `verified_purchase: true` default unless an order match exists; make `api/client/submissions.ts` stop accepting whole-blob overwrites; gate/remove mock merges in admin pages; replace hardcoded revenue cards with server aggregates.
