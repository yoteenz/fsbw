import {
  MobileMansionLayout,
  GlassPanel,
  GlassSection,
  GlassButton,
  PlaceholderSlot,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileAnalysisPage() {
  return (
    <MobileMansionLayout
      title="Hair Analysis Lab"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.analysis}
      overlayOpacity={0.3}
      blurAmount={5}
      showBack
      backTo="/mobile/penthouse"
    >
      <PlaceholderSlot label="ANALYSIS SLOT" minHeight="10rem" />

      <GlassPanel className="p-5">
        <GlassSection title="Your Hair Profile">
          <PlaceholderSlot label="GLASS PANEL SLOT" minHeight="7rem" />
        </GlassSection>
      </GlassPanel>

      <div className="flex justify-center pt-2">
        <GlassButton variant="primary">View Your Match</GlassButton>
      </div>

      <PlaceholderSlot label="CONTENT SLOT" minHeight="3rem" />
    </MobileMansionLayout>
  );
}
