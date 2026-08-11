import {
  useCallback,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import type { SlayTip } from '../../../content/education/types';
import type { LoungeEngagementSummary } from '../../../utils/loungeEngagementTypes';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { AcrylicLikeControl } from '../AcrylicLikeControl';
import { LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC } from '../../../constants/slayTicketAssets';
import { slayTipAccessGranted, slayTipUnlockCost } from './slayTipAccess';
import { slayTipPreviewCopy, slayTipPublicTitle } from './slayTipContent';
import {
  slayTipImageCropForTip,
  slayTipImageScaleForTip,
  slayTipPinMetaLine,
  slayTipPinGridSpansTwoRows,
  type SlayTipPinArchetype,
} from './slayTipDiscoveryMeta';
import { LoungeEngagementMetaRow } from '../engagement/LoungeEngagementMetaRow';

export type SlayTipCardVariant = 'discovery' | 'rail';

type SlayTipCardProps = {
  tip: SlayTip;
  onSelect: (tip: SlayTip) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked?: (contentId: string) => boolean;
  variant?: SlayTipCardVariant;
  pinArchetype?: SlayTipPinArchetype;
  pinIndex?: number;
  pinGridPlacement?: CSSProperties;
  engagementSummary?: LoungeEngagementSummary;
  engagementHelpfulActive?: boolean;
  engagementHelpfulPending?: boolean;
  onEngagementHelpful?: () => void;
  onEngagementComments?: () => void;
};

function isSlayTipLikeTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('.lounge-tv-slay-tip-like, [data-lounge-engagement-meta]'))
  );
}

function SlayTipPinMedia({
  cover,
  crop,
  scale,
  archetype,
}: {
  cover?: string;
  crop: string;
  scale: number;
  archetype: SlayTipPinArchetype;
}) {
  return (
    <span
      className={`lounge-tv-slay-tip-pin__media lounge-tv-slay-tip-pin__media--${archetype}`}
      aria-hidden
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          draggable={false}
          className="lounge-tv-slay-tip-pin__image"
          style={
            {
              objectPosition: crop,
              '--pin-image-scale': scale,
            } as CSSProperties
          }
          loading="lazy"
        />
      ) : (
        <span className="lounge-tv-slay-tip-pin__placeholder" />
      )}
      <span className="lounge-tv-slay-tip-pin__veil" />
      <span className="lounge-tv-slay-tip-pin__chrome" aria-hidden />
    </span>
  );
}

function SlayTipPinAccess({
  tip,
  unlocked,
  unlocks,
  compact = false,
}: {
  tip: SlayTip;
  unlocked: boolean;
  unlocks?: LoungeContentUnlock[];
  compact?: boolean;
}) {
  if (tip.comingSoon) {
    return <span className="lounge-tv-slay-tip-pin__access">COMING SOON</span>;
  }
  if (tip.slayTicketCost <= 0 || unlocked) {
    return compact ? null : <span className="lounge-tv-slay-tip-pin__access lounge-tv-slay-tip-pin__access--free">FREE</span>;
  }
  const cost = slayTipUnlockCost(tip, unlocks);
  return (
    <span className="lounge-tv-slay-tip-pin__access lounge-tv-slay-tip-pin__access--ticket">
      <img src={LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC} alt="" aria-hidden draggable={false} />
      <span>{cost}</span>
    </span>
  );
}

