import { Link } from 'react-router-dom';
import { serviceDivisions, servicePageMeta } from '../data/mockServices';
import { aioServicePath } from '../utils/paths';
import { AIOCard } from '../components/AIOCard';

export function ServicesPage() {
  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Services</p>
          <h1 className="aio-page-hero__title">Full-service transportation business support</h1>
          <p className="aio-page-hero__desc">
            From business formation through compliance, insurance, dispatch, and brokerage — All In One Enterprises
            Inc. is designed to become the business office behind your truck.
          </p>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container">
          <div className="aio-intent-grid">
            {serviceDivisions.map((service) => {
              const meta = servicePageMeta[service.slug];
              return (
                <AIOCard key={service.id}>
                  <h2 className="aio-intent-card__title">{service.title}</h2>
                  <p className="aio-intent-card__desc">{meta?.description ?? ''}</p>
                  <Link to={aioServicePath(service.slug)} className="aio-intent-card__cta">
                    Learn More →
                  </Link>
                </AIOCard>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
