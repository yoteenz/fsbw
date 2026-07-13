import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { ManufacturingQueue } from './manufacturing-queue';
import type { AssetDnaRecord } from './asset-dna';

export const FOUNDER_PREVIEW_VERSION = 'founder-preview.v1';

export type FounderPreviewSection = {
  label: string;
  items: Array<{ name: string; version: string; status: 'ready' | 'pending' | 'warning' }>;
};

export type FounderPreviewEstimate = {
  estimatedDurationMs: number;
  estimatedAiCostUnits: number;
  estimatedTokens: number;
  estimatedModels: string[];
  estimatedRetries: number;
};

export type FounderPreview = {
  previewVersion: typeof FOUNDER_PREVIEW_VERSION;
  planId: string;
  roomDisplayName: string;
  blueprintRevision: number;
  sections: FounderPreviewSection[];
  jobs: Array<{ jobNumber: string; label: string; status: 'pending' | 'ready' }>;
  estimate: FounderPreviewEstimate;
  compileReady: boolean;
};

export function buildFounderPreview(input: {
  plan: ConstructionPlan;
  queue: ManufacturingQueue;
  dnaRecords: AssetDnaRecord[];
}): FounderPreview {
  const { plan, queue } = input;

  const sections: FounderPreviewSection[] = [
    {
      label: 'Architecture',
      items: [{ name: plan.architecture.architectureId, version: plan.architecture.version, status: 'ready' }],
    },
    {
      label: 'Hero Assets',
      items: plan.heroAssets.map((a) => ({ name: a.assetId, version: a.version, status: 'ready' as const })),
    },
    {
      label: 'Furniture',
      items: [
        {
          name: plan.furnitureSet.setId,
          version: plan.furnitureSet.version,
          status: plan.furnitureSet.assets.length > 0 ? 'ready' : 'pending',
        },
      ],
    },
    {
      label: 'Materials',
      items: plan.materialSet.materialIds.map((m) => ({
        name: m.replace('founder-', 'Founder ').replace(/-/g, ' '),
        version: plan.materialSet.version,
        status: 'ready' as const,
      })),
    },
    {
      label: 'Lighting',
      items: [
        {
          name: plan.lightingProfile.profileId,
          version: plan.lightingProfile.version,
          status: 'ready',
        },
      ],
    },
  ];

  const modelSet = new Set<string>();
  for (const job of queue.jobs) {
    if (job.jobType === 'architecture') modelSet.add('fal-ai/nano-banana-pro/edit');
    else if (job.jobType === 'hero-asset') modelSet.add('fal-ai/nano-banana-2/edit');
    else if (job.jobType === 'furniture' || job.jobType === 'decor') modelSet.add('fal-ai/nano-banana-2');
  }

  return {
    previewVersion: FOUNDER_PREVIEW_VERSION,
    planId: plan.planId,
    roomDisplayName: plan.room.displayName,
    blueprintRevision: plan.metadata.revision,
    sections,
    jobs: queue.jobs.map((j) => ({
      jobNumber: j.jobNumber,
      label: j.assetId,
      status: 'pending' as const,
    })),
    estimate: {
      estimatedDurationMs: queue.totalEstimatedDurationMs,
      estimatedAiCostUnits: queue.totalEstimatedCost,
      estimatedTokens: queue.totalEstimatedTokens,
      estimatedModels: [...modelSet],
      estimatedRetries: Math.ceil(queue.jobs.length * 0.1),
    },
    compileReady: true,
  };
}
