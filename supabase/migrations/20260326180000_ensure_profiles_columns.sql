-- Build-a-Wig: ensure profiles row can store all fields used by api/profile.ts (toProfileRow).
-- Safe to run multiple times (IF NOT EXISTS).
-- After running, verify RLS policies allow users to insert/update their own profile (id = auth.uid()).

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists birthday text;
alter table public.profiles add column if not exists facebook text;
alter table public.profiles add column if not exists instagram text;
alter table public.profiles add column if not exists youtube text;
alter table public.profiles add column if not exists tiktok text;
alter table public.profiles add column if not exists twitter text;
alter table public.profiles add column if not exists profile_image text;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists membership_type text;
alter table public.profiles add column if not exists subscription_tier text;
alter table public.profiles add column if not exists current_tier_name text;
alter table public.profiles add column if not exists default_address jsonb;
alter table public.profiles add column if not exists shipping_address jsonb;
alter table public.profiles add column if not exists saved_addresses jsonb;
alter table public.profiles add column if not exists referral_code text;
alter table public.profiles add column if not exists gift_card_balance numeric default 0;
alter table public.profiles add column if not exists has_made_first_purchase boolean default false;
alter table public.profiles add column if not exists loyalty_points integer default 0;
alter table public.profiles add column if not exists unlocked_discounts jsonb;
alter table public.profiles add column if not exists voucher_list jsonb;
alter table public.profiles add column if not exists voucher_history jsonb;
alter table public.profiles add column if not exists digital_cash_history jsonb;
alter table public.profiles add column if not exists welcome_discount_tiers_credited_by_period jsonb;
alter table public.profiles add column if not exists created_at timestamptz default timezone('utc'::text, now());
alter table public.profiles add column if not exists updated_at timestamptz default timezone('utc'::text, now());
