import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CanonicalMainDepartmentId } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { useCanonicalDepartmentQueue } from '../../../hooks/useCanonicalDepartmentQueue';
import { ExperienceLabCommandDock } from '../experience-lab-v2/ExperienceLabCommandDock';
import { ExperienceLabRegistrySidebar } from '../experience-lab-v2/ExperienceLabRegistrySidebar';
import { ExperienceLabGovernanceSidebar } from '../experience-lab-v2/ExperienceLabGovernanceSidebar';
import { ExperienceLabViewportStage } from '../experience-lab-v2/ExperienceLabViewportStage';
import { ExperienceLabFounderWorkbench } from '../experience-lab-v2/ExperienceLabFounderWorkbench';
import { ExperienceLabFounderReviewConsole } from '../experience-lab-v2/ExperienceLabFounderReviewConsole';
import { ExperienceLabApprovalBridge } from '../experience-lab-v2/ExperienceLabApprovalBridge';
import { ExperienceLabWorkbenchDock } from '../experience-lab-v2/ExperienceLabWorkbenchDock';
import { ExperienceLabWorkstationFrame } from '../experience-lab-v2/ExperienceLabWorkstationFrame';
import { ExperienceLabSheet } from '../experience-lab-v2/ExperienceLabSheet';
import { parseViewportModeFromQuery, viewportModeToQuery } from '../experience-lab-v2/experience-lab-v2-view-model-adapter';
import {
  ExperienceLabLiveWorkspaceProvider,
  liveWorkspaceToV2ViewModel,
  useExperienceLabLiveWorkspace,
} from '../experience-lab-v2/live-workspace';
import type { ExperienceLabV2TestMode, StudioViewportMode } from '../experience-lab-v2/experience-lab-v2.types';
import { readExperienceLabV2TestMode } from '../experience-lab-v2/experience-lab-v2-test-modes';
import { resolveExperienceLabV2FeatureFlags } from '../experience-lab-v2/experience-lab-v2-feature-flags';
import { useExperienceLabAppShell } from '../experience-lab-v2/useExperienceLabAppShell';
import { useExperienceLabPanelOrchestrator } from '../experience-lab-v2/useExperienceLabPanelOrchestrator';
import {
  useExperienceLabDesignVariants,
  type ExperienceLabDesignVariants,
} from '../experience-lab-v2/useExperienceLabDesignVariants';
import { DEFAULT_ACTIVE_DESIGN_VARIANT_ID } from '../experience-lab-v2/experience-lab-design-variants';
import { ExperienceLabDesignVariantDrawerBody } from '../experience-lab-v2/ExperienceLabDesignVariantDrawer';
import { defaultWorkbenchTab, focusModeFromViewportMode } from '../experience-lab-v2/experience-lab-v2-layout';
import type { ElabWorkbenchTab } from '../experience-lab-v2/experience-lab-v2-layout';
import type { WorkbenchEditingToolId } from '../experience-lab-v2/experience-lab-v2-workbench-config';
import { inspectorPanelForWorkbenchTool } from '../experience-lab-v2/experience-lab-v2-workbench-config';
import { ELAB_V2_COMPOSITION } from '../experience-lab-v2/experience-lab-v2-composition';
import { INSPECTOR_PANELS } from '../experience-lab-v2/experience-lab-v2-panel-orchestrator';
import { ProgramContextProvider, useProgramContext } from '../experience-lab-v2/ProgramContextProvider';
import '../experience-lab-v2/experience-lab-v2.css';
import './experience-lab-v3-pager.css';

import { resolveExperienceLabV3FeatureFlags } from './experience-lab-v3-feature-flags';
import { ExperienceLabV3StoreProvider, useExperienceLabV3Store } from './store/ExperienceLabV3Store';
import { ExperienceLabV3WorkspaceProvider, useV3Workspace } from './context/ExperienceLabV3WorkspaceProvider';
import { V3WorkspaceViewportPager } from './viewport/V3WorkspaceViewportPager';
import { V3WorkspacePaneRenderer } from './viewport/V3WorkspacePaneRenderer';
import { resolveV3WorkspaceForWorkbenchTool } from './registry/v3-workbench-workspace-map';
import { V3WorkspaceToolStrip } from './workbench/V3WorkspaceToolStrip';
import { V3WorkspaceDiagnostics } from './diagnostics/V3WorkspaceDiagnostics';

type Props = {
  initialDepartmentId?: CanonicalMainDepartmentId;
};

