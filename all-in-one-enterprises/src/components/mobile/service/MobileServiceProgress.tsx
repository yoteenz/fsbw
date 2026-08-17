import { Link } from 'react-router-dom';
import type { MobileServiceProgressView } from '../../../hooks/useMobileServicePage';

type Props = {
  progress: MobileServiceProgressView;
};

export function MobileServiceProgress({ progress }: Props) {
  if (!progress.ready) {
    return (
      <section className="aio-msvc-progress aio-msvc-progress--ready" aria-label="Service progress">
        <p className="aio-msvc-section-label">{progress.title}</p>
        <p className="aio-msvc-progress__ready">Ready to Begin</p>
      </section>
    );
  }

  return (
    <section className="aio-msvc-progress" aria-label="Service progress">
      <div className="aio-msvc-progress__head">
        <p className="aio-msvc-section-label">{progress.title}</p>
        {progress.totalCount > 0 ? (
          <p className="aio-msvc-progress__meta">
            {progress.completedCount} of {progress.totalCount} steps · {progress.percent}% complete
          </p>
        ) : null}
      </div>
      {progress.phases.length > 0 ? (
        <ul className="aio-msvc-progress__phases">
          {progress.phases.map((phase) => (
            <li key={phase.label} className={`aio-msvc-progress__phase aio-msvc-progress__phase--${phase.status}`}>
              <span className="aio-msvc-progress__marker" aria-hidden="true">
                {phase.status === 'complete' ? '●' : phase.status === 'current' ? '◉' : '○'}
              </span>
              <span>{phase.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {progress.trackerHref ? (
        <Link to={progress.trackerHref} className="aio-btn aio-btn--outline-gold aio-msvc-progress__cta">
          View Progress →
        </Link>
      ) : null}
    </section>
  );
}
