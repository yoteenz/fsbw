-- Hairstyle analysis: one free generation per calendar month for 3 / 6 / 12 month subscribers.

CREATE TABLE IF NOT EXISTS public.hairstyle_analysis_usage (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  month_key text NOT NULL DEFAULT '',
  month_count integer NOT NULL DEFAULT 0 CHECK (month_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hairstyle_analysis_usage_updated
  ON public.hairstyle_analysis_usage (updated_at DESC);

ALTER TABLE public.hairstyle_analysis_usage ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.hairstyle_analysis_usage IS 'Free hairstyle analysis generations per member per UTC month; writes via hairstyle_analysis_try_consume RPC (service role).';

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
BEGIN
  IF p_month_limit < 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'monthly', 'month_count', 0, 'month_limit', p_month_limit);
  END IF;

  INSERT INTO public.hairstyle_analysis_usage (user_id, month_key, month_count)
    VALUES (p_user_id, p_month_key, 0)
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

  IF r.month_count >= p_month_limit THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'monthly',
      'month_count', r.month_count,
      'month_limit', p_month_limit
    );
  END IF;

  next_count := r.month_count + 1;

  UPDATE public.hairstyle_analysis_usage
     SET month_key = p_month_key,
         month_count = next_count,
         updated_at = now()
   WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'month_count', next_count,
    'month_limit', p_month_limit
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.hairstyle_analysis_refund_consume (
  p_user_id uuid,
  p_month_key text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
DECLARE
  r public.hairstyle_analysis_usage;
BEGIN
  SELECT *
    INTO r
    FROM public.hairstyle_analysis_usage
   WHERE user_id = p_user_id
     FOR UPDATE;

  IF NOT FOUND OR r.month_key IS DISTINCT FROM p_month_key OR r.month_count < 1 THEN
    RETURN;
  END IF;

  UPDATE public.hairstyle_analysis_usage
     SET month_count = r.month_count - 1,
         updated_at = now()
   WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.hairstyle_analysis_try_consume (uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hairstyle_analysis_refund_consume (uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_try_consume (uuid, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.hairstyle_analysis_refund_consume (uuid, text) TO service_role;
