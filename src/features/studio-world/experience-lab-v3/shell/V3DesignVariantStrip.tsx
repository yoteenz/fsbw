import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { V3_DESIGN_VARIANTS_SECTION_LABEL } from '../registry/v3-workspace-registry';
import type { V3DesignVariantId } from '../experience-lab-v3.types';

/** Design variant strip — always visible beneath the viewport, synced across workspaces. */
export function V3DesignVariantStrip() {
  const { state, setVariant, dispatch } = useExperienceLabV3Store();
  const activeId = state.workspace.variantId as V3DesignVariantId;

  return (
    <nav
      className={`elab-v3-design-variants${state.designVariantsCollapsed ? ' is-collapsed' : ''}`}
      {...{ [ELAB_V3_COMPOSITION.designVariants]: '' }}
      aria-label="Design variants"
    >
      <div className="elab-v3-design-variants__head">
        <span className="elab-v3-design-variants__label">{V3_DESIGN_VARIANTS_SECTION_LABEL}</span>
        <button
          type="button"
          className="elab-v3-design-variants__collapse"
          aria-expanded={!state.designVariantsCollapsed}
          onClick={() => dispatch({ type: 'TOGGLE_DESIGN_VARIANTS_COLLAPSED' })}
        >
          {state.designVariantsCollapsed ? `${state.workspace.variantLabel} · ${state.designVariants.length}` : 'Collapse'}
        </button>
      </div>
      {!state.designVariantsCollapsed ? (
        <div className="elab-v3-design-variants__strip" role="listbox">
          {state.designVariants.map((variant) => {
            const isActive = variant.id === activeId;
            return (
              <button
                key={variant.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`elab-v3-design-variants__thumb${isActive ? ' is-active' : ''}${variant.theme === 'light' ? ' is-light' : ' is-dark'}`}
                onClick={() => setVariant(variant.id, variant.name)}
              >
                <img src={variant.thumbnailUrl} alt="" aria-hidden decoding="async" />
                <span className="elab-v3-design-variants__name">{variant.name}</span>
                <span className="elab-v3-design-variants__status">{variant.cardStatus}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}
