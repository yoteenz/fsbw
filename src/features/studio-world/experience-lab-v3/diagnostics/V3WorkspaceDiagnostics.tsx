import { useCallback } from 'react';
import { useExperienceLabLiveWorkspace } from '../../experience-lab-v2/live-workspace';
import { useV3Workspace } from '../context/ExperienceLabV3WorkspaceProvider';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { V3_INSPECTOR_COPY } from '../registry/v3-workbench-registry';

/** V3 workspace diagnostics panel + export. */
export function V3WorkspaceDiagnostics() {
  const { getPagerDiagnostics } = useV3Workspace();
  const { state } = useExperienceLabV3Store();
  const { liveWorkspace, exportDiagnostics, eventSync } = useExperienceLabLiveWorkspace();

  const buildExport = useCallback(() => {
    const pager = getPagerDiagnostics();
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        activeWorkspace: state.activeWorkspace,
        pagerIndex: pager.pagerIndex,
        pagerOffset: pager.pagerOffset,
        swipeProgress: pager.swipeProgress,
        mountedPages: pager.mountedPages,
        preloadedPages: pager.preloadedPages,
        activePackageId: liveWorkspace.environmentPackageId,
        activeWorkOrderId: state.activeWorkOrderId,
        activeReviewItemId: state.activeReviewId,
        activeAssetId: state.activeAssetId,
        activeWorkbenchTool: state.activeWorkbenchTool,
        activePersistentDisplay: 'workspace-specific',
        activeInterchangeableDisplay: state.activeInspectorMode,
        workspaceDataState: state.workspaceDataState,
        lastWorkspaceEvent: eventSync.lastInvalidationSet,
        lastPageError: state.lastPageError,
        useLiveData: state.useLiveData,
        liveWorkspaceDiagnostic: JSON.parse(exportDiagnostics()),
      },
      null,
      2
    );
  }, [getPagerDiagnostics, state, liveWorkspace.environmentPackageId, exportDiagnostics, eventSync.lastInvalidationSet]);

  const handleExport = () => {
    const json = buildExport();
    void navigator.clipboard?.writeText(json);
  };

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="elab-v3-diagnostics" data-v3-no-swipe hidden>
      <button type="button" onClick={handleExport}>
        EXPORT EXPERIENCE LAB V3 WORKSPACE DIAGNOSTIC JSON
      </button>
      <dl>
        <div>
          <dt>Inspector</dt>
          <dd>{state.activeInspectorMode ? V3_INSPECTOR_COPY[state.activeInspectorMode]?.title : '—'}</dd>
        </div>
      </dl>
    </div>
  );
}

export function exportV3WorkspaceDiagnosticJson(
  state: ReturnType<typeof useExperienceLabV3Store>['state'],
  pager: ReturnType<typeof useV3Workspace>['getPagerDiagnostics'] extends () => infer R ? R : never,
  liveExport: string
): string {
  return JSON.stringify(
    {
      activeWorkspace: state.activeWorkspace,
      pagerIndex: pager.pagerIndex,
      pagerOffset: pager.pagerOffset,
      swipeProgress: pager.swipeProgress,
      mountedPages: pager.mountedPages,
      activePackageId: JSON.parse(liveExport).activeWorkspaceContext?.environmentPackageId,
      activeWorkbenchTool: state.activeWorkbenchTool,
      workspaceDataState: state.workspaceDataState,
    },
    null,
    2
  );
}
