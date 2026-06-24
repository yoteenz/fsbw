import { useNavigate } from 'react-router-dom';
import {
  MobileMansionLayout,
  GlassPanel,
  GlassListItem,
  PlaceholderSlot,
  LockIcon,
} from '../../../components/mobile-mansion';
import { mansionPlaceholderBackgrounds } from '../../../constants/mobileMansionTokens';

export default function MobileLobbyPage() {
  const navigate = useNavigate();

  return (
    <MobileMansionLayout
      title="The Lobby"
      subtitle="Frontal Slayer Experience"
      backgroundImage={mansionPlaceholderBackgrounds.lobby}
      overlayOpacity={0.32}
      blurAmount={6}
      actionButton={
        <button type="button" className="w-8 h-8 flex items-center justify-center text-[#808080] bg-transparent border-none" aria-label="Lock">
          <LockIcon className="w-4 h-4" />
        </button>
      }
    >
      <PlaceholderSlot label="BACKGROUND IMAGE SLOT" minHeight="6rem" className="opacity-60" />

      <GlassPanel className="p-1 overflow-hidden">
        <GlassListItem label="Explore the Mansion" subtitle="Directory & navigation" />
        <GlassListItem label="Membership" subtitle="Tiers & benefits" />
        <GlassListItem label="Mansion Economy" subtitle="Points & rewards" />
        <GlassListItem label="House Information" subtitle="About the mansion" />
        <GlassListItem label="The Lounge" onClick={() => navigate('/mobile/lounge')} subtitle="Events & community" />
      </GlassPanel>

      <PlaceholderSlot label="DIRECTORY SLOT" minHeight="7rem" />
    </MobileMansionLayout>
  );
}
