import type { MasterPlanProjectPhase } from './types';

export const MASTER_PLAN_PHASE_ORDER: MasterPlanProjectPhase[] = [
  'vision',
  'reserved-land',
  'concept-blueprint',
  'approved-blueprint',
  'construction',
  'interior-assembly',
  'commissioning',
  'grand-opening',
  'operational',
];

export function nextMasterPlanPhase(phase: MasterPlanProjectPhase): MasterPlanProjectPhase {
  const idx = MASTER_PLAN_PHASE_ORDER.indexOf(phase);
  if (idx < 0 || idx >= MASTER_PLAN_PHASE_ORDER.length - 1) return 'operational';
  return MASTER_PLAN_PHASE_ORDER[idx + 1]!;
}

export function planPhaseProgress(phase: MasterPlanProjectPhase): number {
  const idx = MASTER_PLAN_PHASE_ORDER.indexOf(phase);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / MASTER_PLAN_PHASE_ORDER.length) * 100);
}

export function isPlanApprovedForConstruction(phase: MasterPlanProjectPhase): boolean {
  const idx = MASTER_PLAN_PHASE_ORDER.indexOf(phase);
  return idx >= MASTER_PLAN_PHASE_ORDER.indexOf('approved-blueprint');
}

export function defaultPlanPhase(): MasterPlanProjectPhase {
  return 'reserved-land';
}
