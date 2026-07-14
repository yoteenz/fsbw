import type { EnvironmentAssetPackage } from './EnvironmentAssetPackage';
import type { EnvironmentPackageOutputKey } from './EnvironmentPackageOutputs';

export type GenerationQueueItemKind =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'hero'
  | 'blueprint'
  | 'construction'
  | 'lighting'
  | 'materials';

export type GenerationQueueItemStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cached';

export type EnvironmentPackageGenerationQueueItem = {
  kind: GenerationQueueItemKind;
  outputKeys: EnvironmentPackageOutputKey[];
  status: GenerationQueueItemStatus;
  startedAt: string | null;
  completedAt: string | null;
};

const QUEUE_KIND_OUTPUTS: Record<GenerationQueueItemKind, EnvironmentPackageOutputKey[]> = {
  desktop: ['desktop'],
  mobile: ['mobile'],
  tablet: ['tablet'],
  hero: ['heroLandscape', 'heroPortrait'],
  blueprint: ['blueprint'],
  construction: ['constructionPlan'],
  lighting: ['lightingProfile'],
  materials: ['materialsProfile'],
};

function mapOutputStatusToQueueStatus(
  statuses: Array<'pending' | 'generating' | 'generated' | 'failed' | 'cached'>
): GenerationQueueItemStatus {
  if (statuses.every((s) => s === 'cached' || s === 'generated')) {
    return statuses.some((s) => s === 'cached') ? 'cached' : 'completed';
  }
  if (statuses.some((s) => s === 'generating')) return 'running';
  if (statuses.some((s) => s === 'failed')) return 'failed';
  return 'pending';
}

export function buildEnvironmentPackageGenerationQueue(
  pkg: EnvironmentAssetPackage
): EnvironmentPackageGenerationQueueItem[] {
  return (Object.keys(QUEUE_KIND_OUTPUTS) as GenerationQueueItemKind[]).map((kind) => {
    const outputKeys = QUEUE_KIND_OUTPUTS[kind];
    const statuses = outputKeys.map((k) => pkg.outputs[k]?.status ?? 'pending');
    return {
      kind,
      outputKeys,
      status: mapOutputStatusToQueueStatus(statuses),
      startedAt: null,
      completedAt: statuses.every((s) => s === 'generated' || s === 'cached')
        ? pkg.updatedAt
        : null,
    };
  });
}

export function countQueueProgress(queue: EnvironmentPackageGenerationQueueItem[]) {
  const completed = queue.filter(
    (q) => q.status === 'completed' || q.status === 'cached'
  ).length;
  return { completed, total: queue.length, percent: Math.round((completed / queue.length) * 100) };
}
