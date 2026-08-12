-- Slay Forecast Weekly Video Generation v2
-- Continuous 15s MiniMax H3 take + episode workflow + full_job on packages.

-- Extend generation jobs for continuous 'full' segment
ALTER TABLE public.slay_forecast_generation_jobs
  DROP CONSTRAINT IF EXISTS slay_forecast_generation_jobs_segment_type_check;

ALTER TABLE public.slay_forecast_generation_jobs
  ADD CONSTRAINT slay_forecast_generation_jobs_segment_type_check
  CHECK (segment_type IN ('opening', 'closing', 'full'));

-- Broadcast packages: link approved continuous take
ALTER TABLE public.slay_forecast_broadcast_packages
  ADD COLUMN IF NOT EXISTS full_job_id uuid REFERENCES public.slay_forecast_generation_jobs (id) ON DELETE SET NULL;

-- Weekly episode production model
CREATE TABLE IF NOT EXISTS public.slay_forecast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_slug text NOT NULL UNIQUE,
  week_start date,
  week_end date,
  display_date_range text,
  headline text NOT NULL DEFAULT '',
  summary text,
  opening_dialogue text NOT NULL DEFAULT '',
  closing_dialogue text NOT NULL DEFAULT '',
  signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  workflow_status text NOT NULL DEFAULT 'script_draft'
    CHECK (workflow_status IN (
      'intelligence_ready',
      'script_draft',
      'script_review',
      'ready_to_generate',
      'generating',
      'video_ready',
      'awaiting_approval',
      'approved',
      'scheduled',
      'published',
      'generation_failed'
    )),
  generation_job_id uuid REFERENCES public.slay_forecast_generation_jobs (id) ON DELETE SET NULL,
  review_status text,
  approved_at timestamptz,
  publish_status text,
  published_at timestamptz,
  prompt_version text NOT NULL DEFAULT 'SLAY_FORECAST_GOLDEN_V1',
  master_asset_version text NOT NULL DEFAULT 'PSA_FORECAST_MASTER_V1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS slay_forecast_episodes_workflow_idx
  ON public.slay_forecast_episodes (workflow_status, updated_at DESC);

ALTER TABLE public.slay_forecast_episodes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'slay_forecast_episodes' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON public.slay_forecast_episodes FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed canonical master image continuity (v1)
INSERT INTO public.slay_forecast_continuity_versions (
  version_slug,
  version_number,
  status,
  studio_master_image_url,
  resting_poster_url,
  prompt_template_version,
  is_demo,
  notes,
  approved_by,
  approved_at
)
VALUES (
  'psa-forecast-master-v1',
  1,
  'approved',
  ('https://' || 'hyycomvcaqxxvyrfupes' || '.supabase.co/storage/v1/object/public/live-preview/3D%20Stock/Lounge/F5C94CE3-DF1B-4B42-9ECD-BA3768B93A10.png'),
  ('https://' || 'hyycomvcaqxxvyrfupes' || '.supabase.co/storage/v1/object/public/live-preview/3D%20Stock/Lounge/F5C94CE3-DF1B-4B42-9ECD-BA3768B93A10.png'),
  'SLAY_FORECAST_GOLDEN_V1',
  false,
  'Canonical PSA Slay Forecast master image — production locked.',
  'system-migration',
  now()
)
ON CONFLICT (version_slug) DO UPDATE SET
  studio_master_image_url = EXCLUDED.studio_master_image_url,
  resting_poster_url = EXCLUDED.resting_poster_url,
  prompt_template_version = EXCLUDED.prompt_template_version,
  status = 'approved',
  updated_at = now();

-- Public projection — prefer full continuous asset when published
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
  full_url text;
BEGIN
  SELECT p.*, cv.resting_video_url AS continuity_resting, cv.studio_master_image_url AS continuity_poster
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

  IF pkg.full_job_id IS NOT NULL THEN
    SELECT COALESCE(j.output_optimized_url, j.output_source_url)
    INTO full_url
    FROM slay_forecast_generation_jobs j
    WHERE j.id = pkg.full_job_id;
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
      'fullBroadcastAsset', full_url,
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
