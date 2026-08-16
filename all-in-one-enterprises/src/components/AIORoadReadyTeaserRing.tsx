import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const ILLUSTRATIVE_PROGRESS = 72;

export function AIORoadReadyTeaserRing() {
  const reducedMotion = usePrefersReducedMotion();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (ILLUSTRATIVE_PROGRESS / 100) * circumference;

  return (
    <div
      className="aio-road-ready-ring"
      role="img"
      aria-label="Illustrative Road Ready example showing sample readiness progress"
    >
      <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
        <circle cx="66" cy="66" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke="var(--aio-gold-light)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: reducedMotion ? undefined : 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="aio-road-ready-ring__label">
        <span className="aio-road-ready-ring__pct">{ILLUSTRATIVE_PROGRESS}%</span>
        <span className="aio-road-ready-ring__sub">Example</span>
        <span className="aio-road-ready-ring__product">Road Ready™</span>
      </div>
    </div>
  );
}
