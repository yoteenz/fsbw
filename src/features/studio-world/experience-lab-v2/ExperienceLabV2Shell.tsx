import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CanonicalMainDepartmentId } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { useExperienceLabProgram } from '../../../hooks/useExperienceLabProgram';
import { useCanonicalDepartmentQueue } from '../../../hooks/useCanonicalDepartmentQueue';
import { ExperienceLabEnvironmentLayer } from './ExperienceLabEnvironmentLayer';
import { ExperienceLabCommandDock } from './ExperienceLabCommandDock';
import { ExperienceLabRegistrySidebar } from './ExperienceLabRegistrySidebar';
import { ExperienceLabGovernanceSidebar } from './ExperienceLabGovernanceSidebar';
import { ExperienceLabViewportStage } from './ExperienceLabViewportStage';
import { ExperienceLabFounderWorkbench } from './ExperienceLabFounderWorkbench';
import { ExperienceLabFounderReviewConsole } from './ExperienceLabFounderReviewConsole';
import { ExperienceLabApprovalBridge } from './ExperienceLabApprovalBridge';
import { ExperienceLabWorkbenchDock } from './ExperienceLabWorkbenchDock';
import { ExperienceLabWorkstationFrame } from './ExperienceLabWorkstationFrame';
import { ExperienceLabDiagnostics } from './ExperienceLabDiagnostics';
import { ExperienceLabComponentReviewChrome } from './ExperienceLabComponentReviewChrome';
import { ExperienceLabComponentReviewSandbox } from './ExperienceLabComponentReviewSandbox';
import { ExperienceLabSheet } from './ExperienceLabSheet';
import {
  experienceLabV2ViewModelAdapter,
  parseViewportModeFromQuery,
  viewportModeToQuery,
} from './experience-lab-v2-view-model-adapter';
import type { ExperienceLabV2TestMode, StudioViewportMode } from './experience-lab-v2.types';
import { readExperienceLabV2TestMode } from './experience-lab-v2-test-modes';
import { resolveExperienceLabV2FeatureFlags } from './experience-lab-v2-feature-flags';
import { useExperienceLabAppShell } from './useExperienceLabAppShell';
import { useExperienceLabPanelOrchestrator } from './useExperienceLabPanelOrchestrator';
import { useExperienceLabComponentReview } from './useExperienceLabComponentReview';
import { useExperienceLabDesignVariants } from './useExperienceLabDesignVariants';
import { ExperienceLabDesignVariantDrawerBody } from './ExperienceLabDesignVariantDrawer';
import { defaultWorkbenchTab, focusModeFromViewportMode } from './experience-lab-v2-layout';
import type { ElabWorkbenchTab } from './experience-lab-v2-layout';
import type { WorkbenchEditingToolId } from './experience-lab-v2-workbench-config';
import { inspectorPanelForWorkbenchTool } from './experience-lab-v2-workbench-config';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import { INSPECTOR_PANELS, viewportModeForInspector } from './experience-lab-v2-panel-orchestrator';
import './experience-lab-v2.css';

type Props = {
  initialDepartmentId?: CanonicalMainDepartmentId;
};

/**
 * Experience Lab V2 — Component-by-component production build.
 * Component Review Mode shows one system component at a time for founder approval.
 */
