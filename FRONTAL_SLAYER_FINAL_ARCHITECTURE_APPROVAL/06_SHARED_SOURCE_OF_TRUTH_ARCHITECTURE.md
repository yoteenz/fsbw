# 06 — Shared Source of Truth Architecture

**Design only. No schema is created in this sprint.** Table names are proposals (audit doc 14 S1–S15). Every new table needs migration approval (decision A1/A9) and a cross-project check against SITE00, which shares the Supabase project (doc 11 R-17).

## 1. Principles

1. **One record per business fact, on the server.** Customer and admin screens read the same row. Neither keeps its own copy.
2. **Money and value move only through append-only ledgers.** A balance is the sum of ledger entries, and any balance column is a cache maintained by the database, never written by a client.
3. **Every write that creates value or moves money happens on the server**, inside one transaction, with an idempotency key, and writes `audit_log`.
4. **Stripe is the authority for payment facts** (succeeded, refunded, subscription state). Our database is the authority for *what was bought* (order and items) and *what was granted* (ledgers, entitlements).
5. **Browser storage is allowed only for:** UI preferences (tab, currency display, animations), unsent drafts (an in-progress build, a half-typed review), and **read caches** of server data that are invalidated on sync and never pushed back as truth.
6. **Status is written by events, not computed from clocks.** Time-derived stages (today's concierge offsets) are removed. SLAs only *flag* delays.

## 2. Authority map

| Domain | Authoritative owner (target) | Today | Writers (target) | Readers | Transaction boundary |
|---|---|---|---|---|---|
| Customers / identity | Supabase Auth + `profiles` | ✅ same | Auth signup trigger; `PATCH /api/profile` (non-privileged); admin APIs | everyone | per request |
| Orders | `customer_orders` (new) | ❌ local `userOrders_*` + server stub | `POST /api/checkout/intent` creates `pending_payment`; Stripe webhook → `paid`; admin order API | customer orders, admin orders, Command Center, care entitlements, PSA tools | order + items + first status event in one transaction |
| Order items | `customer_order_items` (new) | ❌ local only | same as order | same | with order |
| Product configurations (BAW) | `customer_order_items.configuration_snapshot` (immutable once paid) and `saved_configurations` (drafts the customer names) | ❌ global localStorage keys | checkout (snapshot); My Hair (saved) | Orders, admin order detail, Atelier | with order / per save |
| Checkout sessions | Stripe PaymentIntent / Checkout Session; `customer_orders.stripe_payment_intent_id` UNIQUE | ⚠️ PI exists, no order link | `/api/checkout/intent` | webhook | Stripe idempotency key = order id |
| Payments | Stripe (truth) → `customer_orders.paid_at`, `membership_payments` (exists) | ✅ membership · ❌ products | webhook only | Finance | webhook event id (dedupe table) |
| Refunds | Stripe refund → `order_refunds` (new) | ❌ none (admin "refund" is fake) | admin order API (calls Stripe), webhook `charge.refunded` | Orders, Finance, customer order detail | refund row + status event + ledger reversals in one transaction |
| Fulfilment | `order_status_events` (new) + `customer_orders.status` | ❌ admin localStorage | admin order API; pending-queue form approval | customer detail, admin, emails | event + status in one transaction |
| Inventory | `inventory_items` + `inventory_movements` (new) | ❌ hardcoded 10 per SKU minus local orders | webhook (sale, −1), admin adjust, refund/cancel (+1) | storefront stock API, admin inventory | movement + on-hand in one transaction |
| Membership subscriptions | Stripe Subscription → `profiles` mirror + `membership_events` (new) | ✅ mirror (Stripe path) · ❌ in-app CONFIRM ORDER | webhook only | Rewards, gates (server), admin members | per webhook event |
| Entitlements | Existing entitlement tables (PSA, care, season pass, lounge unlocks) + benefit resolver over the membership mirror | ✅ mostly | server only | gates | per grant |
| Analysis credits | `hairstyle_analysis_usage` + `hairstyle_analysis_purchase_grants` (exist) | ⚠️ RPCs executable by anon (C2); count mismatch | webhook (purchase), generate API (consume/refund), admin grant | My Hair, admin credits tab | RPC (service role only) |
| Appointments | `meetings` (exists) | ⚠️ client-writable metadata (H1) | booking APIs (server-priced), admin meetings API | Orders › Appointments, admin Meetings | per request |
| Rewards transactions | `loyalty_ledger`, `wallet_ledger`, `customer_vouchers` (new) | ❌ client-computed | server only (doc 08) | Rewards, checkout, admin | ledger entry + source event |
| Points | `loyalty_ledger` (sum) | ❌ | — | — | — |
| Vouchers | `customer_vouchers` | ❌ wiped locally | — | — | — |
| Digital cash | `wallet_ledger` (sum) | ❌ | — | — | — |
| Slay Challenge progress | `slay_challenge_progress` (new) | ❌ global localStorage | server event handlers | Rewards tab, admin | per qualifying event |
| Affiliate submissions | `content_submissions` (new; `pending_affiliate_submissions` becomes a view or is migrated) | ⚠️ queue real; profile JSON forgeable | submission API, admin approvals | Affiliate, Reviews & Content, Approvals | approval + ledger entry in one transaction |
| Referral qualifications | `referral_earnings` (exists, unused) + `wallet_ledger` | ❌ buyer's localStorage | webhook (on qualifying status), refund (reversal) | Referrals, admin | qualify + credit in one transaction |
| Reviews | `reviews` (exists) | ⚠️ client can insert published; JSON mirror | submission API only; admin moderation | customer, admin, public reviews | per request |
| Customer notifications | `customer_notifications` (new, row per item) | ⚠️ JSON array + local read state | server events, admin send | Alerts, overview | per event |
| Administrative actions | `audit_log` (exists) + `admin_roles` (new) | ⚠️ partial coverage, mutable | every admin API | System | same transaction as the action |

## 3. Cross-cutting mechanisms

### Idempotency
- **Stripe:** every PI or refund creation passes `idempotencyKey = <order_id>:<action>`.
- **Webhooks:** a `stripe_webhook_events(event_id PK, type, processed_at)` table. Insert-first; on conflict, skip.
- **Ledger entries:** a unique `(reason, source_type, source_id)`, so the same order never earns twice and the same submission never pays twice.

### Reversal
Never update or delete a ledger entry. Write a compensating entry with `reverses_entry_id`. A refund triggers reversals for the points earned, referral credits and any voucher consumed.

### Reconciliation
- A nightly job compares Stripe payments, refunds and subscriptions against `customer_orders`, `order_refunds` and `membership_payments`, and compares cached balances against ledger sums.
- Mismatches go to SYSTEM ALERTS.
- Founder-visible report in Finance.

### Expiration
- Points and vouchers carry `expires_at`; the rules are founder decision D5.
- A scheduled job writes `expiry` ledger entries (never deletes).
- The existing `expiring-rewards-emails` cron reads the same tables.

### Duplicate-event protection
- Webhook event table.
- Unique PI id per order.
- Unique ledger source keys.
- Order numbers come from a database sequence (today they come from a per-browser counter).

### Caching on the client
- `syncFromApi` becomes **read-through only**. The server replaces the cache; the cache never overwrites the server.
- Remove `putOrders`, the local order writers, and local writers for balances and codes.

## 4. What stays in browser storage (allowed)

| Key family | Allowed because |
|---|---|
| `cardAnimations*`, `selectedCurrency_*`, `ordersPageAnimations` | UI preference |
| `adminMessagesActiveTab`, sort choices | UI preference |
| In-progress BAW selections (`selected*`, `editingCartItem`) | draft (until "Save build" writes `saved_configurations`) |
| `cartItems` | cache of the server `cart` (already versioned) |
| `pendingProfilePatch_v1` | retry queue for a server write |

**Prohibited** as an authority after Sprint 1/4: `userOrders_*`, `registeredUsers` (as a user database), `referralEarnings*`, `adminInventoryOverride`, `adminBrandPromoCodes`, `voucherList`/`giftCardBalance`/`loyaltyPoints` in `currentUser`, `slayChallenge*`, `unitStockNotifyWaitlist_v1`, `userLists_*`, `wishlistSharedListsByToken`, `brandJobApplications_v1`, `admin_accounting_receipts`, `adminMeetingsScheduled`.

## 5. Cross-project (SITE00) boundary

SITE00 shares Supabase project `hyycomvcaqxxvyrfupes` (SITE00 `README.md:93`). Rules for every Frontal Slayer migration:
1. **New tables:** use names that cannot collide with `site00_*` and `studio_*`. Check `list_tables` before applying.
2. **Shared objects** (`auth.users`, the `handle_new_user` trigger, `profiles`, `audit_log`, `app_config`, `site_analytics_events`, `user_activity`, public SECURITY DEFINER functions): run an impact check against the SITE00 repo before any change (doc 11 R-17 lists the findings).
3. **Prefer a Supabase branch (staging)** for rehearsing migrations. It is also needed for signed-in E2E (decision H2).
