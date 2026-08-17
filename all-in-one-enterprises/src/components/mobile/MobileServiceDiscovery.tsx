import { Link } from 'react-router-dom';
import { mobileHomeServices } from '../../data/mobileNavigation';
import { aioPaths } from '../../utils/paths';

export function MobileServiceDiscovery() {
  return (
    <section className="aio-mobile-services" aria-labelledby="aio-mobile-services-heading">
      <div className="aio-container">
        <p className="aio-mobile-services__eyebrow">Solutions for every stage</p>
        <h2 id="aio-mobile-services-heading" className="aio-mobile-services__title">
          Solutions for every stage of your journey
        </h2>
        <div className="aio-mobile-services__grid">
          {mobileHomeServices.map((pathway) => (
            <Link key={pathway.id} to={pathway.href} className="aio-mobile-service-card">
              <img src={pathway.iconSrc} alt="" className="aio-mobile-service-card__icon" width={40} height={40} />
              <h3 className="aio-mobile-service-card__title">{pathway.title}</h3>
              <p className="aio-mobile-service-card__desc">{pathway.description}</p>
              <span className="aio-mobile-service-card__cta">Explore →</span>
            </Link>
          ))}
        </div>
        <Link to={aioPaths.services} className="aio-mobile-services__view-all">
          View All Services →
        </Link>
      </div>
    </section>
  );
}
