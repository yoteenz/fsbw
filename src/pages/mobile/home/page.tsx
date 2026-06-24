import { useNavigate } from 'react-router-dom';
import {
  MobileMansionLayout,
  GlassPanel,
  GlassCard,
  GlassSection,
  GlassListItem,
  PlaceholderSlot,
  LockIcon,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileHomePage() {
  const navigate = useNavigate();

  return (
    <MobileMansionLayout
      title="Home"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.home}
      overlayOpacity={0.3}
      blurAmount={4}
      actionButton={
        <button type="button" className="w-8 h-8 flex items-center justify-center text-[#808080] bg-transparent border-none" aria-label="Lock">
          <LockIcon className="w-4 h-4" />
        </button>
      }
    >
      <PlaceholderSlot label="HERO CONTENT SLOT" minHeight="10rem" />

      <GlassPanel className="p-5">
        <GlassSection title="Your Mansion Status">
          <PlaceholderSlot label="REWARD SHOWCASE SLOT" minHeight="8rem" />
        </GlassSection>
      </GlassPanel>

      <GlassCard className="p-4">
        <PlaceholderSlot label="DIRECTORY SLOT" minHeight="5rem" />
      </GlassCard>

      <GlassPanel className="p-1 overflow-hidden">
        <GlassListItem label="Rewards Gallery" onClick={() => navigate('/mobile/rewards')} />
        <GlassListItem label="The Lounge" onClick={() => navigate('/mobile/lounge')} />
        <GlassListItem label="Slay Cam" onClick={() => navigate('/mobile/slay-cam')} />
      </GlassPanel>
    </MobileMansionLayout>
  );
}
