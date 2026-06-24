import {
  MobileMansionLayout,
  GlassPanel,
  GlassCard,
  GlassSection,
  PlaceholderSlot,
  SettingsIcon,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileConciergePage() {
  return (
    <MobileMansionLayout
      title="Concierge"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.concierge}
      overlayOpacity={0.3}
      blurAmount={5}
      actionButton={
        <button type="button" className="w-8 h-8 flex items-center justify-center text-[#808080] bg-transparent border-none" aria-label="Settings">
          <SettingsIcon className="w-4 h-4" />
        </button>
      }
    >
      <GlassCard className="p-4">
        <PlaceholderSlot label="PROFILE SLOT" minHeight="3.5rem" />
      </GlassCard>

      <GlassPanel className="p-5">
        <GlassSection title="Recommended for You">
          <PlaceholderSlot label="PRODUCT SHOWCASE SLOT" minHeight="9rem" />
        </GlassSection>
      </GlassPanel>

      <GlassPanel className="p-5">
        <GlassSection title="Today in the Mansion">
          <PlaceholderSlot label="SCHEDULE SLOT" minHeight="6rem" />
        </GlassSection>
      </GlassPanel>

      <PlaceholderSlot label="CONTENT SLOT" minHeight="4rem" />
    </MobileMansionLayout>
  );
}
