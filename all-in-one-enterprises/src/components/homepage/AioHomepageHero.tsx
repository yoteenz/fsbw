import { aioAppConfig } from '../../config/appConfig';
import { aioPaths } from '../../utils/paths';
import { homepageHeroSupportingCopy } from '../../data/homepageMobileContent';
import { AIOButton } from '../AIOButton';
import { StartBusinessCtaButton } from '../journey/StartBusinessCtaButton';

export function AioHomepageHero() {
  return (
    <section
      className="aio-home-hero"
      aria-labelledby="aio-home-hero-heading"
      style={
        {
          '--aio-hero-bg': `url(${aioAppConfig.assets.heroImage})`,
        } as React.CSSProperties
      }
    >
      <div className="aio-home-hero__bg" role="presentation" aria-hidden="true" />
      <div className="aio-home-hero__overlay" aria-hidden="true" />
      <div className="aio-home-hero__inner">
        <div className="aio-home-hero__content">
          <p className="aio-home-hero__eyebrow">{aioAppConfig.company.legalName}</p>
          <h1 id="aio-home-hero-heading" className="aio-home-hero__headline">
            WHERE
            <br />
            BUSINESS
            <br />
            MEETS THE
            <br />
            <em>ROAD.</em>
          </h1>
          <p className="aio-home-hero__sub">{homepageHeroSupportingCopy}</p>
          <div className="aio-home-hero__actions">
            <StartBusinessCtaButton variant="gold" className="aio-btn--block" showArrow />
            <AIOButton to={aioPaths.getStarted} variant="outline-gold" className="aio-btn--block" showArrow>
              Check What I Need
            </AIOButton>
          </div>
        </div>
        <div className="aio-home-hero__visual" aria-hidden="true" />
      </div>
    </section>
  );
}
