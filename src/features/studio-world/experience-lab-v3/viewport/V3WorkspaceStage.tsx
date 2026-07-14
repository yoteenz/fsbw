import { useCallback, useRef, type ReactNode } from 'react';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { resolveV3WorkspaceIndex, V3_CORE_WORKSPACES } from '../registry/v3-workspace-registry';
import { V3BlueprintPanel } from '../panels/V3BlueprintPanel';
import { V3ContextInspector } from '../panels/V3ContextInspector';
import { V3EnvironmentWorkspace } from '../workspaces/V3EnvironmentWorkspace';
import { V3ProductionWorkspace } from '../workspaces/V3ProductionWorkspace';
import { V3ReviewWorkspace } from '../workspaces/V3ReviewWorkspace';
import { V3AssetsWorkspace } from '../workspaces/V3AssetsWorkspace';
import { V3IntelligenceWorkspace } from '../workspaces/V3IntelligenceWorkspace';

const WORKSPACE_COMPONENTS = [
  V3EnvironmentWorkspace,
  V3ProductionWorkspace,
  V3ReviewWorkspace,
  V3AssetsWorkspace,
  V3IntelligenceWorkspace,
] as const;

const SWIPE_THRESHOLD_PX = 48;

/** Swipeable viewport stage — five workspaces with horizontal slide transitions. */
export function V3WorkspaceStage({ children }: { children?: ReactNode }) {
  const { state, swipeWorkspace } = useExperienceLabV3Store();
  const touchStartX = useRef<number | null>(null);
  const activeIndex = resolveV3WorkspaceIndex(state.activeWorkspace);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartX.current;
      if (start == null) return;
      const end = e.changedTouches[0]?.clientX ?? start;
      const delta = end - start;
      if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
        swipeWorkspace(delta < 0 ? 1 : -1);
      }
      touchStartX.current = null;
    },
    [swipeWorkspace]
  );

  return (
    <div
      className="elab-v3-stage"
      {...{ [ELAB_V3_COMPOSITION.workspaceStage]: '' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="elab-v3-stage__track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        aria-live="polite"
      >
        {V3_CORE_WORKSPACES.map((ws, index) => {
          const Component = WORKSPACE_COMPONENTS[index]!;
          return (
            <div key={ws.id} className="elab-v3-stage__pane" data-workspace={ws.id}>
              <Component />
            </div>
          );
        })}
      </div>

      <V3BlueprintPanel />
      <V3ContextInspector />
      {children}
    </div>
  );
}
