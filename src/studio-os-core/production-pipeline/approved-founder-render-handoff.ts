import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { FounderRenderApprovalRecord } from '../founder-render/contract';

/** Canonical handoff from Experience Lab (Architect) → Creative Director Studio (Manufacturing). */
export const APPROVED_FOUNDER_RENDER_HANDOFF_VERSION = 'approved-founder-render-handoff.v1';

export type ProductionPipelineSource = 'experience-lab' | 'creative-director';

export type ApprovedFounderRenderHandoff = {
  handoffVersion: typeof APPROVED_FOUNDER_RENDER_HANDOFF_VERSION;
  source: ProductionPipelineSource;
  organizationId: string;
  projectId: string;
  stationId: string;
  roomId: string;
  constructionPlanId: string;
  blueprintId: string;
  blueprintRevision: number;
  founderRenderJobId: string;
  previewArtifactUrl: string;
  approvedAt: string;
  approvedBy: string;
  materialSetId: string;
  lightingProfileId: string;
  cameraProfileLabel: string;
  approvalRecord: FounderRenderApprovalRecord;
};

export type ApprovedHandoffValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export function buildApprovedFounderRenderHandoff(input: {
  plan: ConstructionPlan;
  source: ProductionPipelineSource;
  stationId: string;
  projectId: string;
  founderRenderJobId: string;
  previewArtifactUrl: string;
  approvedBy: string;
  approvalRecord: FounderRenderApprovalRecord;
}): ApprovedFounderRenderHandoff {
  const camera = input.plan.cameraAnchors[0];
  return {
    handoffVersion: APPROVED_FOUNDER_RENDER_HANDOFF_VERSION,
    source: input.source,
    organizationId: input.plan.metadata.organizationId,
    projectId: input.projectId,
    stationId: input.stationId,
    roomId: input.plan.room.roomId,
    constructionPlanId: input.plan.planId,
    blueprintId: input.plan.planId,
    blueprintRevision: input.plan.metadata.revision,
    founderRenderJobId: input.founderRenderJobId,
    previewArtifactUrl: input.previewArtifactUrl,
    approvedAt: input.approvalRecord.approvedAt,
    approvedBy: input.approvedBy,
    materialSetId: input.plan.materialSet.materialSetId,
    lightingProfileId: input.plan.lightingProfile.profileId,
    cameraProfileLabel: camera?.label ?? 'Hero',
    approvalRecord: input.approvalRecord,
  };
}

export function validateApprovedFounderRenderHandoff(
  handoff: ApprovedFounderRenderHandoff | null | undefined,
  options?: { currentBlueprintRevision?: number }
): ApprovedHandoffValidationResult {
  if (!handoff) {
    return {
      ok: false,
      code: 'HANDOFF_MISSING',
      message: 'Creative Director Studio requires an approved Founder Render from Experience Lab.',
    };
  }
  if (!handoff.previewArtifactUrl?.startsWith('http')) {
    return {
      ok: false,
      code: 'HANDOFF_PREVIEW_MISSING',
      message: 'Approved Founder Render preview URL is required before manufacturing.',
    };
  }
  if (!handoff.founderRenderJobId) {
    return { ok: false, code: 'HANDOFF_JOB_MISSING', message: 'Founder Render job id missing from handoff.' };
  }
  const current = options?.currentBlueprintRevision;
  if (typeof current === 'number' && current > handoff.blueprintRevision) {
    return {
      ok: false,
      code: 'HANDOFF_STALE',
      message: `Blueprint revision ${handoff.blueprintRevision} is stale; current is ${current}. Regenerate in Experience Lab.`,
    };
  }
  return { ok: true };
}

/** Experience Lab owns design only — never manufactures production assets after room approval. */
export const EXPERIENCE_LAB_MANUFACTURES_PRODUCTION_ASSETS = false;

/** CDS must not open a blank room generator when handoff is missing. */
export const CREATIVE_DIRECTOR_STUDIO_REQUIRES_APPROVED_HANDOFF = true;
