import { usePageMeta } from '../hooks/usePageMeta';
import { HeroSection } from '../sections/HeroSection';
import { ServicePathwaysSection } from '../sections/ServicePathwaysSection';
import { RoadReadyTeaserSection } from '../sections/RoadReadyTeaserSection';
import { CustomerStageSection } from '../sections/CustomerStageSection';
import { CommandCenterTeaserSection } from '../sections/CommandCenterTeaserSection';
import { FinalCtaSection } from '../sections/FinalCtaSection';
import { aioAppConfig } from '../config/appConfig';

export function HomePage() {
  usePageMeta({
    title: `${aioAppConfig.company.legalName} — ${aioAppConfig.company.tagline}`,
    description: aioAppConfig.company.brandDescription,
  });

  return (
    <>
      <HeroSection />
      <ServicePathwaysSection />
      <RoadReadyTeaserSection />
      <CustomerStageSection />
      <CommandCenterTeaserSection />
      <FinalCtaSection />
    </>
  );
}
