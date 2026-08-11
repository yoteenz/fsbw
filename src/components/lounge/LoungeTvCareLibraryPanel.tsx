import type { CareLesson } from '../../content/education/types';
import { getCareLessonsForLearnRail, CARE_LEARN_RAILS } from '../../content/education';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_TYPE } from './loungeTvTypography';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from './loungeTvTheme';
import { LoungeTvBackButton } from './LoungeTvUiPrimitives';
import { CareLessonRow } from './care';

const CARE_LIBRARY_CATEGORY_RAILS = CARE_LEARN_RAILS.filter(
  (rail) =>
    rail.id === 'care-universal' || rail.id === 'care-unit' || rail.id === 'care-texture',
);

type LoungeTvCareLibraryPanelProps = {
  onBack: () => void;
  onSelectCareLesson: (lesson: CareLesson) => void;
  isCareUnlocked: (id: string) => boolean;
  careUnlockedSet: Set<string>;
  /** Restore focus when returning from a care lesson viewer. */
  restoreFocusId?: string | null;
};

export function LoungeTvCareLibraryPanel({
  onBack,
  onSelectCareLesson,
  isCareUnlocked,
  careUnlockedSet,
}: LoungeTvCareLibraryPanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(2, 5, 10),
        width: '100%',
      }}
    >
      <LoungeTvBackButton onClick={onBack} label="< LEARN" />

      <header data-lounge-tv-rail="learn-care-library-destination-header">
        <h2
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l1,
            color: LOUNGE_TV_TEXT_WHITE,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          CARE LIBRARY
        </h2>
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.6, 1.4, 2.8)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_TYPE.l3,
            color: LOUNGE_TV_TEXT_GRAY,
            textTransform: 'uppercase',
            lineHeight: 1.4,
          }}
        >
          CARE EDUCATION PERSONALIZED TO THE HAIR YOU OWN.
        </p>
      </header>

      {CARE_LIBRARY_CATEGORY_RAILS.map((rail) => {
        const lessons = getCareLessonsForLearnRail(rail.id, careUnlockedSet);
        if (!lessons.length) return null;
        return (
          <CareLessonRow
            key={rail.id}
            railId={`learn-care-library-${rail.id}`}
            title={rail.title}
            lessons={lessons}
            onSelect={onSelectCareLesson}
            isUnlocked={isCareUnlocked}
            displayMode="rail"
          />
        );
      })}
    </div>
  );
}

/** Category rails shown inside the Care Library destination. */
export { CARE_LIBRARY_CATEGORY_RAILS };
