-- FS Trend Intelligence v1 — editorial evidence, candidates, approved signals, forecast calls.
-- Idempotent DDL; admin/service-role writes; public reads via SECURITY DEFINER functions only.

-- ---------------------------------------------------------------------------
-- Source registry
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  source_type text NOT NULL,
  domain text,
  adapter_type text NOT NULL DEFAULT 'manual',
  reliability text NOT NULL DEFAULT 'unknown'
    CHECK (reliability IN ('high', 'medium', 'low', 'unknown')),
  automation_status text NOT NULL DEFAULT 'manual'
    CHECK (automation_status IN ('manual', 'available', 'planned', 'disabled')),
  enabled boolean NOT NULL DEFAULT true,
  notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trend_sources_type_idx ON public.trend_sources (source_type);

-- ---------------------------------------------------------------------------
-- Cultural / seasonal events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  event_type text NOT NULL,
  start_date date,
  end_date date,
  description text,
  relevance_tags text[] NOT NULL DEFAULT '{}',
  source_urls text[] NOT NULL DEFAULT '{}',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Raw evidence signals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_raw_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.trend_sources (id) ON DELETE SET NULL,
  source_type text NOT NULL,
  source_provider text,
  source_url text,
  source_title text,
  source_publisher text,
  observed_at timestamptz NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL,
  signal_type text NOT NULL DEFAULT 'observation',
  title text NOT NULL,
  summary text NOT NULL,
  observed_value numeric,
  previous_value numeric,
  change_value numeric,
  change_percent numeric,
  qualitative_strength text,
  geographic_scope text,
  audience_scope text,
  event_id uuid REFERENCES public.trend_events (id) ON DELETE SET NULL,
  reliability_level text NOT NULL DEFAULT 'unknown'
    CHECK (reliability_level IN ('high', 'medium', 'low', 'unknown')),
  public_attribution_allowed boolean NOT NULL DEFAULT false,
  notes text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'dismissed', 'archived')),
  is_demo boolean NOT NULL DEFAULT false,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trend_raw_signals_observed_idx
  ON public.trend_raw_signals (observed_at DESC);

CREATE INDEX IF NOT EXISTS trend_raw_signals_source_url_idx
  ON public.trend_raw_signals (source_url)
  WHERE source_url IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Metric observations (time series)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_metric_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_candidate_id uuid,
  source_id uuid REFERENCES public.trend_sources (id) ON DELETE SET NULL,
  metric text NOT NULL,
  raw_value numeric,
  normalized_value numeric,
  observed_at timestamptz NOT NULL,
  period_start date,
  period_end date,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Trend candidates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  canonical_label text NOT NULL,
  primary_category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  description text,
  first_observed_at timestamptz,
  last_observed_at timestamptz,
  status text NOT NULL DEFAULT 'detected'
    CHECK (status IN (
      'detected', 'watchlist', 'approved', 'dismissed', 'merged'
    )),
  current_momentum text NOT NULL DEFAULT 'watching'
    CHECK (current_momentum IN (
      'watching', 'emerging', 'rising', 'accelerating', 'steady', 'peaking', 'cooling', 'fading'
    )),
  previous_momentum text,
  forecast_horizon text
    CHECK (forecast_horizon IS NULL OR forecast_horizon IN ('now', 'next', 'on_our_radar')),
  signal_strength text,
  editorial_confidence text
    CHECK (editorial_confidence IS NULL OR editorial_confidence IN ('low', 'medium', 'medium_high', 'high')),
  persistence_score numeric,
  cross_source_score numeric,
  cultural_impact_score numeric,
  fs_first_party_score numeric,
  source_layer_coverage text[] NOT NULL DEFAULT '{}',
  scoring_version text NOT NULL DEFAULT 'heuristic-v1',
  dismiss_reason text,
  editorial_notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trend_candidates_status_idx ON public.trend_candidates (status);
CREATE INDEX IF NOT EXISTS trend_candidates_momentum_idx ON public.trend_candidates (current_momentum);

ALTER TABLE public.trend_metric_observations
  DROP CONSTRAINT IF EXISTS trend_metric_observations_candidate_fk;

