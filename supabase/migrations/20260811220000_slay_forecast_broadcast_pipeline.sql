-- Slay Forecast Broadcast Generation Pipeline v1
-- Continuity assets, scripts, generation jobs, broadcast packages.
-- Admin/service-role writes; public reads approved packages via SECURITY DEFINER RPC.

-- ---------------------------------------------------------------------------
-- Continuity versions (permanent resting clip + boundary frames)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slay_forecast_continuity_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_slug text NOT NULL UNIQUE,
  version_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'retired')),
  studio_master_image_url text,
  resting_video_url text,
  resting_first_frame_url text,
  resting_last_frame_url text,
  resting_poster_url text,
  voice_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  prompt_template_version text NOT NULL DEFAULT 'opening-template-v1',
  approved_by text,
  approved_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS slay_forecast_continuity_status_idx
  ON public.slay_forecast_continuity_versions (status);

-- ---------------------------------------------------------------------------
-- PSA broadcast scripts (per edition)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slay_forecast_broadcast_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_slug text NOT NULL,
  opening_script text NOT NULL DEFAULT '',
  closing_script text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'outdated')),
  version integer NOT NULL DEFAULT 1,
  approved_by text,
  approved_at timestamptz,
  is_test boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS slay_forecast_broadcast_scripts_edition_idx
  ON public.slay_forecast_broadcast_scripts (edition_slug, version DESC);

-- ---------------------------------------------------------------------------
-- Generation jobs (opening / closing attempts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slay_forecast_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_slug text NOT NULL,
  segment_type text NOT NULL CHECK (segment_type IN ('opening', 'closing')),
  attempt_number integer NOT NULL DEFAULT 1,
  provider text NOT NULL DEFAULT 'mock',
  model_id text,
  continuity_version_id uuid REFERENCES public.slay_forecast_continuity_versions (id) ON DELETE SET NULL,
  script_id uuid REFERENCES public.slay_forecast_broadcast_scripts (id) ON DELETE SET NULL,
  script_version integer,
  prompt_template_version text NOT NULL DEFAULT 'opening-template-v1',
  prompt_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  start_frame_url text,
  end_frame_url text,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'generating', 'completed', 'failed', 'rejected', 'approved')),
  provider_job_id text,
  output_source_url text,
  output_optimized_url text,
  duration_seconds numeric,
  estimated_cost numeric,
  actual_cost numeric,
  is_test boolean NOT NULL DEFAULT false,
  generation_notes text,
  error text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (edition_slug, segment_type, attempt_number)
);

CREATE INDEX IF NOT EXISTS slay_forecast_generation_jobs_edition_idx
  ON public.slay_forecast_generation_jobs (edition_slug, segment_type, created_at DESC);

CREATE INDEX IF NOT EXISTS slay_forecast_generation_jobs_active_idx
  ON public.slay_forecast_generation_jobs (edition_slug, segment_type, status)
  WHERE status IN ('queued', 'generating');

-- ---------------------------------------------------------------------------
-- Broadcast packages (assembled forecast broadcast)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slay_forecast_broadcast_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_slug text NOT NULL,
  continuity_version_id uuid REFERENCES public.slay_forecast_continuity_versions (id) ON DELETE SET NULL,
  opening_job_id uuid REFERENCES public.slay_forecast_generation_jobs (id) ON DELETE SET NULL,
  closing_job_id uuid REFERENCES public.slay_forecast_generation_jobs (id) ON DELETE SET NULL,
  resting_asset_url text,
  script_id uuid REFERENCES public.slay_forecast_broadcast_scripts (id) ON DELETE SET NULL,
  script_version integer,
  broadcast_timeline jsonb NOT NULL DEFAULT '{}'::jsonb,
  overlay_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ready_for_review', 'approved', 'published')),
  rejection_reason text,
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS slay_forecast_broadcast_packages_edition_published_idx
  ON public.slay_forecast_broadcast_packages (edition_slug)
  WHERE status = 'published' AND is_demo = false;

CREATE INDEX IF NOT EXISTS slay_forecast_broadcast_packages_edition_idx
  ON public.slay_forecast_broadcast_packages (edition_slug, updated_at DESC);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slay_forecast_broadcast_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- RLS — service role only (admin API)
-- ---------------------------------------------------------------------------
ALTER TABLE public.slay_forecast_continuity_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slay_forecast_broadcast_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slay_forecast_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slay_forecast_broadcast_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slay_forecast_broadcast_audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'slay_forecast_continuity_versions' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON public.slay_forecast_continuity_versions FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'slay_forecast_broadcast_scripts' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON public.slay_forecast_broadcast_scripts FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'slay_forecast_generation_jobs' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON public.slay_forecast_generation_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'slay_forecast_broadcast_packages' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON public.slay_forecast_broadcast_packages FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'slay_forecast_broadcast_audit_log' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON public.slay_forecast_broadcast_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Public projection — published packages only (non-demo)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.slay_forecast_public_broadcast_package(p_edition_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pkg record;
  opening_url text;
  closing_url text;
BEGIN
  SELECT p.*, cv.resting_video_url AS continuity_resting
  INTO pkg
  FROM slay_forecast_broadcast_packages p
  LEFT JOIN slay_forecast_continuity_versions cv ON cv.id = p.continuity_version_id
  WHERE p.edition_slug = p_edition_slug
    AND p.status = 'published'
    AND p.is_demo = false
  ORDER BY p.published_at DESC NULLS LAST
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('editionSlug', p_edition_slug, 'package', null);
  END IF;

  SELECT COALESCE(j.output_optimized_url, j.output_source_url)
  INTO opening_url
  FROM slay_forecast_generation_jobs j
  WHERE j.id = pkg.opening_job_id;

  SELECT COALESCE(j.output_optimized_url, j.output_source_url)
  INTO closing_url
  FROM slay_forecast_generation_jobs j
  WHERE j.id = pkg.closing_job_id;

  RETURN jsonb_build_object(
    'editionSlug', p_edition_slug,
    'package', jsonb_build_object(
      'id', pkg.id,
      'editionSlug', pkg.edition_slug,
      'continuityVersionId', pkg.continuity_version_id,
      'openingAsset', opening_url,
      'restingAsset', COALESCE(pkg.resting_asset_url, pkg.continuity_resting),
      'closingAsset', closing_url,
      'broadcastTimeline', pkg.broadcast_timeline,
      'overlayData', pkg.overlay_data,
      'scriptVersion', pkg.script_version,
      'publishedAt', pkg.published_at
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.slay_forecast_public_broadcast_package(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.slay_forecast_public_broadcast_package(text) TO anon, authenticated, service_role;
