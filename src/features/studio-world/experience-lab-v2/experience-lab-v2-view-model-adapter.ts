import type { CanonicalMainDepartmentId } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { getCanonicalDepartmentRecord } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { resolveDepartmentCharter } from '../../../studio-os-core/canonical-studio-world/department-charters';
import { buildCanonicalDepartmentConstructionPlan } from '../../../studio-os-core/canonical-studio-world/canonical-department-construction-plan';
import type { CanonicalQueueSnapshot } from '../../../studio-os-core/canonical-studio-world/canonical-department-queue';
import type { ExperienceLabProgram } from '../../../studio-os-core/canonical-studio-world/experience-lab-program';
import { buildFounderRenderJobView, type FounderRenderJobView } from '../../../studio-os-core/founder-render';
import type { ConstructionPlan } from '../../../studio-os-core/blueprint-author/construction-plan-schema';
import { evaluateExperienceLabV2Approval } from './experience-lab-v2-approval';
import { readExperienceLabV2TestMode } from './experience-lab-v2-test-modes';
import type {
  ExperienceLabV2ArtifactRef,
  ExperienceLabV2ViewModel,
  StudioViewportMode,
} from './experience-lab-v2.types';

export type ExperienceLabV2AdapterInput = {
  program: ExperienceLabProgram;
  departmentId: CanonicalMainDepartmentId;
  viewportMode: StudioViewportMode;
  queue: CanonicalQueueSnapshot | null;
  founderRender?: Partial<FounderRenderJobView> | null;
  imageLoaded?: boolean;
  approvalRecorded?: boolean;
  hasAdminPermission?: boolean;
  useMock?: boolean;
};

function artifactFromPlan(plan: ConstructionPlan | null): ExperienceLabV2ArtifactRef {
  if (!plan) {
    return {
      kind: 'blueprint',
      label: 'Blueprint',
      revision: 0,
      status: 'missing',
      previewUrl: null,
      thumbnailUrl: null,
      summary: 'Blueprint unavailable',
    };
  }
  return {
    kind: 'blueprint',
    label: 'Blueprint',
    revision: plan.metadata.revision,
    status: 'ready',
    previewUrl: null,
    thumbnailUrl: null,
    summary: `${plan.room.displayName} · r${plan.metadata.revision}`,
  };
}

function buildRenderView(plan: ConstructionPlan | null, partial?: Partial<FounderRenderJobView> | null): FounderRenderJobView | null {
  if (!plan) return null;
  return buildFounderRenderJobView({
    plan,
    job: partial
      ? {
          jobId: partial.jobId ?? undefined,
          status: partial.status,
          previewArtifactUrl: partial.previewArtifactUrl ?? null,
          failureReason: partial.failureReason ?? null,
          blueprintRevision: partial.blueprintRevision,
          approvalStatus: partial.approvalStatus,
        }
      : null,
  });
}

