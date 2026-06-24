import { useNavigate } from 'react-router-dom';
import {
  MobileMansionLayout,
  GlassPanel,
  GlassListItem,
  PlaceholderSlot,
  LockIcon,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobilePenthousePage() {
  const navigate = useNavigate();

  return (
    <MobileMansionLayout
      title="The Penthouse"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.penthouse}
      overlayOpacity={0.32}
      blurAmount={6}
      actionButton={
        <button type="button" className="w-8 h-8 flex items-center justify-center text-[#808080] bg-transparent border-none" aria-label="Lock">
          <LockIcon className="w-4 h-4" />
        </button>
      }
    >
      <PlaceholderSlot label="HERO CONTENT SLOT" minHeight="7rem" />

      <GlassPanel className="p-1 overflow-hidden">
        <GlassListItem
          label="Hair Showroom"
          subtitle="Collections & new arrivals"
          onClick={() => navigate('/mobile/showroom')}
        />
        <GlassListItem
          label="Hair Analysis Lab"
          subtitle="Your hair profile"
          onClick={() => navigate('/mobile/analysis')}
        />
        <GlassListItem
          label="Build-A-Wig"
          subtitle="Custom configurator"
          onClick={() => navigate('/mobile/build-a-wig')}
        />
        <GlassListItem
          label="Exclusive Access"
          subtitle="Members-only features"
        />
        <GlassListItem
          label="Slay Cam"
          subtitle="Capture your look"
          onClick={() => navigate('/mobile/slay-cam')}
        />
      </GlassPanel>

      <PlaceholderSlot label="NAVIGATION SLOT" minHeight="4rem" />
    </MobileMansionLayout>
  );
}
