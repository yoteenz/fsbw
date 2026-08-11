import { useMemo, type ReactNode } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { LoungeTvContentPackCard } from './LoungeTvContentPackCard';
import { LoungeTvSectionTitle } from './LoungeTvUiPrimitives';
import { LoungeTvEmptyState } from './LoungeTvEmptyState';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import {
  resolveRailLayoutMode,
  type LoungeTvRailDisplayMode,
} from './loungeTvAdaptiveRail';
import { engagementKeyForPack } from '../../utils/loungeEngagementTypes';
import { engagementItemKey } from '../../utils/loungeEngagementTypes';
import { useLoungeEngagementSummaries } from '../../hooks/useLoungeEngagementSummaries';
import { useLoungeHelpfulToggle } from '../../hooks/useLoungeHelpfulToggle';

type LoungeTvContentRowProps = {
  title: string;
  packs: LoungeContentPack[];
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  emptyLabel?: string;
  action?: ReactNode;
  /** @deprecated compact headings removed for 10-foot TV */
  compactHeading?: boolean;
  railId?: string;
  displayMode?: LoungeTvRailDisplayMode;
  /** Hide section title when parent already shows it (Library destinations). */
  suppressTitle?: boolean;
  /** When true, parent handles section spacing (Learn tab PSA dividers). */
  embeddedSection?: boolean;
  /** Extra space above the section title (Library continue rail). */
  sectionMarginTop?: string;
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenDiscussion?: (pack: LoungeContentPack) => void;
  engagementToast?: (message: string) => void;
};

function LoungeTvEngagementCard({
  pack,
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
  cardSize,
  summaryMap,
  patchSummary,
  onEngagementRequireSignIn,
  onEngagementOpenDiscussion,
  engagementToast,
}: {
  pack: LoungeContentPack;
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  cardSize: ReturnType<typeof resolveRailLayoutMode>;
  summaryMap: ReturnType<typeof useLoungeEngagementSummaries>['map'];
  patchSummary: ReturnType<typeof useLoungeEngagementSummaries>['patchSummary'];
  onEngagementRequireSignIn?: () => void;
  onEngagementOpenDiscussion?: (pack: LoungeContentPack) => void;
  engagementToast?: (message: string) => void;
}) {
  const key = useMemo(() => engagementKeyForPack(pack.id), [pack.id]);
  const summary = summaryMap.get(engagementItemKey(key));

  const { helpfulActive, helpfulCount, pending, toggle } = useLoungeHelpfulToggle({
    key,
    summary,
    contentTitle: pack.title,
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
    <LoungeTvContentPackCard
      pack={pack}
      onSelect={onSelect}
      onToggleSave={onToggleSave}
      isUnlocked={isUnlocked}
      unlocks={unlocks}
      cardSize={cardSize}
      engagementSummary={mergedSummary}
      engagementHelpfulActive={helpfulActive}
      engagementHelpfulPending={pending}
      onEngagementHelpful={() => void toggle()}
      onEngagementComments={() => onEngagementOpenDiscussion?.(pack)}
    />
  );
}

export function LoungeTvContentRow({
  title,
  packs,
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
  emptyLabel,
  action,
  railId = 'content-row',
  displayMode = 'auto',
  suppressTitle = false,
  embeddedSection = false,
  sectionMarginTop,
  onEngagementRequireSignIn,
  onEngagementOpenDiscussion,
  engagementToast,
}: LoungeTvContentRowProps) {
  const layoutMode = resolveRailLayoutMode(packs.length, displayMode);
  const sectionFooterGap = embeddedSection ? '0' : loungeTvGlassCqw(2.5, 6, 12);
  const engagementItems = useMemo(() => packs.map((p) => engagementKeyForPack(p.id)), [packs]);
  const { map, patchSummary } = useLoungeEngagementSummaries(engagementItems);

  const sectionStyle = {
    marginBottom: sectionFooterGap,
    ...(sectionMarginTop ? { marginTop: sectionMarginTop } : {}),
  };

  if (!packs.length && emptyLabel) {
    return (
      <section
        data-lounge-tv-rail={railId}
        style={sectionStyle}
      >
        {!suppressTitle && title ? <LoungeTvSectionTitle title={title} action={action} /> : null}
        <LoungeTvEmptyState message={emptyLabel} />
      </section>
    );
  }

  if (!packs.length) return null;

  const isFeature = layoutMode === 'feature';

  return (
    <section
      data-lounge-tv-rail={railId}
      data-lounge-tv-rail-layout={layoutMode}
      style={sectionStyle}
    >
      {!suppressTitle && title ? <LoungeTvSectionTitle title={title} action={action} /> : null}
      <div
        data-lounge-tv-rail-scroll
        style={{
          display: 'flex',
          flexDirection: isFeature ? 'column' : 'row',
          alignItems: 'stretch',
          gap: loungeTvGlassCqw(isFeature ? 0 : 1.8, isFeature ? 0 : 4, isFeature ? 0 : 8),
          overflowX: isFeature ? 'visible' : 'auto',
          overflowY: 'visible',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: isFeature ? undefined : 'x proximity',
          paddingBottom: loungeTvGlassCqw(0.8, 2, 4),
        }}
      >
        {packs.map((pack) => (
          <div
            key={pack.id}
            data-lounge-tv-card-unit
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: isFeature ? '1 1 100%' : '0 0 auto',
              minWidth: isFeature ? undefined : 0,
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
            }}
          >
            <LoungeTvEngagementCard
              pack={pack}
              onSelect={onSelect}
              onToggleSave={onToggleSave}
              isUnlocked={isUnlocked}
              unlocks={unlocks}
              cardSize={layoutMode}
              summaryMap={map}
              patchSummary={patchSummary}
              onEngagementRequireSignIn={onEngagementRequireSignIn}
              onEngagementOpenDiscussion={onEngagementOpenDiscussion}
              engagementToast={engagementToast}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
