import { Link } from 'react-router-dom';
import type { JourneyStepView } from '../../journeys/journeyTypes';
import { AioSectionHeading } from './AioSectionHeading';
import { AIOIcon } from '../AIOIcon';
import type { AioIconKey } from '../../config/aioIconRegistry';

const STEP_ICONS: Record<string, AioIconKey> = {
  build: 'companyFormation',
  authorize: 'operatingAuthority',
  protect: 'serviceTruckingInsurance',
  register: 'permits',
  activate: 'driver',
  roll: 'operationsDispatch',
};

type Props = {
  steps: JourneyStepView[];
  className?: string;
};

export function AioJourneyMilestones({ steps, className = '' }: Props) {
  return (
    <ol className={`aio-ps-journey${className ? ` ${className}` : ''}`}>
      {steps.map((step) => {
        const icon = STEP_ICONS[step.def.id] ?? 'operatingAuthority';
        return (
          <li key={step.def.id} className={`aio-ps-journey__item aio-ps-journey__item--${step.status}`}>
            <div className="aio-ps-journey__marker" aria-hidden="true">
              <AIOIcon icon={icon} size={24} alt="" />
            </div>
            <div className="aio-ps-journey__copy">
              <div className="aio-ps-journey__head">
                <span className="aio-ps-journey__num">{step.def.number}</span>
                <h3 className="aio-ps-journey__title">{step.def.title}</h3>
                <span className={`aio-ps-journey__status aio-ps-journey__status--${step.status}`}>
                  {step.statusLabel}
                </span>
              </div>
              <p className="aio-ps-journey__desc">{step.def.description}</p>
              {step.applicable ? (
                <Link to={step.ctaRoute} className="aio-ps-journey__cta">
                  {step.ctaLabel}
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type JourneySectionProps = {
  steps: JourneyStepView[];
};

export function AioJourneySection({ steps }: JourneySectionProps) {
  return (
    <section className="aio-ps-block">
      <AioSectionHeading
        eyebrow="Your journey"
        title="From idea to running your trucking business"
        subtitle="Each milestone connects to Road Ready requirements and live service status when you're signed in."
        light
      />
      <AioJourneyMilestones steps={steps} />
    </section>
  );
}
