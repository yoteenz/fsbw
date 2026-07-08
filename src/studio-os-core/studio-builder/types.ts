/** Studio Builder™ — Creative Approval Pipeline™ types. */

import type { PipelineStageId } from './pipeline-definition';

export type PipelineStageStatus =
  | 'locked'
  | 'preparing'
  | 'ready'
  | 'generating'
  | 'braintrust-review'
  | 'founder-review'
  | 'approved'
  | 'failed';

/** @deprecated Use founder-review */
export type LegacyReviewStatus = 'review';

export type FounderReviewPath = 'summary' | 'deep-dive' | 'self-review' | 'trust-instinct' | null;

export type SpecialistReview = {
  specialistId: string;
  role: string;
  overallScore: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  confidence: number;
};

export type CreativeReviewFollowUp = {
  question: string;
  answer: string;
  at: string;
};

export type CreativeReviewReport = {
  id: string;
  stageId: PipelineStageId;
  branchId: string;
  branchLabel: string;
  completedAt: string;
  specialists: string[];
  overallScore: number;
  significantObservations: number;
  optionalRefinements: number;
  specialistReviews: SpecialistReview[];
  consensus: string;
  recommendedAction: 'approve' | 'regenerate' | 'branch' | 'neutral';
  orbIntro: string;
  summaryBriefing: string;
  followUpThread: CreativeReviewFollowUp[];
  savedQuietly?: boolean;
};

export type PipelineBranch = {
  id: string;
  label: string;
  previewUrl?: string;
  storagePath?: string;
  compiledPrompt?: string;
  directorFeedback?: string;
  model?: string;
  createdAt: string;
  approvedAt?: string;
};

export type PipelineStageRecord = {
  stageId: PipelineStageId;
  productionGroupId: string;
  displayName: string;
  order: number;
  status: PipelineStageStatus;
  heroAssetId: string;
  activeBranchId: string;
  branches: PipelineBranch[];
  preparedPrompt?: string;
  preparedAt?: string;
  error?: string;
  approvedAt?: string;
  creativeNotes?: string;
  pendingReview: boolean;
  creativeReview?: CreativeReviewReport;
  founderReviewPath?: FounderReviewPath;
  reviewMode?: boolean;
  updatedAt: string;
};

export type PipelineHistoryEntry = {
  id: string;
  stageId: PipelineStageId;
  action: 'generate' | 'approve' | 'regenerate' | 'branch' | 'unlock' | 'invalidate' | 'braintrust' | 'founder-path';
  detail: string;
  at: string;
};

export type CreativeApprovalPipeline = {
  departmentId: string;
  packageId: string;
  projectId: string;
  stages: PipelineStageRecord[];
  history: PipelineHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type CompiledGenerationPrompt = {
  prompt: string;
  negativePrompt: string;
  promptVersion: string;
  modelPresetId: string;
  aspectRatio: string;
  outputFormat: string;
  heroAssetId: string;
  productionGroupId: string;
  genomeSummary: string;
};

export type StudioBuilderGenerateRequest = {
  departmentId: string;
  packageId: string;
  projectId: string;
  productionGroupId: string;
  workspaceId?: string;
};

export type StudioBuilderGenerateResponse = {
  ok: boolean;
  publicUrl?: string;
  storagePath?: string;
  model?: string;
  compiledPrompt?: string;
  promptVersion?: string;
  error?: string;
};

export type StudioAssetRegistryEntry = {
  id: string;
  departmentId: string;
  packageId: string;
  projectId: string;
  assetId: string;
  productionGroupId: string;
  category: string;
  publicUrl: string;
  storagePath: string;
  model: string;
  promptVersion: string;
  status: 'validated' | 'pending' | 'rejected';
  registeredAt: string;
  /** Scene Stack™ station (zone) — enables Warehouse → CDS mount without re-parsing assetId */
  stationId?: string;
  /** Scene Stack™ layer — pairs with stationId for hydration */
  layerId?: string;
};

/** @deprecated Use Creative Approval Pipeline™ */
export type GenerationJobStatus = 'queued' | 'generating' | 'validating' | 'complete' | 'failed';

/** @deprecated Use Creative Approval Pipeline™ */
export type GenerationQueueItem = {
  id: string;
  departmentId: string;
  packageId: string;
  projectId: string;
  productionGroupId: string;
  displayName: string;
  heroAssetId: string;
  status: GenerationJobStatus;
  progressPct: number;
  error?: string;
  promptVersion: string;
  compiledPrompt?: string;
  previewUrl?: string;
  storagePath?: string;
  model?: string;
  createdAt: string;
  updatedAt: string;
  attempt: number;
};

export type RegenerationImpact = {
  stageId: PipelineStageId;
  displayName: string;
  downstreamImpact: string[];
  affectedStages: Array<{ stageId: PipelineStageId; displayName: string }>;
};
