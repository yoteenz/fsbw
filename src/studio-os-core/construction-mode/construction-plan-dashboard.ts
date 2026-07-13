import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { ManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';
import type { AssetDnaRecord } from '../manufacturing-engine/asset-dna';

export const CONSTRUCTION_PLAN_DASHBOARD_VERSION = 'construction-plan-dashboard.v1';

export type DashboardWorkerTier = {
  label: string;
  jobCount: number;
  status: 'ready' | 'pending';
};

export type ConstructionPlanDashboard = {
  dashboardVersion: typeof CONSTRUCTION_PLAN_DASHBOARD_VERSION;
  planId: string;
  roomDisplayName: string;
  blueprintRevision: number;
  architecture: { name: string; version: string };
  heroAssets: Array<{ name: string; version: string }>;
  furnitureSet: { name: string; version: string };
  materialLibrary: Array<{ name: string; version: string }>;
  lighting: { name: string; version: string };
  aiWorkers: DashboardWorkerTier[];
  estimates: {
    costUnits: number;
    durationMs: number;
    gpuUnits: number;
    models: string[];
    retries: number;
  };
  actions: {
    compileWorld: boolean;
    editPlan: boolean;
    previewWorld: boolean;
  };
  /** Nothing generated yet */
  generationOccurred: false;
};

export function buildConstructionPlanDashboard(input: {
  plan: ConstructionPlan;
  queue: ManufacturingQueue;
  dnaRecords: AssetDnaRecord[];
}): ConstructionPlanDashboard {
  const { plan, queue } = input;
  const workerTiers: DashboardWorkerTier[] = [
    { label: 'Architecture', jobCount: queue.jobs.filter((j) => j.jobType === 'architecture').length, status: 'ready' },
    { label: 'Hero Assets', jobCount: queue.jobs.filter((j) => j.jobType === 'hero-asset').length, status: 'ready' },
    { label: 'Furniture', jobCount: queue.jobs.filter((j) => j.jobType === 'furniture').length, status: 'ready' },
    { label: 'Lighting', jobCount: queue.jobs.filter((j) => j.jobType === 'lighting').length, status: 'ready' },
  ];

  const models = new Set<string>();
  for (const job of queue.jobs) {
    if (job.jobType === 'architecture') models.add('fal-ai/nano-banana-pro/edit');
    else if (job.jobType === 'hero-asset') models.add('fal-ai/nano-banana-2/edit');
    else models.add('fal-ai/nano-banana-2');
  }

  return {
    dashboardVersion: CONSTRUCTION_PLAN_DASHBOARD_VERSION,
    planId: plan.planId,
    roomDisplayName: plan.room.displayName,
    blueprintRevision: plan.metadata.revision,
    architecture: { name: plan.architecture.architectureId, version: plan.architecture.version },
    heroAssets: plan.heroAssets.map((a) => ({ name: a.assetId, version: a.version })),
    furnitureSet: { name: plan.furnitureSet.setId, version: plan.furnitureSet.version },
    materialLibrary: plan.materialSet.materialIds.map((m) => ({
      name: m.replace('founder-', 'Founder ').replace(/-/g, ' '),
      version: plan.materialSet.version,
    })),
    lighting: { name: plan.lightingProfile.profileId, version: plan.lightingProfile.version },
    aiWorkers: workerTiers,
    estimates: {
      costUnits: queue.totalEstimatedCost,
      durationMs: queue.totalEstimatedDurationMs,
      gpuUnits: Math.ceil(queue.totalEstimatedCost * 0.8),
      models: [...models],
      retries: Math.ceil(queue.jobs.length * 0.1),
    },
    actions: {
      compileWorld: true,
      editPlan: true,
      previewWorld: true,
    },
    generationOccurred: false,
  };
}
