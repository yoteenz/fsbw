import { defineDefaultDepartmentUiSockets } from '../architecture-law-001/ui-socket-registry';
import type { CanonicalMainDepartmentId, CanonicalDepartmentRecord } from './canonical-department-registry';
import {
  CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY,
  getCanonicalDepartmentRecord,
  listCanonicalDepartmentTree,
} from './canonical-department-registry';
import { resolveDepartmentCharter } from './department-charters';
import { buildCanonicalDepartmentPromptContract } from './prompt-contracts';
import { COMMAND_DOCK_SHELL_PROFILES, WORKBENCH_SHELL_PROFILES } from './shell-profiles';

export const CANONICAL_GENERATION_VERSION = 'canonical-department-generation.v1' as const;

export type CanonicalGenerationPhase =
  | 'select-department'
  | 'review-charter'
  | 'author-blueprint'
  | 'generate-landscape'
  | 'approve-landscape'
  | 'generate-portrait'
  | 'validate-cross-device'
  | 'generate-command-dock'
  | 'generate-workbench'
  | 'generate-socket-metadata'
  | 'approve-department'
  | 'send-to-cds'
  | 'construction-mode'
  | 'quality-guard'
  | 'immune-system'
  | 'publish-registry';

export const CANONICAL_DEPARTMENT_GENERATION_PIPELINE: readonly CanonicalGenerationPhase[] = [
  'select-department',
  'review-charter',
  'author-blueprint',
  'generate-landscape',
  'approve-landscape',
  'generate-portrait',
  'validate-cross-device',
  'generate-command-dock',
  'generate-workbench',
  'generate-socket-metadata',
  'approve-department',
  'send-to-cds',
  'construction-mode',
  'quality-guard',
  'immune-system',
  'publish-registry',
] as const;

export type CanonicalGenerationCostEstimate = {
  landscapeRenderCostUnits: number;
  portraitCompanionCostUnits: number;
  isolatedAssetEstimateUnits: number;
  cleanupEstimateUnits: number;
  storageEstimateMb: number;
  totalEstimatedCostUnits: number;
  estimatedDurationMs: number;
  reuseShellPatterns: boolean;
};

export type CanonicalBatchGenerationPlan = {
  departmentIds: CanonicalMainDepartmentId[];
  departmentCount: number;
  expectedRenderCount: number;
  cost: CanonicalGenerationCostEstimate;
  queueCapacity: number;
  permitRequired: boolean;
  confirmed: boolean;
};

const LANDSCAPE_COST = 12;
const PORTRAIT_COST = 4;
const ASSET_COST_PER_DEPT = 8;

export function estimateCanonicalDepartmentCost(
  departmentIds: CanonicalMainDepartmentId[]
): CanonicalGenerationCostEstimate {
  const count = departmentIds.length;
  const landscapeRenderCostUnits = count * LANDSCAPE_COST;
  const portraitCompanionCostUnits = count * PORTRAIT_COST;
  const isolatedAssetEstimateUnits = count * ASSET_COST_PER_DEPT;
  const cleanupEstimateUnits = count * 2;
  const storageEstimateMb = count * 48;
  return {
    landscapeRenderCostUnits,
    portraitCompanionCostUnits,
    isolatedAssetEstimateUnits,
    cleanupEstimateUnits,
    storageEstimateMb,
    totalEstimatedCostUnits:
      landscapeRenderCostUnits + portraitCompanionCostUnits + isolatedAssetEstimateUnits + cleanupEstimateUnits,
    estimatedDurationMs: count * 120_000,
    reuseShellPatterns: true,
  };
}

export function planCanonicalBatchGeneration(input: {
  departmentIds: CanonicalMainDepartmentId[];
  confirmed?: boolean;
}): CanonicalBatchGenerationPlan {
  const cost = estimateCanonicalDepartmentCost(input.departmentIds);
  return {
    departmentIds: input.departmentIds,
    departmentCount: input.departmentIds.length,
    expectedRenderCount: input.departmentIds.length * 2,
    cost,
    queueCapacity: 4,
    permitRequired: true,
    confirmed: input.confirmed ?? false,
  };
}

export function planCanonicalDepartmentGeneration(departmentId: CanonicalMainDepartmentId) {
  const record = getCanonicalDepartmentRecord(departmentId);
  if (!record) {
    return { ok: false as const, code: 'DEPARTMENT_UNKNOWN', message: `Unknown canonical department: ${departmentId}` };
  }

  const charter = resolveDepartmentCharter(departmentId);
  const promptContract = buildCanonicalDepartmentPromptContract(departmentId);
  if ('ok' in promptContract && promptContract.ok === false) return promptContract;

  const uiSockets = defineDefaultDepartmentUiSockets(departmentId);
  const commandDock = COMMAND_DOCK_SHELL_PROFILES[record.commandDockProfile];
  const workbench = WORKBENCH_SHELL_PROFILES[record.workbenchProfile];

  return {
    ok: true as const,
    departmentId,
    record,
    charter,
    promptContract,
    uiSockets,
    commandDockPlaceholder: commandDock ?? null,
    workbenchPlaceholder: workbench ?? null,
    phases: CANONICAL_DEPARTMENT_GENERATION_PIPELINE,
    cost: estimateCanonicalDepartmentCost([departmentId]),
    modelRoute: 'nano-banana-pro-full-scene' as const,
    ownership: 'studio-world-global' as const,
  };
}

export function listMissingCanonicalDepartments(): CanonicalDepartmentRecord[] {
  return CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.filter((d) => d.lifecycleState === 'DRAFT');
}

export function listStaleCanonicalDepartments(): CanonicalDepartmentRecord[] {
  return CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.filter(
    (d) => d.lifecycleState === 'NEEDS_REVISION' || d.lifecycleState === 'DEGRADED'
  );
}

export function queueAllMissingCanonicalDepartments(confirmed: boolean): CanonicalBatchGenerationPlan | { ok: false; code: string; message: string } {
  if (!confirmed) {
    return { ok: false, code: 'BATCH_NOT_CONFIRMED', message: 'Explicit confirmation required before batch canonical generation.' };
  }
  const missing = listMissingCanonicalDepartments();
  return planCanonicalBatchGeneration({
    departmentIds: missing.map((d) => d.departmentId),
    confirmed: true,
  });
}

export type CanonicalPublicationResult = {
  departmentId: CanonicalMainDepartmentId;
  publishedVersion: string;
  registryEntryId: string;
  lifecycleState: 'PUBLISHED';
  publishedAt: string;
};

export function publishCanonicalDepartmentToRegistry(
  departmentId: CanonicalMainDepartmentId
): { ok: true; publication: CanonicalPublicationResult } | { ok: false; code: string; message: string } {
  const record = getCanonicalDepartmentRecord(departmentId);
  if (!record) {
    return { ok: false, code: 'NOT_CANONICAL', message: `${departmentId} is not a canonical Studio World department.` };
  }

  const version = record.publishedVersion ?? `v${record.blueprintRevision}.0.0`;
  return {
    ok: true,
    publication: {
      departmentId,
      publishedVersion: version,
      registryEntryId: `studio-world-registry:${departmentId}`,
      lifecycleState: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    },
  };
}

export { listCanonicalDepartmentTree };
