import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { LOUNGE_TV_SIDEBAR } from './loungeTvContent';
import { explorePacksForSection } from './loungeTvStreamingCatalog';
import { LoungeTvContentRow } from './LoungeTvContentRow';
import { LoungeTvSectionDivider } from './LoungeTvSectionDivider';

type LoungeTvExplorePanelProps = {
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenDiscussion?: (pack: LoungeContentPack) => void;
  engagementToast?: (message: string) => void;
};

export function LoungeTvExplorePanel({
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
  onEngagementRequireSignIn,
  onEngagementOpenDiscussion,
  engagementToast,
}: LoungeTvExplorePanelProps) {
  const sections = LOUNGE_TV_SIDEBAR.explore;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {sections.map((section, index) => (
        <div key={section.id}>
          <LoungeTvContentRow
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
            embeddedSection
            onEngagementRequireSignIn={onEngagementRequireSignIn}
            onEngagementOpenDiscussion={onEngagementOpenDiscussion}
            engagementToast={engagementToast}
          />
          {index < sections.length - 1 ? <LoungeTvSectionDivider /> : null}
        </div>
      ))}
    </div>
  );
}
