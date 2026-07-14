import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

/** Hero render viewport — production preview, not presentation chrome. */
export function V3Viewport() {
  const { state } = useExperienceLabV3Store();

  return (
    <main className="elab-v3-viewport" data-elab-v3-viewport role="main">
      <div className="elab-v3-viewport__scene">
        <div className="elab-v3-viewport__ambient" />
        <div className="elab-v3-viewport__floor" />
        <div className="elab-v3-viewport__hero" />
      </div>
      <div className="elab-v3-viewport__caption">
        <span>{state.workspace.departmentLabel}</span>
        <span>{state.workspace.variantLabel}</span>
        <span>R{state.workspace.revision}</span>
      </div>
    </main>
  );
}
