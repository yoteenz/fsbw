import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { ROAD_READY_PRODUCT_NAME } from '../road-ready/roadReadyConfig';

type Props = {
  setupProgress: number;
  verifiedProgress?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  dual?: boolean;
};

export function RoadReadyRing({
  setupProgress,
  verifiedProgress,
  size = 'md',
  label,
  sublabel,
  dual = false,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const dim = size === 'lg' ? 180 : size === 'sm' ? 100 : 140;
  const radius = size === 'lg' ? 72 : size === 'sm' ? 40 : 58;
  const stroke = size === 'lg' ? 12 : size === 'sm' ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const setupOffset = circumference - (setupProgress / 100) * circumference;
  const verifiedOffset = verifiedProgress != null ? circumference - (verifiedProgress / 100) * circumference : setupOffset;

  return (
    <div
      className={`aio-road-ready-ring aio-road-ready-ring--${size}`}
      role="img"
      aria-label={`${ROAD_READY_PRODUCT_NAME} setup progress ${setupProgress} percent${verifiedProgress != null ? `, verified ${verifiedProgress} percent` : ''}`}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} aria-hidden="true">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {dual && verifiedProgress != null && (
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius - stroke - 2}
            fill="none"
            stroke="rgba(201,162,39,0.35)"
            strokeWidth={stroke - 2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={reducedMotion ? verifiedOffset : verifiedOffset}
            transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
            style={{ transition: reducedMotion ? undefined : 'stroke-dashoffset 1s ease' }}
          />
        )}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="var(--aio-gold-light)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={reducedMotion ? setupOffset : setupOffset}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          style={{ transition: reducedMotion ? undefined : 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="aio-road-ready-ring__label">
        <span className="aio-road-ready-ring__pct">{setupProgress}%</span>
        <span className="aio-road-ready-ring__sub">{label ?? ROAD_READY_PRODUCT_NAME}</span>
        {dual && verifiedProgress != null && (
          <span className="aio-road-ready-ring__verified">{verifiedProgress}% verified</span>
        )}
        {sublabel && <span className="aio-road-ready-ring__hint">{sublabel}</span>}
      </div>
    </div>
  );
}