export function ExperienceLabV2Shell({ initialDepartmentId = 'experience-lab' }: Props) {
  const { program } = useExperienceLabProgram();
  const canonicalQueue = useCanonicalDepartmentQueue();
  const location = useLocation();
  const navigate = useNavigate();
  const flags = resolveExperienceLabV2FeatureFlags();
  const shell = useExperienceLabAppShell();
  const review = useExperienceLabComponentReview();
  const designVariants = useExperienceLabDesignVariants({ isCompact: shell.isCompact });

  const [departmentId] = useState<CanonicalMainDepartmentId>(initialDepartmentId);
  const [viewportMode, setViewportMode] = useState<StudioViewportMode>(
    () => parseViewportModeFromQuery(location.search) ?? 'BLUEPRINT'
  );
  const [testMode, setTestMode] = useState<ExperienceLabV2TestMode>(() => readExperienceLabV2TestMode());
  const [imageLoaded, setImageLoaded] = useState(false);

  const model = useMemo(
    () =>
      experienceLabV2ViewModelAdapter({
        program,
        departmentId,
        viewportMode,
        queue: canonicalQueue.queue,
        imageLoaded,
        useMock: testMode === 'MOCK',
      }),
    [program, departmentId, viewportMode, canonicalQueue.queue, imageLoaded, testMode]
  );

  const hasRender = Boolean(model.founderRender?.previewArtifactUrl);
  const [workbenchTab, setWorkbenchTab] = useState<ElabWorkbenchTab>(() => defaultWorkbenchTab(hasRender));
  const [workbenchToolId, setWorkbenchToolId] = useState<WorkbenchEditingToolId | null>(null);

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
      setWorkbenchToolId(tool);
      if (!tool) return;
      const inspector = inspectorPanelForWorkbenchTool(tool);
      if (inspector) {
        orchestrator.selectInspector(inspector, { syncViewport: tool !== 'architectural-tools' });
      }
      if (tool === 'architectural-tools') {
        setModeWithQuery('BLUEPRINT');
      }
    },
    [orchestrator, setModeWithQuery]
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

  const focusClass =
    shell.focusMode !== 'none' ? ` elab-app-shell--focus-${shell.focusMode}` : '';

  const reviewClass = review.enabled ? ' elab-app-shell--component-review' : '';

  if (!flags.experienceLabV2Enabled) {
    return (
      <div className="elab-workstation elab-workstation--disabled" data-experience-lab-v2-shell>
        <p>Experience Lab V2 is disabled.</p>
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
  };

  const lowerDeck = shell.focusMode === 'none' ? (
    <>
      {review.show('workbench') ? <ExperienceLabFounderReviewConsole model={model} /> : null}
      {review.show('approval-bridge') ? (
        <ExperienceLabApprovalBridge
          approval={model.approval}
          testMode={testMode}
          onBlockersOpen={() => shell.toggleOverlay('blockers')}
        />
      ) : null}
      {review.show('workbench') ? (
        <ExperienceLabFounderWorkbench
          model={model}
          activeTab={workbenchTab}
          onTabChange={setWorkbenchTab}
          activeTool={workbenchToolId}
          onToolChange={handleWorkbenchToolChange}
        />
      ) : null}
      {review.show('bottom-tool-dock') && !review.show('workbench') ? (
        <ExperienceLabWorkbenchDock onMoreOpen={() => shell.toggleOverlay('tools')} />
      ) : null}
    </>
  ) : null;

  const renderReviewSandbox = () => {
    if (!review.enabled) return null;

    if (review.show('command-dock')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="command-dock" label="Command Dock">
          <ExperienceLabCommandDock
            model={{ ...model, testMode }}
            onStatusOpen={() => shell.toggleOverlay('status')}
          />
        </ExperienceLabComponentReviewSandbox>
      );
    }

    if (review.show('workbench')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="workbench" label="Founder Workbench">
          <ExperienceLabFounderWorkbench
            model={model}
            activeTab={workbenchTab}
            onTabChange={setWorkbenchTab}
            activeTool={workbenchToolId}
            onToolChange={handleWorkbenchToolChange}
          />
        </ExperienceLabComponentReviewSandbox>
      );
    }

    if (review.show('studio-viewport')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="studio-viewport" label="Studio Viewport">
          <ExperienceLabViewportStage {...viewportStageProps} reviewIsolate="viewport" />
        </ExperienceLabComponentReviewSandbox>
      );
    }

    if (review.show('floating-inspectors')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="floating-inspectors" label="Floating Inspectors">
          <ExperienceLabViewportStage {...viewportStageProps} reviewIsolate="inspectors" />
        </ExperienceLabComponentReviewSandbox>
      );
    }

    if (review.show('approval-bridge')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="approval-bridge" label="Approval Bridge">
          <ExperienceLabApprovalBridge
            approval={model.approval}
            testMode={testMode}
            onBlockersOpen={() => shell.toggleOverlay('blockers')}
          />
        </ExperienceLabComponentReviewSandbox>
      );
    }

    if (review.show('bottom-tool-dock')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="bottom-tool-dock" label="Bottom Tool Dock">
          <ExperienceLabWorkbenchDock onMoreOpen={() => shell.toggleOverlay('tools')} />
        </ExperienceLabComponentReviewSandbox>
      );
    }

    if (review.show('diagnostics')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="diagnostics" label="Diagnostics">
          <ExperienceLabDiagnostics
            testMode={testMode}
            onTestModeChange={setTestMode}
            migration={model.migrationReadiness}
            panelDiagnostics={orchestrator.diagnostics}
            onResetLayout={orchestrator.resetLayout}
            open
            compact
          />
        </ExperienceLabComponentReviewSandbox>
      );
    }

    if (review.show('view-angle-strip')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="view-angle-strip" label="View Angle Strip">
          <ExperienceLabViewportStage {...viewportStageProps} reviewIsolate="view-angles" />
        </ExperienceLabComponentReviewSandbox>
      );
    }

    if (review.show('environment-layer')) {
      return (
        <ExperienceLabComponentReviewSandbox componentId="environment-layer" label="Environment Layer">
          <div className="elab-component-review-env-preview">
            <ExperienceLabEnvironmentLayer isMobile={shell.isCompact} />
          </div>
        </ExperienceLabComponentReviewSandbox>
      );
    }

    return null;
  };

  return (
    <div
      className={`elab-workstation elab-app-shell elab-app-shell--${shell.breakpoint}${focusClass}${reviewClass}`}
      data-experience-lab-v2-shell
      data-elab-review-active={review.enabled ? review.activeComponent : undefined}
      {...{ [ELAB_V2_COMPOSITION.applicationShell]: '' }}
      {...(shell.focusMode !== 'none' ? { [ELAB_V2_COMPOSITION.focusMode]: shell.focusMode } : {})}
    >
      {review.enabled ? <ExperienceLabComponentReviewChrome review={review} /> : null}

      <div className={`elab-app-shell__grid${review.enabled ? ' elab-app-shell__grid--review' : ''}`}>
        {!review.enabled ? (
          <div className="elab-app-shell__badges">
            <span className="elab-v2__badge">EXPERIENCE LAB V2 — TEST ENVIRONMENT</span>
            <span className="elab-v2__badge">NOT YET PRODUCTION</span>
          </div>
        ) : null}

        {!review.enabled && review.show('command-dock') ? (
          <div className="elab-app-shell__command">
            <ExperienceLabCommandDock
              model={{ ...model, testMode }}
              onStatusOpen={() => shell.toggleOverlay('status')}
            />
          </div>
        ) : null}

        {review.enabled ? (
          <div className="elab-app-shell__review-stage">{renderReviewSandbox()}</div>
        ) : shell.focusMode === 'none' ? (
          <ExperienceLabWorkstationFrame
            registry={shell.isDesktop ? <ExperienceLabRegistrySidebar /> : undefined}
            governance={shell.isDesktop ? <ExperienceLabGovernanceSidebar model={model} /> : undefined}
            viewport={<ExperienceLabViewportStage {...viewportStageProps} />}
            lowerDeck={lowerDeck}
          />
        ) : (
          <div className="elab-app-shell__viewport-room elab-app-shell__viewport-room--focus">
            <ExperienceLabViewportStage {...viewportStageProps} />
          </div>
        )}

        {!review.enabled && shell.focusMode !== 'none' ? (
          <div className="elab-app-shell__focus-bar">
            <span>Focus: {shell.focusMode.replace('_', ' ')}</span>
            <button type="button" onClick={() => shell.setFocusMode('none')}>Exit focus</button>
          </div>
        ) : null}
      </div>

      <ExperienceLabSheet open={shell.overlay === 'status'} title="Status & metadata" onClose={shell.closeOverlay}>
        <dl className="elab-sheet-dl">
          <div><dt>Status</dt><dd className="elab-status--ok">{model.approvalStatus.toUpperCase()}</dd></div>
          <div><dt>Permit</dt><dd className="elab-status--ok">{model.permitStatus.toUpperCase()}</dd></div>
          <div><dt>AI cost</dt><dd>{model.costEstimate}</dd></div>
          <div><dt>Test mode</dt><dd>{testMode}</dd></div>
          <div><dt>Revision</dt><dd>r{model.revision}</dd></div>
        </dl>
      </ExperienceLabSheet>

      <ExperienceLabSheet open={shell.overlay === 'blockers'} title="Approval requirements" onClose={shell.closeOverlay}>
        <ul className="elab-sheet-list">
          {model.approval.disabledReasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </ExperienceLabSheet>

      <ExperienceLabSheet open={shell.overlay === 'governance'} title="Scene governance" onClose={shell.closeOverlay}>
        <ExperienceLabGovernanceSidebar model={model} embedded />
      </ExperienceLabSheet>

      <ExperienceLabSheet
        open={shell.overlay === 'inspector' && Boolean(orchestrator.expandedPanel)}
        title={expandedDef?.label ?? 'Inspector'}
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
              <div><dt>Revision</dt><dd>r{expandedArtifact?.revision ?? model.revision}</dd></div>
              <div><dt>Status</dt><dd>{expandedArtifact?.status ?? model.healthState}</dd></div>
              <div><dt>Viewport mode</dt><dd>{viewportModeForInspector(expandedDef.id).replace('_', ' ')}</dd></div>
            </dl>
            {expandedArtifact?.previewUrl ? (
              <img src={expandedArtifact.previewUrl} alt="" className="elab-sheet-preview" />
            ) : null}
            <button
              type="button"
              className="elab-sheet-tool-btn"
              onClick={() => {
                setModeWithQuery(viewportModeForInspector(expandedDef.id));
                orchestrator.collapseExpanded();
                shell.closeOverlay();
              }}
            >
              Open in Viewport
            </button>
          </>
        ) : null}
      </ExperienceLabSheet>

      <ExperienceLabSheet open={shell.overlay === 'tools'} title="Experience Lab tools" onClose={shell.closeOverlay}>
        <div className="elab-sheet-tools">
          {['Architectural Tools', 'Material Library', 'Lighting Studio', 'Camera Studio', 'Budget Forecast', 'Permit Center'].map((t) => (
            <button key={t} type="button" className="elab-sheet-tool-btn">{t}</button>
          ))}
        </div>
      </ExperienceLabSheet>

      <ExperienceLabSheet
        open={Boolean(designVariants.drawerVariant)}
        title={designVariants.drawerVariant?.name ?? 'Design Variant'}
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
