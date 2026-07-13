import type { ReactNode } from 'react';
import type { ComponentReviewId } from './experience-lab-v2-component-review';

type Props = {
  componentId: ComponentReviewId;
  label: string;
  children: ReactNode;
};

/** Isolated stage for reviewing one production component. */
export function ExperienceLabComponentReviewSandbox({ componentId, label, children }: Props) {
  return (
    <div
      className={`elab-component-review-sandbox elab-component-review-sandbox--${componentId}`}
      data-elab-review-sandbox={componentId}
      aria-label={`${label} review sandbox`}
    >
      <div className="elab-component-review-sandbox__label">{label}</div>
      <div className="elab-component-review-sandbox__stage">{children}</div>
    </div>
  );
}
