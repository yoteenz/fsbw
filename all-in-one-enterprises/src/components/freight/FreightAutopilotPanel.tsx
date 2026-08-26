import type { FreightAutopilotState } from '../../freight/autopilot/freightAutopilotTypes';
import type { FreightException } from '../../freight/autopilot/freightExceptionTypes';
import type { DocumentCompletenessResult } from '../../freight/autopilot/documentCompleteness';
import type { FreightAutopilotStep } from '../../freight/autopilot/freightAutopilotTypes';

const STATUS_ICON: Record<string, string> = {
  complete: '✓',
  ready: '◐',
  blocked: '✕',
  pending: '○',
  skipped: '—',
  manual_required: '!',
};

interface FreightAutopilotPanelProps {
  state: FreightAutopilotState;
  exceptions: FreightException[];
  documentCompleteness: DocumentCompletenessResult;
}

export function FreightAutopilotPanel({ state, exceptions, documentCompleteness }: FreightAutopilotPanelProps) {
  return (
    <section className="aio-freight-autopilot" aria-label="Freight Autopilot">
      <h2 className="aio-freight-autopilot__title">Freight Autopilot</h2>
      <ul className="aio-freight-autopilot__steps">
        {state.steps.map((step: FreightAutopilotStep) => (
          <li key={step.key} className={`aio-freight-autopilot__step aio-freight-autopilot__step--${step.status}`}>
            <span className="aio-freight-autopilot__icon">{STATUS_ICON[step.status] ?? '○'}</span>
            <span className="aio-freight-autopilot__label">{step.label}</span>
            {step.blockedReason && (
              <span className="aio-freight-autopilot__blocked">{step.blockedReason}</span>
            )}
          </li>
        ))}
      </ul>
      {documentCompleteness.missingLabels.length > 0 && (
        <p className="aio-freight-autopilot__missing">
          Missing: {documentCompleteness.missingLabels.join(', ')}
        </p>
      )}
      {exceptions.length > 0 && (
        <div className="aio-freight-autopilot__exceptions">
          <h3>Exceptions</h3>
          <ul>
            {exceptions.map((ex) => (
              <li key={ex.id}>
                [{ex.severity}] {ex.summary}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
