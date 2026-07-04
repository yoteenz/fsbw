import { studioServiceNotConnected, studioServicePhase2, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  exportCastingSnapshot,
  getCastingProductionById,
} from '../../../hooks/useAdminStudioCastingState';
import { CASTING_INHERITANCE_CHAIN, CASTING_WORKFLOW_STEPS } from '../../../utils/adminStudioCastingDemo';

export type CastingSnapshot = ReturnType<typeof exportCastingSnapshot>;

export type CastingApprovalValidation = {
  productionId: string;
  workflowSteps: Array<{ id: string; label: string; complete: boolean }>;
  castApproved: boolean;
  castLocked: boolean;
  readyForProduction: boolean;
};

export type CastingInheritance = {
  productionId: string;
  showName: string;
  inheritanceChain: readonly string[];
  production: NonNullable<ReturnType<typeof getCastingProductionById>>;
  assignedTalent: string[];
  backupTalent: string[];
  talentAgencyIds: string[];
  wardrobeAssignment: string;
  expressionPreset: string;
  continuityNotes: string;
  bypassBlocked: true;
  inheritedFrom: string[];
};

function buildInheritedFrom(): string[] {
  return ['TALENT AGENCY', 'SHOW BIBLE', 'STUDIO LOT'];
}

export function validateCastApproval(productionId: string): CastingApprovalValidation {
  const production = getCastingProductionById(productionId);
  const workflowSteps = CASTING_WORKFLOW_STEPS.map((step) => ({
    id: step.id,
    label: step.label,
    complete: production?.workflowState[step.id] ?? false,
  }));
  const castApproved = production?.workflowState['approve-cast'] ?? false;
  const castLocked = production?.workflowState['lock-cast'] ?? false;
  return {
    productionId,
    workflowSteps,
    castApproved,
    castLocked,
    readyForProduction: castApproved && castLocked,
  };
}

export function getCastingInheritance(productionId: string): CastingInheritance | null {
  const production = getCastingProductionById(productionId);
  if (!production) return null;
  const assignedTalent = production.selectedTalent.split('\n').map((l) => l.trim()).filter(Boolean);
  const backupTalent = production.backupTalent.split('\n').map((l) => l.trim()).filter(Boolean);
  const profiles = listTalentAgencyIds(assignedTalent);
  return {
    productionId: production.id,
    showName: production.showName,
    inheritanceChain: CASTING_INHERITANCE_CHAIN,
    production,
    assignedTalent,
    backupTalent,
    talentAgencyIds: profiles,
    wardrobeAssignment: production.wardrobeAssignment,
    expressionPreset: production.expressionPreset,
    continuityNotes: production.continuityNotes,
    bypassBlocked: true,
    inheritedFrom: buildInheritedFrom(),
  };
}

function listTalentAgencyIds(names: string[]): string[] {
  const all = exportCastingSnapshot().talent;
  return names
    .map((name) => all.find((t) => t.name.toUpperCase() === name.toUpperCase())?.talentAgencyId)
    .filter((id): id is string => Boolean(id));
}

export const castingStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<CastingSnapshot>>;
  validateApproval(productionId: string): Promise<StudioServiceResult<CastingApprovalValidation>>;
  getCastingInheritance(productionId: string): Promise<StudioServiceResult<CastingInheritance>>;
} = {
  id: 'casting',
  label: 'CASTING',
  phase: 2,
  enabled: false,
  description:
    'CASTING & TALENT MANAGEMENT — NOTHING PROCEEDS WITHOUT APPROVED CAST · REFERENCES TALENT AGENCY',
  async getSnapshot() {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Casting snapshot requires browser localStorage context.');
    }
    return { ok: true, data: exportCastingSnapshot() };
  },
  async validateApproval(productionId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Casting validation requires browser context.');
    }
    const production = getCastingProductionById(productionId);
    if (!production) {
      return studioServicePhase2(`Casting production not found: ${productionId}`);
    }
    return { ok: true, data: validateCastApproval(productionId) };
  },
  async getCastingInheritance(productionId) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Casting inheritance requires browser context.');
    }
    const inheritance = getCastingInheritance(productionId);
    if (!inheritance) {
      return studioServicePhase2(`Casting production not found: ${productionId}`);
    }
    return { ok: true, data: inheritance };
  },
};
