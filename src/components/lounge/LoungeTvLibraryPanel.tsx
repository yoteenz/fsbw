import { useEffect, useState } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import type { SlayTip, CareLesson } from '../../content/education/types';
import type { PSATodayEpisode } from './psa-today/types';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_TYPE } from './loungeTvTypography';
import { LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_WHITE } from './loungeTvTheme';
import { LoungeTvBackButton } from './LoungeTvUiPrimitives';
import { LoungeTvLibrarySections } from './LoungeTvLibrarySections';
import { LoungeTvLibraryDestinationList } from './LoungeTvLibraryDestination';
import { LoungeTvSectionDivider } from './LoungeTvSectionDivider';
import { LoungeTvLibrarySearch, loungeTvLibrarySearchIsActive } from './LoungeTvLibrarySearch';

const CONTENT_RAIL_IDS = ['continue', 'saved', 'unlocked'] as const;

function resetLoungeTvScrollBody(): void {
  const scrollBody = document.querySelector<HTMLElement>(
    '.lounge-tv-screen-root [data-scene-hit-region="lounge-tv-media-panel"]',
  );
  if (scrollBody) scrollBody.scrollTop = 0;
}

type LoungeTvLibraryPanelProps = {
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  onSelectSlayTip?: (tip: SlayTip) => void;
  onSelectCareLesson?: (lesson: CareLesson) => void;
  onSelectPsaEpisode?: (episode: PSATodayEpisode) => void;
  onSelectMastery?: (masteryId: string) => void;
  onSelectSeason?: (seasonId: string) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  careUnlockedSet?: Set<string>;
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenDiscussion?: (pack: LoungeContentPack) => void;
  engagementToast?: (message: string) => void;
};

export function LoungeTvLibraryPanel(props: LoungeTvLibraryPanelProps) {
  const [activeDestination, setActiveDestination] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchActive = loungeTvLibrarySearchIsActive(searchQuery);

  useEffect(() => {
    if (!searchActive) return;
    resetLoungeTvScrollBody();
  }, [searchActive]);

  if (activeDestination) {
    const destTitle =
      activeDestination.replace(/-/g, ' ').toUpperCase();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(1.5, 4, 8) }}>
        <LoungeTvBackButton onClick={() => setActiveDestination(null)} label="< LIBRARY" />
        <h2
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l1,
            color: LOUNGE_TV_TEXT_WHITE,
            textTransform: 'uppercase',
          }}
        >
          {destTitle}
        </h2>
        <LoungeTvLibrarySections sectionId={activeDestination} suppressTitle {...props} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <LoungeTvLibrarySearch
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onSelect={props.onSelect}
        onSelectSlayTip={props.onSelectSlayTip}
        onSelectCareLesson={props.onSelectCareLesson}
        onSelectPsaEpisode={props.onSelectPsaEpisode}
        onSelectMastery={props.onSelectMastery}
        onSelectSeason={props.onSelectSeason}
        isUnlocked={props.isUnlocked}
        unlocks={props.unlocks}
      />

      {searchActive ? null : (
        <>
          {CONTENT_RAIL_IDS.map((sectionId, index) => (
            <div key={sectionId}>
              <LoungeTvLibrarySections sectionId={sectionId} embeddedSection {...props} />
              {index < CONTENT_RAIL_IDS.length - 1 ? <LoungeTvSectionDivider /> : null}
            </div>
          ))}
          <LoungeTvSectionDivider
            marginTop={loungeTvGlassCqw(2, 5, 10)}
            marginBottom={loungeTvGlassCqw(3, 7, 14)}
          />
          <LoungeTvLibraryDestinationList onSelect={setActiveDestination} />
        </>
      )}
    </div>
  );
}
