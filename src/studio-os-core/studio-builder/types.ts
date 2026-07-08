/** Studio Builder™ — generation types (department-agnostic). */

export type GenerationJobStatus =
  | 'queued'
  | 'generating'
  | 'validating'
  | 'complete'
  | 'failed';

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
