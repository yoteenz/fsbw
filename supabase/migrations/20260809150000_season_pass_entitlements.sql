-- Season Pass entitlements + season-pass PSA episode access source.

CREATE TABLE IF NOT EXISTS public.season_pass_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  mastery_id text NOT NULL,
  season_id text NOT NULL,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  access_source text NOT NULL DEFAULT 'slay-ticket'
    CHECK (access_source IN ('slay-ticket', 'member', 'promotion', 'admin')),
  slay_ticket_cost_at_purchase integer,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id)
);

CREATE INDEX IF NOT EXISTS season_pass_entitlements_user_idx
  ON public.season_pass_entitlements (user_id, status, acquired_at DESC);

ALTER TABLE public.season_pass_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS season_pass_entitlements_select_own ON public.season_pass_entitlements;
CREATE POLICY season_pass_entitlements_select_own ON public.season_pass_entitlements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.season_pass_entitlements IS 'Full-season prepaid access; released episodes grant PSA entitlements idempotently.';

-- Allow season-pass as PSA episode access source.
ALTER TABLE public.psa_episode_entitlements
  DROP CONSTRAINT IF EXISTS psa_episode_entitlements_access_source_check;

ALTER TABLE public.psa_episode_entitlements
  ADD CONSTRAINT psa_episode_entitlements_access_source_check
  CHECK (access_source IN ('slay-ticket', 'member', 'purchase', 'admin', 'free', 'season-pass'));
