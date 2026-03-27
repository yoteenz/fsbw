-- Stripe membership: profile billing fields + membership payment ledger (webhook inserts).
-- Run in Supabase SQL Editor or via CLI after review.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS auto_renew_membership boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_purchased_at timestamptz;

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer id (cus_...)';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe Subscription id (sub_...)';
COMMENT ON COLUMN public.profiles.auto_renew_membership IS 'Mirrors cancel_at_period_end inverse when synced from Stripe';
COMMENT ON COLUMN public.profiles.subscription_period_end IS 'Current billing period end from Stripe (ISO timestamptz)';
COMMENT ON COLUMN public.profiles.subscription_purchased_at IS 'When premium subscription first activated (Stripe checkout completed)';

CREATE TABLE IF NOT EXISTS public.membership_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email text,
  stripe_invoice_id text UNIQUE NOT NULL,
  stripe_subscription_id text,
  stripe_customer_id text,
  subscription_tier text,
  amount_usd numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  kind text NOT NULL CHECK (kind IN ('initial', 'renewal')),
  created_at timestamptz NOT NULL DEFAULT now(),
  billing_period_end timestamptz
);

CREATE INDEX IF NOT EXISTS membership_payments_user_id_idx ON public.membership_payments(user_id);
CREATE INDEX IF NOT EXISTS membership_payments_created_at_idx ON public.membership_payments(created_at DESC);

ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own payment rows (optional; admin list uses service role).
DROP POLICY IF EXISTS "Users read own membership payments" ON public.membership_payments;
CREATE POLICY "Users read own membership payments"
  ON public.membership_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated: only service role (webhook / admin API) writes.
