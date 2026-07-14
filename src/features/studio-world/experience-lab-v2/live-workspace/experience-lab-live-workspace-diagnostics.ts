import type { ExperienceLabLiveWorkspaceViewModel } from './ExperienceLabLiveWorkspaceViewModel';
import type { EventSyncState } from './useEnvironmentPackageEventSync';

export function buildLiveWorkspaceDiagnosticJson(
  live: ExperienceLabLiveWorkspaceViewModel,
  eventSync?: EventSyncState
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
    eventSynchronization: eventSync
      ? {
          connectionState: eventSync.cursor.connectionState,
          activeSubscriptionPackageId: eventSync.cursor.packageId,
          lastEventId: eventSync.cursor.lastEventId,
          lastSequence: eventSync.cursor.lastSequence,
          missingEventCount: eventSync.cursor.missingSequenceCount,
          duplicateEventCount: eventSync.cursor.duplicateEventCount,
          recoveryCount: eventSync.cursor.recoveryCount,
          lastRecoveryTime: eventSync.cursor.lastRecoveryAt,
          lastInvalidationSet: eventSync.lastInvalidationSet,
          processingErrors: eventSync.cursor.processingErrors,
          subscriberCount: eventSync.subscriberCount,
          currentPackageUpdatedWhileHistoricalPreview: eventSync.currentPackageUpdated,
        }
      : live.diagnostics.eventSync,
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

export function exportLiveWorkspaceDiagnosticJson(
  live: ExperienceLabLiveWorkspaceViewModel,
  eventSync?: EventSyncState
): string {
  return JSON.stringify(buildLiveWorkspaceDiagnosticJson(live, eventSync), null, 2);
}
