import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

type Props = {
  progress: number;
  label?: string;
  sublabel?: string;
  size?: 'md' | 'lg';
  className?: string;
};

export function AioProgressRing({
  progress,
  label,
  sublabel = 'Your roadmap in progress',
  size = 'md',
  className = '',
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const radius = size === 'lg' ? 68 : 54;
  const svgSize = size === 'lg' ? 168 : 132;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`aio-ps-progress-ring aio-ps-progress-ring--${size}${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={label ?? `${clamped}% roadmap progress`}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="9"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--aio-gold-light)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: reducedMotion ? undefined : 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="aio-ps-progress-ring__label">
        <span className="aio-ps-progress-ring__pct">{clamped}%</span>
        {sublabel ? <span className="aio-ps-progress-ring__sub">{sublabel}</span> : null}
        {label ? <span className="aio-ps-progress-ring__product">{label}</span> : null}
      </div>
    </div>
  );
}
