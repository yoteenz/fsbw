import { Link } from 'react-router-dom';
import type { HomePathway } from '../data/homePathways';
import { getPublicServiceCta } from '../launch/serviceActivationLaunch';
import { AIOCard } from './AIOCard';

function PathwayIcon({ type }: { type: HomePathway['icon'] }) {
  const paths: Record<HomePathway['icon'], React.ReactNode> = {
    startup: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
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
    factoring: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M12 11v6M9 14h6" />
      </svg>
    ),
    legal: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 3l7 4v5c0 4.5-3.5 8.5-7 9-3.5-.5-7-4.5-7-9V7l7-4z" />
      </svg>
    ),
  };
  return <div className="aio-pathway-card__icon">{paths[type]}</div>;
}

type Props = {
  pathway: HomePathway;
};

export function AIOServicePathwayCard({ pathway }: Props) {
  const activation = getPublicServiceCta(pathway.serviceSlug);
  const showStatus = !activation.allowed || activation.state === 'LIMITED_PILOT';

  return (
    <AIOCard className="aio-pathway-card">
      <PathwayIcon type={pathway.icon} />
      <h3 className="aio-pathway-card__title">{pathway.title}</h3>
      <p className="aio-pathway-card__desc">{pathway.description}</p>
      {showStatus && activation.state === 'LIMITED_PILOT' ? (
        <p className="aio-pathway-card__status">Limited pilot availability</p>
      ) : null}
      {!activation.allowed ? (
        <p className="aio-pathway-card__status">{activation.label}</p>
      ) : null}
      <Link to={pathway.href} className="aio-pathway-card__cta">
        Explore <span className="aio-pathway-card__cta-arrow" aria-hidden="true">→</span>
      </Link>
    </AIOCard>
  );
}
