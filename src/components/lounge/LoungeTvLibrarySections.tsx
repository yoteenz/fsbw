import { useMemo } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { getContentPackById, LOUNGE_TV_CONTENT_PACKS } from './loungeTvContentPack';
import { contentPackToTile } from './loungeTvContent';
import { LoungeTvContentRow } from './LoungeTvContentRow';
import { SlayTipRow } from './slay-tips/SlayTipRow';
import { CareLessonRow } from './care/CareLessonRow';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import {
  getCompletedPackIds,
  getSavedPackIds,
  getWatchProgressMap,
} from '../../utils/loungeTvLibrary';
import { useLoungeTvLibraryRevision } from '../../hooks/useLoungeTvLibraryRevision';
import {
  findLoungeContentUnlock,
  loungeTvContentIsAccessible,
  resolveLoungeTvTicketCost,
} from './loungeTvTicketAccess';
import { getAllSlayTips, getAllCareLessons, getCareLessonById } from '../../content/education';
import { slayTipAccessGranted } from './slay-tips/slayTipAccess';
import type { SlayTip, CareLesson } from '../../content/education/types';
import { getCareProgressMap } from './care/careProgress';

type LoungeTvLibrarySectionsProps = {
  sectionId: string;
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  onSelectSlayTip?: (tip: SlayTip) => void;
  onSelectCareLesson?: (lesson: CareLesson) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  careUnlockedSet?: Set<string>;
  suppressTitle?: boolean;
  /** Hide section entirely when empty (Library root rails). */
  hideWhenEmpty?: boolean;
  /** When true, parent handles section spacing (Library tab dividers). */
  embeddedSection?: boolean;
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenDiscussion?: (pack: LoungeContentPack) => void;
  engagementToast?: (message: string) => void;
};

function packsFromIds(ids: string[]): LoungeContentPack[] {
  return ids.map((id) => getContentPackById(id)).filter((p): p is LoungeContentPack => Boolean(p));
}

