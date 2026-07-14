import type { EnvironmentPackageEvent } from './EnvironmentPackageEvent';
import { resolveInvalidationsForEvent } from './EnvironmentPackageEventInvalidationMatrix';
import type { WorkspaceDataSelector } from './EnvironmentPackageEventInvalidationMatrix';

export type WorkspaceReconciliationInput = {
  event: EnvironmentPackageEvent;
  activePackageId: string | null;
  historicalPreviewRevision: number | null;
  activeWorkbenchTool: string | null;
};

export type WorkspaceReconciliationResult = {
  accepted: boolean;
  reason: string | null;
  invalidations: WorkspaceDataSelector[];
  refreshPackage: boolean;
  preserveHistoricalPreview: boolean;
  currentPackageUpdated: boolean;
  switchWorkbenchTool: false;
};

/** Reconcile one event against active workspace — prevents stale cross-package writes. */
export function reconcileExperienceLabWorkspace(
  input: WorkspaceReconciliationInput
): WorkspaceReconciliationResult {
  const { event, activePackageId, historicalPreviewRevision } = input;

  if (!activePackageId || event.packageId !== activePackageId) {
    return {
      accepted: false,
      reason: 'event-package-mismatch',
      invalidations: [],
      refreshPackage: false,
      preserveHistoricalPreview: historicalPreviewRevision !== null,
      currentPackageUpdated: false,
      switchWorkbenchTool: false,
    };
  }

  const invalidations = resolveInvalidationsForEvent(event.eventType);
  const refreshPackage =
    invalidations.includes('active-package')
    || invalidations.includes('package-outputs')
    || event.eventType.startsWith('PACKAGE_')
    || event.eventType.startsWith('OUTPUT_');

  const currentPackageUpdated =
    historicalPreviewRevision !== null
    && (
      event.eventType === 'OUTPUT_GENERATED'
      || event.eventType === 'BLUEPRINT_UPDATED'
      || event.eventType === 'REVISION_COMPLETED'
      || event.eventType === 'PACKAGE_STATUS_CHANGED'
    );

  return {
    accepted: true,
    reason: null,
    invalidations,
    refreshPackage,
    preserveHistoricalPreview: historicalPreviewRevision !== null,
    currentPackageUpdated,
    switchWorkbenchTool: false,
  };
}
