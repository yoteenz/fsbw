import {
  MobileMansionLayout,
  GlassPanel,
  GlassSection,
  PlaceholderSlot,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileBuildAWigPage() {
  return (
    <MobileMansionLayout
      title="Build-A-Wig"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.buildAWig}
      overlayOpacity={0.28}
      blurAmount={4}
      showBack
      backTo="/mobile/penthouse"
    >
      <PlaceholderSlot label="CONFIGURATOR SLOT" minHeight="14rem" />

      <GlassPanel className="p-5">
        <GlassSection title="Customize">
          <PlaceholderSlot label="GLASS PANEL SLOT" minHeight="4rem" />
        </GlassSection>
      </GlassPanel>

      <PlaceholderSlot label="NAVIGATION SLOT" minHeight="3rem" />
    </MobileMansionLayout>
  );
}