export function LoungeTvLibrarySections({
  sectionId,
  onSelect,
  onToggleSave,
  onSelectSlayTip,
  onSelectCareLesson,
  isUnlocked,
  unlocks,
  careUnlockedSet,
  suppressTitle = false,
  hideWhenEmpty = false,
  embeddedSection = false,
  onEngagementRequireSignIn,
  onEngagementOpenDiscussion,
  engagementToast,
}: LoungeTvLibrarySectionsProps) {
  const libraryRevision = useLoungeTvLibraryRevision();

  const packs = useMemo(() => {
    switch (sectionId) {
      case 'continue': {
        const progress = getWatchProgressMap();
        return Object.values(progress)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((row) => getContentPackById(row.packId))
          .filter((p): p is LoungeContentPack => Boolean(p));
      }
      case 'saved':
        return packsFromIds(getSavedPackIds());
      case 'unlocked':
        return LOUNGE_TV_CONTENT_PACKS.filter((pack) => {
          const tile = contentPackToTile(pack);
          return loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
        });
      case 'purchased':
        return LOUNGE_TV_CONTENT_PACKS.filter((pack) => {
          const tile = contentPackToTile(pack);
          const cost = resolveLoungeTvTicketCost(tile);
          if (cost === 0) return false;
          return Boolean(findLoungeContentUnlock(pack.id, unlocks));
        });
      case 'completed':
        return packsFromIds(getCompletedPackIds());
      case 'downloads':
        return [];
      case 'certificates':
        return [];
      case 'history': {
        const progress = getWatchProgressMap();
        return Object.values(progress)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((row) => getContentPackById(row.packId))
          .filter((p): p is LoungeContentPack => Boolean(p));
      }
      default:
        return [];
    }
  }, [sectionId, isUnlocked, unlocks, libraryRevision]);

  const slayTips = useMemo(() => {
    if (!onSelectSlayTip) return [];
    if (sectionId !== 'unlocked' && sectionId !== 'purchased') return [];
    return getAllSlayTips().filter((tip) => {
      if (sectionId === 'purchased' && tip.slayTicketCost <= 0) return false;
      return slayTipAccessGranted(tip, unlocks, isUnlocked);
    });
  }, [sectionId, isUnlocked, unlocks, onSelectSlayTip]);

  const careContinueLessons = useMemo(() => {
    if (!onSelectCareLesson || sectionId !== 'continue') return [];
    const progress = getCareProgressMap();
    return Object.values(progress)
      .filter((row) => !row.completed)
      .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
      .map((row) => getCareLessonById(row.lessonId))
      .filter((l): l is CareLesson => Boolean(l));
  }, [sectionId, onSelectCareLesson]);

  const careYourLibraryLessons = useMemo(() => {
    if (!onSelectCareLesson || !careUnlockedSet?.size) return [];
    if (sectionId !== 'continue' && sectionId !== 'unlocked') return [];
    return getAllCareLessons().filter((l) => careUnlockedSet.has(l.id));
  }, [sectionId, careUnlockedSet, onSelectCareLesson]);

  const careIsUnlocked = useMemo(
    () => (lessonId: string) => careUnlockedSet?.has(lessonId) ?? false,
    [careUnlockedSet]
  );

  const titles: Record<string, string> = {
    continue: 'CONTINUE WATCHING',
    saved: 'SAVED',
    unlocked: 'UNLOCKED',
    purchased: 'PURCHASED',
    downloads: 'DOWNLOADS',
    completed: 'COMPLETED COURSES',
    certificates: 'CERTIFICATES',
    history: 'WATCH HISTORY',
  };

  const emptyLabels: Record<string, string> = {
    continue: 'NOTHING IN PROGRESS YET.',
    saved: 'NO SAVED TITLES YET.',
    unlocked: 'UNLOCKED CONTENT WILL APPEAR HERE.',
    purchased: 'NOTHING PURCHASED YET.',
    downloads: 'OFFLINE DOWNLOADS ARRIVE IN A FUTURE UPDATE.',
    completed: 'NO COMPLETED COURSES YET.',
    certificates: 'NO CERTIFICATES YET. COMPLETED ELIGIBLE MASTERS WILL APPEAR HERE.',
    history: 'WATCH HISTORY WILL APPEAR HERE.',
  };

  const slayTipSectionTitle =
    sectionId === 'purchased' ? 'PURCHASED SLAY TIPS' : sectionId === 'unlocked' ? 'UNLOCKED SLAY TIPS' : '';

  const hasCareRows =
    careYourLibraryLessons.length > 0 || careContinueLessons.length > 0;
  const hasContent = packs.length > 0 || slayTips.length > 0 || hasCareRows;

  if (hideWhenEmpty && !hasContent) return null;

  const emptyLabel = hideWhenEmpty ? undefined : (emptyLabels[sectionId] ?? 'NOTHING HERE YET.');

  return (
    <>
      {careYourLibraryLessons.length > 0 && onSelectCareLesson ? (
        <CareLessonRow
          title="YOUR CARE GUIDES"
          lessons={careYourLibraryLessons}
          onSelect={onSelectCareLesson}
          isUnlocked={careIsUnlocked}
          embeddedSection={embeddedSection}
        />
      ) : null}
      {careContinueLessons.length > 0 && onSelectCareLesson ? (
        <CareLessonRow
          title="CONTINUE CARE"
          lessons={careContinueLessons}
          onSelect={onSelectCareLesson}
          isUnlocked={careIsUnlocked}
          embeddedSection={embeddedSection}
        />
      ) : null}
      <LoungeTvContentRow
        title={titles[sectionId] ?? sectionId.toUpperCase()}
        packs={packs}
        onSelect={onSelect}
        onToggleSave={onToggleSave}
        isUnlocked={isUnlocked}
        unlocks={unlocks}
        emptyLabel={emptyLabel}
        suppressTitle={suppressTitle}
        embeddedSection={embeddedSection}
        sectionMarginTop={sectionId === 'continue' ? '6px' : undefined}
        onEngagementRequireSignIn={onEngagementRequireSignIn}
        onEngagementOpenDiscussion={onEngagementOpenDiscussion}
        engagementToast={engagementToast}
      />
      {slayTips.length > 0 && onSelectSlayTip ? (
        <SlayTipRow
          title={slayTipSectionTitle}
          tips={slayTips}
          onSelect={onSelectSlayTip}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
          embeddedSection={embeddedSection}
        />
      ) : null}
    </>
  );
}
