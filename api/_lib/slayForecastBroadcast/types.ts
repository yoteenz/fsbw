export type ContinuityStatus = 'draft' | 'approved' | 'retired';
export type ScriptStatus = 'draft' | 'approved' | 'outdated';
export type GenerationSegmentType = 'opening' | 'closing' | 'full';
export type GenerationJobStatus =
  | 'queued'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'approved';
export type BroadcastPackageStatus = 'draft' | 'ready_for_review' | 'approved' | 'published';

export type GenerationProviderId = 'mock' | 'fal' | 'minimax' | 'openart';

export type GenerationModelCapability = {
  provider: GenerationProviderId;
  modelId: string;
  supportsStartFrame: boolean;
  supportsEndFrame: boolean;
  supportsAudio: boolean;
  supportsLipSync: boolean;
  supportsDuration: boolean;
  supportsSeed: boolean;
  supportsNegativePrompt: boolean;
};

export type BroadcastTimelineSignal = {
  signalId: string;
  revealAt: number;
  emphasisAt?: number;
};

export type BroadcastTimeline = {
  openingEnd: number;
  signals: BroadcastTimelineSignal[];
  closingStart: number;
  restingLoopDurationSec?: number;
  seamCrossfadeMs?: number;
};

export type ContinuityVersionRow = {
  id: string;
  version_slug: string;
  version_number: number;
  status: ContinuityStatus;
  studio_master_image_url: string | null;
  resting_video_url: string | null;
  resting_first_frame_url: string | null;
  resting_last_frame_url: string | null;
  resting_poster_url: string | null;
  voice_config: Record<string, unknown>;
  prompt_template_version: string;
  approved_by: string | null;
  approved_at: string | null;
  is_demo: boolean;
  notes: string | null;
};

export type BroadcastScriptRow = {
  id: string;
  edition_slug: string;
  opening_script: string;
  closing_script: string;
  status: ScriptStatus;
  version: number;
  approved_by: string | null;
  approved_at: string | null;
  is_test: boolean;
};

export type GenerationJobRow = {
  id: string;
  edition_slug: string;
  segment_type: GenerationSegmentType;
  attempt_number: number;
  provider: string;
  model_id: string | null;
  continuity_version_id: string | null;
  script_id: string | null;
  script_version: number | null;
  prompt_template_version: string;
  prompt_snapshot: Record<string, unknown>;
  start_frame_url: string | null;
  end_frame_url: string | null;
  status: GenerationJobStatus;
  provider_job_id: string | null;
  output_source_url: string | null;
  output_optimized_url: string | null;
  duration_seconds: number | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  is_test: boolean;
  generation_notes: string | null;
  error: string | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
};

export type BroadcastPackageRow = {
  id: string;
  edition_slug: string;
  continuity_version_id: string | null;
  opening_job_id: string | null;
  closing_job_id: string | null;
  full_job_id: string | null;
  resting_asset_url: string | null;
  script_id: string | null;
  script_version: number | null;
  broadcast_timeline: BroadcastTimeline;
  overlay_data: unknown[];
  status: BroadcastPackageStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  is_demo: boolean;
};

export type PublicBroadcastPackage = {
  id: string;
  editionSlug: string;
  continuityVersionId: string | null;
  openingAsset: string | null;
  restingAsset: string | null;
  closingAsset: string | null;
  /** Single continuous 15s take — preferred when published. */
  fullBroadcastAsset: string | null;
  broadcastTimeline: BroadcastTimeline;
  overlayData: unknown[];
  scriptVersion: number | null;
  publishedAt: string | null;
};

export type ScriptDurationEstimate = {
  wordCount: number;
  estimatedSeconds: number;
  withinRange: boolean;
  minSeconds: number;
  maxSeconds: number;
  warning?: string;
};

export type SeamDiagnostic = {
  segmentA: string;
  segmentB: string;
  differenceScore: number | null;
  note: string;
};

export type EpisodeWorkflowStatus =
  | 'intelligence_ready'
  | 'script_draft'
  | 'script_review'
  | 'ready_to_generate'
  | 'generating'
  | 'video_ready'
  | 'awaiting_approval'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'generation_failed';

export type EpisodeSignal = {
  id: string;
  label: string;
  direction: 'RISING' | 'ACCELERATING' | 'HOLDING' | 'COOLING' | 'EMERGING';
  strength?: string;
  supportingEvidence?: string;
  confidence?: 'low' | 'medium' | 'high';
  displayPriority?: number;
};

export type SlayForecastEpisodeRow = {
  id: string;
  edition_slug: string;
  week_start: string | null;
  week_end: string | null;
  display_date_range: string | null;
  headline: string;
  summary: string | null;
  opening_dialogue: string;
  closing_dialogue: string;
  signals: EpisodeSignal[];
  workflow_status: EpisodeWorkflowStatus;
  generation_job_id: string | null;
  review_status: string | null;
  approved_at: string | null;
  publish_status: string | null;
  published_at: string | null;
  prompt_version: string;
  master_asset_version: string;
  created_at: string;
  updated_at: string;
};

export type GenerateSegmentInput = {
  editionSlug: string;
  segmentType: GenerationSegmentType;
  provider?: GenerationProviderId;
  modelId?: string;
  isTest?: boolean;
  generationNotes?: string;
  forceNewAttempt?: boolean;
};

export type GenerateFullBroadcastInput = {
  editionSlug: string;
  provider?: GenerationProviderId;
  isTest?: boolean;
  generationNotes?: string;
  forceNewAttempt?: boolean;
};
