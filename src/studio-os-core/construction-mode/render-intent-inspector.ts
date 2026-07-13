import type { RenderIntent } from '../manufacturing-engine/render-intent';
import type { ManufacturingWorkerRole } from '../manufacturing-engine/contract';

export const RENDER_INTENT_INSPECTOR_VERSION = 'render-intent-inspector.v1';

export type RenderIntentInspectorPanel = {
  inspectorVersion: typeof RENDER_INTENT_INSPECTOR_VERSION;
  intentId: string;
  assetId: string;
  purpose: string;
  isolation: boolean;
  transparency: string;
  perspective: string;
  lighting: string;
  materialLibraryId: string;
  materialIds: string[];
  negativeRules: string[];
  organizationAssets: string[];
  workerRole: ManufacturingWorkerRole | null;
  qualityThreshold: number;
  validationThreshold: number;
  repairThreshold: number;
  forbiddenArchitecture: boolean;
  forbiddenPeople: boolean;
  expectedOutput: string;
};

export function buildRenderIntentInspector(input: {
  intent: RenderIntent;
  workerRole?: ManufacturingWorkerRole;
}): RenderIntentInspectorPanel {
  return {
    inspectorVersion: RENDER_INTENT_INSPECTOR_VERSION,
    intentId: input.intent.intentId,
    assetId: input.intent.assetId,
    purpose: input.intent.purpose,
    isolation: input.intent.isolation,
    transparency: input.intent.transparency,
    perspective: input.intent.perspective,
    lighting: input.intent.lighting,
    materialLibraryId: input.intent.materialLibraryId,
    materialIds: input.intent.materialIds,
    negativeRules: input.intent.negativeRules,
    organizationAssets: input.intent.organizationAssets,
    workerRole: input.workerRole ?? null,
    qualityThreshold: input.intent.qualityThreshold,
    validationThreshold: input.intent.validationThreshold,
    repairThreshold: input.intent.repairThreshold,
    forbiddenArchitecture: input.intent.forbiddenArchitecture,
    forbiddenPeople: input.intent.forbiddenPeople,
    expectedOutput: input.intent.outputType === 'transparent-png' ? 'Single isolated asset — nothing else' : input.intent.outputType,
  };
}
