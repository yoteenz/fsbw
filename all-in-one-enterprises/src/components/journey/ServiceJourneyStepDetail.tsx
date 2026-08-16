import { Link } from 'react-router-dom';
import { AIOButton } from '../AIOButton';
import type { JourneyStepView } from '../../journeys/journeyTypes';

type Props = {
  step: JourneyStepView;
};

export function ServiceJourneyStepDetail({ step }: Props) {
  return (
    <article
      className={[
        'aio-journey-detail',
        step.status === 'in_progress' || step.status === 'action_required' ? 'is-current' : '',
        step.status === 'complete' ? 'is-complete' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="aio-journey-detail__head">
        <p className="aio-journey-detail__num">{step.def.number}</p>
        <div>
          <h3 className="aio-journey-detail__title">{step.def.title}</h3>
          <p className="aio-journey-detail__subtitle">{step.def.shortTitle}</p>
        </div>
        <span className="aio-journey-detail__status">{step.statusLabel}</span>
      </div>
      <p className="aio-journey-detail__desc">{step.def.description}</p>

      {step.subProgress && step.subProgress.total > 0 ? (
        <p className="aio-journey-detail__subprogress">
          {step.subProgress.completed} of {step.subProgress.total} complete ({step.subProgress.percent}%)
        </p>
      ) : null}

      {step.subSteps?.length ? (
        <ul className="aio-journey-substeps">
          {step.subSteps
            .filter((s) => s.applicable)
            .map((sub) => (
              <li key={sub.def.id} className="aio-journey-substeps__item">
                <div>
                  <p className="aio-journey-substeps__label">{sub.def.label}</p>
                  <p className="aio-journey-substeps__desc">{sub.def.description}</p>
                  <span className="aio-journey-substeps__status">{sub.statusLabel}</span>
                </div>
                <Link to={sub.ctaRoute} className="aio-journey-substeps__cta">
                  {sub.ctaLabel.toUpperCase()} →
                </Link>
              </li>
            ))}
        </ul>
      ) : null}

      <div className="aio-journey-detail__actions">
        <AIOButton to={step.ctaRoute} variant="gold" showArrow>
          {step.ctaLabel.replace(' →', '')}
        </AIOButton>
      </div>
    </article>
  );
}
