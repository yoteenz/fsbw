import type { DesignVariantId, DesignVariantRecord } from './experience-lab-design-variants';
import { DESIGN_VARIANTS_SECTION_LABEL, resolveVariantCardBadge } from './experience-lab-design-variants';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  variants: DesignVariantRecord[];
  activeVariantId: DesignVariantId;
  collapsed: boolean;
  isCompact?: boolean;
  onToggleCollapse: () => void;
  onSelect: (id: DesignVariantId) => void;
  onOpenDrawer: (id: DesignVariantId) => void;
};

/** Render-direction strip — six architectural concept variants (not camera angles). */
export function ExperienceLabDesignVariantStrip({
  variants,
  activeVariantId,
  collapsed,
  isCompact,
  onToggleCollapse,
  onSelect,
  onOpenDrawer,
}: Props) {
  const activeVariant = variants.find((v) => v.id === activeVariantId);

  return (
    <nav
      className={`elab-view-angles elab-view-angles--chrome elab-design-variants${collapsed ? ' elab-view-angles--collapsed' : ''}`}
      {...{ [ELAB_V2_COMPOSITION.designVariants]: '' }}
      aria-label="Design variants"
    >
      <div className="elab-view-angles__head">
        <span className="elab-view-angles__label">{DESIGN_VARIANTS_SECTION_LABEL}</span>
        <button
          type="button"
          className="elab-view-angles__collapse"
          aria-expanded={!collapsed}
          onClick={onToggleCollapse}
        >
          {collapsed
            ? `${activeVariant?.name ?? 'Variant'} · ${variants.length}`
            : 'Collapse'}
        </button>
      </div>
      {!collapsed ? (
        <div className="elab-view-angles__strip" role="listbox" aria-label="Design variant concepts">
          {variants.map((variant) => {
            const isActive = variant.id === activeVariantId;
            const badge = resolveVariantCardBadge(variant, isActive);
            return (
              <div key={variant.id} className="elab-design-variants__card" role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  aria-label={`${variant.name} ${variant.theme} design variant${isActive ? ', active' : ''}${badge ? `, ${badge}` : ''}`}
                  className={`elab-view-angles__thumb elab-design-variants__thumb${isActive ? ' elab-view-angles__thumb--active elab-design-variants__thumb--active' : ''}${variant.theme === 'light' ? ' elab-design-variants__thumb--light' : ' elab-design-variants__thumb--dark'}`}
                  onClick={() => onSelect(variant.id)}
                >
                  <span
                    className="elab-view-angles__thumb-inner elab-design-variants__thumb-inner"
                    style={variant.thumbnailUrl ? { backgroundImage: `url(${variant.thumbnailUrl})` } : undefined}
                  />
                  {!isCompact ? (
                    <span className="elab-view-angles__thumb-label">{variant.name}</span>
                  ) : null}
                  {badge ? (
                    <span className={`elab-design-variants__badge elab-design-variants__badge--${badge.toLowerCase()}`}>
                      {badge}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  className="elab-design-variants__details"
                  aria-label={`${variant.name} details`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDrawer(variant.id);
                  }}
                >
                  ⋯
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}
