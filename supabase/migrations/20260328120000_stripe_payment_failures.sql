-- Stripe billing health: subscription status mirror + failed renewal attempts (webhook-driven).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_status text,
  ADD COLUMN IF NOT EXISTS last_payment_failure_at timestamptz;

COMMENT ON COLUMN public.profiles.stripe_subscription_status IS 'Stripe Subscription.status (active, past_due, unpaid, canceled, etc.)';
COMMENT ON COLUMN public.profiles.last_payment_failure_at IS 'Last invoice.payment_failed timestamp for this member (cleared on successful invoice.paid)';

CREATE TABLE IF NOT EXISTS public.membership_payment_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email text,
  stripe_invoice_id text,
  stripe_subscription_id text,
  amount_usd numeric(12, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS membership_payment_failures_created_idx
  ON public.membership_payment_failures(created_at DESC);
CREATE INDEX IF NOT EXISTS membership_payment_failures_user_id_idx
  ON public.membership_payment_failures(user_id);

ALTER TABLE public.membership_payment_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own membership payment failures" ON public.membership_payment_failures;
CREATE POLICY "Users read own membership payment failures"
  ON public.membership_payment_failures
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
