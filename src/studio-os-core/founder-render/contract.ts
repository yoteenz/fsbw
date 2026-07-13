import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export const FOUNDER_RENDER_ARTIFACT_INTENT = 'founder-full-room-preview' as const;
export const FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION = 'founder-full-room-preview-prompt.v1';

export type FounderRenderJobStatus =
  | 'no_preview'
  | 'queued'
  | 'generating'
  | 'ready'
  | 'failed'
  | 'stale'
  | 'approved';

export type FounderRenderApprovalRecord = {
  previewArtifactId: string;
  previewArtifactUrl: string;
  blueprintId: string;
  blueprintRevision: number;
  constructionPlanId: string;
  founderId: string;
  approvedAt: string;
  model: string;
  promptVersion: string;
  materialSet: string;
  lightingProfile: string;
  cameraProfile: string;
};

export type FounderRenderJobView = {
  jobId: string | null;
  status: FounderRenderJobStatus;
  artifactIntent: typeof FOUNDER_RENDER_ARTIFACT_INTENT;
  organizationId: string;
  projectId: string;
  roomId: string;
  blueprintId: string;
  blueprintRevision: number;
  constructionPlanId: string;
  roomDisplayName: string;
  roomPurpose: string;
  modelRoute: string | null;
  providerModel: string | null;
  promptVersion: string;
  previewArtifactUrl: string | null;
  failureReason: string | null;
  materialLibrary: string;
  lightingProfile: string;
  cameraProfile: string;
  estimatedCost: number;
  estimatedBuildTimeMs: number;
  isStale: boolean;
  currentBlueprintRevision: number;
  approvalStatus: 'pending' | 'approved';
  diagnostics: FounderRenderDiagnostics | null;
  revisionNote: string | null;
};

export type FounderRenderDiagnostics = {
  artifactIntent: string;
  modelRoute: string | null;
  providerModel: string | null;
  promptVersion: string;
  blueprintRevision: number;
  referenceCount: number;
  brandMaterialReferences: string[];
  dispatchTimestamp: string | null;
  providerJobId: string | null;
  providerStatus: string | null;
  outputUrl: string | null;
  outputDimensions: string | null;
  generationDurationMs: number | null;
  persistenceStatus: string;
  approvalStatus: string;
  effectivePromptPreview: string | null;
  departmentId?: string | null;
  departmentClass?: string | null;
  blueprintId?: string | null;
  shellSpecId?: string | null;
  cacheKey?: string | null;
  architecturalFingerprint?: string[];
  referencePackageVersion?: string | null;
  promptHash?: string | null;
  jobId?: string | null;
  renderId?: string | null;
};

export function buildFounderRenderJobView(input: {
  plan: ConstructionPlan;
  job?: Partial<{
    jobId: string;
    status: FounderRenderJobStatus;
    previewArtifactUrl: string | null;
    failureReason: string | null;
    modelRoute: string | null;
    providerModel: string | null;
    blueprintRevision: number;
    approvalStatus: 'pending' | 'approved';
    diagnostics: FounderRenderDiagnostics | null;
    revisionNote: string | null;
  }> | null;
  estimatedCost?: number;
  estimatedBuildTimeMs?: number;
}): FounderRenderJobView {
  const { plan } = input;
  const job = input.job;
  const currentRevision = plan.metadata.revision;
  const jobRevision = job?.blueprintRevision ?? currentRevision;
  const hasPreview = Boolean(job?.previewArtifactUrl);
  let status: FounderRenderJobStatus = job?.status ?? 'no_preview';
  if (hasPreview && jobRevision < currentRevision) status = 'stale';
  if (job?.approvalStatus === 'approved' && hasPreview && status !== 'stale') status = 'approved';

  const primaryCamera = plan.cameraAnchors[0];

  return {
    jobId: job?.jobId ?? null,
    status,
    artifactIntent: FOUNDER_RENDER_ARTIFACT_INTENT,
    organizationId: plan.metadata.organizationId,
    projectId: plan.metadata.author,
    roomId: plan.room.roomId,
    blueprintId: plan.planId,
    blueprintRevision: jobRevision,
    constructionPlanId: plan.planId,
    roomDisplayName: plan.room.displayName,
    roomPurpose: plan.room.purpose,
    modelRoute: job?.modelRoute ?? null,
    providerModel: job?.providerModel ?? null,
    promptVersion: FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
    previewArtifactUrl: job?.previewArtifactUrl ?? null,
    failureReason: job?.failureReason ?? null,
    materialLibrary: plan.materialSet.materialSetId,
    lightingProfile: plan.lightingProfile.profileId,
    cameraProfile: primaryCamera?.label ?? 'Hero camera',
    estimatedCost: input.estimatedCost ?? 0,
    estimatedBuildTimeMs: input.estimatedBuildTimeMs ?? 0,
    isStale: hasPreview && jobRevision < currentRevision,
    currentBlueprintRevision: currentRevision,
    approvalStatus: job?.approvalStatus ?? 'pending',
    diagnostics: job?.diagnostics ?? null,
    revisionNote: job?.revisionNote ?? null,
  };
}

export function canApproveFounderRender(job: FounderRenderJobView, imageLoaded: boolean): boolean {
  if (job.status !== 'ready' && job.status !== 'approved') return false;
  if (job.isStale) return false;
  if (!job.previewArtifactUrl) return false;
  if (!imageLoaded) return false;
  if (job.blueprintRevision !== job.currentBlueprintRevision) return false;
  if (job.failureReason) return false;
  return true;
}
