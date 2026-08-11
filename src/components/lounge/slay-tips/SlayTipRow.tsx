import { useCallback, useId, useMemo, useState } from 'react';
import type { SlayTip } from '../../../content/education/types';
import { SlayTipCard } from './SlayTipCard';
import { LoungeTvSectionTitle } from '../LoungeTvUiPrimitives';
import { LoungeTvEmptyState } from '../LoungeTvEmptyState';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import {
  SLAY_TIP_DISCOVERY_FILTERS,
  SLAY_TIPS_DISCOVERY_TAGLINE,
  SLAY_TIPS_EDITORIAL_BAND_SIZE,
  slayTipMatchesDiscoveryFilter,
  slayTipPinArchetypeForIndex,
  slayTipPinGridPlacement,
  type SlayTipDiscoveryFilter,
} from './slayTipDiscoveryMeta';
import {
  LearnBrowseFilters,
  LearnSectionHeaderRow,
  LearnSectionTagline,
  LearnSectionTitle,
  LearnSectionViewAllToggle,
} from '../education/LearnBrowseChrome';
import { renderLearnLikesFilterContent } from '../education/LearnLikesFilterContent';
import {
  engagementItemKey,
  engagementKeyForSlayTip,
} from '../../../utils/loungeEngagementTypes';
import { useLoungeEngagementSummaries } from '../../../hooks/useLoungeEngagementSummaries';
import { useLoungeHelpfulToggle } from '../../../hooks/useLoungeHelpfulToggle';
import { slayTipPublicTitle } from './slayTipContent';

/** One full editorial band — hero row, portrait row, duo row. */
const SLAY_TIPS_PREVIEW_COUNT = SLAY_TIPS_EDITORIAL_BAND_SIZE;

type SlayTipRowProps = {
  title: string;
  tips: SlayTip[];
  onSelect: (tip: SlayTip) => void;
  emptyLabel?: string;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  railId?: string;
  /** When true, parent handles section spacing (Learn tab dividers). */
  embeddedSection?: boolean;
  /** Learn tab — full discovery board (masonry + filters). */
  discoveryBoard?: boolean;
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenSlayTipDiscussion?: (tip: SlayTip) => void;
  engagementToast?: (message: string) => void;
};

function SlayTipEngagementCard({
  tip,
  onSelect,
  unlocks,
  isUnlocked,
  pinArchetype,
  pinIndex,
  pinGridPlacement,
  variant,
  summaryMap,
  patchSummary,
  onEngagementRequireSignIn,
  onEngagementOpenSlayTipDiscussion,
  engagementToast,
}: {
  tip: SlayTip;
  onSelect: (tip: SlayTip) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  pinArchetype?: ReturnType<typeof slayTipPinArchetypeForIndex>;
  pinIndex?: number;
  pinGridPlacement?: ReturnType<typeof slayTipPinGridPlacement>;
  variant?: 'discovery' | 'rail';
  summaryMap: ReturnType<typeof useLoungeEngagementSummaries>['map'];
  patchSummary: ReturnType<typeof useLoungeEngagementSummaries>['patchSummary'];
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenSlayTipDiscussion?: (tip: SlayTip) => void;
  engagementToast?: (message: string) => void;
}) {
  const key = useMemo(() => engagementKeyForSlayTip(tip), [tip]);
  const summary = summaryMap.get(engagementItemKey(key));
  const contentTitle = slayTipPublicTitle(tip);

  const { helpfulActive, helpfulCount, pending, toggle } = useLoungeHelpfulToggle({
    key,
    summary,
    contentTitle,
    onRequireAuth: () => onEngagementRequireSignIn?.(),
    onPatch: (patch) => patchSummary(key, patch),
    onError: (msg) => engagementToast?.(msg),
  });

  const mergedSummary = summary
    ? { ...summary, helpfulCount, viewerHelpful: helpfulActive }
    : {
        contentType: key.contentType,
        contentId: key.contentId,
        qualifiedViewCount: 0,
        helpfulCount,
        commentCount: 0,
        viewerHelpful: helpfulActive,
      };

  return (
    <SlayTipCard
      tip={tip}
      onSelect={onSelect}
      unlocks={unlocks}
      isUnlocked={isUnlocked}
      variant={variant}
      pinArchetype={pinArchetype}
      pinIndex={pinIndex}
      pinGridPlacement={pinGridPlacement}
      engagementSummary={mergedSummary}
      engagementHelpfulActive={helpfulActive}
      engagementHelpfulPending={pending}
      onEngagementHelpful={() => void toggle()}
      onEngagementComments={
        onEngagementOpenSlayTipDiscussion
          ? () => onEngagementOpenSlayTipDiscussion(tip)
          : undefined
      }
    />
  );
}