export function experienceLabV2ViewModelAdapter(input: ExperienceLabV2AdapterInput): ExperienceLabV2ViewModel {
  const record = getCanonicalDepartmentRecord(input.departmentId);
  const charter = resolveDepartmentCharter(input.departmentId);
  const built = buildCanonicalDepartmentConstructionPlan(input.departmentId, 'landscape');
  const plan = built.ok ? built.plan : null;

  const founderRender = buildRenderView(plan, input.founderRender);

  const queueEntry = input.queue?.entries.find((e) => e.departmentId === input.departmentId);
  const testMode = input.useMock ? 'MOCK' : readExperienceLabV2TestMode();

  const blueprintArtifact = artifactFromPlan(plan);
  const constructionArtifact: ExperienceLabV2ArtifactRef = {
    kind: 'construction-plan',
    label: 'Construction Plan',
    revision: plan?.metadata.revision ?? 0,
    status: plan ? 'ready' : 'missing',
    previewUrl: null,
    thumbnailUrl: null,
    summary: plan ? `${plan.planId}` : 'Construction plan unavailable',
  };
  const renderArtifact: ExperienceLabV2ArtifactRef = {
    kind: 'founder-render',
    label: 'Founder Render',
    revision: founderRender?.blueprintRevision ?? plan?.metadata.revision ?? 0,
    status:
      founderRender?.status === 'ready' || founderRender?.status === 'approved'
        ? 'ready'
        : founderRender?.status === 'generating' || founderRender?.status === 'queued'
          ? 'loading'
          : founderRender?.isStale
            ? 'stale'
            : founderRender?.status === 'failed'
              ? 'error'
              : 'missing',
    previewUrl: founderRender?.previewArtifactUrl ?? null,
    thumbnailUrl: founderRender?.previewArtifactUrl ?? null,
    summary: founderRender?.roomDisplayName ?? record?.name ?? input.departmentId,
  };

  const approval = evaluateExperienceLabV2Approval({
    founderRender,
    imageLoaded: input.imageLoaded ?? false,
    blueprintRevision: record?.blueprintRevision ?? plan?.metadata.revision ?? 0,
    testMode,
    approvalRecorded: input.approvalRecorded ?? founderRender?.approvalStatus === 'approved',
    hasAdminPermission: input.hasAdminPermission ?? true,
  });

  return {
    version: 'experience-lab-v2.v1',
    program: input.program,
    departmentId: input.departmentId,
    departmentName: record?.name ?? input.departmentId,
    revision: record?.blueprintRevision ?? plan?.metadata.revision ?? 0,
    approvalStatus: founderRender?.approvalStatus ?? 'pending',
    permitStatus: approval.permitStatus,
    costEstimate: founderRender?.estimatedCost ? `$${founderRender.estimatedCost.toFixed(2)}` : '—',
    healthState: queueEntry?.status ?? 'idle',
    testMode,
    liveBackendMode: testMode === 'CONTROLLED_LIVE',
    viewportMode: input.viewportMode,
    artifacts: {
      blueprint: blueprintArtifact,
      construction: constructionArtifact,
      founderRender: renderArtifact,
      materials: {
        kind: 'materials',
        label: 'Materials',
        revision: record?.blueprintRevision ?? 0,
        status: 'ready',
        previewUrl: null,
        thumbnailUrl: null,
        summary: founderRender?.materialLibrary ?? 'canonical-marble',
      },
      lighting: {
        kind: 'lighting',
        label: 'Lighting',
        revision: record?.blueprintRevision ?? 0,
        status: 'ready',
        previewUrl: null,
        thumbnailUrl: null,
        summary: founderRender?.lightingProfile ?? 'experience-lab-default',
      },
      camera: {
        kind: 'camera',
        label: 'Camera',
        revision: record?.blueprintRevision ?? 0,
        status: 'ready',
        previewUrl: null,
        thumbnailUrl: null,
        summary: founderRender?.cameraProfile ?? 'Hero camera',
      },
    },
    founderRender,
    blueprintSummary: blueprintArtifact.summary,
    constructionSummary: constructionArtifact.summary,
    charterSummary: charter.mission,
    dependencies: charter.requiredWorkbenchModules?.slice(0, 4) ?? [],
    approval,
    migrationReadiness: {
      mobileApproved: false,
      desktopApproved: false,
      viewportApproved: false,
      dataParityApproved: false,
      generationParityApproved: false,
      accessibilityApproved: false,
      performanceApproved: false,
      productionNavigationApproved: false,
    },
    diagnostics: [
      `Queue: ${queueEntry?.status ?? 'none'}`,
      `Render: ${founderRender?.status ?? 'no_preview'}`,
      `Mode: ${testMode}`,
    ],
    isStale: founderRender?.isStale ?? false,
    imageLoaded: input.imageLoaded ?? false,
  };
}

export function parseViewportModeFromQuery(search: string): StudioViewportMode | null {
  const params = new URLSearchParams(search);
  const view = params.get('view');
  if (!view) return null;
  const map: Record<string, StudioViewportMode> = {
    blueprint: 'BLUEPRINT',
    'founder-render': 'FOUNDER_RENDER',
    construction: 'CONSTRUCTION_PLAN',
    materials: 'MATERIALS',
    lighting: 'LIGHTING',
    camera: 'CAMERA',
    split: 'SPLIT_VIEW',
  };
  return map[view] ?? null;
}

export function viewportModeToQuery(mode: StudioViewportMode): string | null {
  const map: Partial<Record<StudioViewportMode, string>> = {
    BLUEPRINT: 'blueprint',
    FOUNDER_RENDER: 'founder-render',
    CONSTRUCTION_PLAN: 'construction',
    MATERIALS: 'materials',
    LIGHTING: 'lighting',
    CAMERA: 'camera',
    SPLIT_VIEW: 'split',
  };
  return map[mode] ?? null;
}
