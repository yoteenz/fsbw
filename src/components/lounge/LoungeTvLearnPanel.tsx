import { useCallback, useLayoutEffect, useState } from 'react';
import { pauseLoungeTvBrowseMedia } from './loungeTvMutedPlayback';
import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from './loungeTvFocusHandlers';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_MEDIUM,
} from './loungeTvTheme';
import { MASTERY_PANEL_TYPE_TITLE_MINUS_1 } from './education/LearnMasterySelector';
import {
  getSlayTipsForLearnRail,
  getCareLessonsForLearnRail,
} from '../../content/education';
import { PsaTodayLearnSection } from './education/PsaTodayLearnSection';
import { PsaAnswersLearnSection } from './education/PsaAnswersLearnSection';
import { ProductEducationLearnSection } from './education/ProductEducationLearnSection';
import { CareLessonRow } from './care';
import { SlayTipRow } from './slay-tips';
import { LoungeTvCareLibraryPanel } from './LoungeTvCareLibraryPanel';
import type { SlayTip, CareLesson } from '../../content/education/types';
import { LoungeTvSectionDivider } from './LoungeTvSectionDivider';

type LoungeTvLearnPanelProps = {
  onSelectMastery: (masteryId: string) => void;
  onSelectPack: (pack: LoungeContentPack) => void;
  onSelectSlayTip: (tip: SlayTip) => void;
  onSelectCareLesson: (lesson: CareLesson) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  careUnlockedSet: Set<string>;
  isCareUnlocked: (id: string) => boolean;
  /** Whether Care Library destination is open (controlled by parent for back nav). */
  careLibraryOpen?: boolean;
  onCareLibraryOpenChange?: (open: boolean) => void;
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenDiscussion?: (pack: LoungeContentPack) => void;
  onEngagementOpenSlayTipDiscussion?: (tip: SlayTip) => void;
  engagementToast?: (message: string) => void;
};

const CARE_LIBRARY_SUBTITLE = 'CARE EDUCATION PERSONALIZED TO THE HAIR YOU OWN.';
const CARE_LIBRARY_EMPTY =
  'CARE GUIDES UNLOCK WITH QUALIFYING DELIVERED HAIR PURCHASES.';

function CareLibraryViewAllButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      data-lounge-tv-focusable
      data-lounge-tv-focus-id="learn-care-library-view-all"
      onClick={onClick}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
      style={{
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: MASTERY_PANEL_TYPE_TITLE_MINUS_1,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: LOUNGE_TV_BRAND_RED,
        background: 'transparent',
        border: 'none',
        padding: `${loungeTvGlassCqw(0.45, 1, 2)} 0`,
        marginBottom: '3px',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {'VIEW ALL >'}
    </button>
  );
}

export function LoungeTvLearnPanel({
  onSelectMastery,
  onSelectPack,
  onSelectSlayTip,
  onSelectCareLesson,
  onToggleSave,
  isUnlocked,
  unlocks,
  careUnlockedSet,
  isCareUnlocked,
  careLibraryOpen: controlledCareLibraryOpen,
  onCareLibraryOpenChange,
  onEngagementRequireSignIn,
  onEngagementOpenSlayTipDiscussion,
  engagementToast,
}: LoungeTvLearnPanelProps) {
  const [internalCareLibraryOpen, setInternalCareLibraryOpen] = useState(false);
  const careLibraryOpen = controlledCareLibraryOpen ?? internalCareLibraryOpen;

  const openCareLibrary = useCallback(() => {
    if (onCareLibraryOpenChange) onCareLibraryOpenChange(true);
    else setInternalCareLibraryOpen(true);
  }, [onCareLibraryOpenChange]);

  const closeCareLibrary = useCallback(() => {
    if (onCareLibraryOpenChange) onCareLibraryOpenChange(false);
    else setInternalCareLibraryOpen(false);
  }, [onCareLibraryOpenChange]);

  const libraryPreviewLessons = getCareLessonsForLearnRail('care-your-library', careUnlockedSet);

  useLayoutEffect(() => {
    pauseLoungeTvBrowseMedia();
  }, []);

  if (careLibraryOpen) {
    return (
      <LoungeTvCareLibraryPanel
        onBack={closeCareLibrary}
        onSelectCareLesson={onSelectCareLesson}
        isCareUnlocked={isCareUnlocked}
        careUnlockedSet={careUnlockedSet}
      />
    );
  }

  return (
    <div
      className="lounge-tv-learn-panel"
      style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(2, 4.5, 9), width: '100%' }}
    >
      <PsaTodayLearnSection onSelectMastery={onSelectMastery} />

      <LoungeTvSectionDivider
        marginTop={loungeTvGlassCqw(1.2, 3, 6)}
        marginBottom={loungeTvGlassCqw(1.5, 3.5, 7)}
      />

      <SlayTipRow
        title="SLAY TIPS"
        tips={getSlayTipsForLearnRail('slay-tips')}
        onSelect={onSelectSlayTip}
        unlocks={unlocks}
        isUnlocked={isUnlocked}
        railId="slay-tips"
        embeddedSection
        onEngagementRequireSignIn={onEngagementRequireSignIn}
        onEngagementOpenSlayTipDiscussion={onEngagementOpenSlayTipDiscussion}
        engagementToast={engagementToast}
      />

      <LoungeTvSectionDivider />

      <PsaAnswersLearnSection
        onSelect={onSelectPack}
        isUnlocked={isUnlocked}
        unlocks={unlocks}
        onEngagementRequireSignIn={onEngagementRequireSignIn}
        engagementToast={engagementToast}
      />

      <LoungeTvSectionDivider />

      <ProductEducationLearnSection
        onSelectPack={onSelectPack}
        onToggleSave={onToggleSave}
        onOpenCareLibrary={openCareLibrary}
      />

      <LoungeTvSectionDivider />

      <CareLessonRow
        railId="learn-care-library-preview"
        title="CARE LIBRARY"
        subtitle={CARE_LIBRARY_SUBTITLE}
        lessons={libraryPreviewLessons}
        onSelect={onSelectCareLesson}
        isUnlocked={isCareUnlocked}
        emptyLabel={CARE_LIBRARY_EMPTY}
        action={<CareLibraryViewAllButton onClick={openCareLibrary} />}
        displayMode="rail"
        embeddedSection
      />
    </div>
  );
}
