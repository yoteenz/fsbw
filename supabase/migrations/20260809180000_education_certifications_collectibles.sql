-- Education certifications, collectibles, episode completions (server-authoritative).

CREATE TABLE IF NOT EXISTS public.collectible_definitions (
  id text PRIMARY KEY,
  type text NOT NULL,
  mastery_id text,
  season_id text,
  title text NOT NULL,
  description text,
  asset_url text,
  thumbnail_url text,
  transparent_asset_url text,
  locked_asset_url text,
  earned_asset_url text,
  rarity text,
  display_style text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.education_episode_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  episode_ref_id text NOT NULL,
  episode_type text NOT NULL CHECK (episode_type IN ('psa-today', 'care-lesson')),
  season_id text,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_ref_id)
);

CREATE INDEX IF NOT EXISTS education_episode_completions_user_idx
  ON public.education_episode_completions (user_id, season_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS public.education_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  mastery_id text NOT NULL,
  season_id text NOT NULL,
  certification_code text NOT NULL UNIQUE,
  title text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  season_version text NOT NULL DEFAULT '1',
  completed_episode_ids text[] NOT NULL DEFAULT '{}',
  collectible_id text REFERENCES public.collectible_definitions (id),
  certification_reveal_seen_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id, season_version)
);

CREATE INDEX IF NOT EXISTS education_certifications_user_idx
  ON public.education_certifications (user_id, status, issued_at DESC);

CREATE INDEX IF NOT EXISTS education_certifications_code_idx
  ON public.education_certifications (certification_code);

CREATE TABLE IF NOT EXISTS public.user_collectibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  collectible_id text NOT NULL REFERENCES public.collectible_definitions (id),
  source_type text NOT NULL
    CHECK (source_type IN ('education', 'slay-challenge', 'reward', 'promotion', 'special')),
  source_id text,
  earned_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'earned' CHECK (status IN ('earned', 'revoked')),
  display_slot_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, collectible_id, source_id)
);

CREATE INDEX IF NOT EXISTS user_collectibles_user_idx
  ON public.user_collectibles (user_id, status, earned_at DESC);

ALTER TABLE public.collectible_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_episode_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collectibles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS collectible_definitions_select_all ON public.collectible_definitions;
CREATE POLICY collectible_definitions_select_all ON public.collectible_definitions
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS education_episode_completions_select_own ON public.education_episode_completions;
CREATE POLICY education_episode_completions_select_own ON public.education_episode_completions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS education_episode_completions_insert_own ON public.education_episode_completions;
CREATE POLICY education_episode_completions_insert_own ON public.education_episode_completions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS education_certifications_select_own ON public.education_certifications;
CREATE POLICY education_certifications_select_own ON public.education_certifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_collectibles_select_own ON public.user_collectibles;
CREATE POLICY user_collectibles_select_own ON public.user_collectibles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Seed placeholder collectible definition (artwork TBD).
INSERT INTO public.collectible_definitions (
  id, type, mastery_id, season_id, title, description, display_style, rarity, metadata
) VALUES (
  'collectible-season-cert-lace-s2',
  'season-certification',
  'mastery-lace',
  'season-lace-02-customize-your-lace',
  'Customize Your Lace',
  'Frontal Slayer Season Certification — Lace Mastery Season 2',
  'crystal-plaque',
  'season-certification',
  '{"visualLanguage":["crystal-acrylic","white-marble","chrome","crimson-rose","red-foil"],"certificateLabel":"CERTIFICATE OF MASTERY"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.education_certifications IS 'Verified season completion credentials — source of truth for certifications.';
COMMENT ON TABLE public.user_collectibles IS 'Generalized earned collectible ownership across education, slay challenge, rewards.';
COMMENT ON TABLE public.education_episode_completions IS 'Server-authoritative episode completion for certification eligibility.';
