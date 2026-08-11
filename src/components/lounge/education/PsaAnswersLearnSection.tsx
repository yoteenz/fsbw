import { useCallback, useId, useMemo, useState } from 'react';
import type { LoungeContentPack } from '../loungeTvContentPack';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  PSA_ANSWER_CATEGORY_FILTERS,
  PSA_ANSWERS_SECTION_TAGLINE,
  filterPsaAnswerEntries,
  listPsaAnswerPresentationEntries,
  resolvePsaAnswerPack,
  type PsaAnswerCategoryFilter,
  type PsaAnswerPresentationEntry,
} from './psaAnswersPresentation';
import { PsaAnswerCard } from './PsaAnswerCard';
import {
  LearnBrowseFilters,
  LearnSectionHeaderRow,
  LearnSectionTagline,
  LearnSectionTitle,
  LearnSectionViewAllToggle,
} from './LearnBrowseChrome';
import { renderLearnLikesFilterContent } from './LearnLikesFilterContent';
import { LoungeTvEmptyState } from '../LoungeTvEmptyState';
import {
  engagementItemKey,
  engagementKeyForPack,
} from '../../../utils/loungeEngagementTypes';
import { useLoungeEngagementSummaries } from '../../../hooks/useLoungeEngagementSummaries';
import { useLoungeHelpfulToggle } from '../../../hooks/useLoungeHelpfulToggle';

type PsaAnswersLearnSectionProps = {
  onSelectEntry: (entry: PsaAnswerPresentationEntry) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  onEngagementRequireSignIn?: () => void;
  engagementToast?: (message: string) => void;
};

const PSA_ANSWERS_PREVIEW_COUNT = 6;

function PsaAnswerEngagementCard({
  entry,
  pack,
  editorialVariant,
  onSelect,
  unlocks,
  isUnlocked,
  summaryMap,
  patchSummary,
  onEngagementRequireSignIn,
  engagementToast,
}: {
  entry: PsaAnswerPresentationEntry;
  pack: LoungeContentPack;
  editorialVariant: number;
  onSelect: (entry: PsaAnswerPresentationEntry) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  summaryMap: ReturnType<typeof useLoungeEngagementSummaries>['map'];
  patchSummary: ReturnType<typeof useLoungeEngagementSummaries>['patchSummary'];
  onEngagementRequireSignIn?: () => void;
  engagementToast?: (message: string) => void;
}) {
  const key = useMemo(() => engagementKeyForPack(pack.id), [pack.id]);
  const summary = summaryMap.get(engagementItemKey(key));

  const { helpfulActive, pending, toggle } = useLoungeHelpfulToggle({
    key,
    summary,
    contentTitle: entry.displayQuestion,
    onRequireAuth: () => onEngagementRequireSignIn?.(),
    onPatch: (patch) => patchSummary(key, patch),
    onError: (msg) => engagementToast?.(msg),
  });

  return (
    <PsaAnswerCard
      entry={entry}
      pack={pack}
      editorialVariant={editorialVariant}
      onSelect={onSelect}
      unlocks={unlocks}
      isUnlocked={isUnlocked}
      helpfulActive={helpfulActive}
      helpfulPending={pending}
      onHelpful={() => void toggle()}
    />
  );
}

