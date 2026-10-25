# 14 — Supabase and Data Dependency Audit

Sources: 82 migrations, `api/**`, `src/utils/**`, docs, plus read-only live catalog and aggregate checks (doc 02 §5). Full table inventory, localStorage key table and mock-data table: `appendix/E_data.md`.

## 1. What the server owns today (and owns well)

| Domain | Tables | Status |
|---|---|---|
| Identity and profile | `profiles` (identity, contact, socials, 3 notification prefs) | Authoritative; guarded privileged columns |
| Membership billing | `profiles` Stripe mirror, `membership_payments`, `membership_payment_failures` | Authoritative (Stripe webhook) |
| Cart / wishlist items | `cart` (versioned), `wishlist` | Synced |
| Slay Tickets | `slay_ticket_transactions` + `profiles.slay_ticket_balance` | A real ledger (but see C1) |
| Content entitlements | `psa_episode_entitlements`, `care_purchase_entitlements`, `season_pass_entitlements`, `lounge_content_unlocks` | Authoritative |
| Education collectibles | `collectible_definitions`, `education_certifications`, `user_collectibles` | Authoritative (education source only) |
| Hair analysis usage | `hairstyle_analysis_usage`, `hairstyle_analysis_purchase_grants` | Authoritative counters (but see C2 and BW-08) |
| Consult offers | `consult_quotes` | Authoritative |
| Messages / inquiries | `priority_messages`, `brand_contact_inquiries` | Authoritative |
| Approval queues | `pending_order_forms`, `pending_affiliate_submissions`, `pending_review_supplemental`, `reviews` | Authoritative |
| Config | `app_config` | Authoritative |
| Audit / analytics / deletion | `audit_log`, `site_analytics_events`, `user_activity`, `deleted_accounts` | Authoritative |

## 2. What the server does **not** own (and where the UI gets it instead)

