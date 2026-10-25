-- =====================================================================================
-- REVIEW ONLY — NOT EXECUTED.  Gate: A1a → staging pass → A1b. Apply AFTER M1A.
-- =====================================================================================
-- Candidate:  S0B1-M3  accept the pack sizes the app actually sells, and stop recording a
--             payment as granted when part of it was rejected.
-- Risk:       R-10 (CRITICAL, live re-verified 2026-10-25: grant body checks `c IN (1, 3, 6)`;
--             the app and server price only 1 ($20) and 4 ($60) — MEMORY 2026-06-12).
--             Correction found this sprint (evidence S §Corrections 3): a mixed 1+4 cart grants
--             the 1, drops the 4, and records the PaymentIntent as granted, so a replay cannot
--             repair it.
-- Behaviour change (engineering, no business rule changed):
--   * Accept 1 and 4. Keep 3 and 6 accepted so any legacy queue entries remain valid.
--   * If ANY requested count is invalid, grant nothing and do not record the PaymentIntent
--     (returns ok:false, reason invalid_counts) so the webhook can be replayed after a fix.
--   * Function stays SECURITY DEFINER with search_path=public; EXECUTE remains service-only (M1A).
-- Live rows today: hairstyle_analysis_purchase_grants = 0, so no existing grant is affected.
-- Prices are NOT changed here (they live in api/_lib/hairstyleAnalysisPricing.ts).
-- =====================================================================================
BEGIN;

CREATE OR REPLACE FUNCTION public.hairstyle_analysis_grant_purchase_credits(
  p_user_id uuid, p_payment_intent_id text, p_comparison_counts integer[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  r public.hairstyle_analysis_usage;
  c integer;
  new_queue integer[];
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_user');
  END IF;

  IF p_payment_intent_id IS NULL OR length(trim(p_payment_intent_id)) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_payment_intent');
  END IF;

  IF EXISTS (SELECT 1 FROM public.hairstyle_analysis_purchase_grants g
              WHERE g.stripe_payment_intent_id = p_payment_intent_id) THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true);
  END IF;

  IF p_comparison_counts IS NULL OR COALESCE(array_length(p_comparison_counts, 1), 0) < 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_counts');
  END IF;

  -- All-or-nothing validation (was: silently drop invalid entries and still record the payment).
  FOREACH c IN ARRAY p_comparison_counts LOOP
    IF c IS NULL OR c NOT IN (1, 3, 4, 6) THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'invalid_counts', 'rejected', c);
    END IF;
  END LOOP;

  INSERT INTO public.hairstyle_analysis_usage (user_id, month_key, month_count, paid_credit_queue)
    VALUES (p_user_id, '', 0, '{}')
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO r FROM public.hairstyle_analysis_usage WHERE user_id = p_user_id FOR UPDATE;

  new_queue := COALESCE(r.paid_credit_queue, '{}') || p_comparison_counts;

  UPDATE public.hairstyle_analysis_usage
     SET paid_credit_queue = new_queue, updated_at = now()
   WHERE user_id = p_user_id;

  INSERT INTO public.hairstyle_analysis_purchase_grants (stripe_payment_intent_id, user_id)
    VALUES (p_payment_intent_id, p_user_id);

  RETURN jsonb_build_object('ok', true, 'granted', p_comparison_counts,
                            'paid_remaining', COALESCE(array_length(new_queue, 1), 0));
END;
$function$;

-- Refund path must accept the same sizes, otherwise a failed 4-comparison analysis is never refunded.
CREATE OR REPLACE FUNCTION public.hairstyle_analysis_refund_consume(
  p_user_id uuid, p_month_key text, p_source text DEFAULT 'monthly'::text, p_comparison_count integer DEFAULT NULL::integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  r public.hairstyle_analysis_usage;
  new_queue integer[];
BEGIN
  SELECT * INTO r FROM public.hairstyle_analysis_usage WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF p_source = 'paid' THEN
    IF p_comparison_count IS NULL OR p_comparison_count NOT IN (1, 3, 4, 6) THEN
      RETURN;
    END IF;
    new_queue := array_prepend(p_comparison_count, COALESCE(r.paid_credit_queue, '{}'));
    UPDATE public.hairstyle_analysis_usage
       SET paid_credit_queue = new_queue, updated_at = now()
     WHERE user_id = p_user_id;
    RETURN;
  END IF;

  IF r.month_key IS DISTINCT FROM p_month_key OR r.month_count < 1 THEN
    RETURN;
  END IF;

  UPDATE public.hairstyle_analysis_usage
     SET month_count = r.month_count - 1, updated_at = now()
   WHERE user_id = p_user_id;
END;
$function$;

-- CREATE OR REPLACE keeps existing privileges; re-assert least privilege in case M1A was not applied first.
REVOKE EXECUTE ON FUNCTION public.hairstyle_analysis_grant_purchase_credits(uuid, text, integer[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid, text, text, integer)      FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.hairstyle_analysis_grant_purchase_credits(uuid, text, integer[]) TO service_role;
GRANT  EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume(uuid, text, text, integer)      TO service_role;

COMMIT;

-- Application follow-up (S0B-2, not SQL): api/stripe/webhook.ts:280-295 should alert (not only
-- console.error) when grant.ok === false, so a rejected grant is visible to an admin.
