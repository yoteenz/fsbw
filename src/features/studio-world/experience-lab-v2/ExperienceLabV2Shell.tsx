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
import { ExperienceLabApprovalBridge } from './ExperienceLabApprovalBridge';
import { ExperienceLabWorkbenchDock } from './ExperienceLabWorkbenchDock';
import { ExperienceLabDepartmentDock } from './ExperienceLabDepartmentDock';
import { ExperienceLabDiagnostics } from './ExperienceLabDiagnostics';
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
import { defaultWorkbenchTab, focusModeFromViewportMode } from './experience-lab-v2-layout';
import type { ElabWorkbenchTab } from './experience-lab-v2-layout';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import { INSPECTOR_PANELS, viewportModeForInspector } from './experience-lab-v2-panel-orchestrator';
import './experience-lab-v2.css';

type Props = {
  initialDepartmentId?: CanonicalMainDepartmentId;
};

/**
 * Experience Lab V2 — Fixed-viewport application shell (no document scroll).
 * Three layers: Environment · React UI · Viewport content.
 */
export function ExperienceLabV2Shell({ initialDepartmentId = 'experience-lab' }: Props) {
  const { program } = useExperienceLabProgram();
  const canonicalQueue = useCanonicalDepartmentQueue();
  const location = useLocation();
  const navigate = useNavigate();
  const flags = resolveExperienceLabV2FeatureFlags();
  const shell = useExperienceLabAppShell();

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
    model,
    onViewportModeChange: setModeWithQuery,
  });

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

  if (!flags.experienceLabV2Enabled) {
    return (
      <div className="elab-workstation elab-workstation--disabled" data-experience-lab-v2-shell>
        <p>Experience Lab V2 is disabled.</p>
      </div>
    );
  }

  return (
    <div
      className={`elab-workstation elab-app-shell elab-app-shell--${shell.breakpoint}${focusClass}`}
      data-experience-lab-v2-shell
      {...{ [ELAB_V2_COMPOSITION.applicationShell]: '' }}
      {...(shell.focusMode !== 'none' ? { [ELAB_V2_COMPOSITION.focusMode]: shell.focusMode } : {})}
    >
      <ExperienceLabEnvironmentLayer isMobile={shell.isCompact} />

      <div className="elab-app-shell__grid">
        <div className="elab-app-shell__badges">
          <span className="elab-v2__badge">EXPERIENCE LAB V2 — TEST ENVIRONMENT</span>
          <span className="elab-v2__badge">NOT YET PRODUCTION</span>
        </div>

        <div className="elab-app-shell__command">
          <ExperienceLabCommandDock
            model={{ ...model, testMode }}
            isCompact={shell.isCompact}
            onStatusOpen={() => shell.toggleOverlay('status')}
          />
        </div>

        <main className="elab-app-shell__workspace">
          {shell.isDesktop ? <ExperienceLabRegistrySidebar /> : null}

          <div className="elab-app-shell__viewport-region">
            <ExperienceLabViewportStage
              model={model}
              viewportMode={viewportMode}
              onModeChange={setModeWithQuery}
              onImageLoad={() => setImageLoaded(true)}
              isCompact={shell.isCompact}
              onFocusMode={(mode) => shell.setFocusMode(focusModeFromViewportMode(mode))}
              focusMode={shell.focusMode}
              orchestrator={orchestrator}
            />
          </div>

          {shell.isDesktop ? <ExperienceLabGovernanceSidebar model={model} /> : null}
        </main>

        {shell.focusMode === 'none' ? (
          <>
            <div className="elab-app-shell__workbench">
              <ExperienceLabFounderWorkbench
                model={model}
                isCompact={shell.isCompact}
                activeTab={workbenchTab}
                onTabChange={setWorkbenchTab}
              />
            </div>

            <div className="elab-app-shell__approval">
              <ExperienceLabApprovalBridge
                approval={model.approval}
                testMode={testMode}
                isCompact={shell.isCompact}
                onBlockersOpen={() => shell.toggleOverlay('blockers')}
              />
            </div>

            {flags.experienceLabV2DiagnosticsEnabled ? (
              <div className="elab-app-shell__diagnostics">
                <ExperienceLabDiagnostics
                  testMode={testMode}
                  onTestModeChange={setTestMode}
                  migration={model.migrationReadiness}
                  panelDiagnostics={orchestrator.diagnostics}
                  onResetLayout={orchestrator.resetLayout}
                  open={shell.overlay === 'diagnostics'}
                  onToggle={() => shell.toggleOverlay('diagnostics')}
                  compact
                />
              </div>
            ) : null}

            <div className="elab-app-shell__tools">
              <ExperienceLabWorkbenchDock
                isCompact={shell.isCompact}
                onMoreOpen={() => shell.toggleOverlay('tools')}
              />
            </div>

            <div className="elab-app-shell__dept-dock">
              <ExperienceLabDepartmentDock
                isCompact={shell.isCompact}
                onGovernanceOpen={shell.isCompact ? () => shell.toggleOverlay('governance') : undefined}
              />
            </div>
          </>
        ) : (
          <div className="elab-app-shell__focus-bar">
            <span>Focus: {shell.focusMode.replace('_', ' ')}</span>
            <button type="button" onClick={() => shell.setFocusMode('none')}>Exit focus</button>
          </div>
        )}
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
    </div>
  );
}
