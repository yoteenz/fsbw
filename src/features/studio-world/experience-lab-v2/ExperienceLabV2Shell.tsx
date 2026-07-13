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
import {
  experienceLabV2ViewModelAdapter,
  parseViewportModeFromQuery,
  viewportModeToQuery,
} from './experience-lab-v2-view-model-adapter';
import type { ExperienceLabV2TestMode, StudioViewportMode } from './experience-lab-v2.types';
import { readExperienceLabV2TestMode } from './experience-lab-v2-test-modes';
import { resolveExperienceLabV2FeatureFlags } from './experience-lab-v2-feature-flags';
import './experience-lab-v2.css';

type Props = {
  initialDepartmentId?: CanonicalMainDepartmentId;
};

/**
 * Experience Lab V2 — Immersive Command Interface (presentation layer).
 * Three layers: Environment · React UI · Viewport content.
 */
export function ExperienceLabV2Shell({ initialDepartmentId = 'experience-lab' }: Props) {
  const { program } = useExperienceLabProgram();
  const canonicalQueue = useCanonicalDepartmentQueue();
  const location = useLocation();
  const navigate = useNavigate();
  const flags = resolveExperienceLabV2FeatureFlags();

  const [departmentId] = useState<CanonicalMainDepartmentId>(initialDepartmentId);
  const [viewportMode, setViewportMode] = useState<StudioViewportMode>(
    () => parseViewportModeFromQuery(location.search) ?? 'BLUEPRINT'
  );
  const [activeFloat, setActiveFloat] = useState({ left: 'blueprint', right: 'materials' });
  const [testMode, setTestMode] = useState<ExperienceLabV2TestMode>(() => readExperienceLabV2TestMode());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
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

  const onFloatSelect = useCallback(
    (side: 'left' | 'right', slot: string, mode: StudioViewportMode) => {
      setActiveFloat((prev) => ({ ...prev, [side]: slot }));
      if (mode !== 'EMPTY_STATE') setModeWithQuery(mode);
    },
    [setModeWithQuery]
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
      <div className="elab-workstation elab-workstation--disabled" data-experience-lab-v2-shell>
        <p>Experience Lab V2 is disabled.</p>
      </div>
    );
  }

  return (
    <div className={`elab-workstation${isMobile ? ' elab-workstation--mobile' : ' elab-workstation--desktop'}`} data-experience-lab-v2-shell>
      <ExperienceLabEnvironmentLayer isMobile={isMobile} />

      <div className="elab-workstation__ui">
        <div className="elab-v2__badge-row">
          <span className="elab-v2__badge">EXPERIENCE LAB V2 — TEST ENVIRONMENT</span>
          <span className="elab-v2__badge">NOT YET PRODUCTION</span>
        </div>

        <ExperienceLabCommandDock model={{ ...model, testMode }} isMobile={isMobile} />

        <main className="elab-workstation__main">
          {!isMobile ? <ExperienceLabRegistrySidebar /> : null}

          <div className="elab-workstation__center">
            <ExperienceLabViewportStage
              model={model}
              viewportMode={viewportMode}
              onModeChange={setModeWithQuery}
              onImageLoad={() => setImageLoaded(true)}
              isMobile={isMobile}
              onFloatSelect={onFloatSelect}
              activeFloat={activeFloat}
            />
          </div>

          {!isMobile ? <ExperienceLabGovernanceSidebar model={model} /> : null}
        </main>

        <ExperienceLabFounderWorkbench model={model} />
        <ExperienceLabApprovalBridge approval={model.approval} testMode={testMode} />

        {flags.experienceLabV2DiagnosticsEnabled ? (
          <ExperienceLabDiagnostics
            testMode={testMode}
            onTestModeChange={setTestMode}
            migration={model.migrationReadiness}
            open={diagnosticsOpen}
            onToggle={() => setDiagnosticsOpen((o) => !o)}
          />
        ) : null}

        <ExperienceLabWorkbenchDock isMobile={isMobile} />
        <ExperienceLabDepartmentDock />
      </div>
    </div>
  );
}
