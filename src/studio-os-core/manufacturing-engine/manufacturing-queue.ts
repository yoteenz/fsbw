import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { RenderIntent } from './render-intent';
import type { AssetDnaRecord } from './asset-dna';
import type { ManufacturingJobStatus } from './contract';

export const MANUFACTURING_QUEUE_VERSION = 'manufacturing-queue.v1';

export type ManufacturingJobType =
  | 'architecture'
  | 'hero-asset'
  | 'furniture'
  | 'decor'
  | 'lighting'
  | 'particles'
  | 'interaction';

export type RetryPolicy = {
  maxRetries: number;
  backoffMs: number;
  escalateAfter: number;
};

export type InspectionPolicy = {
  inspectBeforeAssembly: boolean;
  inspectPerAsset: boolean;
  blockOnCriticalFailure: boolean;
};

export type RepairPolicy = {
  targetedRepairFirst: boolean;
  fullRegenerationLast: boolean;
  backgroundRemovalWorkerEnabled: boolean;
};

export type ManufacturingJob = {
  jobNumber: string;
  jobId: string;
  jobType: ManufacturingJobType;
  planId: string;
  assetId: string;
  dnaId: string;
  renderIntentId: string;
  priority: number;
  dependencies: string[];
  estimatedCostUnits: number;
  estimatedTokens: number;
  estimatedDurationMs: number;
  retryPolicy: RetryPolicy;
  inspectionPolicy: InspectionPolicy;
  repairPolicy: RepairPolicy;
  status: ManufacturingJobStatus;
};

export type ManufacturingQueue = {
  queueId: string;
  planId: string;
  version: typeof MANUFACTURING_QUEUE_VERSION;
  jobs: ManufacturingJob[];
  totalEstimatedCost: number;
  totalEstimatedTokens: number;
  totalEstimatedDurationMs: number;
  createdAt: string;
};

const JOB_COST_ESTIMATES: Record<ManufacturingJobType, { cost: number; tokens: number; durationMs: number }> = {
  architecture: { cost: 12, tokens: 8000, durationMs: 45000 },
  'hero-asset': { cost: 8, tokens: 5000, durationMs: 30000 },
  furniture: { cost: 4, tokens: 2500, durationMs: 15000 },
  decor: { cost: 2, tokens: 1200, durationMs: 8000 },
  lighting: { cost: 3, tokens: 1500, durationMs: 10000 },
  particles: { cost: 2, tokens: 1000, durationMs: 8000 },
  interaction: { cost: 1, tokens: 500, durationMs: 5000 },
};

