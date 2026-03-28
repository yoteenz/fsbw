# Profiles table columns and app mapping

Single source of truth for Supabase `profiles` columns and how they map to the API, localStorage, and the app UI. Use this when fixing sync, admin client details, or account settings.

---

## 1. Database columns (Supabase `profiles` table)

These are the **snake_case** column names the backend reads/writes. The API converts to/from camelCase via `api/_lib/profileMapping.ts`.

| DB column | Type / notes |
|-----------|----------------|
| `id` | UUID (Supabase Auth user id) |
| `email` | string |
| `role` | string \| null |
| `first_name` | string \| null |
| `last_name` | string \| null |
| `phone_number` | string \| null |
| `birthday` | string \| null (any format; app often stores MM/DD/YYYY or compact) |
| `facebook` | string \| null (handle or URL) |
| `instagram` | string \| null |
| `youtube` | string \| null |
| `tiktok` | string \| null |
| `twitter` | string \| null |
| `profile_image` | string \| null (URL; e.g. Supabase storage or `/assets/profile-thumb.png`) |
| `membership_type` | string \| null (e.g. `STANDARD`, `PREMIUM`) |
| `subscription_tier` | string \| null (e.g. `3months`, `6months`, `12months`) |
| `stripe_customer_id` | string \| null — Stripe Customer id (`cus_...`) |
| `stripe_subscription_id` | string \| null — Stripe Subscription id (`sub_...`) |
| `auto_renew_membership` | boolean — synced from Stripe `cancel_at_period_end` |
| `subscription_period_end` | timestamptz \| null — current period end from Stripe |
| `subscription_purchased_at` | timestamptz \| null — first subscription activation |
| `stripe_subscription_status` | string \| null — Stripe `Subscription.status` (`active`, `past_due`, `unpaid`, `canceled`, …) |
| `last_payment_failure_at` | timestamptz \| null — last `invoice.payment_failed` (cleared on `invoice.paid`) |
| `current_tier_name` | string \| null (rewards tier: `SILVER`, `RED`, `BLACK`) |
| `default_address` | object \| null |
| `shipping_address` | object \| null |
| `saved_addresses` | array \| null |
| `referral_code` | string \| null |
| `gift_card_balance` | number |
| `has_made_first_purchase` | boolean |
| `loyalty_points` | number |
| `unlocked_discounts` | (varies) \| null |
| `voucher_list` | (varies) \| null |
| `voucher_history` | (varies) \| null |
| `digital_cash_history` | (varies) \| null |
| `welcome_discount_tiers_credited_by_period` | (varies) \| null |
| `notification_newsletter` | boolean (default true) |
| `notification_sales` | boolean (default true) |
| `notification_order_tracking` | boolean (default true) |
| `created_at` | timestamp (set by DB) |
| `updated_at` | timestamp (set by API on PATCH) |

**One-shot schema + RLS:** Run the SQL migration in the repo at `supabase/migrations/20260325120000_full_app_sync.sql` in the Supabase SQL Editor (or via Supabase CLI) so `profiles`, `cart`, `wishlist`, and `orders` exist with the columns above and row-level security policies that allow each user to manage their own rows.

If **`GET` / `PATCH` `/api/profile` returns HTTP 500** and the JSON body mentions **permission denied**, **row-level security**, or **RLS**, run `docs/SUPABASE_PROFILES_RLS.sql` in the SQL Editor (or align your `profiles` policies so `authenticated` users can `SELECT` / `INSERT` / `UPDATE` their own row where `auth.uid() = id`).

If the table is missing any of these columns, GET/PATCH and sync may return partial data or fail. Add missing columns in Supabase (Table Editor or SQL) and backfill if needed.

---

## 2. API shape (camelCase)

- **GET /api/profile** and **POST /api/admin/sync-profile** return profile as camelCase (via `fromProfileRow` in `api/_lib/profileMapping.ts`).
- **PATCH /api/profile** accepts camelCase; `api/profile.ts` converts to snake_case with `toProfileRow`.

| App/API key | DB column(s) | Notes |
|--------------|--------------|--------|
| `id` | `id` | Auth user id |
| `email` | `email` | |
| `role` | `role` | |
| `firstName` | `first_name` | |
| `lastName` | `last_name` | |
| `phoneNumber` | `phone_number` | |
| `birthday` | `birthday` | Display: MM/DD/YYYY; stored can be compact (e.g. 08301989) |
| `facebook` | `facebook` | |
| `instagram` | `instagram` | |
| `youtube` | `youtube` | |
| `tiktok` | `tiktok` | |
| `twitter` | `twitter` | |
| `profileImage` | `profile_image` | Fallback: `/assets/profile-thumb.png` |
| `membershipType` | `membership_type` | STANDARD \| PREMIUM |
| `subscriptionTier` | `subscription_tier` | 3months \| 6months \| 12months |
| `stripeCustomerId` | `stripe_customer_id` | Set by Stripe checkout / webhook only (not client PATCH) |
| `stripeSubscriptionId` | `stripe_subscription_id` | Set by Stripe webhook only (not client PATCH) |
| `autoRenewMembership` | `auto_renew_membership` | |
| `subscriptionEndDate` | `subscription_period_end` | ISO string in API JSON |
| `subscriptionPurchasedAt` | `subscription_purchased_at` | |
| `stripeSubscriptionStatus` | `stripe_subscription_status` | Webhook / Stripe only (not client PATCH) |
| `lastPaymentFailureAt` | `last_payment_failure_at` | Webhook only (not client PATCH) |
| `currentTierName` | `current_tier_name` or `tier` | SILVER \| RED \| BLACK (rewards) |
| `defaultAddress` | `default_address` | |
| `shippingAddress` | `shipping_address` | |
| `savedAddresses` | `saved_addresses` | |
| `referralCode` | `referral_code` | |
| `giftCardBalance` | `gift_card_balance` | |
| `hasMadeFirstPurchase` | `has_made_first_purchase` | |
| `loyaltyPoints` | `loyalty_points` | |
| `unlockedDiscounts` | `unlocked_discounts` | |
| `voucherList` | `voucher_list` | |
| `voucherHistory` | `voucher_history` | |
| `digitalCashHistory` | `digital_cash_history` | |
| `welcomeDiscountTiersCreditedByPeriod` | `welcome_discount_tiers_credited_by_period` | |
| `notificationNewsletter` | `notification_newsletter` | Settings notification toggles |
| `notificationSales` | `notification_sales` | |
| `notificationOrderTracking` | `notification_order_tracking` | |
| `createdAt` | `created_at` | Join date (account created) |
| `updatedAt` | `updated_at` | |

