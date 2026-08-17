import { aioPaths } from '../utils/paths';
import { aioAppConfig } from '../config/appConfig';
import { AIOButton } from '../components/AIOButton';
import { resourcesMenuLinks } from '../data/publicNavigation';
import {
  AioPageShell,
  AioCinematicHero,
  AioSectionHeading,
  AioRoadmapFooterCta,
} from '../components/page-system';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <AioPageShell>
      <AioCinematicHero
        eyebrow="About All In One"
        title={aioAppConfig.company.tagline}
        description={aioAppConfig.company.brandDescription}
        breadcrumbs={[{ label: 'About' }]}
        compact
      />
      <div className="aio-ps-body">
        <div className="aio-container">
          <section id="industries" className="aio-ps-block">
            <AioSectionHeading
              title="Industries we serve"
              subtitle="Owner-operators, small fleets, growing carriers, and shippers who need a trusted partner for permits, compliance, insurance assistance, dispatch support, and freight coordination."
              light
            />
          </section>

          <section id="resources" className="aio-ps-block">
            <AioSectionHeading
              eyebrow="Knowledge Center"
              title="Knowledge that keeps you moving"
              subtitle="Guides, Road Ready™, and service information to help you plan your trucking business journey."
              light
            />
            <ul className="aio-ps-service-rows">
              {resourcesMenuLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="aio-ps-service-row">
                    <span className="aio-ps-service-row__copy">
                      <strong className="aio-ps-service-row__title">{link.label}</strong>
                    </span>
                    <span className="aio-ps-service-row__chevron" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="aio-ps-hero-actions-row" style={{ marginTop: '1.5rem' }}>
              <AIOButton to={aioPaths.roadReadyPublic} variant="gold" showArrow>
                Road Ready™
              </AIOButton>
              <AIOButton to={aioPaths.startYourBusiness} variant="outline-gold" showArrow>
                Start Your Business
              </AIOButton>
            </div>
          </section>
        </div>
      </div>
      <AioRoadmapFooterCta />
    </AioPageShell>
  );
}
