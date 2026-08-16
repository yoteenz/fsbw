import { mockBusinessSteps } from '../data/mockRoadmap';

const icons: Record<string, React.ReactNode> = {
  BUILD: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </svg>
  ),
  AUTHORIZE: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3l7 4v5c0 4.5-3.5 8.5-7 9-3.5-.5-7-4.5-7-9V7l7-4z" />
    </svg>
  ),
  PROTECT: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3l7 4v5c0 4.5-3.5 8.5-7 9-3.5-.5-7-4.5-7-9V7l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  REGISTER: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  ACTIVATE: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  ROLL: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1 13h2l2-5h11l2 5h3M5 16h.01M19 16h.01" />
    </svg>
  ),
};

export function AIOStartupMilestones() {
  return (
    <section className="aio-milestones" aria-labelledby="aio-milestones-heading">
      <h2 id="aio-milestones-heading" className="aio-milestones__heading">
        BUILD → AUTHORIZE → PROTECT → REGISTER → ACTIVATE → ROLL
      </h2>
      <ul className="aio-milestones__grid">
        {mockBusinessSteps.map((step) => (
          <li key={step.step} className="aio-milestones__item">
            <div className="aio-milestones__icon">{icons[step.title] ?? icons.BUILD}</div>
            <p className="aio-milestones__label">{step.title}</p>
            <p className="aio-milestones__desc">{step.subtitle}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
