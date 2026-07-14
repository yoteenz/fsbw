import type { ExperienceLabLiveWorkspaceViewModel } from './ExperienceLabLiveWorkspaceViewModel';
import type {
  ExperienceLabV2ArtifactRef,
  ExperienceLabV2ViewModel,
  StudioViewportMode,
} from '../experience-lab-v2.types';
import { evaluateExperienceLabV2Approval } from '../experience-lab-v2-approval';
import { readExperienceLabV2TestMode } from '../experience-lab-v2-test-modes';

/** Bridge live workspace view model to legacy ExperienceLabV2ViewModel for unchanged layout components. */
export function liveWorkspaceToV2ViewModel(
  live: ExperienceLabLiveWorkspaceViewModel,
  viewportMode: StudioViewportMode,
  imageLoaded: boolean,
  useMock?: boolean
): ExperienceLabV2ViewModel {
  const testMode = useMock ? 'MOCK' : readExperienceLabV2TestMode();
  const fr = live.founderRender;

  const blueprintArtifact: ExperienceLabV2ArtifactRef = {
    kind: 'blueprint',
    label: 'Blueprint',
    revision: live.packageRevision,
    status: live.blueprintOutput.artifactUrl ? 'ready' : live.blueprintOutput.outputStatus === 'generating' ? 'loading' : live.blueprintOutput.outputStatus === 'failed' ? 'error' : 'missing',
    previewUrl: live.blueprintOutput.artifactUrl,
    thumbnailUrl: live.blueprintOutput.artifactUrl,
    summary: `${live.environmentName} · r${live.packageRevision}`,
  };

  const constructionArtifact: ExperienceLabV2ArtifactRef = {
    kind: 'construction-plan',
    label: 'Construction Plan',
    revision: live.packageRevision,
    status: live.workbenchModules.architectural.constructionStatus === 'generated' || live.workbenchModules.architectural.constructionStatus === 'cached' ? 'ready' : 'missing',
    previewUrl: null,
    thumbnailUrl: null,
    summary: `Construction · ${live.workbenchModules.architectural.constructionStatus}`,
  };

  const renderArtifact: ExperienceLabV2ArtifactRef = {
    kind: 'founder-render',
    label: 'Founder Render',
    revision: fr?.blueprintRevision ?? live.packageRevision,
    status:
      fr?.status === 'ready' || fr?.status === 'approved'
        ? 'ready'
        : fr?.status === 'generating' || fr?.status === 'queued'
          ? 'loading'
          : fr?.isStale
            ? 'stale'
            : fr?.status === 'failed'
              ? 'error'
              : 'missing',
    previewUrl: fr?.previewArtifactUrl ?? null,
    thumbnailUrl: fr?.previewArtifactUrl ?? null,
    summary: fr?.roomDisplayName ?? live.departmentName,
  };

  const approval = evaluateExperienceLabV2Approval({
    founderRender: fr,
    imageLoaded,
    blueprintRevision: live.packageRevision,
    testMode,
    approvalRecorded: fr?.approvalStatus === 'approved',
    hasAdminPermission: true,
  });

  return {
    version: 'experience-lab-v2.v1',
    program: live.programId,
    departmentId: live.departmentId,
    departmentName: live.departmentName,
    revision: live.packageRevision,
    approvalStatus: fr?.approvalStatus ?? 'pending',
    permitStatus: live.workbenchModules.permit.permitStatus,
    costEstimate: live.workbenchModules.budget.displayEstimate,
    healthState: live.packageStatus,
    testMode,
    liveBackendMode: testMode === 'CONTROLLED_LIVE',
    viewportMode,
    artifacts: {
      blueprint: blueprintArtifact,
      construction: constructionArtifact,
      founderRender: renderArtifact,
      materials: {
        kind: 'materials',
        label: 'Materials',
        revision: live.packageRevision,
        status: live.workbenchModules.materials.profileStatus === 'generated' || live.workbenchModules.materials.profileStatus === 'cached' ? 'ready' : 'missing',
        previewUrl: null,
        thumbnailUrl: null,
        summary: live.workbenchModules.materials.summary,
      },
      lighting: {
        kind: 'lighting',
        label: 'Lighting',
        revision: live.packageRevision,
        status: 'ready',
        previewUrl: null,
        thumbnailUrl: null,
        summary: live.founderRender?.lightingProfile ?? 'experience-lab-default',
      },
      camera: {
        kind: 'camera',
        label: 'Camera',
        revision: live.packageRevision,
        status: 'ready',
        previewUrl: null,
        thumbnailUrl: null,
        summary: live.founderRender?.cameraProfile ?? 'Hero camera',
      },
    },
    founderRender: fr,
    blueprintSummary: blueprintArtifact.summary,
    constructionSummary: constructionArtifact.summary,
    charterSummary: live.designBrief.currentObjective,
    dependencies: live.workbenchModules.architectural.dependencies,
    approval,
    migrationReadiness: {
      mobileApproved: live.generatedOutputs.includes('mobile'),
      desktopApproved: live.generatedOutputs.includes('desktop'),
      viewportApproved: Boolean(fr?.previewArtifactUrl),
      dataParityApproved: !live.empty,
      generationParityApproved: live.generatedOutputs.length > 0,
      accessibilityApproved: false,
      performanceApproved: false,
      productionNavigationApproved: false,
    },
    diagnostics: [
      `Package: ${live.environmentPackageId || 'none'}`,
      `Blueprint: ${live.blueprintStatus}`,
      `Render: ${fr?.status ?? 'no_preview'}`,
      `Mode: ${testMode}`,
      `Timeline events: ${live.timelineEvents.length}`,
      `Review entries: ${live.founderReviewEntries.length}`,
    ],
    isStale: live.blueprintOutput.isStale,
    imageLoaded,
    liveWorkspace: live,
  } as ExperienceLabV2ViewModel & { liveWorkspace: ExperienceLabLiveWorkspaceViewModel };
}
