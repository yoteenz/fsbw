# Supabase schema and sync (profiles, cart, wishlist, orders)

The app expects these tables and columns. Run the SQL in the **Supabase Dashboard → SQL Editor** (or link this repo’s `supabase/migrations` if you use the Supabase CLI).

## Why signup data was missing

1. **Email confirmation** — If Supabase requires email confirm, there is no session until the user clicks the link. The signup form data must live in **`auth.users.raw_user_meta_data`** so it is still available after confirm. The app now stores **name, birthday, phone, socials, referral_code** in `signUp({ options: { data: { ... } } })`.
2. **Profile row** — After confirm, `AccountRouteGuard` / sign-in flows call **`PATCH /api/profile`** with `buildProfilePayloadForBackend()`, which now maps **all** of those metadata fields into the **`profiles`** row.
3. **RLS** — Users must be allowed to `insert`/`update` their own row in `profiles` and their rows in `cart` / `wishlist` / `orders`. If PATCH returns 500 or RLS errors, adjust policies in Supabase.

## `profiles` columns (align with `api/profile.ts` → `toProfileRow`)

Ensure these exist (add with `ADD COLUMN IF NOT EXISTS` if missing):

| Column | Type | Notes |
|--------|------|--------|
| `id` | uuid | PK, `auth.users.id` |
| `email` | text | |
| `role` | text | nullable |
| `first_name`, `last_name` | text | |
| `phone_number` | text | |
| `birthday` | text | e.g. MM/DD/YYYY |
| `facebook`, `instagram`, `youtube`, `tiktok`, `twitter` | text | nullable |
| `profile_image` | text | nullable |
| `membership_type`, `subscription_tier`, `current_tier_name` | text | nullable |
| `default_address`, `shipping_address`, `saved_addresses` | jsonb | nullable |
| `referral_code` | text | nullable |
| `gift_card_balance` | numeric | default 0 |
| `has_made_first_purchase` | boolean | default false |
| `loyalty_points` | int | default 0 |
| `unlocked_discounts`, `voucher_list`, `voucher_history`, `digital_cash_history`, `welcome_discount_tiers_credited_by_period` | jsonb | nullable |
| `created_at`, `updated_at` | timestamptz | |

See `supabase/migrations/20260326180000_ensure_profiles_columns.sql` for ready-to-run `ALTER` statements.

## `cart`, `wishlist`, `orders`

- **`cart`**: `user_id` (uuid, unique), `items` (jsonb), `updated_at`.
- **`wishlist`**: same pattern as cart.
- **`orders`**: `user_id` (uuid, unique), `active_orders` (jsonb), `past_orders` (jsonb), `updated_at`.

RLS: authenticated users can read/write rows where `user_id = auth.uid()`. Admin APIs use the **service role** and bypass RLS.

## App behaviour (summary)

| Area | Mechanism |
|------|-----------|
| Sign up (Supabase) | Full signup fields → `auth` metadata + immediate `PATCH /api/profile` when session exists |
| After email confirm | Session + metadata → `buildMinimalUserFromSupabaseSession` → `patchProfile(buildProfilePayloadForBackend(...))` |
| Account settings / profile edits | `PATCH /api/profile` (partial merge) |
| Cart / wishlist | `GET`/`PUT` `/api/cart`, `/api/wishlist`; app also **debounced push** on route change when signed in (`schedulePushCartWishlistToCloud`) |
| Orders | Written by checkout / order flows that call your APIs (ensure they upsert `orders` for `user_id`) |

“Every page” does not each need custom code: profile changes go through existing save paths; cart/wishlist are pushed on navigation when signed in. Add `patchProfile` (or domain-specific API calls) anywhere new persistent fields are introduced.
