import type {
  OrchestratorProviderId,
  OrchestratorPipelineStepId,
  ContentPackAssetSlotId,
  ApprovalPipelineStatus,
  OrchestratorErrorCode,
} from '../../../utils/adminStudioOrchestratorDemo';

export type AdapterRuntimeState = {
  enabled: boolean;
  connected: boolean;
  statusMessage: string;
};

export type GenerationStepResult = {
  stepId: string;
  providerId: OrchestratorProviderId | null;
  status: 'pending' | 'running' | 'complete' | 'failed' | 'skipped';
  errorCode?: OrchestratorErrorCode;
  errorMessage?: string;
  outputPreview?: string;
};

export type ContentPackVersion = {
  versionNumber: number;
  promptUsed: string;
  providerId: OrchestratorProviderId | string;
  editorNotes: string;
  approvalHistory: string[];
  generatedAt: string;
  rollbackAvailable: boolean;
};

export type ContentPackAsset = {
  slotId: ContentPackAssetSlotId;
  label: string;
  providerId: OrchestratorProviderId;
  status: 'empty' | 'draft' | 'generated' | 'failed';
  preview: string;
};

export type OrchestratedContentPack = {
  packId: string;
  topic: string;
  pipelineStep: OrchestratorPipelineStepId;
  approvalStatus: ApprovalPipelineStatus;
  assets: ContentPackAsset[];
  versions: ContentPackVersion[];
  promptHistory: string[];
  providerUsed: OrchestratorProviderId[];
  generationTimestamp: string | null;
  steps: GenerationStepResult[];
};

export type OrchestratorRunInput = {
  topic: string;
  packId: string;
  masterPrompt: string;
  adapterStates: Record<OrchestratorProviderId, AdapterRuntimeState>;
};

export type OrchestratorRunResult = {
  pack: OrchestratedContentPack;
  blocked: boolean;
  blockReason?: string;
};
