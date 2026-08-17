import type { MobileServiceProcessStep } from '../../../services/mobileServicePageConfig';

type Props = {
  steps: MobileServiceProcessStep[];
};

export function MobileServiceJourney({ steps }: Props) {
  return (
    <section className="aio-msvc-journey" aria-labelledby="aio-msvc-journey-heading">
      <h2 id="aio-msvc-journey-heading" className="aio-msvc-section-label">
        Our Process
      </h2>
      <ol className="aio-msvc-journey__list">
        {steps.map((step, index) => (
          <li key={step.title} className="aio-msvc-journey__item">
            <div className="aio-msvc-journey__rail" aria-hidden="true">
              <span className="aio-msvc-journey__node">{String(index + 1).padStart(2, '0')}</span>
              {index < steps.length - 1 ? <span className="aio-msvc-journey__line" /> : null}
            </div>
            <div className="aio-msvc-journey__content">
              <h3 className="aio-msvc-journey__title">{step.title}</h3>
              <p className="aio-msvc-journey__desc">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
