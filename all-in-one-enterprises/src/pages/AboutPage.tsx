import { Link } from 'react-router-dom';
import { aioPaths } from '../utils/paths';
import { aioAppConfig } from '../config/appConfig';
import { AIOButton } from '../components/AIOButton';

export function AboutPage() {
  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">About Us</p>
          <h1 className="aio-page-hero__title">The business office behind the truck</h1>
          <p className="aio-page-hero__desc">
            {aioAppConfig.company.legalName} helps trucking entrepreneurs, owner-operators, carriers, fleets, and
            shippers manage the administrative and operational services surrounding transportation.
          </p>
        </div>
      </div>
      <div className="aio-page-content">
        <div className="aio-container">
          <section id="industries" style={{ marginBottom: '3rem' }}>
            <h2 className="aio-display-md" style={{ marginBottom: '1rem' }}>
              Industries We Serve
            </h2>
            <p style={{ maxWidth: '40rem', lineHeight: 1.65, color: 'var(--aio-gray-800)' }}>
              Owner-operators, small fleets, growing carriers, and shippers who need a trusted partner for permits,
              compliance, insurance assistance, dispatch support, and freight coordination.
            </p>
          </section>
          <section id="resources">
            <h2 className="aio-display-md" style={{ marginBottom: '1rem' }}>
              Resources
            </h2>
            <p style={{ maxWidth: '40rem', lineHeight: 1.65, color: 'var(--aio-gray-800)', marginBottom: '1.5rem' }}>
              Explore our roadmap prototype and service divisions to understand how All In One may support your
              transportation business journey.
            </p>
            <Link to={aioPaths.roadmap}>
              <AIOButton variant="gold">Explore Roadmap</AIOButton>
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
