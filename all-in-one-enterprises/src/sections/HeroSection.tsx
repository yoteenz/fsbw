import { Link } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { heroPrimaryCtaHref, heroSecondaryCtaHref, heroTrustItems } from '../data/homePathways';
import { AIOButton } from '../components/AIOButton';

export function HeroSection() {
  const [taglineLine1, taglineLine2] = aioAppConfig.company.heroTaglineLines;

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
          <p className="aio-hero__eyebrow">{aioAppConfig.company.legalName}</p>
          <h1 id="aio-hero-heading" className="aio-display-xl aio-hero__headline">
            {taglineLine1}
            <br />
            <em>{taglineLine2}</em>
          </h1>
          <p className="aio-hero__sub">{aioAppConfig.company.brandDescription}</p>
          <div className="aio-hero__actions aio-cta-row">
            <Link to={heroPrimaryCtaHref} className="aio-cta-row__link">
              <AIOButton variant="gold" className="aio-btn--block">
                Start My Business
              </AIOButton>
            </Link>
            <Link to={heroSecondaryCtaHref} className="aio-cta-row__link">
              <AIOButton variant="outline-gold" className="aio-btn--block" showArrow>
                See How It Works
              </AIOButton>
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
