import { usePageMeta } from '../hooks/usePageMeta';
import { HeroSection } from '../sections/HeroSection';
import { ServicePathwaysSection } from '../sections/ServicePathwaysSection';
import { RoadReadyTeaserSection } from '../sections/RoadReadyTeaserSection';
import { CustomerStageSection } from '../sections/CustomerStageSection';
import { CommandCenterTeaserSection } from '../sections/CommandCenterTeaserSection';
import { FinalCtaSection } from '../sections/FinalCtaSection';
import { AioHomepageHero } from '../components/homepage/AioHomepageHero';
import { AioPathwayRouter } from '../components/homepage/AioPathwayRouter';
import { AioRoadReadyJourney } from '../components/homepage/AioRoadReadyJourney';
import { AioConnectedValue } from '../components/homepage/AioConnectedValue';
import { AioHomepageFinalCTA } from '../components/homepage/AioHomepageFinalCTA';
import { aioAppConfig } from '../config/appConfig';

export function HomePage() {
  usePageMeta({
    title: `${aioAppConfig.company.legalName} — ${aioAppConfig.company.tagline}`,
    description: aioAppConfig.company.brandDescription,
  });

  return (
    <>
      <div className="aio-mobile-only aio-home-mobile">
        <AioHomepageHero />
        <AioPathwayRouter />
        <AioRoadReadyJourney />
        <AioConnectedValue />
        <AioHomepageFinalCTA />
      </div>
      <div className="aio-desktop-only">
        <HeroSection />
        <ServicePathwaysSection />
        <RoadReadyTeaserSection />
        <CustomerStageSection />
        <CommandCenterTeaserSection />
        <FinalCtaSection />
      </div>
    </>
  );
}
