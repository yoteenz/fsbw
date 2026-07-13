import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CanonicalMainDepartmentId } from '../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { useExperienceLabProgram } from '../../../hooks/useExperienceLabProgram';
import { useCanonicalDepartmentQueue } from '../../../hooks/useCanonicalDepartmentQueue';
import { ExperienceLabEnvironmentLayer } from './ExperienceLabEnvironmentLayer';
import { ExperienceLabV2Header } from './ExperienceLabV2Header';
import { ExperienceLabV2ContextRail } from './ExperienceLabV2ContextRail';
import { ExperienceLabLeftInspector } from './ExperienceLabLeftInspector';
import { ExperienceLabRightInspector } from './ExperienceLabRightInspector';
import { StudioViewport } from './StudioViewport';
import { ExperienceLabWorkbench } from './ExperienceLabWorkbench';
import { ExperienceLabApprovalBar } from './ExperienceLabApprovalBar';
import { ExperienceLabToolDock } from './ExperienceLabToolDock';
import { ExperienceLabDiagnostics } from './ExperienceLabDiagnostics';
import {
  experienceLabV2ViewModelAdapter,
  parseViewportModeFromQuery,
  viewportModeToQuery,
} from './experience-lab-v2-view-model-adapter';
import type { ExperienceLabV2TestMode, StudioViewportMode } from './experience-lab-v2.types';
import { readExperienceLabV2TestMode } from './experience-lab-v2-test-modes';
import { resolveExperienceLabV2FeatureFlags } from './experience-lab-v2-feature-flags';
import './experience-lab-v2.css';

const VIEWPORT_MODES: StudioViewportMode[] = [
  'BLUEPRINT',
  'FOUNDER_RENDER',
  'CONSTRUCTION_PLAN',
  'MATERIALS',
  'LIGHTING',
  'CAMERA',
  'SPLIT_VIEW',
];

type Props = {
  initialDepartmentId?: CanonicalMainDepartmentId;
};

/** Experience Lab V2 — React-first department shell with universal StudioViewport. */
export function ExperienceLabV2Shell({ initialDepartmentId = 'experience-lab' }: Props) {
  const { program, selectProgram } = useExperienceLabProgram();
  const canonicalQueue = useCanonicalDepartmentQueue();
  const location = useLocation();
  const navigate = useNavigate();
  const flags = resolveExperienceLabV2FeatureFlags();

  const [departmentId] = useState<CanonicalMainDepartmentId>(initialDepartmentId);
  const [viewportMode, setViewportMode] = useState<StudioViewportMode>(() => parseViewportModeFromQuery(location.search) ?? 'BLUEPRINT');
  const [leftSelected, setLeftSelected] = useState('blueprint');
  const [rightSelected, setRightSelected] = useState('materials');
  const [testMode, setTestMode] = useState<ExperienceLabV2TestMode>(() => readExperienceLabV2TestMode());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false));
  const [envPreset, setEnvPreset] = useState<'dark' | 'bright'>('dark');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  if (!flags.experienceLabV2Enabled) {
    return (
      <div className="elab-v2" style={{ padding: 24 }}>
        <p>Experience Lab V2 is disabled. Set VITE_EXPERIENCE_LAB_V2_ENABLED=true for Studio World Admin.</p>
      </div>
    );
  }

  return (
    <div className={`elab-v2${envPreset === 'bright' ? ' elab-v2--bright' : ''}`} data-experience-lab-v2-shell>
      <ExperienceLabEnvironmentLayer preset={envPreset} isMobile={isMobile} />

      <div className="elab-v2__badge-row">
        <span className="elab-v2__badge">EXPERIENCE LAB V2 — TEST ENVIRONMENT</span>
        <span className="elab-v2__badge">NOT YET PRODUCTION</span>
      </div>

      <div className="elab-v2__shell">
        <ExperienceLabV2Header model={{ ...model, testMode }} />
        <ExperienceLabV2ContextRail program={program} healthState={model.healthState} onProgramChange={selectProgram} />

        <nav className="elab-v2__mode-rail" aria-label="Viewport modes" data-viewport-mode-rail>
          {VIEWPORT_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              className="elab-v2__mode-btn"
              aria-pressed={viewportMode === mode}
              aria-label={`${mode.replace(/_/g, ' ')} view`}
              onClick={() => setModeWithQuery(mode)}
            >
              {mode.replace(/_/g, ' ')}
            </button>
          ))}
          {flags.experienceLabV2DiagnosticsEnabled ? (
            <button type="button" className="elab-v2__mode-btn" onClick={() => setEnvPreset((p) => (p === 'dark' ? 'bright' : 'dark'))}>
              ENV {envPreset.toUpperCase()}
            </button>
          ) : null}
        </nav>

        <div className="elab-v2__grid">
          <ExperienceLabLeftInspector
            selectedId={leftSelected}
            charterSummary={model.charterSummary}
            onSelect={(id, mode) => {
              setLeftSelected(id);
              if (mode !== 'EMPTY_STATE') setModeWithQuery(mode);
            }}
          />

          <div>
            <StudioViewport
              mode={viewportMode}
              departmentName={model.departmentName}
              revision={model.revision}
              artifactStatus={model.healthState}
              artifacts={model.artifacts}
              isStale={model.isStale}
              onImageLoad={() => setImageLoaded(true)}
            />
          </div>

          <ExperienceLabRightInspector
            selectedId={rightSelected}
            diagnostics={model.diagnostics}
            onSelect={(id, mode) => {
              setRightSelected(id);
              if (mode !== 'EMPTY_STATE') setModeWithQuery(mode);
            }}
          />
        </div>

        <ExperienceLabWorkbench model={model} />

        {flags.experienceLabV2DiagnosticsEnabled ? (
          <ExperienceLabDiagnostics
            testMode={testMode}
            onTestModeChange={setTestMode}
            migration={model.migrationReadiness}
            open={diagnosticsOpen}
            onToggle={() => setDiagnosticsOpen((o) => !o)}
          />
        ) : null}

        <ExperienceLabApprovalBar
          approval={model.approval}
          testMode={testMode}
          onOpenDiagnostics={() => setDiagnosticsOpen(true)}
          onApprove={() => {
            /* V2 default: no production write unless CONTROLLED_LIVE + confirmation */
          }}
        />

        {flags.experienceLabV2MobileDockEnabled ? (
          <ExperienceLabToolDock isMobile={isMobile} />
        ) : (
          <ExperienceLabToolDock isMobile={false} />
        )}
      </div>
    </div>
  );
}
