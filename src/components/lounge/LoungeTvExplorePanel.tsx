import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { ExploreDiscoveryPanel } from './explore/ExploreDiscoveryPanel';

type LoungeTvExplorePanelProps = {
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  onOpenSlayForecast?: (editionId?: string) => void;
  onOpenSlayForecastSignal?: (seasonId: string, signalId: string) => void;
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenDiscussion?: (pack: LoungeContentPack) => void;
  engagementToast?: (message: string) => void;
};

export function LoungeTvExplorePanel({
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
  onOpenSlayForecast,
  onOpenSlayForecastSignal,
}: LoungeTvExplorePanelProps) {
  return (
    <ExploreDiscoveryPanel
      onSelect={onSelect}
      onToggleSave={onToggleSave}
      isUnlocked={isUnlocked}
      unlocks={unlocks}
      onOpenSlayForecast={onOpenSlayForecast}
      onOpenSlayForecastSignal={onOpenSlayForecastSignal}
    />
  );
}
