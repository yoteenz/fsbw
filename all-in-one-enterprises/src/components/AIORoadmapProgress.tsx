import { Link } from 'react-router-dom';
import type { AioRoadmapItem } from '../types';
import { AIOStatusBadge } from './AIOStatusBadge';
import { AIOButton } from './AIOButton';
import { AIOIcon } from './AIOIcon';
import { aioRoadmapItemIcons } from '../config/aioIconRegistry';
import { aioPaths } from '../utils/paths';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type Props = {
  progress: number;
  items: AioRoadmapItem[];
};

export function AIORoadmapProgress({ progress, items }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="aio-roadmap-widget">
      <div className="aio-progress-ring" role="img" aria-label={`Roadmap progress ${progress} percent`}>
        <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--aio-gold-light)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={reducedMotion ? offset : offset}
            style={{ transition: reducedMotion ? undefined : 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="aio-progress-ring__label">
          <span className="aio-progress-ring__pct">{progress}%</span>
          <span className="aio-progress-ring__sub">Road Ready</span>
        </div>
      </div>

      <div>
        <ul className="aio-roadmap-list">
          {items.map((item) => {
            const iconKey = aioRoadmapItemIcons[item.id];
            return (
              <li key={item.id} className="aio-roadmap-list__item">
                <span className="aio-roadmap-list__label">
                  {iconKey ? <AIOIcon icon={iconKey} size={20} className="aio-roadmap-list__icon" /> : null}
                  {item.label}
                </span>
                <AIOStatusBadge status={item.status} />
              </li>
            );
          })}
        </ul>
        <div style={{ marginTop: '1.25rem' }}>
          <Link to={aioPaths.roadmap}>
            <AIOButton variant="gold" size="sm">
              View Full Roadmap →
            </AIOButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