export function PsaAnswersLearnSection({
  onSelectEntry,
  isUnlocked,
  unlocks,
  onEngagementRequireSignIn,
  engagementToast,
}: PsaAnswersLearnSectionProps) {
  const stageId = useId();
  const [expanded, setExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PsaAnswerCategoryFilter>('ALL');

  const allEntries = useMemo(() => listPsaAnswerPresentationEntries(), []);

  const engagementItems = useMemo(() => {
    const seen = new Set<string>();
    return allEntries.flatMap((entry) => {
      const key = engagementKeyForPack(entry.packId);
      const id = engagementItemKey(key);
      if (seen.has(id)) return [];
      seen.add(id);
      return [key];
    });
  }, [allEntries]);

  const { map: summaryMap, patchSummary } = useLoungeEngagementSummaries(engagementItems);

  const isPackLiked = useCallback(
    (packId: string) =>
      Boolean(summaryMap.get(engagementItemKey(engagementKeyForPack(packId)))?.viewerHelpful),
    [summaryMap],
  );

  const filteredEntries = useMemo(
    () => filterPsaAnswerEntries(allEntries, activeFilter, { isPackLiked }),
    [allEntries, activeFilter, isPackLiked],
  );

  const visibleEntries = expanded
    ? filteredEntries
    : filteredEntries.slice(0, PSA_ANSWERS_PREVIEW_COUNT);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (!allEntries.length) return null;

  const meta = `${filteredEntries.length} QUESTION${filteredEntries.length === 1 ? '' : 'S'}`;

  return (
    <section
      data-lounge-tv-rail="learn-psa-answers"
      className="lounge-tv-psa-answers-section"
      style={{ width: '100%', minWidth: 0 }}
    >
      <header>
        <LearnSectionTitle title="PSA ANSWERS" />
        <LearnSectionTagline spacingVariant="browse">{PSA_ANSWERS_SECTION_TAGLINE}</LearnSectionTagline>
      </header>

      <LearnBrowseFilters
        filters={PSA_ANSWER_CATEGORY_FILTERS}
        active={activeFilter}
        onChange={setActiveFilter}
        focusIdPrefix="psa-answers-filter"
        ariaLabel="PSA Answers categories"
        renderFilterContent={renderLearnLikesFilterContent}
      />

      <LearnSectionHeaderRow
        meta={meta}
        toggle={
          <LearnSectionViewAllToggle
            expanded={expanded}
            onToggle={toggleExpanded}
            expandLabel="VIEW ALL ANSWERS >"
            collapseLabel="COLLAPSE"
            focusId="psa-answers-view-all"
            controlsId={stageId}
          />
        }
      />

      {activeFilter === 'LIKES' && filteredEntries.length === 0 ? (
        <div className="lounge-tv-psa-answers-likes-empty">
          <p className="lounge-tv-psa-answers-likes-empty__lead">LIKE THE ANSWERS THAT HIT.</p>
          <p className="lounge-tv-psa-answers-likes-empty__sub">LIKED PSA ANSWERS WILL APPEAR IN THIS GRID.</p>
        </div>
      ) : null}

      {visibleEntries.length > 0 ? (
        <div
          id={stageId}
          className={
            expanded
              ? 'lounge-tv-psa-answers-stage lounge-tv-psa-answers-stage--expanded'
              : 'lounge-tv-psa-answers-stage lounge-tv-psa-answers-stage--preview'
          }
          data-lounge-tv-psa-answers-expanded={expanded ? 'true' : 'false'}
        >
          <div className="lounge-tv-psa-answers-grid">
            {visibleEntries.map((entry, index) => {
              const pack = resolvePsaAnswerPack(entry);
              if (!pack) return null;
              return (
                <PsaAnswerEngagementCard
                  key={entry.id}
                  entry={entry}
                  pack={pack}
                  editorialVariant={index % 3}
                  onSelect={onSelectEntry}
                  unlocks={unlocks}
                  isUnlocked={isUnlocked}
                  summaryMap={summaryMap}
                  patchSummary={patchSummary}
                  onEngagementRequireSignIn={onEngagementRequireSignIn}
                  engagementToast={engagementToast}
                />
              );
            })}
          </div>
        </div>
      ) : activeFilter !== 'LIKES' ? (
        <div style={{ marginTop: loungeTvGlassCqw(1, 2.4, 4.8) }}>
          <LoungeTvEmptyState message="NO ANSWERS IN THIS CATEGORY YET." />
        </div>
      ) : null}
    </section>
  );
}
