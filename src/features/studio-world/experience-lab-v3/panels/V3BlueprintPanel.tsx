import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import type { V3CoreWorkspaceId } from '../experience-lab-v3.types';

const BLUEPRINT_COPY: Record<V3CoreWorkspaceId, { title: string; subtitle: string }> = {
  environment: { title: 'Blueprint', subtitle: 'Architectural context for the active environment render.' },
  production: { title: 'Active Work Order', subtitle: 'Current production task driving the package pipeline.' },
  review: { title: 'Review Item', subtitle: 'Founder decision context for the pending approval.' },
  assets: { title: 'Current Package', subtitle: 'Warehouse record for the selected environment package.' },
  intelligence: { title: 'Analytics Context', subtitle: 'Operational metrics scoped to the active package.' },
};

/** Persistent floating blueprint panel — visual shell stays fixed; content adapts per workspace. */
export function V3BlueprintPanel() {
  const { state, activeWorkOrder, dispatch } = useExperienceLabV3Store();
  const copy = BLUEPRINT_COPY[state.activeWorkspace];
  const pkg = state.activePackage;

  return (
    <aside
      className={`elab-v3-blueprint${state.blueprintFullscreen ? ' is-fullscreen' : ''}`}
      {...{ [ELAB_V3_COMPOSITION.blueprintPanel]: '' }}
      aria-label="Blueprint panel"
    >
      <header className="elab-v3-blueprint__head">
        <span className="elab-v3-blueprint__eyebrow">BLUEPRINT PANEL</span>
        <h3 className="elab-v3-blueprint__title">{copy.title}</h3>
        <p className="elab-v3-blueprint__subtitle">{copy.subtitle}</p>
      </header>

      <div
        className="elab-v3-blueprint__canvas"
        style={{
          transform: `scale(${state.blueprintZoom}) translate(${state.blueprintPan.x}px, ${state.blueprintPan.y}px)`,
        }}
      >
        <div className="elab-v3-blueprint__grid" aria-hidden />
        <div className="elab-v3-blueprint__structure" aria-hidden />
        <p className="elab-v3-blueprint__status">
          {state.activeWorkspace === 'production' && activeWorkOrder
            ? `${activeWorkOrder.title} · ${activeWorkOrder.progress}%`
            : state.activeWorkspace === 'review'
              ? `R${state.workspace.revision} · ${state.workspace.lifecycleStatus}`
              : pkg
                ? `${pkg.variantLabel} · ${pkg.lifecycleStatus}`
                : 'No package'}
        </p>
      </div>

      <div className="elab-v3-blueprint__actions">
        <button type="button" onClick={() => dispatch({ type: 'SET_BLUEPRINT_ZOOM', zoom: Math.min(2, state.blueprintZoom + 0.1) })}>
          Zoom +
        </button>
        <button type="button" onClick={() => dispatch({ type: 'SET_BLUEPRINT_ZOOM', zoom: Math.max(0.5, state.blueprintZoom - 0.1) })}>
          Zoom −
        </button>
        <button type="button" onClick={() => dispatch({ type: 'TOGGLE_BLUEPRINT_FULLSCREEN' })}>
          {state.blueprintFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>
    </aside>
  );
}
