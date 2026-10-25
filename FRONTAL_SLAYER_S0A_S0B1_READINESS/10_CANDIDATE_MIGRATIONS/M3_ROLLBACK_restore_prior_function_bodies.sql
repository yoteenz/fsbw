-- =====================================================================================
-- REVIEW ONLY — NOT EXECUTED.  ROLLBACK for S0B1-M3.
-- WARNING: re-breaks R-10 ($60 4-comparison packs grant nothing again).
-- Data note: credits granted under M3 stay in paid_credit_queue (try_consume pops any integer),
-- so rolling back does not remove value already delivered; it only stops new 4-pack grants.
-- Bodies below are the live definitions captured read-only on 2026-10-25 (pg_get_functiondef).
-- =====================================================================================
BEGIN;

CREATE OR REPLACE FUNCTION public.hairstyle_analysis_grant_purchase_credits(p_user_id uuid, p_payment_intent_id text, p_comparison_counts integer[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.hairstyle_analysis_refund_consume(p_user_id uuid, p_month_key text, p_source text DEFAULT 'monthly'::text, p_comparison_count integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

COMMIT;
-- Privileges are unchanged by CREATE OR REPLACE; this rollback does NOT re-grant anon (that is M1A's rollback).
