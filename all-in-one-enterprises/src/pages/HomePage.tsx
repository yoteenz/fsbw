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
    title: `${aioAppConfig.company.legalName} — The business office behind the truck`,
    description:
      'Start your trucking business, stay compliant, dispatch loads, and manage everything from one platform. Permits, formation, insurance, factoring, and brokerage — All In One.',
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
