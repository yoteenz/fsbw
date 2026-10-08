import { assertGateAllowed, isFounderApproved, rejectGeneratedAsCanonical } from './approvals';
import { evaluateFabricationSpend, type FabricationJobBudget } from './cost-control';
import { validateCodexHandoff } from './handoffs';
import { assertImmutableOriginPreserved, type FabricationAssetRecord, type LineageTransformRecord } from './lineage';
import { validateMassingRequest } from './massing-provider';
import {
  canTransitionStage,
  getStageById,
  isStageApprovalSatisfied,
  type FabricationStageState,
  type WorldFabricationStageId,
} from './stages';
import type {
  FabricationJobManifest,
  SpatialSpecification,
  VisualAuthorityRecord,
  WorldFabricationTargetRuntime,
} from './types';
import { WORLD_FABRICATION_ENGINE_VERSION } from './types';

export type FabricationJobStore = {
  manifest: FabricationJobManifest;
  authorities: VisualAuthorityRecord[];
  spatialSpec: SpatialSpecification;
  stages: FabricationStageState[];
  budget: FabricationJobBudget;
  lineage: LineageTransformRecord[];
  assets: FabricationAssetRecord[];
  reviews: import('./approvals').FounderReviewRecord[];
};

export function createFabricationJobManifest(input: {
  manifestId: string;
  project: FabricationJobManifest['project'];
  spatialSpecId: string;
  visualAuthorityIds: string[];
  referenceViewIds: string[];
  targetRuntime: WorldFabricationTargetRuntime;
  costBudgetId: string;
  lineageRootAuthorityId: string;
}): FabricationJobManifest {
  const now = new Date().toISOString();
  return {
    manifestId: input.manifestId,
    manifestVersion: WORLD_FABRICATION_ENGINE_VERSION,
    project: input.project,
    spatialSpecId: input.spatialSpecId,
    visualAuthorityIds: input.visualAuthorityIds,
    referenceViewIds: input.referenceViewIds,
    currentStageId: 'STAGE_00',
    targetRuntime: input.targetRuntime,
    proofEnvironment: input.project.proofEnvironment,
    costBudgetId: input.costBudgetId,
    lineageRootAuthorityId: input.lineageRootAuthorityId,
    executionCapabilityRequired: ['CODEX_AGENT', 'BLENDER_HEADLESS'],
    createdAt: now,
    updatedAt: now,
  };
}

export function validateAuthorityForFabrication(authorities: VisualAuthorityRecord[]): string[] {
  const errors: string[] = [];
  if (!authorities.length) errors.push('At least one visual authority required');
  for (const a of authorities) {
    if (rejectGeneratedAsCanonical(a.approvalStatus)) {
      errors.push(`${a.authorityId}: authority not founder-approved`);
    }
  }
  return errors;
}

export function transitionJobStage(
  job: FabricationJobStore,
  toStageId: WorldFabricationStageId,
  actor: string
): { ok: boolean; job?: FabricationJobStore; errors: string[] } {
  const errors: string[] = [];
  const authErrors = validateAuthorityForFabrication(job.authorities);
  if (authErrors.length && (getStageById(toStageId)?.order ?? 0) >= (getStageById('STAGE_04')?.order ?? 99)) {
    errors.push(...authErrors);
  }

  const visualApproved = job.reviews.some(
    (r) => r.gate === 'VISUAL_AUTHORITY_APPROVAL' && isFounderApproved(r.status)
  );
  const transition = canTransitionStage({
    manifestId: job.manifest.manifestId,
    fromStageId: job.manifest.currentStageId as WorldFabricationStageId,
    toStageId,
    actor,
    approvalsSatisfied: visualApproved || isStageApprovalSatisfied(job.authorities[0]?.approvalStatus ?? 'DRAFT'),
    validationPassed: job.stages.some((s) => s.stageId === 'STAGE_07' && s.status === 'COMPLETE'),
  });
  if (!transition.ok) errors.push(transition.reason ?? 'transition blocked');

  if (errors.length) return { ok: false, errors };

  const updated: FabricationJobStore = {
    ...job,
    manifest: { ...job.manifest, currentStageId: toStageId, updatedAt: new Date().toISOString() },
    stages: job.stages.map((s) =>
      s.stageId === toStageId ? { ...s, status: 'IN_PROGRESS', enteredAt: new Date().toISOString() } : s
    ),
  };
  return { ok: true, job: updated, errors: [] };
}

export function requestPaidMassing(
  job: FabricationJobStore,
  req: Parameters<typeof validateMassingRequest>[0]
): { ok: boolean; errors: string[] } {
  const massingErrors = validateMassingRequest(req);
  if (massingErrors.length) return { ok: false, errors: massingErrors };
  const spend = evaluateFabricationSpend(job.budget, req.paidExecutionAuthorized ? 1 : 0);
  if (!spend.allowed) return { ok: false, errors: [spend.reason ?? 'budget blocked'] };
  return { ok: true, errors: [] };
}

export function validateJobIntegrity(job: FabricationJobStore): string[] {
  const errors: string[] = [];
  errors.push(...validateAuthorityForFabrication(job.authorities));
  const origin = assertImmutableOriginPreserved(job.assets, job.manifest.lineageRootAuthorityId);
  if (!origin.ok) errors.push(origin.reason ?? 'lineage origin invalid');
  const geomGate = assertGateAllowed('GEOMETRY_APPROVAL', job.reviews);
  if (
    !geomGate.ok &&
    (getStageById(job.manifest.currentStageId as WorldFabricationStageId)?.order ?? 0) >=
      (getStageById('STAGE_08')?.order ?? 99)
  ) {
    errors.push(geomGate.reason ?? 'geometry gate blocked');
  }
  return errors;
}

export function validateHandoffPackage(
  _job: FabricationJobStore,
  handoff: Parameters<typeof validateCodexHandoff>[0]
): string[] {
  return validateCodexHandoff(handoff);
}
