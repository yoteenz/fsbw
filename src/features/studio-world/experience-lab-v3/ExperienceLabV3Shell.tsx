import { useEffect } from 'react';
import { resolveExperienceLabV3FeatureFlags } from './experience-lab-v3-feature-flags';
import { ExperienceLabV3StoreProvider, useExperienceLabV3Store } from './store/ExperienceLabV3Store';
import { V3CommandDock } from './shell/V3CommandDock';
import { V3WorkspacePills } from './shell/V3WorkspacePills';
import { V3DesignVariantStrip } from './shell/V3DesignVariantStrip';
import { V3ContextAwareWorkbench } from './shell/V3ContextAwareWorkbench';
import { V3WorkspaceStage } from './viewport/V3WorkspaceStage';
import { V3StudioSpotlightSearch } from './search/V3StudioSpotlightSearch';
import { V3StudioAiAssistantDock } from './assistant/V3StudioAiAssistantDock';
import { ELAB_V3_COMPOSITION } from './experience-lab-v3-composition';
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
      <div className="elab-v3-app-shell" {...{ [ELAB_V3_COMPOSITION.applicationShell]: '' }}>
        <div className="elab-v3-app-shell__command">
          <V3CommandDock />
        </div>

        <V3WorkspacePills />

        <div className="elab-v3-app-shell__stage-wrap">
          <V3WorkspaceStage />
          <V3DesignVariantStrip />
        </div>

        <V3ContextAwareWorkbench />
      </div>

      {flags.spotlightSearchEnabled && <V3StudioSpotlightSearch />}
      {flags.aiAssistantEnabled && <V3StudioAiAssistantDock />}
    </div>
  );
}

/** Experience Lab V3 — Five-Workspace Operating System. V2 untouched. */
export function ExperienceLabV3Shell(_props: Props) {
  return (
    <ExperienceLabV3StoreProvider>
      <ExperienceLabV3ShellInner />
    </ExperienceLabV3StoreProvider>
  );
}
