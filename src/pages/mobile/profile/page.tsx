import {
  MobileMansionLayout,
  GlassPanel,
  GlassSection,
  PlaceholderSlot,
  SettingsIcon,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileProfilePage() {
  return (
    <MobileMansionLayout
      title="Profile"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.profile}
      overlayOpacity={0.3}
      blurAmount={5}
      actionButton={
        <button type="button" className="w-8 h-8 flex items-center justify-center text-[#808080] bg-transparent border-none" aria-label="Settings">
          <SettingsIcon className="w-4 h-4" />
        </button>
      }
    >
      <GlassPanel className="p-5">
        <GlassSection title="Member">
          <PlaceholderSlot label="PROFILE SLOT" minHeight="6rem" />
        </GlassSection>
      </GlassPanel>

      <GlassPanel className="p-5">
        <GlassSection title="Account">
          <PlaceholderSlot label="GLASS PANEL SLOT" minHeight="5rem" />
        </GlassSection>
      </GlassPanel>

      <PlaceholderSlot label="CONTENT SLOT" minHeight="4rem" />
    </MobileMansionLayout>
  );
}
