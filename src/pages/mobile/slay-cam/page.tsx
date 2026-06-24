import {
  MobileMansionLayout,
  GlassPanel,
  PlaceholderSlot,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileSlayCamPage() {
  return (
    <MobileMansionLayout
      title="Slay Cam"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.slayCam}
      overlayOpacity={0.2}
      blurAmount={2}
      showBack
      backTo="/mobile/penthouse"
    >
      <PlaceholderSlot label="CAMERA VIEW SLOT" minHeight="18rem" />

      <GlassPanel className="p-4">
        <PlaceholderSlot label="GLASS PANEL SLOT" minHeight="3.5rem" />
      </GlassPanel>

      <PlaceholderSlot label="CONTENT SLOT" minHeight="3rem" />
    </MobileMansionLayout>
  );
}
