import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import {
  defineDefaultDepartmentUiSockets,
  assertRequiredUiSocketsPresent,
  type DepartmentUiSocketBlueprint,
} from './ui-socket-registry';
import {
  detectAiGeneratedProductionUi,
  validateFounderRenderBeforeApproval,
  type RenderUiInspectionInput,
} from './immune-ui-detection';
import {
  appendArchitectureLawToEnvironmentPrompt,
  appendArchitectureLawToNegativePrompt,
  buildArchitectureLawPositiveDirective,
  buildArchitectureLawNegativeDirective,
} from './prompt-directives';
import { ARCHITECTURE_LAW_001_VERSION } from './contract';

export function attachUiSocketBlueprintToConstructionPlan(input: {
  plan: ConstructionPlan;
  departmentId: string;
}): ConstructionPlan & { uiMountSockets: DepartmentUiSocketBlueprint } {
  const uiMountSockets = defineDefaultDepartmentUiSockets(input.departmentId);
  return { ...input.plan, uiMountSockets };
}

export function validateDepartmentBlueprintForLaw001(input: {
  departmentId: string;
  uiMountSockets?: DepartmentUiSocketBlueprint;
}): { ok: true } | { ok: false; code: string; message: string } {
  const blueprint = input.uiMountSockets ?? defineDefaultDepartmentUiSockets(input.departmentId);
  const socketCheck = assertRequiredUiSocketsPresent(blueprint);
  if (!socketCheck.ok) {
    return {
      ok: false,
      code: 'UI_SOCKETS_INCOMPLETE',
      message: `Missing required UI mount sockets: ${socketCheck.missing.join(', ')}`,
    };
  }
  return { ok: true };
}

export function validateExperienceLabRenderApproval(input: RenderUiInspectionInput) {
  return validateFounderRenderBeforeApproval(input);
}

export function validateCdsRuntimeMountPrerequisite(input: {
  blueprintLocked: boolean;
  renderApproval: ReturnType<typeof validateFounderRenderBeforeApproval>;
}): { ok: true } | { ok: false; code: string; message: string } {
  if (!input.blueprintLocked) {
    return { ok: false, code: 'BLUEPRINT_NOT_LOCKED', message: 'Blueprint must be locked before Studio World runtime mounts live UI.' };
  }
  if (!input.renderApproval.ok) {
    return { ok: false, code: input.renderApproval.code, message: input.renderApproval.message };
  }
  return { ok: true };
}

export {
  appendArchitectureLawToEnvironmentPrompt,
  appendArchitectureLawToNegativePrompt,
  buildArchitectureLawPositiveDirective,
  buildArchitectureLawNegativeDirective,
  detectAiGeneratedProductionUi,
  defineDefaultDepartmentUiSockets,
  ARCHITECTURE_LAW_001_VERSION,
};
