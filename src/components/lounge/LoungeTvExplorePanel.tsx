import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_SIDEBAR } from './loungeTvContent';
import { explorePacksForSection } from './loungeTvStreamingCatalog';
import { LoungeTvContentRow } from './LoungeTvContentRow';

type LoungeTvExplorePanelProps = {
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
};

export function LoungeTvExplorePanel({
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
}: LoungeTvExplorePanelProps) {
  const sections = LOUNGE_TV_SIDEBAR.explore;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(2.5, 6, 12), width: '100%' }}>
      {sections.map((section) => (
        <LoungeTvContentRow
          key={section.id}
          railId={`explore-${section.id}`}
          title={section.label}
          packs={explorePacksForSection(section.id)}
          onSelect={onSelect}
          onToggleSave={onToggleSave}
          isUnlocked={isUnlocked}
          unlocks={unlocks}
          emptyLabel={
            section.id === 'the-archive'
              ? 'THE ARCHIVE OPENS AS HISTORICAL CAMPAIGNS ARE RESTORED.'
              : 'CONTENT COMING SOON.'
          }
        />
      ))}
    </div>
  );
}
