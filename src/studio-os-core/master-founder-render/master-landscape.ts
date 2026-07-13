import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { BrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import {
  MASTER_FOUNDER_LANDSCAPE_INTENT,
  MASTER_LANDSCAPE_ASPECT,
  MASTER_LANDSCAPE_PROMPT_VERSION,
  MASTER_FOUNDER_RENDER_VERSION,
  type MasterFounderRender,
  type MasterRenderRevisionBundle,
} from './contract';

export function buildMasterLandscapeRenderRecord(input: {
  renderId: string;
  plan: ConstructionPlan;
  jobId?: string | null;
  artifactUrl?: string | null;
  aiModel: string;
  status?: MasterFounderRender['status'];
  departmentRegistryId?: string | null;
}): MasterFounderRender {
  const { plan } = input;
  const revisions: MasterRenderRevisionBundle = {
    blueprintRevision: plan.metadata.revision,
    constructionRevision: plan.metadata.revision,
    materialRevision: parseInt(plan.versions.materialVersion, 10) || plan.metadata.revision,
    lightingRevision: parseInt(plan.versions.lightingVersion, 10) || plan.metadata.revision,
    cameraRevision: plan.metadata.revision,
    assetRevision: parseInt(plan.versions.assetVersion, 10) || plan.metadata.revision,
    sceneRevision: parseInt(plan.versions.roomVersion, 10) || plan.metadata.revision,
  };

  return {
    renderVersion: MASTER_FOUNDER_RENDER_VERSION,
    renderId: input.renderId,
    organizationId: plan.metadata.organizationId,
    projectId: plan.metadata.author,
    roomId: plan.room.roomId,
    blueprintId: plan.planId,
    constructionPlanId: plan.planId,
    revisions,
    aspectRatio: MASTER_LANDSCAPE_ASPECT,
    artifactUrl: input.artifactUrl ?? null,
    jobId: input.jobId ?? null,
    status: input.status ?? 'no_preview',
    aiModel: input.aiModel,
    promptVersion: MASTER_LANDSCAPE_PROMPT_VERSION,
    organizationAssets: [plan.materialSet.materialSetId, plan.styleProfile.styleId],
    departmentRegistryId: input.departmentRegistryId ?? null,
    approvedAt: null,
    approvedBy: null,
  };
}

export function buildMasterLandscapePrompt(input: {
  plan: ConstructionPlan;
  brandPackage: BrandMaterialPackage;
  founderRevisionNote?: string | null;
}): { prompt: string; negativePrompt: string; artifactIntent: typeof MASTER_FOUNDER_LANDSCAPE_INTENT } {
  const { plan, brandPackage } = input;
  const camera = plan.cameraAnchors.find((c) => c.purpose === 'overview' || c.purpose === 'hero') ?? plan.cameraAnchors[0];

  const prompt = [
    `MASTER LANDSCAPE FOUNDER RENDER — canonical architectural source of truth.`,
    `ROOM: ${plan.room.displayName} — ${plan.room.purpose}.`,
    `COMPLETE ROOM: ONE photoreal interior at ${MASTER_LANDSCAPE_ASPECT} ultra-high resolution. This is the permanent master render — all devices derive framing from this image.`,
    `ARCHITECTURE: ${plan.architecture.architectureId} v${plan.architecture.version}. Immutable shell ${plan.architecture.shellSpecId}.`,
    `MATERIALS: ${plan.materialSet.materialIds.join(', ')}. ${brandPackage.promptSections.organizationMaterialAssignments}`,
    `LIGHTING: ${plan.lightingProfile.profileId} — ${plan.lightingProfile.colorTemperatureK}K.`,
    `CAMERA: ${camera?.label ?? 'Wide master'} — eye-level architectural photography, entire room visible.`,
    `OUTPUT: ${MASTER_LANDSCAPE_PROMPT_VERSION} · ${MASTER_LANDSCAPE_ASPECT} · 4K photoreal master landscape.`,
    input.founderRevisionNote ? `FOUNDER REVISION: ${input.founderRevisionNote}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const negativePrompt = [
    'mobile crop',
    'portrait crop',
    'split desktop mobile versions',
    'wireframe',
    'blueprint',
    'procedural clay',
    'isolated object',
  ].join(', ');

  return { prompt, negativePrompt, artifactIntent: MASTER_FOUNDER_LANDSCAPE_INTENT };
}

export function approveMasterLandscape(
  render: MasterFounderRender,
  approvedBy: string
): MasterFounderRender {
  if (!render.artifactUrl?.startsWith('http')) {
    throw new Error('Cannot approve master landscape without artifact URL.');
  }
  return {
    ...render,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy,
  };
}

export function canGenerateMasterPortrait(landscape: MasterFounderRender): boolean {
  return landscape.status === 'approved' && Boolean(landscape.artifactUrl?.startsWith('http'));
}