/** V3 = V2 canonical shell + horizontal viewport workspace pager. V2 files untouched. */
export function ExperienceLabV3Shell({ initialDepartmentId = 'experience-lab' }: Props) {
  const shell = useExperienceLabAppShell();
  const designVariants = useExperienceLabDesignVariants({ isCompact: shell.isCompact });

  const handlePipelineDepthChange = useCallback(
    (_scope: 'program' | 'department' | 'pack' | 'environment') => {
      designVariants.selectVariant(DEFAULT_ACTIVE_DESIGN_VARIANT_ID);
    },
    [designVariants]
  );

  return (
    <ExperienceLabV3StoreProvider>
      <ProgramContextProvider
        activeVariantLabel={designVariants.activeVariant?.name ?? null}
        onPipelineDepthChange={handlePipelineDepthChange}
      >
        <ExperienceLabV3ShellInner
          initialDepartmentId={initialDepartmentId}
          shell={shell}
          designVariants={designVariants}
        />
      </ProgramContextProvider>
    </ExperienceLabV3StoreProvider>
  );
}

type ShellInnerProps = Omit<ShellBodyProps, 'workbenchToolId' | 'onWorkbenchToolChange'>;

function ExperienceLabV3ShellInner(props: ShellInnerProps) {
  const pipeline = useProgramContext();
  const canonicalQueue = useCanonicalDepartmentQueue();
  const departmentId = pipeline.canonicalDepartmentId as CanonicalMainDepartmentId;
  const [workbenchToolId, setWorkbenchToolId] = useState<WorkbenchEditingToolId | null>(null);

  return (
      <ExperienceLabLiveWorkspaceProvider
      designVariants={props.designVariants}
      canonicalQueue={canonicalQueue.queue}
      departmentId={departmentId}
      workbenchToolId={workbenchToolId}
      onWorkbenchToolChange={setWorkbenchToolId}
    >
      <ExperienceLabV3WorkspaceProvider>
        <ExperienceLabV3ShellBody
          {...props}
          workbenchToolId={workbenchToolId}
          onWorkbenchToolChange={setWorkbenchToolId}
        />
      </ExperienceLabV3WorkspaceProvider>
    </ExperienceLabLiveWorkspaceProvider>
  );
}

type ShellBodyProps = Props & {
  shell: ReturnType<typeof useExperienceLabAppShell>;
  designVariants: ExperienceLabDesignVariants;
  workbenchToolId: WorkbenchEditingToolId | null;
  onWorkbenchToolChange: (tool: WorkbenchEditingToolId | null) => void;
};

