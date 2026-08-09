-- PSA Today paid lesson entitlements (3 watches + 1 calendar year per redemption).

CREATE TABLE IF NOT EXISTS public.psa_episode_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  episode_id text NOT NULL,
  content_id text NOT NULL,
  access_source text NOT NULL DEFAULT 'slay-ticket'
    CHECK (access_source IN ('slay-ticket', 'member', 'purchase', 'admin', 'free')),
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  total_watches integer NOT NULL DEFAULT 3 CHECK (total_watches >= 0),
  watches_used integer NOT NULL DEFAULT 0 CHECK (watches_used >= 0),
  pending_watch_seconds numeric NOT NULL DEFAULT 0 CHECK (pending_watch_seconds >= 0),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'watches-exhausted', 'expired', 'revoked')),
  slay_ticket_cost_at_redemption integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS psa_episode_entitlements_user_episode_idx
  ON public.psa_episode_entitlements (user_id, episode_id, redeemed_at DESC);

CREATE TABLE IF NOT EXISTS public.psa_watch_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id uuid NOT NULL REFERENCES public.psa_episode_entitlements (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  episode_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now(),
  actual_watched_seconds numeric NOT NULL DEFAULT 0 CHECK (actual_watched_seconds >= 0),
  qualification_threshold_seconds numeric NOT NULL DEFAULT 0 CHECK (qualification_threshold_seconds >= 0),
  qualified boolean NOT NULL DEFAULT false,
  consumed_watch_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS psa_watch_sessions_entitlement_idx
  ON public.psa_watch_sessions (entitlement_id, started_at DESC);

CREATE INDEX IF NOT EXISTS psa_watch_sessions_user_open_idx
  ON public.psa_watch_sessions (user_id, episode_id)
  WHERE closed_at IS NULL;

ALTER TABLE public.psa_episode_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psa_watch_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS psa_episode_entitlements_select_own ON public.psa_episode_entitlements;
CREATE POLICY psa_episode_entitlements_select_own ON public.psa_episode_entitlements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS psa_watch_sessions_select_own ON public.psa_watch_sessions;
CREATE POLICY psa_watch_sessions_select_own ON public.psa_watch_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.psa_episode_entitlements IS 'PSA Today paid lesson access: watches + calendar-year expiration per redemption.';
COMMENT ON TABLE public.psa_watch_sessions IS 'PSA Today paid viewing sessions — actual playback time toward one-third watch qualification.';

CREATE OR REPLACE FUNCTION public.psa_consume_watch_if_qualified (
  p_session_id uuid,
  p_user_id uuid
)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
DECLARE
  v_session public.psa_watch_sessions%ROWTYPE;
  v_ent public.psa_episode_entitlements%ROWTYPE;
  v_total numeric;
BEGIN
  SELECT *
  INTO v_session
  FROM public.psa_watch_sessions
  WHERE id = p_session_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND OR v_session.consumed_watch_at IS NOT NULL THEN
    RETURN false;
  END IF;

  SELECT *
  INTO v_ent
  FROM public.psa_episode_entitlements
  WHERE id = v_session.entitlement_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_total := coalesce(v_ent.pending_watch_seconds, 0) + coalesce(v_session.actual_watched_seconds, 0);

  IF v_total < v_session.qualification_threshold_seconds THEN
    RETURN false;
  END IF;

  IF v_ent.watches_used >= v_ent.total_watches THEN
    RETURN false;
  END IF;

  UPDATE public.psa_episode_entitlements
  SET
    watches_used = watches_used + 1,
    pending_watch_seconds = 0,
    status = CASE
      WHEN watches_used + 1 >= total_watches THEN 'watches-exhausted'
      ELSE status
    END
  WHERE id = v_ent.id;

  UPDATE public.psa_watch_sessions
  SET
    qualified = true,
    consumed_watch_at = now(),
    last_active_at = now()
  WHERE id = p_session_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.psa_consume_watch_if_qualified (uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.psa_consume_watch_if_qualified (uuid, uuid) TO service_role;

