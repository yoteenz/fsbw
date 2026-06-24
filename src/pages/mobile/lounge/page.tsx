import {
  MobileMansionLayout,
  GlassPanel,
  GlassSection,
  GlassButton,
  PlaceholderSlot,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileLoungePage() {
  return (
    <MobileMansionLayout
      title="The Lounge"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.lounge}
      overlayOpacity={0.32}
      blurAmount={6}
      showBack
      backTo="/mobile/lobby"
    >
      <PlaceholderSlot label="HERO CONTENT SLOT" minHeight="7rem" />

      <GlassPanel className="p-5">
        <GlassSection title="Upcoming Events">
          <PlaceholderSlot label="SCHEDULE SLOT" minHeight="6rem" />
        </GlassSection>
      </GlassPanel>

      <GlassPanel className="p-5">
        <GlassSection title="Member Conversations">
          <PlaceholderSlot label="SOCIAL SLOT" minHeight="5rem" />
        </GlassSection>
      </GlassPanel>

      <div className="flex justify-center pt-2">
        <GlassButton variant="secondary">RSVP</GlassButton>
      </div>
    </MobileMansionLayout>
  );
}