export function buildManufacturingQueue(input: {
  plan: ConstructionPlan;
  dnaRecords: AssetDnaRecord[];
  renderIntents: RenderIntent[];
}): ManufacturingQueue {
  const now = new Date().toISOString();
  const jobs: ManufacturingJob[] = [];
  let jobNum = 1;

  const intentByAsset = new Map(input.renderIntents.map((i) => [i.assetId, i]));
  const dnaByAsset = new Map(input.dnaRecords.map((d) => [d.assetId, d]));

  const addJob = (
    jobType: ManufacturingJobType,
    assetId: string,
    priority: number,
    dependencies: string[]
  ) => {
    const dna = dnaByAsset.get(assetId);
    const intent = intentByAsset.get(assetId);
    if (!dna || !intent) return;

    const estimates = JOB_COST_ESTIMATES[jobType];
    const jobId = `mfg-job-${String(jobNum).padStart(3, '0')}`;

    jobs.push({
      jobNumber: String(jobNum).padStart(3, '0'),
      jobId,
      jobType,
      planId: input.plan.planId,
      assetId,
      dnaId: dna.assetSignatureHash,
      renderIntentId: intent.intentId,
      priority,
      dependencies,
      estimatedCostUnits: estimates.cost,
      estimatedTokens: estimates.tokens,
      estimatedDurationMs: estimates.durationMs,
      retryPolicy: { maxRetries: 3, backoffMs: 2000, escalateAfter: 2 },
      inspectionPolicy: { inspectBeforeAssembly: true, inspectPerAsset: true, blockOnCriticalFailure: true },
      repairPolicy: { targetedRepairFirst: true, fullRegenerationLast: true, backgroundRemovalWorkerEnabled: true },
      status: 'pending',
    });
    jobNum++;
    return jobId;
  };

  const archJobId = addJob('architecture', input.plan.architecture.architectureId, 1, [])!;

  const heroJobIds: string[] = [];
  for (const asset of input.plan.heroAssets) {
    const id = addJob('hero-asset', asset.assetId, 2, [archJobId]);
    if (id) heroJobIds.push(id);
  }

  for (const asset of input.plan.furnitureSet.assets) {
    addJob('furniture', asset.assetId, 3, [archJobId]);
  }

  for (const asset of input.plan.decorSet.assets) {
    addJob('decor', asset.assetId, 4, [archJobId]);
  }

  const lightingDna = input.dnaRecords.find((d) => d.assetFamily === 'lighting');
  if (!lightingDna) {
    const lightingIntent = input.renderIntents.find((i) => i.generationMode === 'lighting-pass');
    if (lightingIntent) {
      addJob('lighting', lightingIntent.assetId, 5, heroJobIds);
    } else {
      jobs.push({
        jobNumber: String(jobNum).padStart(3, '0'),
        jobId: `mfg-job-${String(jobNum).padStart(3, '0')}`,
        jobType: 'lighting',
        planId: input.plan.planId,
        assetId: input.plan.lightingProfile.profileId,
        dnaId: `dna-lighting-${input.plan.lightingProfile.profileId}`,
        renderIntentId: `intent-lighting-${input.plan.planId}`,
        priority: 5,
        dependencies: heroJobIds,
        estimatedCostUnits: JOB_COST_ESTIMATES.lighting.cost,
        estimatedTokens: JOB_COST_ESTIMATES.lighting.tokens,
        estimatedDurationMs: JOB_COST_ESTIMATES.lighting.durationMs,
        retryPolicy: { maxRetries: 2, backoffMs: 1000, escalateAfter: 1 },
        inspectionPolicy: { inspectBeforeAssembly: true, inspectPerAsset: true, blockOnCriticalFailure: true },
        repairPolicy: { targetedRepairFirst: true, fullRegenerationLast: false, backgroundRemovalWorkerEnabled: false },
        status: 'pending',
      });
      jobNum++;
    }
  }

  jobs.push({
    jobNumber: String(jobNum).padStart(3, '0'),
    jobId: `mfg-job-${String(jobNum).padStart(3, '0')}`,
    jobType: 'particles',
    planId: input.plan.planId,
    assetId: 'particles-atmosphere',
    dnaId: 'dna-particles',
    renderIntentId: `intent-particles-${input.plan.planId}`,
    priority: 6,
    dependencies: [jobs.find((j) => j.jobType === 'lighting')?.jobId ?? archJobId],
    estimatedCostUnits: JOB_COST_ESTIMATES.particles.cost,
    estimatedTokens: JOB_COST_ESTIMATES.particles.tokens,
    estimatedDurationMs: JOB_COST_ESTIMATES.particles.durationMs,
    retryPolicy: { maxRetries: 1, backoffMs: 500, escalateAfter: 1 },
    inspectionPolicy: { inspectBeforeAssembly: true, inspectPerAsset: false, blockOnCriticalFailure: false },
    repairPolicy: { targetedRepairFirst: true, fullRegenerationLast: false, backgroundRemovalWorkerEnabled: false },
    status: 'pending',
  });
  jobNum++;

  jobs.push({
    jobNumber: String(jobNum).padStart(3, '0'),
    jobId: `mfg-job-${String(jobNum).padStart(3, '0')}`,
    jobType: 'interaction',
    planId: input.plan.planId,
    assetId: input.plan.interactionProfile.profileId,
    dnaId: 'dna-interaction',
    renderIntentId: `intent-interaction-${input.plan.planId}`,
    priority: 7,
    dependencies: [jobs.find((j) => j.jobType === 'lighting')?.jobId ?? archJobId],
    estimatedCostUnits: JOB_COST_ESTIMATES.interaction.cost,
    estimatedTokens: JOB_COST_ESTIMATES.interaction.tokens,
    estimatedDurationMs: JOB_COST_ESTIMATES.interaction.durationMs,
    retryPolicy: { maxRetries: 1, backoffMs: 500, escalateAfter: 1 },
    inspectionPolicy: { inspectBeforeAssembly: true, inspectPerAsset: false, blockOnCriticalFailure: false },
    repairPolicy: { targetedRepairFirst: true, fullRegenerationLast: false, backgroundRemovalWorkerEnabled: false },
    status: 'pending',
  });

  const totalEstimatedCost = jobs.reduce((s, j) => s + j.estimatedCostUnits, 0);
  const totalEstimatedTokens = jobs.reduce((s, j) => s + j.estimatedTokens, 0);
  const totalEstimatedDurationMs = jobs.reduce((s, j) => s + j.estimatedDurationMs, 0);

  return {
    queueId: `mfg-queue-${input.plan.planId}`,
    planId: input.plan.planId,
    version: MANUFACTURING_QUEUE_VERSION,
    jobs,
    totalEstimatedCost,
    totalEstimatedTokens,
    totalEstimatedDurationMs,
    createdAt: now,
  };
}
