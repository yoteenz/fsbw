/** Studio Builder™ — Creative Approval Pipeline™ types. */

import type { PipelineStageId } from './pipeline-definition';

export type PipelineStageStatus =
  | 'locked'
  | 'preparing'
  | 'ready'
  | 'generating'
  | 'review'
  | 'approved'
  | 'failed';

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
  updatedAt: string;
};

export type PipelineHistoryEntry = {
  id: string;
  stageId: PipelineStageId;
  action: 'generate' | 'approve' | 'regenerate' | 'branch' | 'unlock' | 'invalidate';
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
