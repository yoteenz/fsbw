import { Link } from 'react-router-dom';
import type { AioIntentCard } from '../types';
import { AIOCard } from './AIOCard';

function IntentIcon({ type }: { type: AioIntentCard['icon'] }) {
  const paths: Record<AioIntentCard['icon'], React.ReactNode> = {
    startup: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
      </svg>
    ),
    legal: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 3l7 4v5c0 4.5-3.5 8.5-7 9-3.5-.5-7-4.5-7-9V7l7-4z" />
      </svg>
    ),
    compliance: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    dispatch: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M1 13h2l2-5h11l2 5h3M5 16h.01M19 16h.01" />
        <rect x="1" y="8" width="15" height="10" rx="1" />
      </svg>
    ),
    freight: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
    insurance: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 3l7 4v5c0 4.5-3.5 8.5-7 9-3.5-.5-7-4.5-7-9V7l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  };
  return <div className="aio-intent-card__icon">{paths[type]}</div>;
}

type Props = {
  card: AioIntentCard;
};

export function AIOIntentCard({ card }: Props) {
  return (
    <AIOCard className="aio-intent-card">
      <IntentIcon type={card.icon} />
      <h3 className="aio-intent-card__title">{card.title}</h3>
      <p className="aio-intent-card__desc">{card.description}</p>
      <Link to={card.href} className="aio-intent-card__cta">
        {card.cta} <span aria-hidden="true">→</span>
      </Link>
    </AIOCard>
  );
}
