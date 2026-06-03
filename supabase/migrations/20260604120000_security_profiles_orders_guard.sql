-- Security hardening: block client JWT writes to privileged profile columns and order JSONB.

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

DROP TRIGGER IF EXISTS profiles_guard_privileged_columns ON public.profiles;

CREATE TRIGGER profiles_guard_privileged_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_preserve_privileged_columns ();

-- Orders: clients may read their row; writes only via service role (Stripe webhook / admin).
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;

DROP POLICY IF EXISTS "orders_update_own" ON public.orders;

COMMENT ON TRIGGER profiles_guard_privileged_columns ON public.profiles IS 'Prevents authenticated users from self-upgrading membership/tier/role; service_role bypasses.';
