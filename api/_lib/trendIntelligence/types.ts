import type {
  AutomationStatus,
  CandidateStatus,
  EditorialConfidence,
  ForecastCallStatus,
  ForecastHorizon,
  OutcomeStatus,
  SourceLayerType,
  SourceReliability,
  TrendCategory,
  TrendMomentum,
} from './constants.js';

export type TrendSourceRow = {
  id: string;
  slug: string;
  name: string;
  source_type: string;
  domain: string | null;
  adapter_type: string;
  reliability: SourceReliability;
  automation_status: AutomationStatus;
  enabled: boolean;
  notes: string | null;
  is_demo: boolean;
};

export type TrendRawSignalRow = {
  id: string;
  source_id: string | null;
  source_type: string;
  source_provider: string | null;
  source_url: string | null;
  source_title: string | null;
  source_publisher: string | null;
  observed_at: string;
  captured_at: string;
  category: string;
  signal_type: string;
  title: string;
  summary: string;
  observed_value: number | null;
  previous_value: number | null;
  change_value: number | null;
  change_percent: number | null;
  qualitative_strength: string | null;
  geographic_scope: string | null;
  audience_scope: string | null;
  event_id: string | null;
  reliability_level: SourceReliability;
  public_attribution_allowed: boolean;
  notes: string | null;
  status: string;
  is_demo: boolean;
  created_by: string | null;
};

export type TrendCandidateRow = {
  id: string;
  slug: string;
  name: string;
  canonical_label: string;
  primary_category: TrendCategory | string;
  tags: string[];
  description: string | null;
  first_observed_at: string | null;
  last_observed_at: string | null;
  status: CandidateStatus;
  current_momentum: TrendMomentum;
  previous_momentum: TrendMomentum | null;
  forecast_horizon: ForecastHorizon | null;
  signal_strength: string | null;
  editorial_confidence: EditorialConfidence | null;
  persistence_score: number | null;
  cross_source_score: number | null;
  cultural_impact_score: number | null;
  fs_first_party_score: number | null;
  source_layer_coverage: SourceLayerType[] | string[];
  scoring_version: string;
  dismiss_reason: string | null;
  editorial_notes: string | null;
  is_demo: boolean;
};

export type TrendSignalRow = {
  id: string;
  candidate_id: string | null;
  slug: string;
  canonical_label: string;
  primary_category: string;
  tags: string[];
  public_momentum: TrendMomentum;
  public_summary: string;
  internal_summary: string | null;
  editorial_confidence: EditorialConfidence | null;
  forecast_horizon: ForecastHorizon | null;
  status: string;
  is_demo: boolean;
  approved_by: string | null;
  approved_at: string | null;
};

export type ForecastCallRow = {
  id: string;
  trend_signal_id: string;
  prediction: string;
  horizon: ForecastHorizon;
  momentum_at_prediction: TrendMomentum;
  confidence: EditorialConfidence;
  rationale: string;
  public_rationale: string | null;
  status: ForecastCallStatus;
  evidence_snapshot_ids: string[];
  related_trend_report_ids: string[];
  scoring_version: string;
  is_demo: boolean;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  outcome_status: OutcomeStatus | null;
  outcome_summary: string | null;
  evaluated_at: string | null;
};

export type ManualRawSignalInput = {
  sourceType: string;
  sourceProvider?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sourcePublisher?: string;
  observedAt: string;
  category: TrendCategory | string;
  signalType?: string;
  title: string;
  summary: string;
  observedValue?: number;
  previousValue?: number;
  qualitativeStrength?: string;
  reliabilityLevel?: SourceReliability;
  geographicScope?: string;
  audienceScope?: string;
  eventId?: string;
  notes?: string;
  publicAttributionAllowed?: boolean;
  candidateId?: string;
  createCandidate?: {
    name: string;
    canonicalLabel: string;
    primaryCategory: TrendCategory | string;
    tags?: string[];
  };
  isDemo?: boolean;
};

export type PublicForecastSignalPayload = {
  category: string;
  label: string;
  momentum: string;
  prediction: string;
  horizon: string;
  confidence: string;
  publicRationale: string;
  trendSignalId: string;
};

export type PublicForecastPayload = {
  editionSlug: string;
  signals: PublicForecastSignalPayload[];
};

export type PublicReportSignalPayload = {
  id: string;
  label: string;
  category: string;
  momentum: string;
  summary: string;
  confidence: string | null;
  evidenceSummary: string | null;
};

export type PublicReportPayload = {
  packId: string;
  status?: string;
  signals: PublicReportSignalPayload[];
};

export type PsaBriefPayload = {
  editionSlug: string;
  headline: string;
  periodLabel?: string;
  primaryCalls: Array<{
    label: string;
    category: string;
    momentum: string;
    prediction: string;
  }>;
  onRadar?: string[];
  openingDirection: string;
  closingDirection: string;
  overlaySignals: Array<{
    category: string;
    label: string;
    momentum: string;
  }>;
};
