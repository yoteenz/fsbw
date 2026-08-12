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
import { LearnSectionNavHeader } from './LearnSectionNavHeader';
import type { LearnSectionSurface } from './learnHubTypes';
import { LEARN_HUB_NAV_FOCUS_IDS } from './learnHubTypes';
import {
  LearnBrowseFilters,
  LearnSectionHeaderRow,
  LearnSectionViewAllLink,
} from './LearnBrowseChrome';
import { renderLearnLikesFilterContent } from './LearnLikesFilterContent';
import { LoungeTvEmptyState } from '../LoungeTvEmptyState';
import {
  engagementItemKey,
  engagementKeyForPack,
} from '../../../utils/loungeEngagementTypes';
import { useLoungeEngagementSummaries } from '../../../hooks/useLoungeEngagementSummaries';
import { useLoungeHelpfulToggle } from '../../../hooks/useLoungeHelpfulToggle';
import { resolveLearnBrowseViewerHelpful } from '../../../utils/learnBrowseLocalHelpful';

type PsaAnswersLearnSectionProps = {
  onSelectEntry: (entry: PsaAnswerPresentationEntry) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  surface?: LearnSectionSurface;
  onOpenHub?: () => void;
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
    allowAnonymousLocal: true,
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
  surface = 'compact',
  onOpenHub,
  onEngagementRequireSignIn,
  engagementToast,
}: PsaAnswersLearnSectionProps) {
  const stageId = useId();
  const hubMode = surface === 'hub';
  const [expanded, setExpanded] = useState(hubMode);
  const [activeFilter, setActiveFilter] = useState<PsaAnswerCategoryFilter>('ALL');
  const isCategoryFiltered = activeFilter !== 'ALL';

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
      resolveLearnBrowseViewerHelpful(
        engagementKeyForPack(packId),
        summaryMap.get(engagementItemKey(engagementKeyForPack(packId))),
      ),
    [summaryMap],
  );

  const filteredEntries = useMemo(
    () => filterPsaAnswerEntries(allEntries, activeFilter, { isPackLiked }),
    [allEntries, activeFilter, isPackLiked],
  );

  const visibleEntries =
    hubMode || expanded || isCategoryFiltered
      ? filteredEntries
      : filteredEntries.slice(0, PSA_ANSWERS_PREVIEW_COUNT);

  const handleEntrySelect = useCallback(
    (entry: PsaAnswerPresentationEntry) => {
      if (hubMode) {
        onSelectEntry(entry);
        return;
      }
      setExpanded(true);
    },
    [hubMode, onSelectEntry],
  );

  if (!allEntries.length) return null;

  const meta = `${filteredEntries.length} QUESTION${filteredEntries.length === 1 ? '' : 'S'}`;

  return (
    <section
      data-lounge-tv-rail={hubMode ? 'learn-hub-psa-answers' : 'learn-psa-answers'}
      className="lounge-tv-psa-answers-section"
      style={{ width: '100%', minWidth: 0 }}
    >
      {!hubMode ? (
        <LearnSectionNavHeader
          title="PSA ANSWERS"
          tagline={PSA_ANSWERS_SECTION_TAGLINE}
          onNavigate={onOpenHub}
          focusId={LEARN_HUB_NAV_FOCUS_IDS['psa-answers']}
          taglineSpacing="browse"
        />
      ) : null}

      <LearnBrowseFilters
        filters={PSA_ANSWER_CATEGORY_FILTERS}
        active={activeFilter}
        onChange={setActiveFilter}
        focusIdPrefix="psa-answers-filter"
        ariaLabel="PSA Answers categories"
        renderFilterContent={renderLearnLikesFilterContent}
      />

      {!hubMode ? (
        <LearnSectionHeaderRow
          meta={meta}
          toggle={
            onOpenHub ? (
              <LearnSectionViewAllLink
                label="VIEW ALL ANSWERS >"
                onNavigate={onOpenHub}
                focusId="psa-answers-view-all"
              />
            ) : null
          }
        />
      ) : (
        <LearnSectionHeaderRow meta={meta} />
      )}

      {activeFilter === 'LIKES' && filteredEntries.length === 0 ? (
        <div className="lounge-tv-psa-answers-likes-empty">
          <p className="lounge-tv-psa-answers-likes-empty__lead">LIKE THE ANSWERS THAT HIT.</p>
          <p className="lounge-tv-psa-answers-likes-empty__sub">LIKED PSA ANSWERS WILL APPEAR IN THIS GRID.</p>
        </div>
      ) : null}

      {visibleEntries.length > 0 ? (
        <div
          id={stageId}
          className={[
            'lounge-tv-psa-answers-stage',
            hubMode || expanded
              ? 'lounge-tv-psa-answers-stage--expanded'
              : 'lounge-tv-psa-answers-stage--preview',
            isCategoryFiltered ? 'lounge-tv-psa-answers-stage--filtered' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          data-lounge-tv-psa-answers-expanded={hubMode || expanded ? 'true' : 'false'}
          data-lounge-tv-psa-answers-filtered={isCategoryFiltered ? 'true' : 'false'}
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
                  onSelect={handleEntrySelect}
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
