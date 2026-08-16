import { Link } from 'react-router-dom';
import type { HomePathway } from '../data/homePathways';
import { getPublicServiceCta } from '../launch/serviceActivationLaunch';
import { AIOCard } from './AIOCard';

type Props = {
  pathway: HomePathway;
};

export function AIOServicePathwayCard({ pathway }: Props) {
  const activation = getPublicServiceCta(pathway.serviceSlug);
  const showStatus = !activation.allowed || activation.state === 'LIMITED_PILOT';

  return (
    <AIOCard className="aio-pathway-card">
      <div className="aio-pathway-card__icon">
        <img src={pathway.iconSrc} alt="" width={48} height={48} decoding="async" />
      </div>
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