| Business record | Where it really lives | Who is affected |
|---|---|---|
| **Orders** (content, line items, BAW spec, status, tracking, number) | The checkout browser's `localStorage userOrders_<email>`. The server keeps one row per user with a JSON array that holds only a webhook **stub** (live: **0 rows**) | Customer orders and concierge; all admin order, revenue, inventory and fraud views |
| Order status beyond PAID / CONFIRMED / CANCELED | Computed client-side from timestamps; admin edits in the admin's localStorage | Customer tracking; admin fulfilment |
| Loyalty points | Computed in the browser (3 different formulas). `profiles.loyalty_points` frozen and never written (live: 0 non-zero) | Rewards, checkout, desktop dashboard, admin |
| Vouchers, digital cash, gift-card codes, promo codes | localStorage (customer) and `adminBrandPromoCodes` (admin's browser) | Load card, checkout, rewards |
| Spend tier SILVER/RED/BLACK | `lastKnownTier_*` localStorage (live: 0 BLACK) | Gates, pricing, server PSA/analysis eligibility |
| Referral credit | Buyer's localStorage; `referral_earnings` never written (live: 0) | Referrals, admin referrals |
| Slay Challenge progress | **Global** localStorage keys (not even per user) | Concierge |
| Saved addresses | localStorage (API supports `saved_addresses`, but the client never sends it) | Settings, checkout |
| Payment methods | localStorage last-4 | Payment page |
| Wishlist named lists and share tokens | localStorage | Lists, shared links |
| Inventory and waitlist | Hardcoded `STARTING_INVENTORY` minus local orders; `adminInventoryOverride`; `unitStockNotifyWaitlist_v1` | Storefront sold-out; admin inventory |
| Saved BAW builds | Global `selected*` keys; nothing named or saved | BAW, account |
| Hair analysis results | React state only (and temporary Fal CDN URLs) | Hair analysis, PSA |
| Alerts read state | localStorage | Alerts |
| FAQ questions (admin side), job applications, accounting receipts, admin meetings scheduled locally | localStorage | Admin |

## 3. JSON-blob anti-patterns (risk-ranked)

1. **`orders.active_orders` / `past_orders`.** No order primary key, no line-item rows and no status history. The webhook and approval handler do read-modify-write with lost-update races, admin aggregates must scan every user, and the legacy client write policies are live (doc 13 H3).
2. **Customer-editable business JSON on `profiles`:** `affiliate_submitted_content` (approval and points), `user_submitted_reviews` (moderation status), `signed_order_forms` (`adminApproved`), `review_supplemental_overlay`. These duplicate the server queues and can be forged by the customer.
3. **Wallet columns with no writer:** `voucher_list/history`, `digital_cash_history`, `unlocked_discounts`, `gift_card_balance`.
4. **`notifications.items`.** One row per user and an array with no per-item read state. Clients can insert into it (live policy).

## 4. Mock / hardcoded data presented as live (top items)

| Where | What | Who sees it |
|---|---|---|
| `admin/clients/page.tsx:909-951` | 17–20 mock clients merged into the live list and **persisted to `registeredUsers`**. One branch is not founder-gated. | Founder / any admin |
| `admin/dashboard/page.tsx:405-446` | A full mock dashboard on any API error, shown silently | Any admin |
| `AdminMeetingsHub.tsx:891-919` | Deterministic mock meetings merged | Every admin |
| `admin/revenue/page.tsx:1396-1421` | Q1 $89K / Q2 $95K / Q3 $112K, margin 35%, ROI 18% | Every admin |
| `api/admin/brand.ts:26-31` | Retention 94%, repeat 78%, growth +15% returned **by the server** | Every admin |
| `utils/adminHeaderNotificationsData.ts` | All admin alerts | Every admin |
| `admin/pending/page.tsx:779-781` | Seeded test order forms | Every admin |
| `admin/reviews/page.tsx:76-160` | Mock reviews when the API is empty | Every admin |
| `pages/slay-cam/page.tsx:75-214` | Fabricated posts, names and stats (public) | **Every visitor** |
| Founder account (`isMockDataAccount`) | Seeded orders, vouchers, cash history, reviews, affiliate rows | Founder (so founder QA sees fake data) |
| `concierge/page.tsx:385-530` | Slay Quests progress | Every eligible customer |

## 5. Conflicts and drift

- **Live policy drift:** 001 policies are still active on `orders`, `meetings`, `notifications` and `reviews` (live-confirmed).
- **Live RLS drift:** `psa_tool_events` has RLS enabled live but not in the repo.
- **Grant drift:** `REVOKE … FROM PUBLIC` does not remove Supabase's `anon` / `authenticated` grants (C2).
- **Function/app mismatch:** hair-analysis counts are `1|4` in the app and `1|3|6` in SQL (live-confirmed).
- `handle_new_user()` is defined twice; the later definition drops signup metadata and the $10 welcome balance the UI still shows.
- `user_activity` is created twice.
- `loyalty_points` is `integer` live but `numeric` in `full_app_sync`.
- `orders.email NOT NULL` exists in 001; the webhook insert omits it. Live has 0 orders, so the first webhook order should be watched.
- **Stale docs:** `ADMIN_DASH_VS_SUPABASE.md`, `SUPABASE_SCHEMA_SYNC.md`, `CROSS_BROWSER_SYNC.md`, `CHECKOUT_SERVER_QUOTE.md` (claims BAW lines are unresolved), and CORE.md:15 (claims the founder toggles sync to Supabase).

## 6. Proposed additive schema repairs

These are descriptions only. **No SQL has been written to the repo and no migration has been applied.** Each item needs founder approval (FD-C2).

| # | Addition | Unblocks | Phase |
|---|---|---|---|
| S1 | `customer_orders` + `customer_order_items` (server order number, status enum, PI id unique, configuration snapshot) | Every order page, customer and admin; inventory; care entitlements; BW-01/02/06/19/21/22 | 1 |
| S2 | `order_status_events` (history + tracking + client-visible notes) | Order detail timelines; admin tracking; emails | 1 |
| S3 | `order_refunds` | Admin cancel/refund | 3 |
| S4 | `loyalty_ledger`, `wallet_ledger`, `customer_vouchers`, `gift_card_codes`, `promo_codes`; spend-tier view writing `current_tier_name` | Rewards, checkout, load card, referrals, affiliate, admin rewards | 4 |
| S5 | `membership_events` | Membership history; admin members tab | 4 |
| S6 | `admin_roles`; `before/after` on `audit_log` | All admin, audit | 3 |
| S7 | `support_requests` (+ messages) unifying contact, FAQ, order issues, priority | Inbox reply; MY REQUESTS | 6 |
| S8 | `saved_configurations`, `wishlist_lists` (+ items, share tokens) | MY HAIR › SAVED BUILDS; lists; shared lists | 5 |
| S9 | `hairstyle_analysis_results` (+ fix SQL counts to 1/4) | MY HAIR › ANALYSES; PSA picks; consult add-on | 5 / 0B |
| S10 | `content_submissions` (affiliate, review media, Slay Cam) + storage bucket | Approvals; affiliate points; Slay Cam | 5–6 |
| S11 | `customer_notifications` (row per item, read state) | Alerts | 2 |
| S12 | `customer_preferences` / `hair_profile` | Settings; MY HAIR profile | 2 / 5 |
| S13 | `slay_challenge_progress` | Slay Challenge | 4 |
| S14 | `inventory_items`, `inventory_movements`, `stock_waitlist` | Inventory, sold-out, waitlist | 3 |
| S15 | Start writing `referral_earnings` (add referrer/referred/order FKs) | Referrals | 6 |
| S0 | Non-table repairs: drop legacy policies; revoke anon RPC grants; zero balances on INSERT; reviews `WITH CHECK`; stop whole-blob overwrites in `client/submissions` | Security baseline | 0B |

**Do not duplicate:** `membership_payments`, `slay_ticket_transactions`, the entitlement tables, `consult_quotes`, `priority_messages`, `pending_*`, `app_config` and `site_analytics_events` already work and stay.
