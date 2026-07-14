import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

/** Workspace 04 — environment package browser (viewport-contained). */
export function V3AssetsWorkspace() {
  const { state } = useExperienceLabV3Store();
  const pkg = state.activePackage;

  return (
    <section
      className="elab-v3-ws-pane elab-v3-ws-pane--assets"
      {...{ [ELAB_V3_COMPOSITION.assetsWorkspace]: '' }}
      aria-label="Assets workspace"
    >
      <div className="elab-v3-ws-pane__grid elab-v3-ws-pane__grid--assets">
        <div className="elab-v3-ws-pane__panel">
          <h3>Asset Library</h3>
          <ul>
            {state.assetLibrary.map((asset) => (
              <li key={asset.id}>
                {asset.kind} · {asset.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="elab-v3-ws-pane__panel">
          <h3>Package Outputs</h3>
          {pkg ? (
            <ul>
              {pkg.outputs.map((out) => (
                <li key={out.id}>
                  {out.label} · {out.status} · {out.progress}%
                </li>
              ))}
            </ul>
          ) : (
            <p>No package</p>
          )}
        </div>
      </div>
    </section>
  );
}
