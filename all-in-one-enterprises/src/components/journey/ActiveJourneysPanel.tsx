import { Link } from 'react-router-dom';
import { useStartBusinessJourney } from '../../journeys/useStartBusinessJourney';
import { aioPaths } from '../../utils/paths';

/** Client portal widget — active service journeys with progress. */
export function ActiveJourneysPanel() {
  const startup = useStartBusinessJourney();

  const journeys = [
    {
      id: startup.journey.id,
      name: startup.journey.name,
      percent: startup.progress.percent,
      label: startup.progress.label,
      href: aioPaths.startYourBusiness,
      continueHref: startup.nextAction?.ctaRoute ?? `${aioPaths.startYourBusiness}/build`,
      attention: startup.attention.length,
      isComplete: startup.isComplete,
    },
  ].filter((j) => j.percent > 0 || j.attention > 0);

  if (journeys.length === 0) return null;

  return (
    <section className="aio-cc-panel" aria-labelledby="aio-active-journeys">
      <h2 id="aio-active-journeys" className="aio-cc-panel__title">
        Active Journeys
      </h2>
      <ul className="aio-journey-workflows">
        {journeys.map((j) => (
          <li key={j.id} className="aio-journey-item">
            <div className="aio-journey-item__main">
              <Link to={j.href} className="aio-journey-item__title">
                {j.name}
              </Link>
              <p className="aio-journey-item__meta">
                {j.percent}% · {j.label}
                {j.attention > 0 ? ` · ${j.attention} action${j.attention === 1 ? '' : 's'} needed` : ''}
              </p>
              <div className="aio-journey-header__bar" role="progressbar" aria-valuenow={j.percent} aria-valuemin={0} aria-valuemax={100}>
                <span className="aio-journey-header__bar-fill" style={{ width: `${j.percent}%` }} />
              </div>
            </div>
            <Link to={j.continueHref} className="aio-btn aio-btn--gold aio-btn--sm">
              Continue →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
