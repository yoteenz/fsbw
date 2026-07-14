import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

/** Workspace 04 — unified asset warehouse. */
export function V3AssetsWorkspace() {
  const { state } = useExperienceLabV3Store();
  const pkg = state.activePackage;

  return (
    <section
      className="elab-v3-ws elab-v3-ws--assets"
      {...{ [ELAB_V3_COMPOSITION.assetsWorkspace]: '' }}
      aria-label="Assets workspace"
    >
      <div className="elab-v3-ws__assets-grid">
        <div className="elab-v3-ws__asset-library">
          <h3>Studio Warehouse</h3>
          <ul>
            {state.assetLibrary.map((asset) => (
              <li key={asset.id}>
                <span className="elab-v3-ws__asset-kind">{asset.kind}</span>
                <span>{asset.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="elab-v3-ws__package-outputs">
          <h3>Environment Package Outputs</h3>
          {pkg ? (
            <ul>
              {pkg.outputs.map((out) => (
                <li key={out.id}>
                  <span>{out.label}</span>
                  <span>{out.status} · {out.progress}%</span>
                  {out.derivedFrom ? <span className="elab-v3-ws__derived">← {out.derivedFrom}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>No active package</p>
          )}
        </div>
      </div>
    </section>
  );
}
