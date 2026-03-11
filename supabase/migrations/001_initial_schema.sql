-- Run this in Supabase SQL Editor after creating a project.
-- Enables sync for profile, orders, cart, wishlist (per BACKEND_SYNC_REQUIREMENTS.md).

-- Profiles: one row per auth user (synced from app currentUser)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text,
  first_name text,
  last_name text,
  phone_number text,
  birthday text,
  facebook text,
  instagram text,
  youtube text,
  tiktok text,
  twitter text,
  profile_image text,
  membership_type text,
  subscription_tier text,
  default_address jsonb,
  shipping_address jsonb,
  saved_addresses jsonb,
  referral_code text,
  gift_card_balance numeric default 0,
  has_made_first_purchase boolean default false,
  loyalty_points integer default 0,
  unlocked_discounts jsonb,
  voucher_list jsonb,
  voucher_history jsonb,
  digital_cash_history jsonb,
  welcome_discount_tiers_credited_by_period jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders: active + past per user (app currently uses userOrders_${email})
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  active_orders jsonb default '[]',
  past_orders jsonb default '[]',
  updated_at timestamptz default now()
);

create unique index if not exists orders_user_id_one on public.orders(user_id);

-- Cart: one row per user (cartItems + optional build state)
create table if not exists public.cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  items jsonb default '[]',
  updated_at timestamptz default now()
);

create index if not exists cart_user_id on public.cart(user_id);

-- Wishlist: one row per user
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  items jsonb default '[]',
  updated_at timestamptz default now()
);

create index if not exists wishlist_user_id on public.wishlist(user_id);

-- Notifications: one row per user (list of notifications)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  items jsonb default '[]',
  updated_at timestamptz default now()
);

create index if not exists notifications_user_id on public.notifications(user_id);

-- RLS: allow users to read/write only their own rows (use service role in API to bypass if preferred)
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.cart enable row level security;
alter table public.wishlist enable row level security;
alter table public.notifications enable row level security;

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Users can update own orders" on public.orders for update using (auth.uid() = user_id);

create policy "Users can read own cart" on public.cart for select using (auth.uid() = user_id);
create policy "Users can insert own cart" on public.cart for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on public.cart for update using (auth.uid() = user_id);
create policy "Users can delete own cart" on public.cart for delete using (auth.uid() = user_id);

create policy "Users can read own wishlist" on public.wishlist for select using (auth.uid() = user_id);
create policy "Users can insert own wishlist" on public.wishlist for insert with check (auth.uid() = user_id);
create policy "Users can update own wishlist" on public.wishlist for update using (auth.uid() = user_id);
create policy "Users can delete own wishlist" on public.wishlist for delete using (auth.uid() = user_id);

create policy "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can insert own notifications" on public.notifications for insert with check (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
