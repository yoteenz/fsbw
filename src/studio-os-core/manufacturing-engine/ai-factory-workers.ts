import type { ManufacturingWorkerRole } from './contract';
import type { ManufacturingJob, ManufacturingJobType } from './manufacturing-queue';
import type { RenderIntent } from './render-intent';
import type { AssetDnaRecord } from './asset-dna';
import { resolveModelForAssetTier } from '../studio-world-architecture-v2/model-routing-v2';

export const AI_FACTORY_WORKERS_VERSION = 'ai-factory-workers.v1';

export type FactoryWorkerAssignment = {
  workerRole: ManufacturingWorkerRole;
  jobId: string;
  assetId: string;
  renderIntentId: string;
  providerModel: string;
  specialization: string;
  boundedScope: true;
};

export type FactoryWorkerOutput = {
  jobId: string;
  assetId: string;
  workerRole: ManufacturingWorkerRole;
  providerModel: string;
  success: boolean;
  sourceUrl: string | null;
  generationTimeMs: number;
  actualSilhouette: string | null;
  actualTransparency: 'opaque' | 'alpha' | 'glass' | 'unknown';
  actualScale: string | null;
  architectureDetected: boolean;
  backgroundDetected: boolean;
  errors: string[];
};

const JOB_TO_WORKER: Record<ManufacturingJobType, ManufacturingWorkerRole> = {
  architecture: 'architect-worker',
  'hero-asset': 'hero-asset-worker',
  furniture: 'furniture-worker',
  decor: 'decor-worker',
  lighting: 'lighting-worker',
  particles: 'particle-worker',
  interaction: 'animation-worker',
};

export function assignFactoryWorker(input: {
  job: ManufacturingJob;
  organizationId: string;
  brandGroundingRequired?: boolean;
}): FactoryWorkerAssignment {
  const workerRole = JOB_TO_WORKER[input.job.jobType];
  let providerModel = 'world-compiler/no-generation';

  if (input.job.jobType === 'architecture') {
    providerModel = 'fal-ai/nano-banana-pro/edit';
  } else if (input.job.jobType === 'hero-asset') {
    providerModel = resolveModelForAssetTier({
      tier: 'hero',
      organizationId: input.organizationId,
      brandGroundingRequired: input.brandGroundingRequired ?? true,
    }).providerModel;
  } else if (input.job.jobType === 'furniture') {
    providerModel = resolveModelForAssetTier({ tier: 'furniture', organizationId: input.organizationId }).providerModel;
  } else if (input.job.jobType === 'decor') {
    providerModel = resolveModelForAssetTier({ tier: 'decor', organizationId: input.organizationId }).providerModel;
  }

  return {
    workerRole,
    jobId: input.job.jobId,
    assetId: input.job.assetId,
    renderIntentId: input.job.renderIntentId,
    providerModel,
    specialization: `${workerRole} — ${input.job.jobType} only`,
    boundedScope: true,
  };
}

export function assertWorkerSpecialization(input: {
  assignment: FactoryWorkerAssignment;
  attemptedRole: ManufacturingWorkerRole;
}): { ok: true } | { ok: false; code: string } {
  if (input.assignment.workerRole !== input.attemptedRole) {
    return { ok: false, code: 'WORKER_ROLE_VIOLATION' };
  }
  return { ok: true };
}

/** Mock factory execution — no real AI in foundation sprint */
export function executeFactoryWorkerMock(input: {
  assignment: FactoryWorkerAssignment;
  intent: RenderIntent;
  dna: AssetDnaRecord;
  simulateFailure?: Partial<{
    architectureDetected: boolean;
    backgroundDetected: boolean;
    wrongSilhouette: boolean;
  }>;
}): FactoryWorkerOutput {
  const sim = input.simulateFailure ?? {};
  const wrongSilhouette = sim.wrongSilhouette ?? false;

  return {
    jobId: input.assignment.jobId,
    assetId: input.assignment.assetId,
    workerRole: input.assignment.workerRole,
    providerModel: input.assignment.providerModel,
    success: !sim.architectureDetected && !sim.backgroundDetected && !wrongSilhouette,
    sourceUrl: `https://example.com/mfg/${input.assignment.assetId}.png`,
    generationTimeMs: 2500,
    actualSilhouette: wrongSilhouette ? 'drifted-silhouette' : input.dna.visualDna.silhouette,
    actualTransparency: input.intent.expectedTransparency,
    actualScale: input.intent.expectedScale,
    architectureDetected: sim.architectureDetected ?? false,
    backgroundDetected: sim.backgroundDetected ?? false,
    errors: sim.architectureDetected
      ? ['architecture-leakage']
      : sim.backgroundDetected
        ? ['background-detected']
        : wrongSilhouette
          ? ['silhouette-drift']
          : [],
  };
}