ALTER TABLE public.trend_metric_observations
  ADD CONSTRAINT trend_metric_observations_candidate_fk
  FOREIGN KEY (trend_candidate_id) REFERENCES public.trend_candidates (id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- Candidate ↔ raw signal links
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_candidate_raw_signal_links (
  candidate_id uuid NOT NULL REFERENCES public.trend_candidates (id) ON DELETE CASCADE,
  raw_signal_id uuid NOT NULL REFERENCES public.trend_raw_signals (id) ON DELETE CASCADE,
  linked_at timestamptz NOT NULL DEFAULT now(),
  linked_by text,
  PRIMARY KEY (candidate_id, raw_signal_id)
);

-- ---------------------------------------------------------------------------
-- Approved trend signals (published intelligence)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.trend_candidates (id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  canonical_label text NOT NULL,
  primary_category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  public_momentum text NOT NULL
    CHECK (public_momentum IN (
      'watching', 'emerging', 'rising', 'accelerating', 'steady', 'peaking', 'cooling', 'fading'
    )),
  public_summary text NOT NULL,
  internal_summary text,
  editorial_confidence text
    CHECK (editorial_confidence IS NULL OR editorial_confidence IN ('low', 'medium', 'medium_high', 'high')),
  forecast_horizon text
    CHECK (forecast_horizon IS NULL OR forecast_horizon IN ('now', 'next', 'on_our_radar')),
  status text NOT NULL DEFAULT 'approved'
    CHECK (status IN ('approved', 'archived')),
  is_demo boolean NOT NULL DEFAULT false,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trend_signal_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_signal_id uuid NOT NULL REFERENCES public.trend_signals (id) ON DELETE CASCADE,
  alias text NOT NULL,
  UNIQUE (trend_signal_id, alias)
);

-- ---------------------------------------------------------------------------
-- Immutable evidence snapshots
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_evidence_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_signal_id uuid REFERENCES public.trend_raw_signals (id) ON DELETE SET NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false
);

-- ---------------------------------------------------------------------------
-- Trend report intelligence links (pack_id from Lounge TV)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_report_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id text NOT NULL,
  season_label text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'published', 'archived')),
  public_dek text,
  is_demo boolean NOT NULL DEFAULT false,
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pack_id)
);

CREATE TABLE IF NOT EXISTS public.trend_report_signal_links (
  report_id uuid NOT NULL REFERENCES public.trend_report_intelligence (id) ON DELETE CASCADE,
  trend_signal_id uuid NOT NULL REFERENCES public.trend_signals (id) ON DELETE RESTRICT,
  display_order integer NOT NULL DEFAULT 0,
  evidence_snapshot_ids uuid[] NOT NULL DEFAULT '{}',
  public_evidence_summary text,
  PRIMARY KEY (report_id, trend_signal_id)
);

-- ---------------------------------------------------------------------------
-- Forecast calls + edition links
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forecast_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_signal_id uuid NOT NULL REFERENCES public.trend_signals (id) ON DELETE RESTRICT,
  prediction text NOT NULL,
  horizon text NOT NULL DEFAULT 'next'
    CHECK (horizon IN ('now', 'next', 'on_our_radar')),
  momentum_at_prediction text NOT NULL,
  confidence text NOT NULL DEFAULT 'medium'
    CHECK (confidence IN ('low', 'medium', 'medium_high', 'high')),
  rationale text NOT NULL,
  public_rationale text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'published', 'rejected', 'archived')),
  evidence_snapshot_ids uuid[] NOT NULL DEFAULT '{}',
  related_trend_report_ids text[] NOT NULL DEFAULT '{}',
  scoring_version text NOT NULL DEFAULT 'heuristic-v1',
  is_demo boolean NOT NULL DEFAULT false,
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  outcome_status text
    CHECK (outcome_status IS NULL OR outcome_status IN (
      'hit', 'partial', 'still_developing', 'early', 'missed'
    )),
  outcome_summary text,
  evaluated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forecast_edition_call_links (
  edition_slug text NOT NULL,
  forecast_call_id uuid NOT NULL REFERENCES public.forecast_calls (id) ON DELETE RESTRICT,
  overlay_category text NOT NULL,
  overlay_label text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (edition_slug, forecast_call_id)
);

