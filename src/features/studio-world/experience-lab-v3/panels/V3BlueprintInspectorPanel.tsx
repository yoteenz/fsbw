import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

/** Persistent blueprint inspector — only permanent floating inspector. */
export function V3BlueprintInspectorPanel() {
  const { state, dispatch } = useExperienceLabV3Store();
  const blueprint = state.activePackage?.outputs.find((o) => o.id === 'blueprint');

  return (
    <aside
      className={`elab-v3-blueprint${state.blueprintFullscreen ? ' is-fullscreen' : ''}`}
      data-elab-v3-blueprint-inspector
    >
      <header className="elab-v3-blueprint__head">
        <h2>Blueprint</h2>
        <div className="elab-v3-blueprint__controls">
          <button type="button" onClick={() => dispatch({ type: 'SET_BLUEPRINT_ZOOM', zoom: Math.max(0.5, state.blueprintZoom - 0.1) })}>−</button>
          <span>{Math.round(state.blueprintZoom * 100)}%</span>
          <button type="button" onClick={() => dispatch({ type: 'SET_BLUEPRINT_ZOOM', zoom: Math.min(2, state.blueprintZoom + 0.1) })}>+</button>
          <button type="button" onClick={() => dispatch({ type: 'TOGGLE_BLUEPRINT_FULLSCREEN' })}>
            {state.blueprintFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </header>
      <div
        className="elab-v3-blueprint__canvas"
        style={{ transform: `scale(${state.blueprintZoom}) translate(${state.blueprintPan.x}px, ${state.blueprintPan.y}px)` }}
      >
        <div className="elab-v3-blueprint__preview" role="img" aria-label="Blueprint preview">
          <div className="elab-v3-blueprint__grid" />
          <div className="elab-v3-blueprint__structure" />
          <p className="elab-v3-blueprint__status">
            {blueprint?.status ?? 'queued'} · {blueprint?.progress ?? 0}%
          </p>
        </div>
      </div>
      <footer className="elab-v3-blueprint__foot">
        <span>R{state.workspace.revision}</span>
        <span>{state.workspace.variantLabel}</span>
        <button type="button">History</button>
        <button type="button">Compare</button>
      </footer>
    </aside>
  );
}
