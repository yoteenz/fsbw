import type { ExperienceLabLiveWorkspaceViewModel } from './ExperienceLabLiveWorkspaceViewModel';

export function buildLiveWorkspaceDiagnosticJson(
  live: ExperienceLabLiveWorkspaceViewModel
): Record<string, unknown> {
  return {
    exportedAt: new Date().toISOString(),
    activeWorkspaceContext: {
      programId: live.programId,
      departmentId: live.departmentId,
      environmentId: live.environmentId,
      variantId: live.variantId,
      environmentPackageId: live.environmentPackageId,
      packageRevision: live.packageRevision,
      packageStatus: live.packageStatus,
    },
    workbench: {
      activeTool: live.activeWorkbenchTool,
      activeContextModule: live.activeContextModule,
    },
    blueprint: {
      displayState: live.blueprintStatus,
      outputSource: live.blueprintOutput.source,
      artifactUrl: live.blueprintOutput.artifactUrl,
      canGenerate: live.blueprintOutput.canGenerate,
      canRetry: live.blueprintOutput.canRetry,
      canOpen: live.blueprintOutput.canOpen,
    },
    dataSources: {
      designBrief: live.diagnostics.designBriefSource,
      reviewWallCount: live.diagnostics.reviewWallSourceCount,
      timelineCount: live.diagnostics.timelineSourceCount,
      repositoryMode: live.diagnostics.repositoryMode,
      realtimeConnected: live.diagnostics.realtimeConnected,
    },
    readiness: {
      percent: live.readinessPercent,
      blockers: live.readinessBlockers,
      approvalEligible: live.diagnostics.approvalEligible,
    },
    latestPackageEvent: live.diagnostics.latestPackageEvent,
    historicalPreviewMode: live.isHistoricalPreviewMode,
    loading: live.loading,
    error: live.error,
    empty: live.empty,
  };
}

export function exportLiveWorkspaceDiagnosticJson(live: ExperienceLabLiveWorkspaceViewModel): string {
  return JSON.stringify(buildLiveWorkspaceDiagnosticJson(live), null, 2);
}