---

## 3. App storage (localStorage)

- **`currentUser`** — JSON object; same camelCase keys as API. Source of truth for “logged-in user” in the app.
- **`profileImage`** — string; single key for current user’s photo URL (or `/assets/profile-thumb.png`).
- **`registeredUsers`** — array of user objects (same shape + optional `password`); used for local sign-in and “Sync my account”.

After **sync** (session-based `syncAllFromApi` or admin **Sync my account** via `syncProfileWithPassword` + `applyAdminSyncPayload`):

- `syncProfileFromApi` / `applyAdminSyncPayload` write API profile into `currentUser` and update `profileImage`, and merge into `registeredUsers` by email.
- **Preserve behavior:** When applying sync payload, if API returns null/empty for name, birthday, socials, profileImage, or rewards fields, the app keeps existing local values (see `profileKeysToPreserve` in `src/utils/syncFromApi.ts`) so sync does not wipe data.

---

## 4. Where each field is used in the app

| Field | Where used |
|-------|------------|
| **firstName, lastName** | Account Settings form; Concierge (user name in messages, birthday gift); Admin client details; checkout/shipping prefills |
| **birthday** | Account Settings; Concierge (birthday gift eligibility, display); Admin client details (BIRTHDAY row) |
| **profileImage** | Header/account avatar; stored in `profileImage` localStorage key |
| **facebook, instagram, youtube, tiktok, twitter** | Account Settings (social handles); Admin client details (personal info) |
| **membershipType** | Concierge (premium vs standard); rewards/membership UI; Admin client list (STANDARD/PREMIUM) |
| **subscriptionTier** | Rewards/membership (3/6/12 months); can be overridden for admin via `adminSubscriptionOverride` |
| **currentTierName** | Rewards tier (Silver/Red/Black); Concierge; Admin client details; can be overridden for admin via `adminTierOverride` |
| **phoneNumber** | Account Settings; Admin client details; checkout |
| **defaultAddress / shippingAddress** | Checkout; Concierge/order context |

---

## 5. Sync flow summary

1. **Session-based (signed in with Supabase):**  
   `syncAllFromApi()` → GET /api/profile (with Bearer) → `syncProfileFromApi()` → merge into `currentUser`, `profileImage`, `registeredUsers`.

2. **Admin “Sync my account” (password-based):**  
   Settings calls `syncProfileWithPassword(email, localPassword)` → POST /api/admin/sync-profile with `{ email, password }` → backend signs in with Supabase, then reads profile (and orders, cart, wishlist) with service role → returns `{ profile, activeOrders, pastOrders, cart, wishlist }` → frontend calls `applyAdminSyncPayload(email, payload, { preservePassword })` to write to localStorage and preserve local password.

If profile photo, name, socials, birthday, or rewards don’t repopulate after sync:

- Confirm `profiles` has the right columns and data in Supabase (Table Editor or SQL).
- Confirm GET /api/profile and POST /api/admin/sync-profile return those keys (camelCase) in `profile`.
- Confirm `fromProfileRow` in `api/_lib/profileMapping.ts` maps the DB columns you use.
- Confirm sync applies payload to `currentUser` and that the Settings page (and Concierge) read from `currentUser` / `userData`; after sync, Settings re-reads with `setUserData(JSON.parse(localStorage.getItem('currentUser')))` so the form should reflect merged data.

---

## 6. Key files

| Purpose | File(s) |
|---------|--------|
| DB → API shape | `api/_lib/profileMapping.ts` (`fromProfileRow`) |
| API PATCH body → DB row | `api/profile.ts` (`toProfileRow`) |
| GET profile | `api/profile.ts` (GET); `api/admin/sync-profile.ts` (admin sync) |
| Sync to localStorage | `src/utils/syncFromApi.ts` (`syncProfileFromApi`, `applyAdminSyncPayload`) |
| Settings form (load/save) | `src/pages/account/settings/page.tsx` (userData, useEffect to set firstName/lastName/birthday/socials) |
| API client | `src/utils/api.ts` (`getProfile`, `patchProfile`, `syncProfileWithPassword`) |