function SlayTipPinFocusLayer({
  tip,
  title,
  teaser,
  unlocked,
  unlocks,
  engagementSummary,
  engagementHelpfulActive,
  engagementHelpfulPending,
  onEngagementHelpful,
  onEngagementComments,
}: {
  tip: SlayTip;
  title: string;
  teaser: string | null;
  unlocked: boolean;
  unlocks?: LoungeContentUnlock[];
  engagementSummary?: LoungeEngagementSummary;
  engagementHelpfulActive?: boolean;
  engagementHelpfulPending?: boolean;
  onEngagementHelpful?: () => void;
  onEngagementComments?: () => void;
}) {
  return (
    <span className="lounge-tv-slay-tip-pin__focus-layer" aria-hidden>
      {teaser ? <span className="lounge-tv-slay-tip-pin__teaser">{teaser.toUpperCase()}</span> : null}
      {!unlocked && tip.slayTicketCost > 0 && !tip.comingSoon ? (
        <span className="lounge-tv-slay-tip-pin__ticket lounge-tv-slay-tip-pin__ticket--cost">
          <img src={LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC} alt="" aria-hidden draggable={false} />
          <span>
            {slayTipUnlockCost(tip, unlocks)} SLAY TICKET
            {slayTipUnlockCost(tip, unlocks) === 1 ? '' : 'S'}
          </span>
        </span>
      ) : null}
      <span className="lounge-tv-slay-tip-pin__cta">VIEW TIP {'>'}</span>
      {onEngagementHelpful || onEngagementComments ? (
        <span className="lounge-tv-slay-tip-pin__engagement">
          <LoungeEngagementMetaRow
            contentTitle={title}
            summary={engagementSummary}
            helpfulActive={engagementHelpfulActive}
            helpfulPending={engagementHelpfulPending}
            onHelpfulClick={onEngagementHelpful ? () => onEngagementHelpful() : undefined}
            onCommentsClick={onEngagementComments ? () => onEngagementComments() : undefined}
          />
        </span>
      ) : null}
    </span>
  );
}

