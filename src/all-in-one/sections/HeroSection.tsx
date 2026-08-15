import { Link } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { aioGetStarted, aioPaths } from '../utils/paths';
import { AIOButton } from '../components/AIOButton';

export function HeroSection() {
  return (
    <section className="aio-hero" aria-labelledby="aio-hero-heading">
      <div
        className="aio-hero__bg"
        style={{ backgroundImage: `url(${aioAppConfig.assets.heroImage})` }}
        role="img"
        aria-label="Commercial semi-truck on highway at dusk"
      />
      <div className="aio-hero__overlay" aria-hidden="true" />
      <div className="aio-hero__content">
        <p className="aio-hero__eyebrow">YOUR BUSINESS. OUR SOLUTIONS. ONE POWERFUL PARTNER.</p>
        <h1 id="aio-hero-heading" className="aio-display-xl aio-hero__headline">
          EVERYTHING YOU NEED. <em>ALL IN ONE</em> PLACE.
        </h1>
        <p className="aio-hero__sub">
          Permitting. Compliance. Insurance. Dispatching. Factoring. Brokerage. Business Formation. We handle the details
          so you can focus on operating your business and staying on the road.
        </p>
        <div className="aio-hero__actions">
          <Link to={aioGetStarted('start-business')}>
            <AIOButton variant="gold">Start My Trucking Business</AIOButton>
          </Link>
          <Link to={aioPaths.getStarted}>
            <AIOButton variant="outline">Get My Roadmap</AIOButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
