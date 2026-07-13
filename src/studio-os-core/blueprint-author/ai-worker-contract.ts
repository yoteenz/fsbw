import type { ConstructionJob } from './job-queue';
import { resolveModelForAssetTier } from '../studio-world-architecture-v2/model-routing-v2';
import type { WorldAssetTier } from '../studio-world-architecture-v2/asset-hierarchy';

export const AI_WORKER_CONTRACT_VERSION = 'ai-worker-contract.v1';

export type AiWorkerInput = {
  jobId: string;
  assetId: string | null;
  socketId: string | null;
  materialSetId: string | null;
  materialIds: string[];
  cameraAnchorId: string | null;
  validationProfileId: string;
  negativeRules: string[];
  organizationRules: string[];
  outputRequirements: string[];
  styleId: string;
  lightingProfileId: string | null;
  providerModel: string;
  /** Worker knows only its assigned task */
  boundedScope: true;
};

export type AiWorkerOutput = {
  jobId: string;
  assetId: string | null;
  success: boolean;
  sourceUrl: string | null;
  actualVersion: string | null;
  actualMaterialIds: string[];
  actualSocketId: string | null;
  transparencyStatus: 'opaque' | 'alpha' | 'glass' | 'unknown';
  qualityScore: number;
  errors: string[];
};

export function buildAiWorkerInput(input: {
  job: ConstructionJob;
  organizationId: string;
  tier?: WorldAssetTier;
  brandGroundingRequired?: boolean;
}): AiWorkerInput {
  let providerModel = 'world-compiler/no-generation';
  if (input.job.jobType === 'architecture') {
    providerModel = 'fal-ai/nano-banana-pro/edit';
  } else if (input.job.jobType === 'hero-asset') {
    const route = resolveModelForAssetTier({
      tier: 'hero',
      organizationId: input.organizationId,
      brandGroundingRequired: input.brandGroundingRequired ?? true,
    });
    providerModel = route.providerModel;
  } else if (input.job.jobType === 'furniture') {
    const route = resolveModelForAssetTier({
      tier: 'furniture',
      organizationId: input.organizationId,
    });
    providerModel = route.providerModel;
  } else if (input.job.jobType === 'decor') {
    const route = resolveModelForAssetTier({
      tier: 'decor',
      organizationId: input.organizationId,
    });
    providerModel = route.providerModel;
  }

  return {
    jobId: input.job.jobId,
    assetId: input.job.assetId,
    socketId: input.job.socketId,
    materialSetId: input.job.materialSetId,
    materialIds: input.job.materialIds,
    cameraAnchorId: input.job.cameraAnchorId,
    validationProfileId: input.job.validationProfileId,
    negativeRules: input.job.negativeRules,
    organizationRules: input.job.organizationRules,
    outputRequirements: input.job.outputRequirements,
    styleId: input.job.styleId,
    lightingProfileId: input.job.lightingProfileId,
    providerModel,
    boundedScope: true,
  };
}

/** Mock worker execution — no real AI calls in foundation sprint */
export function executeAiWorkerMock(input: {
  workerInput: AiWorkerInput;
  expectedVersion: string;
  simulateFailure?: boolean;
}): AiWorkerOutput {
  if (input.simulateFailure) {
    return {
      jobId: input.workerInput.jobId,
      assetId: input.workerInput.assetId,
      success: false,
      sourceUrl: null,
      actualVersion: input.expectedVersion,
      actualMaterialIds: input.workerInput.materialIds,
      actualSocketId: input.workerInput.socketId,
      transparencyStatus: 'unknown',
      qualityScore: 0,
      errors: ['simulated-failure'],
    };
  }

  return {
    jobId: input.workerInput.jobId,
    assetId: input.workerInput.assetId,
    success: true,
    sourceUrl: `https://example.com/${input.workerInput.assetId ?? 'output'}.png`,
    actualVersion: input.expectedVersion,
    actualMaterialIds: input.workerInput.materialIds,
    actualSocketId: input.workerInput.socketId,
    transparencyStatus: input.workerInput.outputRequirements.includes('isolated-asset') ? 'alpha' : 'opaque',
    qualityScore: 0.92,
    errors: [],
  };
}

export function assertWorkerBounded(input: AiWorkerInput): { ok: true } | { ok: false; code: string } {
  if (!input.boundedScope) return { ok: false, code: 'WORKER_NOT_BOUNDED' };
  if (!input.jobId) return { ok: false, code: 'MISSING_JOB_ID' };
  return { ok: true };
}
