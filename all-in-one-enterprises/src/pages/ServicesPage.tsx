import { Link } from 'react-router-dom';
import { serviceDivisions } from '../data/mockServices';
import { serviceBundles, getServicesByDivision, type ServiceDivision } from '../data/services';
import { aioPaths } from '../utils/paths';
import { AIOCard } from '../components/AIOCard';

export function ServicesPage() {
  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Service Marketplace</p>
          <h1 className="aio-page-hero__title">Full-service transportation business support</h1>
          <p className="aio-page-hero__desc">
            From business formation through compliance, insurance, dispatch, factoring, and brokerage — explore how All
            In One can help.
          </p>
          <Link to={aioPaths.getStarted} className="aio-btn aio-btn--gold" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Start Smart Intake
          </Link>
        </div>
      </div>

      <div className="aio-page-content">
        <div className="aio-container">
          <section className="aio-marketplace-section">
            <h2 className="aio-display-md" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Service Packages
            </h2>
            <div className="aio-intent-grid">
              {serviceBundles.map((bundle) => (
                <AIOCard key={bundle.id}>
                  <h3 className="aio-intent-card__title">{bundle.title}</h3>
                  <p className="aio-intent-card__desc">{bundle.description}</p>
                  <Link
                    to={bundle.goal ? `${aioPaths.getStarted}?goal=${bundle.goal}` : aioPaths.getStarted}
                    className="aio-intent-card__cta"
                  >
                    Get Started →
                  </Link>
                </AIOCard>
              ))}
            </div>
          </section>

          {serviceDivisions.map((division) => {
            const services = getServicesByDivision(division.slug as ServiceDivision);
            return (
              <section key={division.id} className="aio-marketplace-section">
                <div className="aio-marketplace-section__header">
                  <h2 className="aio-display-md" style={{ fontSize: '1.25rem' }}>
                    {division.title}
                  </h2>
                  <Link to={aioPaths.serviceSlug(division.slug)} className="aio-intent-card__cta">
                    View All →
                  </Link>
                </div>
                <div className="aio-marketplace-grid">
                  {services.slice(0, 4).map((service) => (
                    <Link key={service.id} to={aioPaths.serviceSlug(service.slug)} className="aio-marketplace-card">
                      <h3 className="aio-marketplace-card__title">{service.title}</h3>
                      <p className="aio-marketplace-card__desc">{service.shortDescription}</p>
                      <span className="aio-marketplace-card__cta">{service.cta} →</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
