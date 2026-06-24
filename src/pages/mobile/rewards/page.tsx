import {
  MobileMansionLayout,
  GlassPanel,
  GlassSection,
  PlaceholderSlot,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileRewardsPage() {
  return (
    <MobileMansionLayout
      title="Rewards Gallery"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.rewards}
      overlayOpacity={0.3}
      blurAmount={5}
      showBack
      backTo="/mobile/home"
    >
      <PlaceholderSlot label="HERO CONTENT SLOT" minHeight="8rem" />

      <GlassPanel className="p-5">
        <GlassSection title="Your Rewards">
          <PlaceholderSlot label="REWARD SHOWCASE SLOT" minHeight="6rem" />
        </GlassSection>
      </GlassPanel>

      <PlaceholderSlot label="CONTENT SLOT" minHeight="4rem" />
    </MobileMansionLayout>
  );
}
