import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

/** Workspace 01 — immersive environment render (hero). */
export function V3EnvironmentWorkspace() {
  const { state } = useExperienceLabV3Store();
  const variant = state.designVariants.find((v) => v.id === state.workspace.variantId);

  return (
    <section
      className="elab-v3-ws elab-v3-ws--environment"
      {...{ [ELAB_V3_COMPOSITION.environmentWorkspace]: '' }}
      aria-label="Environment workspace"
    >
      <div
        className="elab-v3-ws__render"
        style={{ backgroundImage: variant ? `url(${variant.previewEnvironmentUrl})` : undefined }}
      >
        <div className="elab-v3-ws__render-ambient" aria-hidden />
        <div className="elab-v3-ws__render-caption">
          <span>{state.workspace.environmentLabel}</span>
          <span>{variant?.name ?? state.workspace.variantLabel}</span>
          <span>R{state.workspace.revision}</span>
        </div>
      </div>
    </section>
  );
}
