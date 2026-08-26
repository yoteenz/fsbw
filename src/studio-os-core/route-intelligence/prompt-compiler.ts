import { getStudioWorldProject } from './project-registry';
import type {
  DesignFamilyRecord,
  PageDesignReferencePromptInput,
  PageDesignReferencePromptOutput,
  ReferenceBatchPreview,
  ReferenceGenerationStatus,
  ReferenceNecessityAuditRecord,
} from './types';
import { isGenerationRequired } from './effective-reference-resolver';

/** Compiles founder-inspectable FAL prompts — does NOT dispatch generation */
export function compilePageDesignReferencePrompt(
  input: PageDesignReferencePromptInput,
): PageDesignReferencePromptOutput {
  const project = getStudioWorldProject(input.projectId);
  const shell = input.shellAuthority || project?.displayName || input.projectId;
  const dims =
    input.viewportClass === 'MOBILE'
      ? '390×844'
      : input.viewportClass === 'TABLET'
        ? '834×1194'
        : '1440×900';

  const neighborNote =
    input.neighboringReferenceIds.length > 0
      ? `Visual continuity with neighboring canonical screens: ${input.neighboringReferenceIds.join(', ')}.`
      : 'Establish visual continuity with project shell and navigation.';

  const prompt = [
    `Design reference for ${shell} — ${input.displayName} (${input.route}).`,
    `Viewport: ${input.viewportClass} (${dims}).`,
    `Route family: ${input.routeFamily}.`,
    `Purpose: canonical founder-approved design reference for reconstruction pipeline (P0.VR.2).`,
    neighborNote,
    `Shell authority: project header, nav, footer, and viewport conventions for ${shell}.`,
    ...input.designSystemNotes.map((n) => `Design system: ${n}`),
    input.dependencies.length
      ? `Flow dependencies: ${input.dependencies.join(' → ')}.`
      : '',
    'IMAGE REFERENCE > TEXT — use attached neighbor references where provided.',
    'Output: single full-page design reference screenshot composition, not production code.',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    prompt,
    imageReferenceIds: input.neighboringReferenceIds,
    modelHint: 'fal-ai/nano-banana-pro/edit',
    estimatedCostUsd: 0.08,
  };
}

export type ReferenceGenerationRequest = {
  projectId: string;
  routeId: string;
  viewportClass: PageDesignReferencePromptInput['viewportClass'];
  founderTriggered: boolean;
};

/** Validates founder trigger — audit path never spends */
export function validateReferenceGenerationRequest(
  req: ReferenceGenerationRequest,
): { allowed: boolean; status: ReferenceGenerationStatus; reason?: string } {
  if (!req.founderTriggered) {
    return { allowed: false, status: 'BLOCKED', reason: 'Reference generation requires founder trigger' };
  }
  return { allowed: true, status: 'READY_TO_GENERATE' };
}

export function buildReferenceBatchPreview(
  projectId: string,
  viewportClass: PageDesignReferencePromptInput['viewportClass'],
  routeIds: string[],
  model = 'fal-ai/nano-banana-pro/edit',
  options?: {
    necessityAudits?: ReferenceNecessityAuditRecord[];
    designFamilies?: DesignFamilyRecord[];
    designScreensCovered?: number;
  },
): ReferenceBatchPreview {
  const audits = options?.necessityAudits?.filter((a) => a.projectId === projectId && a.viewportClass === viewportClass);
  const requiredIds = audits
    ? [...new Set(audits.filter((a) => isGenerationRequired(a.classification)).map((a) => a.designScreenId))]
    : routeIds;
  const familyIds = options?.designFamilies
    ?.filter((f) => f.projectId === projectId && requiredIds.includes(f.representativeScreenId))
    .map((f) => f.designFamilyId) ?? [];

  const screensCovered = options?.designScreensCovered ?? routeIds.length;
  const avoided = audits?.filter((a) => a.estimatedGenerationAvoided).length ?? 0;

  return {
    projectId,
    viewportClass,
    routeIds: requiredIds,
    designFamilyIds: familyIds,
    requestCount: requiredIds.length,
    designScreensCovered: screensCovered,
    model,
    estimatedCostUsd: model ? Math.round(requiredIds.length * 0.08 * 100) / 100 : undefined,
    generationRequestsAvoided: avoided,
  };
}

/** Re-exports P0.VR.2 reconstruction pipeline entry — no duplicate engine */
export const RECONSTRUCTION_PIPELINE_ID = 'P0.VR.2';
export const ASSET_SLOT_PIPELINE_ID = 'P0.VR.2A';
export const PRODUCT_ASSET_PIPELINE_ID = 'P0.PAF';