CREATE TABLE IF NOT EXISTS public.forecast_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_call_id uuid NOT NULL REFERENCES public.forecast_calls (id) ON DELETE CASCADE,
  review_period_days integer NOT NULL,
  outcome_status text NOT NULL
    CHECK (outcome_status IN ('hit', 'partial', 'still_developing', 'early', 'missed')),
  observed_summary text,
  approved_by text,
  approved_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- PSA script briefs (human-approved editorial layer)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forecast_psa_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_slug text NOT NULL UNIQUE,
  headline text NOT NULL,
  opening_direction text,
  closing_direction text,
  brief_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved')),
  approved_by text,
  approved_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- AI analysis records (derivative — not evidence)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.trend_candidates (id) ON DELETE CASCADE,
  evidence_ids uuid[] NOT NULL DEFAULT '{}',
  model text,
  analysis text NOT NULL,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Scoring configuration
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_scoring_config (
  id text PRIMARY KEY DEFAULT 'heuristic-v1',
  version_label text NOT NULL DEFAULT 'EDITORIAL HEURISTIC V1',
  weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  min_fs_sample_size integer NOT NULL DEFAULT 50,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.trend_scoring_config (id, version_label, weights)
VALUES (
  'heuristic-v1',
  'EDITORIAL HEURISTIC V1',
  '{
    "searchVelocityWeight": 0.15,
    "socialVelocityWeight": 0.15,
    "editorialCoverageWeight": 0.2,
    "culturalEventWeight": 0.1,
    "firstPartyWeight": 0.2,
    "persistenceWeight": 0.1,
    "crossSourceWeight": 0.1
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Audit log (trend-specific)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  change_summary text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trend_audit_log_entity_idx
  ON public.trend_audit_log (entity_type, entity_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- RLS — service role only (admin API)
-- ---------------------------------------------------------------------------
ALTER TABLE public.trend_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_raw_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_metric_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_candidate_raw_signal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_signal_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_evidence_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_report_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_report_signal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_edition_call_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_psa_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_scoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_audit_log ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'trend_sources', 'trend_events', 'trend_raw_signals', 'trend_metric_observations',
    'trend_candidates', 'trend_candidate_raw_signal_links', 'trend_signals', 'trend_signal_aliases',
    'trend_evidence_snapshots', 'trend_report_intelligence', 'trend_report_signal_links',
    'forecast_calls', 'forecast_edition_call_links', 'forecast_outcomes', 'forecast_psa_briefs',
    'trend_ai_analyses', 'trend_scoring_config', 'trend_audit_log'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_service_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      t || '_service_all',
      t
    );
  END LOOP;
END $$;

REVOKE ALL ON public.trend_sources FROM anon, authenticated;
REVOKE ALL ON public.trend_events FROM anon, authenticated;
REVOKE ALL ON public.trend_raw_signals FROM anon, authenticated;
REVOKE ALL ON public.trend_metric_observations FROM anon, authenticated;
REVOKE ALL ON public.trend_candidates FROM anon, authenticated;
REVOKE ALL ON public.trend_candidate_raw_signal_links FROM anon, authenticated;
REVOKE ALL ON public.trend_signals FROM anon, authenticated;
REVOKE ALL ON public.trend_signal_aliases FROM anon, authenticated;
REVOKE ALL ON public.trend_evidence_snapshots FROM anon, authenticated;
REVOKE ALL ON public.trend_report_intelligence FROM anon, authenticated;
REVOKE ALL ON public.trend_report_signal_links FROM anon, authenticated;
REVOKE ALL ON public.forecast_calls FROM anon, authenticated;
REVOKE ALL ON public.forecast_edition_call_links FROM anon, authenticated;
REVOKE ALL ON public.forecast_outcomes FROM anon, authenticated;
REVOKE ALL ON public.forecast_psa_briefs FROM anon, authenticated;
REVOKE ALL ON public.trend_ai_analyses FROM anon, authenticated;
REVOKE ALL ON public.trend_scoring_config FROM anon, authenticated;
REVOKE ALL ON public.trend_audit_log FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public projection functions (approved/published only, no demo in production reads)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trend_intelligence_public_forecast_payload(p_edition_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'editionSlug', p_edition_slug,
    'signals', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'category', fel.overlay_category,
            'label', fel.overlay_label,
            'momentum', fc.momentum_at_prediction,
            'prediction', fc.prediction,
            'horizon', fc.horizon,
            'confidence', fc.confidence,
            'publicRationale', COALESCE(fc.public_rationale, fc.rationale),
            'trendSignalId', fc.trend_signal_id
          )
          ORDER BY fel.display_order
        )
        FROM public.forecast_edition_call_links fel
        JOIN public.forecast_calls fc ON fc.id = fel.forecast_call_id
        WHERE fel.edition_slug = p_edition_slug
          AND fc.status = 'published'
          AND fc.is_demo = false
      ),
      '[]'::jsonb
    )
  )
  INTO result;

  RETURN COALESCE(result, jsonb_build_object('editionSlug', p_edition_slug, 'signals', '[]'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.trend_intelligence_public_report_signals(p_pack_id text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'packId', p_pack_id,
    'status', tri.status,
    'signals', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ts.id,
            'label', ts.canonical_label,
            'category', ts.primary_category,
            'momentum', ts.public_momentum,
            'summary', ts.public_summary,
            'confidence', ts.editorial_confidence,
            'evidenceSummary', trsl.public_evidence_summary
          )
          ORDER BY trsl.display_order
        )
        FROM public.trend_report_intelligence tri
        JOIN public.trend_report_signal_links trsl ON trsl.report_id = tri.id
        JOIN public.trend_signals ts ON ts.id = trsl.trend_signal_id
        WHERE tri.pack_id = p_pack_id
          AND tri.status IN ('approved', 'published')
          AND tri.is_demo = false
          AND ts.is_demo = false
      ),
      '[]'::jsonb
    )
  )
  INTO result;

  RETURN COALESCE(result, jsonb_build_object('packId', p_pack_id, 'signals', '[]'::jsonb));
END;
$$;

GRANT EXECUTE ON FUNCTION public.trend_intelligence_public_forecast_payload(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.trend_intelligence_public_report_signals(text) TO anon, authenticated, service_role;