function ExperienceLabV3ShellBody({
  initialDepartmentId: _initialDepartmentId,
  shell,
  designVariants,
  workbenchToolId,
  onWorkbenchToolChange,
}: ShellBodyProps) {
  const v3Flags = resolveExperienceLabV3FeatureFlags();
  const v2Flags = resolveExperienceLabV2FeatureFlags();
  const { setWorkspace } = useV3Workspace();
  const { state: v3State } = useExperienceLabV3Store();
  const activeWorkspace = v3State.activeWorkspace;

  const location = useLocation();
  const navigate = useNavigate();
  const [viewportMode, setViewportMode] = useState<StudioViewportMode>(
    () => parseViewportModeFromQuery(location.search) ?? 'BLUEPRINT'
  );
  const [testMode] = useState<ExperienceLabV2TestMode>(() => readExperienceLabV2TestMode());
  const [imageLoaded, setImageLoaded] = useState(false);

  const { liveWorkspace, setWorkbenchTool, generateBlueprint, retryBlueprint } = useExperienceLabLiveWorkspace();

  const model = useMemo(
    () => liveWorkspaceToV2ViewModel(liveWorkspace, viewportMode, imageLoaded, testMode === 'MOCK'),
    [liveWorkspace, viewportMode, imageLoaded, testMode]
  );

  const hasRender = Boolean(model.founderRender?.previewArtifactUrl);
  const [workbenchTab, setWorkbenchTab] = useState<ElabWorkbenchTab>(() => defaultWorkbenchTab(hasRender));

  const setModeWithQuery = useCallback(
    (mode: StudioViewportMode) => {
      setViewportMode(mode);
      const q = viewportModeToQuery(mode);
      if (q) {
        const params = new URLSearchParams(location.search);
        params.set('view', q);
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
      }
    },
    [location.pathname, location.search, navigate]
  );

  const orchestrator = useExperienceLabPanelOrchestrator({
    viewportMode,
    breakpoint: shell.breakpoint,
    focusMode: shell.focusMode,
    workbenchToolId,
    model,
    onViewportModeChange: setModeWithQuery,
  });

  const handleWorkbenchToolChange = useCallback(
    (tool: WorkbenchEditingToolId | null) => {
      setWorkbenchTool(tool);
      onWorkbenchToolChange(tool);
      const ws = resolveV3WorkspaceForWorkbenchTool(tool);
      if (ws) setWorkspace(ws);
      if (!tool) return;
      const inspector = inspectorPanelForWorkbenchTool(tool);
      if (inspector) {
        orchestrator.selectInspector(inspector, { syncViewport: tool !== 'architectural-tools' });
      }
      if (tool === 'architectural-tools') {
        setModeWithQuery('BLUEPRINT');
        setWorkspace('environment');
      }
    },
    [onWorkbenchToolChange, orchestrator, setModeWithQuery, setWorkbenchTool, setWorkspace]
  );

  useEffect(() => {
    setWorkbenchTab((prev) => {
      if (prev === 'review' && !hasRender) return 'brief';
      if (prev === 'brief' && hasRender) return 'review';
      return prev;
    });
  }, [hasRender]);

  useEffect(() => {
    if (orchestrator.expandedPanel) {
      shell.setOverlay('inspector');
    } else if (shell.overlay === 'inspector') {
      shell.closeOverlay();
    }
  }, [orchestrator.expandedPanel]); // eslint-disable-line react-hooks/exhaustive-deps

  const expandedDef = INSPECTOR_PANELS.find((p) => p.id === orchestrator.expandedPanel);
  const expandedArtifact = orchestrator.expandedPanel
    ? model.artifacts[orchestrator.expandedPanel === 'metadata' ? 'founderRender' : orchestrator.expandedPanel]
    : null;

  const focusClass = shell.focusMode !== 'none' ? ` elab-app-shell--focus-${shell.focusMode}` : '';

  if (!v3Flags.experienceLabV3Enabled) {
    return (
      <div className="elab-workstation elab-workstation--disabled" data-experience-lab-v3-shell>
        <p>Experience Lab V3 is disabled.</p>
      </div>
    );
  }

  if (!v2Flags.experienceLabV2Enabled) {
    return (
      <div className="elab-workstation elab-workstation--disabled" data-experience-lab-v3-shell>
        <p>Experience Lab V2 shell required for V3.</p>
      </div>
    );
  }

  const viewportStageProps = {
    model,
    viewportMode,
    onModeChange: setModeWithQuery,
    onImageLoad: () => setImageLoaded(true),
    isCompact: shell.isCompact,
    onFocusMode: (mode: StudioViewportMode) => shell.setFocusMode(focusModeFromViewportMode(mode)),
    focusMode: shell.focusMode,
    orchestrator,
    designVariants,
    workbenchToolId,
    designVariantDrawerOpen: Boolean(designVariants.drawerVariant),
    onOpenInspectorSheet: () => shell.toggleOverlay('inspector'),
    onGenerateBlueprint: () => void generateBlueprint(),
    onRetryBlueprint: () => void retryBlueprint(),
  };

  const lowerDeck =
    shell.focusMode === 'none' ? (
      <>
        <ExperienceLabFounderReviewConsole model={model} />
        <ExperienceLabApprovalBridge
          approval={model.approval}
          testMode={testMode}
          onBlockersOpen={() => shell.toggleOverlay('blockers')}
          onApprove={() => {
            const pkgId = liveWorkspace.environmentPackageId;
            if (pkgId) void designVariants.approveForProduction(pkgId);
          }}
        />
        {activeWorkspace !== 'environment' ? <V3WorkspaceToolStrip workspace={activeWorkspace} /> : null}
        <ExperienceLabFounderWorkbench
          model={model}
          activeTab={workbenchTab}
          onTabChange={setWorkbenchTab}
          activeTool={workbenchToolId}
          onToolChange={handleWorkbenchToolChange}
        />
        {!shell.isCompact ? (
          <ExperienceLabWorkbenchDock onMoreOpen={() => shell.toggleOverlay('tools')} />
        ) : null}
        <V3WorkspaceDiagnostics />
      </>
    ) : null;

  const environmentPane = <ExperienceLabViewportStage {...viewportStageProps} />;

  return (
    <div
      className={`elab-workstation elab-app-shell elab-app-shell--${shell.breakpoint}${focusClass} elab-app-shell--v3`}
      data-experience-lab-v3-shell
      data-elab-v3-active-workspace={activeWorkspace}
      {...{ [ELAB_V2_COMPOSITION.applicationShell]: '' }}
      {...(shell.focusMode !== 'none' ? { [ELAB_V2_COMPOSITION.focusMode]: shell.focusMode } : {})}
    >
      <div className="elab-app-shell__grid">
        <div className="elab-app-shell__badges">
          <span className="elab-v2__badge">EXPERIENCE LAB V3 — WORKSPACE OS</span>
          <span className="elab-v2__badge">V2 SHELL PRESERVED</span>
        </div>

        <div className="elab-app-shell__command">
          <ExperienceLabCommandDock
            model={{ ...model, testMode }}
            onStatusOpen={() => shell.toggleOverlay('status')}
          />
        </div>

        {shell.focusMode === 'none' ? (
          <ExperienceLabWorkstationFrame
            registry={shell.isDesktop ? <ExperienceLabRegistrySidebar /> : undefined}
            governance={shell.isDesktop ? <ExperienceLabGovernanceSidebar model={model} /> : undefined}
            viewport={
              <V3WorkspaceViewportPager
                renderPane={(workspaceId) => (
                  <V3WorkspacePaneRenderer workspaceId={workspaceId} environmentPane={environmentPane} />
                )}
              />
            }
            lowerDeck={lowerDeck}
          />
        ) : (
          <div className="elab-app-shell__viewport-room elab-app-shell__viewport-room--focus">
            <ExperienceLabViewportStage {...viewportStageProps} />
          </div>
        )}

        {shell.focusMode !== 'none' ? (
          <div className="elab-app-shell__focus-bar">
            <span>FOCUS: {shell.focusMode.replace(/_/g, ' ').toUpperCase()}</span>
            <button type="button" onClick={() => shell.setFocusMode('none')}>
              EXIT FOCUS
            </button>
          </div>
        ) : null}
      </div>

      <ExperienceLabSheet open={shell.overlay === 'status'} title="STATUS & METADATA" onClose={shell.closeOverlay}>
        <dl className="elab-sheet-dl">
          <div>
            <dt>Status</dt>
            <dd className="elab-status--ok">{model.approvalStatus.toUpperCase()}</dd>
          </div>
          <div>
            <dt>Permit</dt>
            <dd className="elab-status--ok">{model.permitStatus.toUpperCase()}</dd>
          </div>
          <div>
            <dt>AI cost</dt>
            <dd>{model.costEstimate}</dd>
          </div>
          <div>
            <dt>Revision</dt>
            <dd>r{model.revision}</dd>
          </div>
        </dl>
      </ExperienceLabSheet>

      <ExperienceLabSheet open={shell.overlay === 'blockers'} title="APPROVAL REQUIREMENTS" onClose={shell.closeOverlay}>
        <ul className="elab-sheet-list">
          {model.approval.disabledReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </ExperienceLabSheet>

      <ExperienceLabSheet
        open={shell.overlay === 'inspector' && Boolean(orchestrator.expandedPanel)}
        title={expandedDef?.label ?? 'INSPECTOR'}
        onClose={() => {
          orchestrator.collapseExpanded();
          shell.closeOverlay();
        }}
        variant={shell.isCompact ? 'sheet' : 'drawer'}
      >
        {expandedDef ? (
          <>
            <p className="elab-sheet-hint">{expandedArtifact?.summary ?? model.charterSummary}</p>
            <dl className="elab-sheet-dl">
              <div>
                <dt>Revision</dt>
                <dd>r{expandedArtifact?.revision ?? model.revision}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{expandedArtifact?.status ?? model.healthState}</dd>
              </div>
            </dl>
          </>
        ) : null}
      </ExperienceLabSheet>

      <ExperienceLabSheet
        open={Boolean(designVariants.drawerVariant)}
        title="DESIGN VARIANT"
        onClose={designVariants.closeDrawer}
        variant={shell.isCompact ? 'sheet' : 'drawer'}
      >
        {designVariants.drawerVariant ? (
          <ExperienceLabDesignVariantDrawerBody
            variant={designVariants.drawerVariant}
            packageModel={designVariants.drawerPackageModel}
            isActive={designVariants.drawerVariantId === designVariants.activeVariantId}
            onActivate={() => {
              if (designVariants.drawerVariantId) designVariants.activateFromDrawer(designVariants.drawerVariantId);
            }}
            onArchive={() => designVariants.archiveVariant(designVariants.drawerVariant!)}
            onApproveForProduction={() => {
              const pkgId = designVariants.drawerVariant?.environmentPackageId;
              if (pkgId) void designVariants.approveForProduction(pkgId);
            }}
            onPromoteToCanonical={() => {
              const pkgId = designVariants.drawerVariant?.environmentPackageId;
              if (pkgId) void designVariants.promoteToCanonical(pkgId);
            }}
            actionBusy={designVariants.actionBusy}
            actionError={designVariants.actionError}
            onClose={designVariants.closeDrawer}
          />
        ) : null}
      </ExperienceLabSheet>
    </div>
  );
}
