-- Build-a-Wig: ensure profiles, cart, wishlist, orders match the Vercel API and RLS allows
-- each user to read/write their own rows. Run in Supabase SQL Editor or via `supabase db push`.
--
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS where supported.

-- ---------------------------------------------------------------------------
-- profiles (minimal create if missing; then extend columns)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS youtube text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tiktok text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_tier_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_address jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shipping_address jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saved_addresses jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gift_card_balance numeric NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_made_first_purchase boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_points numeric NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unlocked_discounts jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS voucher_list jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS voucher_history jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS digital_cash_history jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_discount_tiers_credited_by_period jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_newsletter boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_sales boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_order_tracking boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS profiles_email_lower ON public.profiles (lower(email));

-- ---------------------------------------------------------------------------
-- cart, wishlist, orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT cart_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT wishlist_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  active_orders jsonb NOT NULL DEFAULT '[]'::jsonb,
  past_orders jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT orders_user_id_key UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS cart_user_id_idx ON public.cart (user_id);
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON public.wishlist (user_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop policies if re-running (names fixed)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "cart_all_own" ON public.cart;
DROP POLICY IF EXISTS "wishlist_all_own" ON public.wishlist;
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid () = id);

CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
WITH CHECK (auth.uid () = id);

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid () = id)
WITH CHECK (auth.uid () = id);

CREATE POLICY "cart_all_own" ON public.cart FOR ALL USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

CREATE POLICY "wishlist_all_own" ON public.wishlist FOR ALL USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid () = user_id);

CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT
WITH CHECK (auth.uid () = user_id);

CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (auth.uid () = user_id)
WITH CHECK (auth.uid () = user_id);

-- Optional: auto-create profile row when auth user signs up (helps email-confirm flows before first PATCH)
CREATE OR REPLACE FUNCTION public.handle_new_user ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
  ON CONFLICT (id)
    DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user ();
