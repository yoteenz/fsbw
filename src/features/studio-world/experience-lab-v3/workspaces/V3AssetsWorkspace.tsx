import { useExperienceLabLiveWorkspace } from '../../experience-lab-v2/live-workspace';
import { V3_INSPECTOR_COPY } from '../registry/v3-workbench-registry';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { V3WorkspaceFloatingDisplays, V3WorkspaceStateGate } from '../shared/V3WorkspaceChrome';

/** Workspace 04 — environment package browser (viewport-contained). */
export function V3AssetsWorkspace() {
  const { state, activeAsset, setActiveAsset, setActiveOutput } = useExperienceLabV3Store();
  const { liveWorkspace } = useExperienceLabLiveWorkspace();
  const pkg = state.activePackage;
  const selectedOutput =
    pkg?.outputs.find((o) => o.id === state.activeOutputId) ?? pkg?.outputs[0] ?? null;
  const inspector = state.activeInspectorMode ? V3_INSPECTOR_COPY[state.activeInspectorMode] : null;

  const completed = pkg?.outputs.filter((o) => o.progress === 100).length ?? 0;
  const total = pkg?.outputs.length ?? 0;

  return (
    <V3WorkspaceStateGate
      workspaceId="assets"
      dataState={state.workspaceDataState.assets}
      error={state.lastPageError}
      emptyTitle="No assets generated"
      emptyBody="Package outputs will appear here after generation completes."
      emptyAction="Open Production"
    >
      <section
        className="elab-v3-ws-pane elab-v3-ws-pane--assets"
        {...{ [ELAB_V3_COMPOSITION.assetsWorkspace]: '' }}
        aria-label="Assets workspace"
      >
        <V3WorkspaceFloatingDisplays
          persistentLabel="Active Package"
          persistentBody={
            pkg ? (
              <dl className="elab-v3-ws-pane__dl">
                <div>
                  <dt>Package</dt>
                  <dd>{pkg.packageId}</dd>
                </div>
                <div>
                  <dt>Variant</dt>
                  <dd>{pkg.variantLabel}</dd>
                </div>
                <div>
                  <dt>Completion</dt>
                  <dd>
                    {completed}/{total}
                  </dd>
                </div>
                <div>
                  <dt>Health</dt>
                  <dd>{liveWorkspace.packageHealth}%</dd>
                </div>
              </dl>
            ) : (
              <p>No active package</p>
            )
          }
          interchangeableLabel={inspector?.title ?? 'Asset Details'}
          interchangeableBody={
            inspector ? (
              <p>{inspector.body}</p>
            ) : selectedOutput ? (
              <dl className="elab-v3-ws-pane__dl">
                <div>
                  <dt>Type</dt>
                  <dd>{selectedOutput.label}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{selectedOutput.status}</dd>
                </div>
                <div>
                  <dt>Revision</dt>
                  <dd>R{pkg?.revision}</dd>
                </div>
                <div>
                  <dt>Provider</dt>
                  <dd>{selectedOutput.provider}</dd>
                </div>
              </dl>
            ) : (
              <p>Select an asset</p>
            )
          }
        />

        <div className="elab-v3-ws-pane__layout elab-v3-ws-pane__layout--assets">
          <header className="elab-v3-ws-pane__region elab-v3-ws-pane__region--top">
            <h3>Package Summary</h3>
            <p className="elab-v3-ws-pane__muted">
              R{pkg?.revision} · {pkg?.lifecycleStatus} · Storage {liveWorkspace.readinessPercent}%
            </p>
          </header>

          <div className="elab-v3-ws-pane__region elab-v3-ws-pane__region--center">
            <h3>Asset Grid</h3>
            <div className="elab-v3-ws-pane__asset-grid" data-v3-no-swipe>
              {pkg?.outputs.map((out) => (
                <button
                  key={out.id}
                  type="button"
                  className={`elab-v3-ws-pane__asset-card${state.activeOutputId === out.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setActiveOutput(out.id);
                    setActiveAsset(`asset-${out.id}`);
                  }}
                >
                  <span className="elab-v3-ws-pane__asset-type">{out.label}</span>
                  <span className="elab-v3-ws-pane__asset-status">{out.status}</span>
                  <span className="elab-v3-ws-pane__asset-meta">
                    R{pkg.revision} · {out.progress}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="elab-v3-ws-pane__region elab-v3-ws-pane__region--lower">
            <h3>Selected Asset</h3>
            {activeAsset && selectedOutput ? (
              <div data-v3-no-swipe>
                <p>
                  <strong>{selectedOutput.label}</strong> · {selectedOutput.status}
                </p>
                <p className="elab-v3-ws-pane__muted">
                  {selectedOutput.cached ? 'Cached' : 'Live'} · {selectedOutput.provider}
                </p>
                <button type="button" disabled={selectedOutput.progress < 100}>
                  Export
                </button>
              </div>
            ) : (
              <p className="elab-v3-ws-pane__muted">Select an output above</p>
            )}
          </div>
        </div>
      </section>
    </V3WorkspaceStateGate>
  );
}
