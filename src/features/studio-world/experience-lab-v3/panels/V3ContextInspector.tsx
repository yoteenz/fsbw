import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { V3_INSPECTOR_COPY } from '../registry/v3-workbench-registry';

/** Single interchangeable inspector — morphs between modes, never stacked. */
export function V3ContextInspector() {
  const { state } = useExperienceLabV3Store();
  const mode = state.activeInspectorMode;

  if (!mode) return null;

  const copy = V3_INSPECTOR_COPY[mode];

  return (
    <aside
      className="elab-v3-inspector"
      {...{ [ELAB_V3_COMPOSITION.contextInspector]: '' }}
      data-inspector-mode={mode}
      aria-label={copy.title}
    >
      <header className="elab-v3-inspector__head">
        <span className="elab-v3-inspector__eyebrow">INSPECTOR</span>
        <h3 className="elab-v3-inspector__title">{copy.title}</h3>
      </header>
      <p className="elab-v3-inspector__body">{copy.body}</p>
      <div className="elab-v3-inspector__meta">
        <span>Workspace: {state.activeWorkspace}</span>
        <span>Package: {state.activePackage?.packageId}</span>
        <span>Variant: {state.workspace.variantLabel}</span>
      </div>
    </aside>
  );
}
