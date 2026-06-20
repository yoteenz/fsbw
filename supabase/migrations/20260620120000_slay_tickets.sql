-- Slay Tickets: balance on profiles, transaction history, lounge content unlocks.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS slay_ticket_balance integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.profiles.slay_ticket_balance IS 'Slay Tickets balance for Lounge TV content unlocks.';

CREATE TABLE IF NOT EXISTS public.slay_ticket_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('earned', 'used', 'purchased', 'adjusted', 'expired')),
  amount integer NOT NULL,
  source text,
  description text NOT NULL DEFAULT '',
  related_order_id text,
  related_content_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS slay_ticket_transactions_user_id_created_at_idx
  ON public.slay_ticket_transactions (user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS slay_ticket_transactions_order_earn_unique_idx
  ON public.slay_ticket_transactions (user_id, related_order_id)
  WHERE type = 'earned' AND related_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS slay_ticket_transactions_order_purchase_unique_idx
  ON public.slay_ticket_transactions (user_id, related_order_id, amount)
  WHERE type = 'purchased' AND related_order_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.lounge_content_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  content_id text NOT NULL,
  ticket_cost integer NOT NULL DEFAULT 0,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  access_type text NOT NULL DEFAULT 'permanent' CHECK (access_type IN ('permanent', 'rental')),
  expires_at timestamptz,
  UNIQUE (user_id, content_id)
);

CREATE INDEX IF NOT EXISTS lounge_content_unlocks_user_id_idx
  ON public.lounge_content_unlocks (user_id);

ALTER TABLE public.slay_ticket_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lounge_content_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS slay_ticket_transactions_select_own ON public.slay_ticket_transactions;
CREATE POLICY slay_ticket_transactions_select_own ON public.slay_ticket_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS lounge_content_unlocks_select_own ON public.lounge_content_unlocks;
CREATE POLICY lounge_content_unlocks_select_own ON public.lounge_content_unlocks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Extend privileged profile guard (service_role bypasses trigger).
CREATE OR REPLACE FUNCTION public.profiles_preserve_privileged_columns ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
BEGIN
  IF coalesce(auth.jwt () ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.membership_type := coalesce(nullif(trim(NEW.membership_type), ''), 'STANDARD');
    IF upper(NEW.membership_type) = 'PREMIUM' OR NEW.subscription_tier IS NOT NULL THEN
      NEW.membership_type := 'STANDARD';
      NEW.subscription_tier := NULL;
    END IF;
    NEW.role := coalesce(nullif(trim(NEW.role), ''), 'user');
    IF NEW.role NOT IN ('user', 'client') THEN
      NEW.role := 'user';
    END IF;
    NEW.loyalty_points := coalesce(NEW.loyalty_points, 0);
    NEW.gift_card_balance := coalesce(NEW.gift_card_balance, 0);
    NEW.slay_ticket_balance := coalesce(NEW.slay_ticket_balance, 0);
    RETURN NEW;
  END IF;

  NEW.membership_type := OLD.membership_type;
  NEW.subscription_tier := OLD.subscription_tier;
  NEW.subscription_period_end := OLD.subscription_period_end;
  NEW.subscription_purchased_at := OLD.subscription_purchased_at;
  NEW.auto_renew_membership := OLD.auto_renew_membership;
  NEW.role := OLD.role;
  NEW.current_tier_name := OLD.current_tier_name;
  NEW.loyalty_points := OLD.loyalty_points;
  NEW.gift_card_balance := OLD.gift_card_balance;
  NEW.slay_ticket_balance := OLD.slay_ticket_balance;
  NEW.has_made_first_purchase := OLD.has_made_first_purchase;
  NEW.unlocked_discounts := OLD.unlocked_discounts;
  NEW.voucher_list := OLD.voucher_list;
  NEW.voucher_history := OLD.voucher_history;
  NEW.digital_cash_history := OLD.digital_cash_history;
  NEW.welcome_discount_tiers_credited_by_period := OLD.welcome_discount_tiers_credited_by_period;
  NEW.stripe_customer_id := OLD.stripe_customer_id;
  NEW.stripe_default_payment_method_id := OLD.stripe_default_payment_method_id;
  NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  NEW.stripe_subscription_status := OLD.stripe_subscription_status;
  NEW.last_payment_failure_at := OLD.last_payment_failure_at;
  RETURN NEW;
END;
$$;