function SlayTipDiscoveryBoard({
  title,
  tips,
  onSelect,
  unlocks,
  isUnlocked,
  embeddedSection,
  onEngagementRequireSignIn,
  onEngagementOpenSlayTipDiscussion,
  engagementToast,
}: Omit<SlayTipRowProps, 'emptyLabel' | 'railId' | 'discoveryBoard'>) {
  const stageId = useId();
  const [expanded, setExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SlayTipDiscoveryFilter>('ALL');

  const engagementItems = useMemo(() => tips.map((tip) => engagementKeyForSlayTip(tip)), [tips]);
  const { map: summaryMap, patchSummary } = useLoungeEngagementSummaries(engagementItems);

  const filteredTips = useMemo(
    () =>
      tips.filter((tip) => {
        const summary = summaryMap.get(engagementItemKey(engagementKeyForSlayTip(tip)));
        return slayTipMatchesDiscoveryFilter(tip, activeFilter, {
          viewerHelpful: summary?.viewerHelpful,
        });
      }),
    [tips, activeFilter, summaryMap],
  );

  const visibleTips = expanded
    ? filteredTips
    : filteredTips.slice(0, SLAY_TIPS_PREVIEW_COUNT);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const sectionFooterGap = embeddedSection ? '0' : loungeTvGlassCqw(2.5, 6, 12);

  return (
    <section
      data-lounge-tv-rail="learn-slay-tips-discovery"
      className="lounge-tv-slay-tips-discovery-section"
      style={{ marginBottom: sectionFooterGap, width: '100%', minWidth: 0 }}
    >
      <header>
        <LearnSectionTitle title={title} />
        <LearnSectionTagline spacingVariant="browse">{SLAY_TIPS_DISCOVERY_TAGLINE}</LearnSectionTagline>
      </header>

      <LearnBrowseFilters
        filters={SLAY_TIP_DISCOVERY_FILTERS}
        active={activeFilter}
        onChange={setActiveFilter}
        focusIdPrefix="slay-tips-filter"
        ariaLabel="Slay Tips categories"
        filtersClassName="lounge-tv-slay-tips-filters"
        renderFilterContent={renderLearnLikesFilterContent}
      />

      <LearnSectionHeaderRow
        meta={`${filteredTips.length} TIP${filteredTips.length === 1 ? '' : 'S'}`}
        toggle={
          <LearnSectionViewAllToggle
            expanded={expanded}
            onToggle={toggleExpanded}
            expandLabel="VIEW ALL TIPS >"
            collapseLabel="COLLAPSE"
            focusId="slay-tips-view-all"
            controlsId={stageId}
          />
        }
      />

      {activeFilter === 'LIKES' && filteredTips.length === 0 ? (
        <div className="lounge-tv-slay-tips-likes-empty">
          <p className="lounge-tv-slay-tips-likes-empty__lead">LIKE THE TIPS THAT HIT.</p>
          <p className="lounge-tv-slay-tips-likes-empty__sub">LIKED SLAY TIPS WILL APPEAR ON THIS BOARD.</p>
        </div>
      ) : null}

      {visibleTips.length > 0 ? (
        <div
          id={stageId}
          className={
            expanded
              ? 'lounge-tv-slay-tips-stage lounge-tv-slay-tips-stage--expanded'
              : 'lounge-tv-slay-tips-stage lounge-tv-slay-tips-stage--preview'
          }
          data-lounge-tv-slay-tips-expanded={expanded ? 'true' : 'false'}
          style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
        >
          <div
            className="lounge-tv-slay-tips-board-shell"
            data-slay-tips-board-version="grid-v3"
            style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
          >
            <div className="lounge-tv-slay-tips-pinboard">
            {visibleTips.map((tip, index) => (
              <SlayTipEngagementCard
                key={tip.id}
                tip={tip}
                onSelect={onSelect}
                unlocks={unlocks}
                isUnlocked={isUnlocked}
                pinArchetype={slayTipPinArchetypeForIndex(index)}
                pinIndex={index}
                pinGridPlacement={slayTipPinGridPlacement(index)}
                variant="discovery"
                summaryMap={summaryMap}
                patchSummary={patchSummary}
                onEngagementRequireSignIn={onEngagementRequireSignIn}
                onEngagementOpenSlayTipDiscussion={onEngagementOpenSlayTipDiscussion}
                engagementToast={engagementToast}
              />
            ))}
            </div>
          </div>
        </div>
      ) : activeFilter !== 'LIKES' ? (
        <div style={{ marginTop: loungeTvGlassCqw(1, 2.4, 4.8) }}>
          <LoungeTvEmptyState message="NO TIPS IN THIS CATEGORY YET." />
        </div>
      ) : null}
    </section>
  );
}

function SlayTipCompactRail({
  title,
  tips,
  onSelect,
  emptyLabel,
  unlocks,
  isUnlocked,
  railId,
  embeddedSection,
  onEngagementRequireSignIn,
  onEngagementOpenSlayTipDiscussion,
  engagementToast,
}: Omit<SlayTipRowProps, 'discoveryBoard'>) {
  const sectionFooterGap = embeddedSection ? '0' : loungeTvGlassCqw(2.5, 6, 12);
  const engagementItems = useMemo(() => tips.map((tip) => engagementKeyForSlayTip(tip)), [tips]);
  const { map: summaryMap, patchSummary } = useLoungeEngagementSummaries(engagementItems);

  if (!tips.length && emptyLabel) {
    return (
      <section
        data-lounge-tv-rail={`learn-${railId}`}
        style={{ marginBottom: sectionFooterGap }}
      >
        <LoungeTvSectionTitle title={title} />
        <LoungeTvEmptyState message={emptyLabel} />
      </section>
    );
  }

  if (!tips.length) return null;

  return (
    <section
      data-lounge-tv-rail={`learn-${railId}`}
      style={{ marginBottom: sectionFooterGap }}
    >
      <LoungeTvSectionTitle title={title} />
      <div className="lounge-tv-slay-tips-rail-scroll" data-lounge-tv-rail-scroll>
        {tips.map((tip) => (
          <SlayTipEngagementCard
            key={tip.id}
            tip={tip}
            onSelect={onSelect}
            unlocks={unlocks}
            isUnlocked={isUnlocked}
            variant="rail"
            summaryMap={summaryMap}
            patchSummary={patchSummary}
            onEngagementRequireSignIn={onEngagementRequireSignIn}
            onEngagementOpenSlayTipDiscussion={onEngagementOpenSlayTipDiscussion}
            engagementToast={engagementToast}
          />
        ))}
      </div>
    </section>
  );
}

/** Slay Tips — discovery board on Learn tab; compact rail elsewhere (Library). */
export function SlayTipRow({
  title,
  tips,
  onSelect,
  emptyLabel,
  unlocks,
  isUnlocked,
  railId = 'slay-tips',
  embeddedSection = false,
  discoveryBoard = railId === 'slay-tips',
  onEngagementRequireSignIn,
  onEngagementOpenSlayTipDiscussion,
  engagementToast,
}: SlayTipRowProps) {
  if (discoveryBoard) {
    if (!tips.length) return null;
    return (
      <SlayTipDiscoveryBoard
        title={title}
        tips={tips}
        onSelect={onSelect}
        unlocks={unlocks}
        isUnlocked={isUnlocked}
        embeddedSection={embeddedSection}
        onEngagementRequireSignIn={onEngagementRequireSignIn}
        onEngagementOpenSlayTipDiscussion={onEngagementOpenSlayTipDiscussion}
        engagementToast={engagementToast}
      />
    );
  }

  return (
    <SlayTipCompactRail
      title={title}
      tips={tips}
      onSelect={onSelect}
      emptyLabel={emptyLabel}
      unlocks={unlocks}
      isUnlocked={isUnlocked}
      railId={railId}
      embeddedSection={embeddedSection}
      onEngagementRequireSignIn={onEngagementRequireSignIn}
      onEngagementOpenSlayTipDiscussion={onEngagementOpenSlayTipDiscussion}
      engagementToast={engagementToast}
    />
  );
}
