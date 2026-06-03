-- PSA chat engagement counters (service role / API only; not client-writable).

CREATE TABLE IF NOT EXISTS public.psa_message_usage (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  month_key text NOT NULL DEFAULT '',
  month_count integer NOT NULL DEFAULT 0 CHECK (month_count >= 0),
  day_key text NOT NULL DEFAULT '',
  day_count integer NOT NULL DEFAULT 0 CHECK (day_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS psa_message_usage_updated
  ON public.psa_message_usage (updated_at DESC);

ALTER TABLE public.psa_message_usage ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.psa_message_usage IS 'PSA chat message counts per member; writes via psa_try_consume_message RPC (service role).';

CREATE OR REPLACE FUNCTION public.psa_try_consume_message (
  p_user_id uuid,
  p_month_key text,
  p_day_key text,
  p_month_limit integer,
  p_day_limit integer
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
DECLARE
  r public.psa_message_usage;
  next_month_count integer;
  next_day_count integer;
BEGIN
  IF p_month_limit < 1 OR p_day_limit < 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'monthly', 'month_count', 0, 'month_limit', p_month_limit, 'day_count', 0, 'day_limit', p_day_limit);
  END IF;

  INSERT INTO public.psa_message_usage (user_id, month_key, month_count, day_key, day_count)
    VALUES (p_user_id, p_month_key, 0, p_day_key, 0)
  ON CONFLICT (user_id)
    DO NOTHING;

  SELECT *
    INTO r
    FROM public.psa_message_usage
   WHERE user_id = p_user_id
     FOR UPDATE;

  IF r.month_key IS DISTINCT FROM p_month_key THEN
    r.month_key := p_month_key;
    r.month_count := 0;
  END IF;

  IF r.day_key IS DISTINCT FROM p_day_key THEN
    r.day_key := p_day_key;
    r.day_count := 0;
  END IF;

  IF r.month_count >= p_month_limit THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'monthly',
      'month_count', r.month_count,
      'month_limit', p_month_limit,
      'day_count', r.day_count,
      'day_limit', p_day_limit
    );
  END IF;

  IF r.day_count >= p_day_limit THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'daily',
      'month_count', r.month_count,
      'month_limit', p_month_limit,
      'day_count', r.day_count,
      'day_limit', p_day_limit
    );
  END IF;

  next_month_count := r.month_count + 1;
  next_day_count := r.day_count + 1;

  UPDATE public.psa_message_usage
     SET month_key = p_month_key,
         month_count = next_month_count,
         day_key = p_day_key,
         day_count = next_day_count,
         updated_at = now()
   WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'month_count', next_month_count,
    'month_limit', p_month_limit,
    'day_count', next_day_count,
    'day_limit', p_day_limit
  );
END;
$$;

REVOKE ALL ON FUNCTION public.psa_try_consume_message (uuid, text, text, integer, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.psa_try_consume_message (uuid, text, text, integer, integer) TO service_role;
