import type { VisualAuthorityApprovalStatus } from './types';

/** Canonical staged workflow (STAGE 00–14). Conditional stages allowed per job scope. */
export const WORLD_FABRICATION_STAGES = [
  { id: 'STAGE_00', code: 'COMMISSION_INTAKE', label: 'Commission intake', order: 0, optional: false },
  { id: 'STAGE_01', code: 'SPATIAL_BRIEF', label: 'Spatial brief', order: 1, optional: false },
  { id: 'STAGE_02', code: 'VISUAL_AUTHORITY', label: 'Visual authority', order: 2, optional: false },
  { id: 'STAGE_03', code: 'MULTI_VIEW_REFERENCE_REVIEW', label: 'Multi-view reference review', order: 3, optional: true },
  { id: 'STAGE_04', code: 'MASSING_GENERATION', label: 'Massing generation', order: 4, optional: true },
  { id: 'STAGE_05', code: 'GEOMETRY_RECONSTRUCTION', label: 'Geometry reconstruction', order: 5, optional: true },
  { id: 'STAGE_06', code: 'MATERIAL_FABRICATION', label: 'Material fabrication', order: 6, optional: true },
  { id: 'STAGE_07', code: 'ARCHITECTURAL_VALIDATION', label: 'Architectural validation', order: 7, optional: true },
  { id: 'STAGE_08', code: 'FOUNDER_GEOMETRY_APPROVAL', label: 'Founder geometry approval', order: 8, optional: true },
  { id: 'STAGE_09', code: 'WORLD_ASSEMBLY', label: 'World assembly', order: 9, optional: true },
  { id: 'STAGE_10', code: 'INTERACTION_INTEGRATION', label: 'Interaction integration', order: 10, optional: true },
  { id: 'STAGE_11', code: 'RUNTIME_QA', label: 'Runtime QA', order: 11, optional: true },
  { id: 'STAGE_12', code: 'FOUNDER_EXPERIENCE_APPROVAL', label: 'Founder experience approval', order: 12, optional: true },
  { id: 'STAGE_13', code: 'DELIVERY_PACKAGE', label: 'Delivery package', order: 13, optional: true },
  { id: 'STAGE_14', code: 'DEPLOYMENT_AUTHORIZATION', label: 'Deployment authorization', order: 14, optional: true },
] as const;

export type WorldFabricationStageId = (typeof WORLD_FABRICATION_STAGES)[number]['id'];

export type FabricationStageState = {
  stageId: WorldFabricationStageId;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETE' | 'SKIPPED';
  enteredAt?: string;
  completedAt?: string;
  blockerReason?: string;
};

export type StageTransitionInput = {
  manifestId: string;
  fromStageId: WorldFabricationStageId;
  toStageId: WorldFabricationStageId;
  actor: string;
  approvalsSatisfied: boolean;
  validationPassed: boolean;
};

export function getStageById(stageId: WorldFabricationStageId) {
  return WORLD_FABRICATION_STAGES.find((s) => s.id === stageId);
}

export function canTransitionStage(input: StageTransitionInput): { ok: boolean; reason?: string } {
  const from = getStageById(input.fromStageId);
  const to = getStageById(input.toStageId);
  if (!from || !to) return { ok: false, reason: 'Unknown stage' };
  if (to.order < from.order) return { ok: false, reason: 'Backward transition requires explicit revision workflow' };
  if (to.order > from.order + 1) return { ok: false, reason: 'Cannot skip stages without scope waiver recorded on manifest' };
  if (input.toStageId === 'STAGE_04' && !input.approvalsSatisfied) {
    return { ok: false, reason: 'Massing generation requires visual authority approval' };
  }
  if (input.toStageId === 'STAGE_08' && !input.validationPassed) {
    return { ok: false, reason: 'Founder geometry approval requires validation report' };
  }
  if (input.toStageId === 'STAGE_14' && !input.approvalsSatisfied) {
    return { ok: false, reason: 'Deployment authorization requires founder experience approval' };
  }
  return { ok: true };
}

/** Minimal path for asset-level proofs (e.g. SITE 00 Build Object). */
export const BUILD_OBJECT_STAGE_PATH: WorldFabricationStageId[] = [
  'STAGE_00',
  'STAGE_01',
  'STAGE_02',
  'STAGE_04',
  'STAGE_05',
  'STAGE_06',
  'STAGE_07',
  'STAGE_08',
  'STAGE_13',
];

export function isStageApprovalSatisfied(status: VisualAuthorityApprovalStatus): boolean {
  return status === 'APPROVED' || status === 'APPROVED_WITH_CORRECTIONS';
}
