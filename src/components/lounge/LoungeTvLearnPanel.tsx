import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from './loungeTvTheme';
import { getPublishedMasteriesWithSeasons } from '../../content/education';
import {
  EDUCATION_PILLAR_RAILS,
  getSlayTipsForLearnRail,
  getCareLessonsForLearnRail,
  CARE_LEARN_RAILS,
} from '../../content/education';
import { PSA_TODAY_LEARN_RAILS, getPsaTodayLearnRailEpisodes, PSATodayEpisodeRow } from './psa-today';
import { CareLessonRow } from './care';
import { SlayTipRow } from './slay-tips';
import { LoungeTvContentRow } from './LoungeTvContentRow';
import { academyPacksForLearningPath } from './loungeTvStreamingCatalog';
import { LOUNGE_TV_SIDEBAR } from './loungeTvContent';
import type { SlayTip, CareLesson } from '../../content/education/types';
import type { PSATodayEpisode } from './psa-today/types';

const LEARN_MASTERY_SLOTS = [
  { id: 'lace-mastery', label: 'LACE MASTERY', masterySlug: 'lace-mastery' },
  { id: 'care-mastery', label: 'CARE MASTERY', masterySlug: 'care-mastery' },
  { id: 'styling-mastery', label: 'STYLING MASTERY', masterySlug: 'style-mastery' },
  { id: 'baw-academy', label: 'BUILD-A-WIG ACADEMY', pathId: 'baw-academy' },
] as const;

type LoungeTvLearnPanelProps = {
  onSelectMastery: (masteryId: string) => void;
  onSelectPack: (pack: LoungeContentPack) => void;
  onSelectPsaEpisode: (ep: PSATodayEpisode) => void;
  onSelectSlayTip: (tip: SlayTip) => void;
  onSelectCareLesson: (lesson: CareLesson) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  careUnlockedSet: Set<string>;
  isCareUnlocked: (id: string) => boolean;
};

export function LoungeTvLearnPanel({
  onSelectMastery,
  onSelectPack,
  onSelectPsaEpisode,
  onSelectSlayTip,
  onSelectCareLesson,
  onToggleSave,
  isUnlocked,
  unlocks,
  careUnlockedSet,
  isCareUnlocked,
}: LoungeTvLearnPanelProps) {
  const publishedMasteries = getPublishedMasteriesWithSeasons();
  const sidebar = LOUNGE_TV_SIDEBAR.learn;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(2.5, 6, 12), width: '100%' }}>
      <section data-lounge-tv-rail="learn-masteries">
        <h2
          style={{
            margin: `0 0 ${loungeTvGlassCqw(1, 2.5, 5)}`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.8, 4.2, 8.5),
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.08em',
          }}
        >
          MASTERIES
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: loungeTvGlassCqw(1, 2.5, 5),
          }}
        >
          {LEARN_MASTERY_SLOTS.map((slot) => {
            const masterySlug = 'masterySlug' in slot ? slot.masterySlug : undefined;
            const pathId = 'pathId' in slot ? slot.pathId : undefined;
            const mastery = masterySlug
              ? publishedMasteries.find((m) => m.slug === masterySlug)
              : undefined;
            const bawPacks = pathId === 'baw-academy' ? academyPacksForLearningPath('baw-academy') : [];
            const available = Boolean(mastery) || bawPacks.length > 0 || slot.id === 'baw-academy';
            return (
              <button
                key={slot.id}
                type="button"
                data-lounge-tv-focusable
                data-lounge-tv-focus-id={`learn-${slot.id}`}
                disabled={!available}
                onClick={() => {
                  if (mastery) onSelectMastery(mastery.id);
                  else if (bawPacks[0]) onSelectPack(bawPacks[0]);
                }}
                style={{
                  textAlign: 'left',
                  padding: loungeTvGlassCqw(1.2, 3, 6),
                  minHeight: loungeTvGlassCqw(8, 18, 32),
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: available ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                  color: available ? LOUNGE_TV_TEXT_WHITE : LOUNGE_TV_TEXT_GRAY,
                  cursor: mastery ? 'pointer' : 'default',
                  textTransform: 'uppercase',
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
                  lineHeight: 1.25,
                  opacity: available ? 1 : 0.55,
                }}
              >
                {slot.label}
                {!mastery && slot.id !== 'baw-academy' ? (
                  <span
                    style={{
                      display: 'block',
                      marginTop: loungeTvGlassCqw(0.5, 1.2, 2.4),
                      fontFamily: LOUNGE_TV_FONT_BOOK,
                      fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
                      color: LOUNGE_TV_TEXT_GRAY,
                    }}
                  >
                    COMING SOON
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {PSA_TODAY_LEARN_RAILS.map((rail) => (
        <div key={rail.id} data-lounge-tv-rail={`learn-${rail.id}`}>
          <PSATodayEpisodeRow
            title={rail.id === 'psa-today' ? 'PSA TODAY' : rail.title}
            episodes={getPsaTodayLearnRailEpisodes(rail.id)}
            onSelect={onSelectPsaEpisode}
            emptyLabel={rail.id === 'psa-today' ? undefined : 'LESSONS COMING SOON.'}
          />
        </div>
      ))}

      {CARE_LEARN_RAILS.map((rail) => {
        const lessons = getCareLessonsForLearnRail(rail.id, careUnlockedSet);
        if (rail.id !== 'care-your-care-guides' && rail.id !== 'care-your-library' && lessons.length === 0) {
          return null;
        }
        return (
          <div key={rail.id} data-lounge-tv-rail={`learn-${rail.id}`}>
            <CareLessonRow
              title={rail.title}
              lessons={lessons}
              onSelect={onSelectCareLesson}
              isUnlocked={isCareUnlocked}
              emptyLabel={
                rail.id === 'care-your-care-guides' || rail.id === 'care-your-library'
                  ? 'YOUR CARE GUIDES UNLOCK WITH QUALIFYING DELIVERED HAIR PURCHASES.'
                  : undefined
              }
            />
          </div>
        );
      })}

      <div data-lounge-tv-rail="learn-slay-tips">
        <SlayTipRow
          title="SLAY TIPS"
          tips={getSlayTipsForLearnRail('slay-tips')}
          onSelect={onSelectSlayTip}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
        />
      </div>

      {EDUCATION_PILLAR_RAILS.filter((rail) => rail.id !== 'care').map((rail) => (
        <div key={rail.id} data-lounge-tv-rail={`learn-pillar-${rail.id}`}>
          <SlayTipRow
            title={rail.title}
            tips={getSlayTipsForLearnRail(rail.id)}
            onSelect={onSelectSlayTip}
            emptyLabel="SLAY TIPS COMING SOON."
            unlocks={unlocks}
            isUnlocked={isUnlocked}
          />
        </div>
      ))}

      {sidebar.map((section) => (
        <LoungeTvContentRow
          key={section.id}
          railId={`learn-path-${section.id}`}
          title={section.label}
          packs={academyPacksForLearningPath(section.id)}
          onSelect={onSelectPack}
          onToggleSave={onToggleSave}
          isUnlocked={isUnlocked}
          unlocks={unlocks}
          emptyLabel="LESSONS COMING SOON."
        />
      ))}
    </div>
  );
}
