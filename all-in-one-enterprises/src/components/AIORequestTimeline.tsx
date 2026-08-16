import type { TimelineStep } from '../repositories/serviceRequestRepository';

export function AIORequestTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="aio-request-timeline">
      {steps.map((step) => (
        <li
          key={step.id}
          className={`aio-request-timeline__step aio-request-timeline__step--${step.status}`}
        >
          <span className="aio-request-timeline__marker" aria-hidden="true">
            {step.status === 'completed' ? '✓' : step.status === 'current' ? '●' : '○'}
          </span>
          <span className="aio-request-timeline__label">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
