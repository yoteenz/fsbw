-- Paid hairstyle analysis credits after monthly free is used (same tiers/prices as consult style analysis add-on).

ALTER TABLE public.hairstyle_analysis_usage
  ADD COLUMN IF NOT EXISTS paid_credit_queue integer[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.hairstyle_analysis_usage.paid_credit_queue IS
  'FIFO queue of purchased comparison counts (1, 3, or 6) for paid generations after the monthly free slot is used.';

CREATE TABLE IF NOT EXISTS public.hairstyle_analysis_purchase_grants (
  stripe_payment_intent_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.hairstyle_analysis_purchase_grants IS
  'Idempotent Stripe PaymentIntent → hairstyle analysis paid credit grants.';

ALTER TABLE public.hairstyle_analysis_purchase_grants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.hairstyle_analysis_try_consume (
  p_user_id uuid,
  p_month_key text,
  p_month_limit integer
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
DECLARE
  r public.hairstyle_analysis_usage;
  next_count integer;
  comparison_count integer;
  new_queue integer[];
  paid_remaining integer;
BEGIN
  INSERT INTO public.hairstyle_analysis_usage (user_id, month_key, month_count, paid_credit_queue)
    VALUES (p_user_id, p_month_key, 0, '{}')
  ON CONFLICT (user_id)
    DO NOTHING;

  SELECT *
    INTO r
    FROM public.hairstyle_analysis_usage
   WHERE user_id = p_user_id
     FOR UPDATE;

  IF r.month_key IS DISTINCT FROM p_month_key THEN
    r.month_key := p_month_key;
    r.month_count := 0;
  END IF;

  IF p_month_limit >= 1 AND r.month_count < p_month_limit THEN
    next_count := r.month_count + 1;

    UPDATE public.hairstyle_analysis_usage
       SET month_key = p_month_key,
           month_count = next_count,
           updated_at = now()
     WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'ok', true,
      'source', 'monthly',
      'month_count', next_count,
      'month_limit', p_month_limit,
      'paid_remaining', COALESCE(array_length(r.paid_credit_queue, 1), 0)
    );
  END IF;

  IF COALESCE(array_length(r.paid_credit_queue, 1), 0) < 1 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'purchase_required',
      'month_count', r.month_count,
      'month_limit', p_month_limit,
      'paid_remaining', 0
    );
  END IF;

  comparison_count := r.paid_credit_queue[1];
  IF array_length(r.paid_credit_queue, 1) > 1 THEN
    new_queue := r.paid_credit_queue[2:array_length(r.paid_credit_queue, 1)];
  ELSE
    new_queue := '{}';
  END IF;
  paid_remaining := COALESCE(array_length(new_queue, 1), 0);

  UPDATE public.hairstyle_analysis_usage
     SET paid_credit_queue = new_queue,
         updated_at = now()
   WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'source', 'paid',
    'comparison_count', comparison_count,
    'month_count', r.month_count,
    'month_limit', p_month_limit,
    'paid_remaining', paid_remaining
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.hairstyle_analysis_refund_consume (
  p_user_id uuid,
  p_month_key text,
  p_source text DEFAULT 'monthly',
  p_comparison_count integer DEFAULT NULL
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
DECLARE
  r public.hairstyle_analysis_usage;
  new_queue integer[];
BEGIN
  SELECT *
    INTO r
    FROM public.hairstyle_analysis_usage
   WHERE user_id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF p_source = 'paid' THEN
    IF p_comparison_count IS NULL OR p_comparison_count NOT IN (1, 3, 6) THEN
      RETURN;
    END IF;
    new_queue := array_prepend(p_comparison_count, COALESCE(r.paid_credit_queue, '{}'));
    UPDATE public.hairstyle_analysis_usage
       SET paid_credit_queue = new_queue,
           updated_at = now()
     WHERE user_id = p_user_id;
    RETURN;
  END IF;

  IF r.month_key IS DISTINCT FROM p_month_key OR r.month_count < 1 THEN
    RETURN;
  END IF;

  UPDATE public.hairstyle_analysis_usage
     SET month_count = r.month_count - 1,
         updated_at = now()
   WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.hairstyle_analysis_grant_purchase_credits (
  p_user_id uuid,
  p_payment_intent_id text,
  p_comparison_counts integer[]
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
DECLARE
  r public.hairstyle_analysis_usage;
  valid_counts integer[] := '{}';
  c integer;
  new_queue integer[];
BEGIN
  IF p_payment_intent_id IS NULL OR length(trim(p_payment_intent_id)) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_payment_intent');
  END IF;

  IF EXISTS (
    SELECT 1
      FROM public.hairstyle_analysis_purchase_grants g
     WHERE g.stripe_payment_intent_id = p_payment_intent_id
  ) THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true);
  END IF;

  IF p_comparison_counts IS NULL OR COALESCE(array_length(p_comparison_counts, 1), 0) < 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_counts');
  END IF;

  FOREACH c IN ARRAY p_comparison_counts LOOP
    IF c IN (1, 3, 6) THEN
      valid_counts := array_append(valid_counts, c);
    END IF;
  END LOOP;

  IF COALESCE(array_length(valid_counts, 1), 0) < 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_counts');
  END IF;

  INSERT INTO public.hairstyle_analysis_usage (user_id, month_key, month_count, paid_credit_queue)
    VALUES (p_user_id, '', 0, '{}')
  ON CONFLICT (user_id)
    DO NOTHING;

  SELECT *
    INTO r
    FROM public.hairstyle_analysis_usage
   WHERE user_id = p_user_id
     FOR UPDATE;

  new_queue := COALESCE(r.paid_credit_queue, '{}') || valid_counts;

  UPDATE public.hairstyle_analysis_usage
     SET paid_credit_queue = new_queue,
         updated_at = now()
   WHERE user_id = p_user_id;

  INSERT INTO public.hairstyle_analysis_purchase_grants (stripe_payment_intent_id, user_id)
    VALUES (p_payment_intent_id, p_user_id);

  RETURN jsonb_build_object(
    'ok', true,
    'granted', valid_counts,
    'paid_remaining', COALESCE(array_length(new_queue, 1), 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.hairstyle_analysis_grant_purchase_credits (uuid, text, integer[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_grant_purchase_credits (uuid, text, integer[]) TO service_role;
