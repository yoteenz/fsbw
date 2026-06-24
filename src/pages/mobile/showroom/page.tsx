import {
  MobileMansionLayout,
  GlassPanel,
  GlassSection,
  PlaceholderSlot,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileShowroomPage() {
  return (
    <MobileMansionLayout
      title="Hair Showroom"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.showroom}
      overlayOpacity={0.28}
      blurAmount={4}
      showBack
      backTo="/mobile/penthouse"
    >
      <PlaceholderSlot label="HERO CONTENT SLOT" minHeight="12rem" />

      <GlassPanel className="p-4">
        <PlaceholderSlot label="GLASS PANEL SLOT" minHeight="2.5rem" />
      </GlassPanel>

      <GlassPanel className="p-5">
        <GlassSection title="Collections">
          <PlaceholderSlot label="PRODUCT SHOWCASE SLOT" minHeight="8rem" />
        </GlassSection>
      </GlassPanel>

      <PlaceholderSlot label="NAVIGATION SLOT" minHeight="3rem" />
    </MobileMansionLayout>
  );
}