/** Editorial pin — borderless image-first Slay Tip for Learn discovery board. */
export function SlayTipCard({
  tip,
  onSelect,
  unlocks,
  isUnlocked,
  variant = 'discovery',
  pinArchetype = 'standard',
  pinIndex = 0,
  pinGridPlacement,
  engagementSummary,
  engagementHelpfulActive = false,
  engagementHelpfulPending = false,
  onEngagementHelpful,
  onEngagementComments,
}: SlayTipCardProps) {
  const cover = tip.thumbnailUrl ?? tip.coverImageUrl;
  const title = slayTipPublicTitle(tip);
  const teaser = slayTipPreviewCopy(tip);
  const unlocked = slayTipAccessGranted(tip, unlocks, isUnlocked);
  const isRail = variant === 'rail';
  const crop = slayTipImageCropForTip(tip, pinIndex, pinArchetype);
  const scale = slayTipImageScaleForTip(tip);
  const metaLine = slayTipPinMetaLine(tip);

  const handleActivate = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isSlayTipLikeTarget(e.target)) return;
      onSelect(tip);
    },
    [onSelect, tip],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(tip);
      }
    },
    [onSelect, tip],
  );

  const focusLayer = (
    <SlayTipPinFocusLayer
      tip={tip}
      title={title}
      teaser={teaser}
      unlocked={unlocked}
      unlocks={unlocks}
      engagementSummary={engagementSummary}
      engagementHelpfulActive={engagementHelpfulActive}
      engagementHelpfulPending={engagementHelpfulPending}
      onEngagementHelpful={onEngagementHelpful}
      onEngagementComments={onEngagementComments}
    />
  );

  if (isRail) {
    return (
      <div className="lounge-tv-slay-tip-discovery-wrap lounge-tv-slay-tip-discovery-wrap--rail">
        <div
          role="button"
          tabIndex={0}
          data-lounge-tv-focusable
          data-lounge-tv-focus-id={tip.id}
          className="lounge-tv-slay-tip-pin lounge-tv-slay-tip-pin--rail"
          aria-label={`Open Slay Tip: ${title}`}
          onClick={handleActivate}
          onKeyDown={handleKeyDown}
        >
          <SlayTipPinMedia cover={cover} crop={crop} scale={scale} archetype="standard" />
          <span className="lounge-tv-slay-tip-pin__copy">
            <span className="lounge-tv-slay-tip-pin__title">{title}</span>
            <span className="lounge-tv-slay-tip-pin__meta">{metaLine}</span>
          </span>
        </div>
        {onEngagementHelpful ? (
          <AcrylicLikeControl
            liked={engagementHelpfulActive}
            pending={engagementHelpfulPending}
            glyphSize={loungeTvGlassCqw(1.1, 2.5, 5)}
            hitSize={loungeTvGlassCqw(2.8, 6.5, 13)}
            data-lounge-tv-focusable
            className="lounge-tv-slay-tip-like"
            ariaLabel={
              engagementHelpfulActive ? `Unlike ${title}` : `Like ${title}`
            }
            onClick={() => onEngagementHelpful()}
          />
        ) : null}
      </div>
    );
  }

  const isOverlayPin =
    pinArchetype === 'hero' ||
    pinArchetype === 'detail' ||
    pinArchetype === 'portrait' ||
    pinArchetype === 'stack' ||
    pinArchetype === 'duo';
  const isFooterPin = pinArchetype === 'standard';
  const isBodyPin = pinArchetype === 'compact' || pinArchetype === 'micro';
  const heroSpansTwoRows = pinArchetype === 'hero' && slayTipPinGridSpansTwoRows(pinIndex);

  return (
    <div
      className={`lounge-tv-slay-tip-pin-wrap lounge-tv-slay-tip-pin-wrap--${pinArchetype}${heroSpansTwoRows ? ' lounge-tv-slay-tip-pin-wrap--band-hero' : ''}`}
      style={pinGridPlacement}
    >
      <div
        role="button"
        tabIndex={0}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={tip.id}
        className={`lounge-tv-slay-tip-pin lounge-tv-slay-tip-pin--${pinArchetype}${heroSpansTwoRows ? ' lounge-tv-slay-tip-pin--band-hero' : ''}`}
        aria-label={`Open Slay Tip: ${title}`}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
      >
        <SlayTipPinMedia cover={cover} crop={crop} scale={scale} archetype={pinArchetype} />

        {isOverlayPin ? (
          <span className="lounge-tv-slay-tip-pin__copy lounge-tv-slay-tip-pin__copy--overlay">
            <span className="lounge-tv-slay-tip-pin__title">{title}</span>
            <span className="lounge-tv-slay-tip-pin__meta">{metaLine}</span>
            <SlayTipPinAccess tip={tip} unlocked={unlocked} unlocks={unlocks} />
            {focusLayer}
          </span>
        ) : null}

        {isFooterPin ? (
          <>
            <span className="lounge-tv-slay-tip-pin__footer">
              <span className="lounge-tv-slay-tip-pin__title">{title}</span>
              <span className="lounge-tv-slay-tip-pin__meta">{metaLine}</span>
              <SlayTipPinAccess tip={tip} unlocked={unlocked} unlocks={unlocks} />
            </span>
            {focusLayer}
          </>
        ) : null}

        {isBodyPin ? (
          <>
            <span className={`lounge-tv-slay-tip-pin__body lounge-tv-slay-tip-pin__body--${pinArchetype}`}>
              <span className="lounge-tv-slay-tip-pin__title">{title}</span>
              <span className="lounge-tv-slay-tip-pin__meta">{metaLine}</span>
              <SlayTipPinAccess tip={tip} unlocked={unlocked} unlocks={unlocks} compact={pinArchetype === 'micro'} />
            </span>
            {focusLayer}
          </>
        ) : null}
      </div>

      {onEngagementHelpful ? (
        <AcrylicLikeControl
          liked={engagementHelpfulActive}
          pending={engagementHelpfulPending}
          glyphSize={loungeTvGlassCqw(1.05, 2.4, 4.8)}
          hitSize={loungeTvGlassCqw(2.6, 6, 12)}
          data-lounge-tv-focusable
          className="lounge-tv-slay-tip-like"
          ariaLabel={
            engagementHelpfulActive ? `Unlike ${title}` : `Like ${title}`
          }
          onClick={() => onEngagementHelpful()}
        />
      ) : null}
    </div>
  );
}
