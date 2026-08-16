import type { JourneyStepView, JourneyStepId } from '../../journeys/journeyTypes';

const STEP_ICONS: Record<JourneyStepId, string> = {
  build: '01',
  authorize: '02',
  protect: '03',
  register: '04',
  activate: '05',
  roll: '06',
};

type Props = {
  steps: JourneyStepView[];
  selectedStepId: JourneyStepId;
  onSelect: (id: JourneyStepId) => void;
};

export function ServiceJourneyStepper({ steps, selectedStepId, onSelect }: Props) {
  return (
    <nav className="aio-journey-stepper" aria-label="Startup journey milestones">
      <ol className="aio-journey-stepper__list">
        {steps.map((step) => {
          const isSelected = step.def.id === selectedStepId;
          const isComplete = step.status === 'complete';
          const isCurrent = step.status === 'in_progress' || step.status === 'action_required';
          return (
            <li key={step.def.id}>
              <button
                type="button"
                className={[
                  'aio-journey-stepper__btn',
                  isSelected ? 'is-selected' : '',
                  isComplete ? 'is-complete' : '',
                  isCurrent ? 'is-current' : '',
                  step.status === 'not_applicable' ? 'is-na' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(step.def.id)}
                aria-current={isSelected ? 'step' : undefined}
                aria-label={`${step.def.title}: ${step.def.shortTitle}. ${step.statusLabel}`}
              >
                <span className="aio-journey-stepper__num" aria-hidden="true">
                  {isComplete ? '✓' : STEP_ICONS[step.def.id]}
                </span>
                <span className="aio-journey-stepper__title">{step.def.title}</span>
                <span className="aio-journey-stepper__status">{step.statusLabel}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
