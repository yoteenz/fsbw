import { useEffect } from 'react';
import { resolveExperienceLabV3FeatureFlags } from './experience-lab-v3-feature-flags';
import { ExperienceLabV3StoreProvider, useExperienceLabV3Store } from './store/ExperienceLabV3Store';
import { V3ProgramSelector } from './hud/V3ProgramSelector';
import { V3WorkspaceContextHud } from './hud/V3WorkspaceContextHud';
import { V3LiveOperationBoard } from './boards/V3LiveOperationBoard';
import { V3QueueBoard } from './boards/V3QueueBoard';
import { V3PipelineView } from './boards/V3PipelineView';
import { V3BottomOperationsBoard } from './boards/V3BottomOperationsBoard';
import { V3ActiveWorkOrderPanel } from './panels/V3ActiveWorkOrderPanel';
import { V3BlueprintInspectorPanel } from './panels/V3BlueprintInspectorPanel';
import { V3ContextInspectorPanel } from './panels/V3ContextInspectorPanel';
import { V3PackageViewPanel } from './panels/V3PackageViewPanel';
import { V3ProductionTimelinePanel } from './panels/V3ProductionTimelinePanel';
import { V3DynamicWorkbench } from './workbench/V3DynamicWorkbench';
import { V3Viewport } from './viewport/V3Viewport';
import { V3StudioSpotlightSearch } from './search/V3StudioSpotlightSearch';
import { V3StudioAiAssistantDock } from './assistant/V3StudioAiAssistantDock';
import './experience-lab-v3.css';

type Props = {
  initialDepartmentId?: string;
};

function ExperienceLabV3ShellInner() {
  const flags = resolveExperienceLabV3FeatureFlags();
  const { dispatch } = useExperienceLabV3Store();

  useEffect(() => {
    if (!flags.liveOperationsTickerEnabled) return undefined;
    const id = window.setInterval(() => dispatch({ type: 'TICK_OPERATIONS' }), 3000);
    return () => window.clearInterval(id);
  }, [dispatch, flags.liveOperationsTickerEnabled]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && flags.spotlightSearchEnabled) {
        e.preventDefault();
        dispatch({ type: 'SET_SPOTLIGHT', open: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, flags.spotlightSearchEnabled]);

  if (!flags.experienceLabV3Enabled) {
    return (
      <div className="elab-v3-disabled" data-experience-lab-v3-shell>
        <p>Experience Lab V3 is disabled. Set VITE_EXPERIENCE_LAB_V3_ENABLED=true for admin sessions.</p>
      </div>
    );
  }

  return (
    <div className="elab-v3-os" data-experience-lab-v3-shell>
      <header className="elab-v3-os__top">
        <V3ProgramSelector />
        <V3WorkspaceContextHud />
        <div className="elab-v3-os__top-actions">
          {flags.spotlightSearchEnabled && (
            <button type="button" className="elab-v3-os__search" onClick={() => dispatch({ type: 'SET_SPOTLIGHT', open: true })}>
              Search ⌘K
            </button>
          )}
          <span className="elab-v3-os__badge">V3 EXPERIMENTAL</span>
        </div>
      </header>

      <V3LiveOperationBoard />

      <div className="elab-v3-os__body">
        <aside className="elab-v3-os__left">
          <V3ProductionTimelinePanel />
          <V3PipelineView />
          <V3QueueBoard />
          <V3PackageViewPanel />
        </aside>

        <div className="elab-v3-os__center">
          <V3Viewport />
          <V3DynamicWorkbench />
        </div>

        <aside className="elab-v3-os__right">
          <V3BlueprintInspectorPanel />
          <V3ActiveWorkOrderPanel />
          <V3ContextInspectorPanel />
        </aside>
      </div>

      <V3BottomOperationsBoard />

      {flags.spotlightSearchEnabled && <V3StudioSpotlightSearch />}
      {flags.aiAssistantEnabled && <V3StudioAiAssistantDock />}
    </div>
  );
}

/** Experience Lab V3 — parallel experimental world-building OS. V2 untouched. */
export function ExperienceLabV3Shell(_props: Props) {
  return (
    <ExperienceLabV3StoreProvider>
      <ExperienceLabV3ShellInner />
    </ExperienceLabV3StoreProvider>
  );
}
