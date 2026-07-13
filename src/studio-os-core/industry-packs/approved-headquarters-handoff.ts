import type {
  ApprovedHeadquartersHandoff,
  DepartmentTemplateId,
  IndustryPack,
  IndustryPackValidationResult,
} from './contract';
import { APPROVED_HEADQUARTERS_HANDOFF_VERSION } from './contract';
import type { HeadquartersGenerationPlan } from './contract';

export type ApprovedHeadquartersHandoffInput = {
  pack: IndustryPack;
  organizationId: string;
  founderPackInstanceId: string;
  founderRenderJobId: string;
  previewArtifactUrl: string;
  approvedAt: string;
  approvedBy: string;
  generationPlan: HeadquartersGenerationPlan;
};

export function buildApprovedHeadquartersHandoff(
  input: ApprovedHeadquartersHandoffInput
): ApprovedHeadquartersHandoff {
  return {
    handoffVersion: APPROVED_HEADQUARTERS_HANDOFF_VERSION,
    organizationId: input.organizationId,
    packId: input.pack.packId,
    packVersion: input.pack.packVersion,
    archetypeId: input.pack.archetypeId,
    founderPackInstanceId: input.founderPackInstanceId,
    headquartersBlueprintId: input.pack.blueprintTemplateId,
    founderRenderJobId: input.founderRenderJobId,
    previewArtifactUrl: input.previewArtifactUrl,
    approvedAt: input.approvedAt,
    approvedBy: input.approvedBy,
    departmentRegistry: input.pack.defaultDepartments,
    constructionMetadata: {
      constructionTemplateId: input.pack.constructionTemplateId,
      materialLibraryId: input.pack.materialLibraryId,
      lightingProfileId: input.pack.lightingProfileId,
      cameraPackId: input.pack.cameraPackId,
    },
    packDependencyGraph: input.generationPlan.packDependencyGraph,
    departmentReuseGraph: input.generationPlan.departmentReuseGraph,
    assetGraphNodeCount: input.pack.defaultAssets.length,
  };
}

export function validateApprovedHeadquartersHandoff(
  handoff: ApprovedHeadquartersHandoff | null | undefined
): IndustryPackValidationResult {
  if (!handoff) {
    return {
      ok: false,
      code: 'HQ_HANDOFF_MISSING',
      message: 'Creative Director Studio requires an approved headquarters handoff from Experience Lab.',
    };
  }
  if (!handoff.previewArtifactUrl?.startsWith('http')) {
    return {
      ok: false,
      code: 'HQ_HANDOFF_PREVIEW_MISSING',
      message: 'Approved headquarters Founder Render URL is required.',
    };
  }
  if (!handoff.founderRenderJobId) {
    return { ok: false, code: 'HQ_HANDOFF_JOB_MISSING', message: 'Founder Render job id missing from headquarters handoff.' };
  }
  if (handoff.departmentRegistry.length === 0) {
    return { ok: false, code: 'HQ_HANDOFF_NO_DEPARTMENTS', message: 'Headquarters handoff must include department registry.' };
  }
  return { ok: true };
}

/** CDS must not invent architecture when headquarters handoff is present. */
export const CREATIVE_DIRECTOR_STUDIO_REQUIRES_HQ_HANDOFF_FOR_PACK_FLOWS = true;

/** Experience Lab generates entire pack — not room-by-room. */
export const EXPERIENCE_LAB_GENERATES_COMPLETE_HEADQUARTERS = true;

export function pinDepartmentVersion(
  pack: IndustryPack,
  templateId: DepartmentTemplateId,
  newVersion: string
): IndustryPack {
  return {
    ...pack,
    defaultDepartments: pack.defaultDepartments.map((slot) =>
      slot.templateId === templateId ? { ...slot, pinnedVersion: newVersion } : slot
    ),
    revisionHistory: [...pack.revisionHistory, `${templateId}@${newVersion}`],
  };
}
