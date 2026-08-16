import { Link } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { heroPrimaryCtaHref, heroSecondaryCtaHref, heroTrustItems } from '../data/homePathways';
import { AIOButton } from '../components/AIOButton';

export function HeroSection() {
  return (
    <>
      <section className="aio-hero" aria-labelledby="aio-hero-heading">
        <div
          className="aio-hero__bg"
          style={{ backgroundImage: `url(${aioAppConfig.assets.heroImage})` }}
          role="img"
          aria-label="Commercial semi-truck on highway at dusk"
        />
        <div className="aio-hero__overlay" aria-hidden="true" />
        <div className="aio-hero__content">
          <p className="aio-hero__eyebrow">{aioAppConfig.company.tagline.toUpperCase()}</p>
          <h1 id="aio-hero-heading" className="aio-display-xl aio-hero__headline">
            THE BUSINESS OFFICE
            <br />
            <em>BEHIND THE TRUCK.</em>
          </h1>
          <p className="aio-hero__sub">
            Start your trucking business. Stay compliant. Keep your trucks moving. Get paid faster.
            <br />
            Everything you need. All in One.
          </p>
          <div className="aio-hero__actions">
            <Link to={heroPrimaryCtaHref}>
              <AIOButton variant="gold">Start My Business</AIOButton>
            </Link>
            <Link to={heroSecondaryCtaHref}>
              <AIOButton variant="outline">See How It Works</AIOButton>
            </Link>
          </div>
        </div>
      </section>
      <section className="aio-hero-trust" aria-label="Platform value highlights">
        <div className="aio-container aio-hero-trust__grid">
          {heroTrustItems.map((item) => (
            <div key={item.title} className="aio-hero-trust__item">
              <p className="aio-hero-trust__title">{item.title}</p>
              <p className="aio-hero-trust__sub">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
