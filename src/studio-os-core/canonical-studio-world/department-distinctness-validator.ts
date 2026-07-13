import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { CanonicalMainDepartmentId } from './canonical-department-registry';
import {
  containsReceptionContamination,
  RECEPTION_CONTAMINATION_MARKERS,
  resolveDepartmentFingerprint,
} from './department-architectural-fingerprints';
import { isCanonicalDepartmentPlan } from './department-blueprint-builder';

export const DEPARTMENT_DISTINCTNESS_VERSION = 'department-distinctness.v1' as const;

export type DepartmentDistinctnessResult =
  | { ok: true; departmentId: CanonicalMainDepartmentId; architectureId: string; promptFingerprint: string }
  | { ok: false; code: 'DEPARTMENT_NOT_DISTINCT' | 'RECEPTION_CONTAMINATION' | 'SHARED_ARCHITECTURE'; message: string; marker?: string };

const priorArchitectureByDepartment = new Map<string, string>();
const priorPromptHashByDepartment = new Map<string, string>();

export function resetDepartmentDistinctnessRegistry(): void {
  priorArchitectureByDepartment.clear();
  priorPromptHashByDepartment.clear();
}

function promptFingerprint(plan: ConstructionPlan, effectivePrompt: string): string {
  return `${plan.architecture.architectureId}:${plan.architecture.shellSpecId}:${effectivePrompt.slice(0, 200)}`;
}

export function validateDepartmentDistinctness(input: {
  plan: ConstructionPlan;
  effectivePrompt: string;
  priorDepartmentId?: CanonicalMainDepartmentId | null;
}): DepartmentDistinctnessResult {
  if (!isCanonicalDepartmentPlan(input.plan)) {
    return { ok: true, departmentId: input.plan.room.roomId as CanonicalMainDepartmentId, architectureId: input.plan.architecture.architectureId, promptFingerprint: '' };
  }

  const departmentId = input.plan.room.roomId as CanonicalMainDepartmentId;
  const architectureId = input.plan.architecture.architectureId;
  const fp = resolveDepartmentFingerprint(departmentId);

  if (architectureId === 'ReceptionShell' || input.plan.architecture.shellSpecId.startsWith('shell-reception')) {
    return {
      ok: false,
      code: 'RECEPTION_CONTAMINATION',
      message: `Department ${departmentId} must not use ReceptionShell architecture.`,
      marker: 'ReceptionShell',
    };
  }

  const promptMarker = containsReceptionContamination(input.effectivePrompt);
  if (promptMarker) {
    return {
      ok: false,
      code: 'RECEPTION_CONTAMINATION',
      message: `Effective prompt for ${departmentId} contains reception contamination: ${promptMarker}`,
      marker: promptMarker,
    };
  }

  for (const asset of [...input.plan.heroAssets, ...input.plan.furnitureSet.assets]) {
    const assetMarker = RECEPTION_CONTAMINATION_MARKERS.find(
      (m) => asset.assetId.toLowerCase().includes(m.toLowerCase()) || asset.assetClass === 'reception-desk'
    );
    if (assetMarker) {
      return {
        ok: false,
        code: 'RECEPTION_CONTAMINATION',
        message: `Asset ${asset.assetId} in ${departmentId} is reception-contaminated.`,
        marker: assetMarker,
      };
    }
  }

  if (architectureId !== fp.shellId) {
    return {
      ok: false,
      code: 'SHARED_ARCHITECTURE',
      message: `Department ${departmentId} expected shell ${fp.shellId} but got ${architectureId}.`,
    };
  }

  const fingerprint = promptFingerprint(input.plan, input.effectivePrompt);

  if (input.priorDepartmentId && input.priorDepartmentId !== departmentId) {
    const priorArch = priorArchitectureByDepartment.get(input.priorDepartmentId);
    const priorPrompt = priorPromptHashByDepartment.get(input.priorDepartmentId);
    if (priorArch === architectureId && priorPrompt === fingerprint) {
      return {
        ok: false,
        code: 'DEPARTMENT_NOT_DISTINCT',
        message: `${departmentId} shares identical architecture and prompt fingerprint with ${input.priorDepartmentId}.`,
      };
    }
  }

  for (const [otherId, otherArch] of priorArchitectureByDepartment.entries()) {
    if (otherId === departmentId) continue;
    if (otherArch === architectureId) {
      const otherPrompt = priorPromptHashByDepartment.get(otherId);
      if (otherPrompt === fingerprint) {
        return {
          ok: false,
          code: 'DEPARTMENT_NOT_DISTINCT',
          message: `${departmentId} is architecturally identical to ${otherId}.`,
        };
      }
    }
  }

  priorArchitectureByDepartment.set(departmentId, architectureId);
  priorPromptHashByDepartment.set(departmentId, fingerprint);

  return { ok: true, departmentId, architectureId, promptFingerprint: fingerprint };
}

export function compareDepartmentPlans(
  planA: ConstructionPlan,
  planB: ConstructionPlan
): { distinct: boolean; sharedFields: string[] } {
  const sharedFields: string[] = [];
  if (planA.architecture.architectureId === planB.architecture.architectureId) {
    sharedFields.push('architectureId');
  }
  if (planA.architecture.shellSpecId === planB.architecture.shellSpecId) {
    sharedFields.push('shellSpecId');
  }
  if (planA.versions.promptVersion === planB.versions.promptVersion) {
    sharedFields.push('promptVersion');
  }
  if (planA.planId === planB.planId) {
    sharedFields.push('planId');
  }
  return { distinct: sharedFields.length === 0 || planA.room.roomId === planB.room.roomId, sharedFields };
}
