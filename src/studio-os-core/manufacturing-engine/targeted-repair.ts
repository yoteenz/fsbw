import type { ClassifiedFailure, FailureClass } from './failure-classification';
import type { ManufacturingWorkerRole } from './contract';

export const TARGETED_REPAIR_VERSION = 'targeted-repair.v1';

export type TargetedRepairAction =
  | 'adjust-silhouette'
  | 'rebuild-material-layer'
  | 'background-removal'
  | 'fix-transparency'
  | 'fix-scale'
  | 'fix-reflection'
  | 'reposition-socket'
  | 'regenerate-asset'
  | 'manufacture-replacement'
  | 'none';

export type TargetedRepairPlan = {
  failure: ClassifiedFailure;
  action: TargetedRepairAction;
  workerRole: ManufacturingWorkerRole | null;
  reusePreviousGeneration: boolean;
  fullRegenerationRequired: boolean;
  reason: string;
};

const FAILURE_REPAIR_MAP: Record<FailureClass, TargetedRepairAction> = {
  'silhouette-failure': 'adjust-silhouette',
  'material-failure': 'rebuild-material-layer',
  'organization-asset-drift': 'rebuild-material-layer',
  'background-failure': 'background-removal',
  'transparency-failure': 'fix-transparency',
  'scale-failure': 'fix-scale',
  'reflection-failure': 'fix-reflection',
  'architecture-leakage': 'background-removal',
  'geometry-failure': 'regenerate-asset',
  'lighting-failure': 'fix-reflection',
  'isolation-failure': 'background-removal',
  'perspective-failure': 'adjust-silhouette',
  'prompt-drift': 'regenerate-asset',
  'model-drift': 'manufacture-replacement',
  'texture-drift': 'rebuild-material-layer',
  'reference-drift': 'rebuild-material-layer',
  'unknown': 'regenerate-asset',
};

const ACTION_WORKER: Partial<Record<TargetedRepairAction, ManufacturingWorkerRole>> = {
  'background-removal': 'background-removal-worker',
  'adjust-silhouette': 'optimization-worker',
  'rebuild-material-layer': 'material-worker',
  'fix-transparency': 'optimization-worker',
  'fix-scale': 'optimization-worker',
  'fix-reflection': 'lighting-worker',
  'regenerate-asset': 'hero-asset-worker',
  'manufacture-replacement': 'hero-asset-worker',
};

export function planTargetedRepair(failure: ClassifiedFailure): TargetedRepairPlan {
  const action = FAILURE_REPAIR_MAP[failure.failureClass] ?? 'regenerate-asset';
  const reusePreviousGeneration =
    action === 'adjust-silhouette' ||
    action === 'background-removal' ||
    action === 'fix-transparency' ||
    action === 'fix-scale' ||
    action === 'rebuild-material-layer';

  return {
    failure,
    action,
    workerRole: ACTION_WORKER[action] ?? null,
    reusePreviousGeneration,
    fullRegenerationRequired: action === 'regenerate-asset' || action === 'manufacture-replacement',
    reason:
      action === 'background-removal'
        ? 'Background detected — Background Removal Worker, no full regeneration'
        : action === 'adjust-silhouette'
          ? 'Silhouette incorrect — adjust and reuse previous generation'
          : `Targeted repair for ${failure.failureClass}`,
  };
}

export function planTargetedRepairs(failures: ClassifiedFailure[]): TargetedRepairPlan[] {
  return failures.map(planTargetedRepair);
}

export function assertSurgicalRepair(plan: TargetedRepairPlan): boolean {
  return plan.reusePreviousGeneration || !plan.fullRegenerationRequired || plan.action === 'manufacture-replacement';
}
