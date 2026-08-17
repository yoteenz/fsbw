import { AIOButton } from '../AIOButton';
import type { JourneyStepId, JourneyStepView, StartBusinessJourneyView } from '../../journeys/journeyTypes';
import { MobileProgressIndicator } from './MobileProgressIndicator';

type Props = {
  view: StartBusinessJourneyView;
  selectedStepId: JourneyStepId;
  onSelect: (id: JourneyStepId) => void;
};

export function MobileJourneyRoadmap({ view, selectedStepId, onSelect }: Props) {
  const currentIndex = view.steps.findIndex((s) => s.def.id === selectedStepId);
  const currentStepNum = currentIndex >= 0 ? currentIndex + 1 : 1;

  return (
    <div className="aio-mobile-journey">
      <MobileProgressIndicator
        current={currentStepNum}
        total={view.steps.length}
        label={`STEP ${currentStepNum} OF ${view.steps.length}`}
      />

      <ol className="aio-mobile-journey__list">
        {view.steps.map((step) => (
          <MobileJourneyStepCard
            key={step.def.id}
            step={step}
            expanded={step.def.id === selectedStepId}
            onSelect={() => onSelect(step.def.id)}
          />
        ))}
      </ol>
    </div>
  );
}

function MobileJourneyStepCard({
  step,
  expanded,
  onSelect,
}: {
  step: JourneyStepView;
  expanded: boolean;
  onSelect: () => void;
}) {
  const isComplete = step.status === 'complete';
  const isCurrent = step.status === 'in_progress' || step.status === 'action_required';

  if (expanded) {
    return (
      <li className="aio-mobile-journey__item aio-mobile-journey__item--expanded">
        <article className="aio-mobile-journey__card aio-mobile-journey__card--active">
          <div className="aio-mobile-journey__card-head">
            <span className="aio-mobile-journey__card-num">{isComplete ? '✓' : step.def.number}</span>
            <div>
              <h3 className="aio-mobile-journey__card-title">{step.def.title}</h3>
              <p className="aio-mobile-journey__card-subtitle">{step.def.shortTitle}</p>
            </div>
          </div>
          <p className="aio-mobile-journey__card-desc">{step.def.description}</p>
          <span className="aio-mobile-journey__card-status">{step.statusLabel}</span>
          <AIOButton to={step.ctaRoute} variant="gold" showArrow className="aio-mobile-journey__card-cta">
            {step.ctaLabel.replace(' →', '')}
          </AIOButton>
        </article>
      </li>
    );
  }

  return (
    <li className="aio-mobile-journey__item">
      <button
        type="button"
        className={[
          'aio-mobile-journey__card aio-mobile-journey__card--compact',
          isComplete ? 'is-complete' : '',
          isCurrent ? 'is-current' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onSelect}
        aria-expanded={false}
      >
        <span className="aio-mobile-journey__card-num">{isComplete ? '✓' : step.def.number}</span>
        <span className="aio-mobile-journey__compact-title">{step.def.title}</span>
        <span className="aio-mobile-journey__chevron" aria-hidden="true">
          ›
        </span>
      </button>
    </li>
  );
}
