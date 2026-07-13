import {
  COMPONENT_REVIEW_REGISTRY,
  componentsHiddenInReview,
  type ComponentReviewId,
} from './experience-lab-v2-component-review';
import type { ExperienceLabComponentReview } from './useExperienceLabComponentReview';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  review: ExperienceLabComponentReview;
};

/** Component Review Mode chrome — selector + lock status (always visible in review mode). */
export function ExperienceLabComponentReviewChrome({ review }: Props) {
  const hidden = componentsHiddenInReview(review.activeComponent);
  const activeDef = COMPONENT_REVIEW_REGISTRY.find((c) => c.id === review.activeComponent);

  return (
    <aside
      className="elab-component-review-chrome"
      {...{ [ELAB_V2_COMPOSITION.componentReviewChrome]: '' }}
      aria-label="Experience Lab component review mode"
    >
      <div className="elab-component-review-chrome__head">
        <strong>COMPONENT REVIEW MODE</strong>
        <span className="elab-component-review-chrome__phase">
          Phase {activeDef?.phase ?? 1} · {activeDef?.label ?? 'Command Dock'}
        </span>
        <button
          type="button"
          className="elab-component-review-chrome__exit"
          onClick={() => review.setReviewEnabled(false)}
        >
          Exit review
        </button>
      </div>

      <div className="elab-component-review-chrome__selector" role="listbox" aria-label="Select component to review">
        {COMPONENT_REVIEW_REGISTRY.map((def) => {
          const locked = review.isLocked(def.id);
          const selectable = review.isSelectable(def.id);
          return (
            <button
              key={def.id}
              type="button"
              role="option"
              aria-selected={review.activeComponent === def.id}
              disabled={!selectable}
              title={!selectable ? 'Complete prior phase approval first' : def.versionName}
              className={`elab-component-review-chrome__option${
                review.activeComponent === def.id ? ' elab-component-review-chrome__option--active' : ''
              }${locked ? ' elab-component-review-chrome__option--locked' : ''}`}
              onClick={() => review.setActiveComponent(def.id as ComponentReviewId)}
            >
              <span className="elab-component-review-chrome__option-label">{def.label}</span>
              {locked ? <span className="elab-component-review-chrome__lock">🔒</span> : null}
            </button>
          );
        })}
      </div>

      <div className="elab-component-review-chrome__meta">
        <span>Visible: <strong>{activeDef?.label}</strong></span>
        <span>Hidden: {hidden.length} components</span>
        <span>Target version: {activeDef?.versionName}</span>
        <span>
          Locked: {Object.keys(review.lockedVersions).length}/{COMPONENT_REVIEW_REGISTRY.length}
        </span>
      </div>
    </aside>
  );
}
