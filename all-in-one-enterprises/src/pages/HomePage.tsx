import { HeroSection } from '../sections/HeroSection';
import { ServiceStripSection } from '../sections/ServiceStripSection';
import { IntentCardsSection } from '../sections/IntentCardsSection';
import { RoadmapSection } from '../sections/RoadmapSection';
import { BusinessProgressionSection } from '../sections/BusinessProgressionSection';
import { PlatformPreviewSection } from '../sections/PlatformPreviewSection';
import { TrustSection } from '../sections/TrustSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <ServiceStripSection />
      <IntentCardsSection />
      <RoadmapSection />
      <BusinessProgressionSection />
      <PlatformPreviewSection />
      <TrustSection />
    </>
  );
}
