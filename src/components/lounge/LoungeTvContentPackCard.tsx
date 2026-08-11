import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { contentPackToTile } from './loungeTvContent';
import { loungeTvTileShowsTicketLock } from './loungeTvTicketAccess';
import { LoungeTvTicketLockWatermark } from './LoungeTvTicketLockWatermark';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { isPackSaved, LOUNGE_TV_LIBRARY_UPDATED_EVENT } from '../../utils/loungeTvLibrary';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import {
  LOUNGE_TV_FEATURE_CARD_WIDTH,
  LOUNGE_TV_PAIR_CARD_WIDTH,
  LOUNGE_TV_RAIL_CARD_WIDTH,
  type LoungeTvRailLayoutMode,
} from './loungeTvAdaptiveRail';
import { LOUNGE_TV_TYPE } from './loungeTvTypography';
import { loungeTvCardCaptionLines, loungeTvCardMetaSegmentColor, loungeTvCardMetaSeparatorColor } from './loungeTvCardMetadata';
import { loungeTvDisplayTitle } from './loungeTvDisplayText';
import { resolvePackArtwork } from './loungeTvArtwork';
import { resolvePackCardEnhancements } from './loungeTvCardEnhancements';
import { LoungeTvVideoPreview } from './LoungeTvVideoPreview';
import { AcrylicSaveBookmarkControl } from './AcrylicSaveBookmarkControl';
import type { LoungeEngagementSummary } from '../../utils/loungeEngagementTypes';
import { LoungeEngagementMetaRow } from './engagement/LoungeEngagementMetaRow';

const PREVIEW_HOVER_DELAY_MS = 450;

function loungeTvSupportsHoverPreview(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Only one rail thumbnail preview plays at a time. */
let activeCardPreviewId: string | null = null;
const previewListeners = new Set<(id: string | null) => void>();

function setActiveCardPreview(id: string | null) {
  activeCardPreviewId = id;
  previewListeners.forEach((fn) => fn(id));
}

/** Stop rail hover preview — e.g. when removing a saved title from the library row. */
export function clearLoungeTvCardPreview(packId?: string): void {
  if (packId == null || activeCardPreviewId === packId) {
    setActiveCardPreview(null);
  }
}

type LoungeTvContentPackCardProps = {
  pack: LoungeContentPack;
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  variant?: 'row' | 'hero';
  cardSize?: LoungeTvRailLayoutMode;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  engagementSummary?: LoungeEngagementSummary;
  engagementHelpfulActive?: boolean;
  engagementHelpfulPending?: boolean;
  onEngagementHelpful?: () => void;
  onEngagementComments?: () => void;
};

function cardWidthForSize(size: LoungeTvRailLayoutMode, isHero: boolean): string {
  if (isHero) return '100%';
  if (size === 'feature') return LOUNGE_TV_FEATURE_CARD_WIDTH;
  if (size === 'pair') return LOUNGE_TV_PAIR_CARD_WIDTH;
  return LOUNGE_TV_RAIL_CARD_WIDTH;
}

const CardThumbnailPreview = memo(function CardThumbnailPreview({
  previewSrc,
  posterSrc,
  previewActive,
  ticketLocked,
  ariaLabel,
}: {
  previewSrc?: string;
  posterSrc?: string;
  previewActive: boolean;
  ticketLocked: boolean;
  ariaLabel: string;
}) {
  if (!previewSrc || ticketLocked) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: previewActive ? 1 : 0,
        transition: 'opacity 0.35s ease',
        pointerEvents: 'none',
      }}
    >
      <LoungeTvVideoPreview
        src={previewSrc}
        poster={posterSrc}
        active={previewActive}
        loop
        muted
        ariaLabel={ariaLabel}
      />
    </div>
  );
});

const CONTENT_PACK_BOOKMARK_INSET = loungeTvGlassCqw(0.7, 1.5, 3);

function isContentPackBookmarkTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('.lounge-tv-content-pack-bookmark'))
  );
}

function isContentPackEngagementTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('[data-lounge-engagement-meta]'))
  );
}

function shouldIgnoreContentPackActivation(target: EventTarget | null): boolean {
  return isContentPackBookmarkTarget(target) || isContentPackEngagementTarget(target);
}

function CardSaveControl({
  pack,
  onToggleSave,
}: {
  pack: LoungeContentPack;
  onToggleSave: (pack: LoungeContentPack) => void;
}) {
  const [, setRevision] = useState(0);

  useEffect(() => {
    const onLibraryUpdated = () => setRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  return (
    <AcrylicSaveBookmarkControl
      saved={isPackSaved(pack.id)}
      glyphSize="13px"
      hitSize={loungeTvGlassCqw(3.5, 8, 16)}
      data-lounge-tv-focusable
      className="lounge-tv-content-pack-bookmark"
      onClick={(e) => {
        e.preventDefault();
        onToggleSave(pack);
      }}
      style={{
        position: 'absolute',
        top: CONTENT_PACK_BOOKMARK_INSET,
        right: CONTENT_PACK_BOOKMARK_INSET,
        zIndex: 6,
        pointerEvents: 'auto',
      }}
    />
  );
}

export function LoungeTvContentPackCard({
  pack,
  onSelect,
  onToggleSave,
  variant = 'row',
  cardSize = 'rail',
  isUnlocked,
  unlocks,
  engagementSummary,
  engagementHelpfulActive = false,
  engagementHelpfulPending = false,
  onEngagementHelpful,
  onEngagementComments,
}: LoungeTvContentPackCardProps) {
  const tile = contentPackToTile(pack);
  const isHero = variant === 'hero';
  const isFeature = !isHero && cardSize === 'feature';
  const captionLines = loungeTvCardCaptionLines(pack, tile, unlocks, isUnlocked);
  const enhancements = resolvePackCardEnhancements(pack, tile, unlocks, isUnlocked);
  const posterSrc = resolvePackArtwork(pack, isHero || isFeature ? 'hero' : 'card');
  const previewSrc = !isHero ? (pack.previewVideo ?? pack.fullVideo) : undefined;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverPreviewRef = useRef(loungeTvSupportsHoverPreview());

  useEffect(() => {
    const onActiveChange = (id: string | null) => {
      setPreviewActive(id === pack.id);
    };
    previewListeners.add(onActiveChange);
    return () => {
      previewListeners.delete(onActiveChange);
      if (activeCardPreviewId === pack.id) setActiveCardPreview(null);
    };
  }, [pack.id]);

  const beginPreview = useCallback(() => {
    if (isHero || !previewSrc) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setActiveCardPreview(pack.id), PREVIEW_HOVER_DELAY_MS);
  }, [isHero, pack.id, previewSrc]);

  const endPreview = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (activeCardPreviewId === pack.id) setActiveCardPreview(null);
  }, [pack.id]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const ticketLocked = loungeTvTileShowsTicketLock(tile, unlocks, isUnlocked);

  const thumbAspect = isFeature ? '21 / 9' : '16 / 9';
  const cardWidth = cardWidthForSize(cardSize, isHero);

  const cardTitleStyle: CSSProperties = {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: isFeature ? LOUNGE_TV_TYPE.l1 : LOUNGE_TV_TYPE.l2,
    lineHeight: 1.2,
    color: LOUNGE_TV_TEXT_WHITE,
    textTransform: 'uppercase',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: isFeature ? 3 : 2,
    WebkitBoxOrient: 'vertical',
  };

  const handleCardFocus = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      if (hoverPreviewRef.current && !e.currentTarget.matches(':focus-visible')) return;
      beginPreview();
    },
    [beginPreview]
  );

  const handleCardBlur = useCallback(() => {
    endPreview();
  }, [endPreview]);

  const handleCardKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(pack);
      }
    },
    [onSelect, pack]
  );

  const handleCardClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (shouldIgnoreContentPackActivation(e.target)) return;
      onSelect(pack);
    },
    [onSelect, pack]
  );

  const cardSizingStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: isHero || isFeature ? '1 1 100%' : `0 0 ${cardWidth}`,
    width: isHero || isFeature ? '100%' : cardWidth,
    minWidth: isHero || isFeature ? 0 : cardWidth,
    maxWidth: isHero || isFeature ? '100%' : cardWidth,
    scrollSnapAlign: 'start',
  };

  return (
    <div
      className="lounge-tv-content-pack-card-wrap"
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        ...cardSizingStyle,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={pack.id}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        onMouseEnter={hoverPreviewRef.current ? beginPreview : undefined}
        onMouseLeave={hoverPreviewRef.current ? endPreview : undefined}
        onFocus={handleCardFocus}
        onBlur={handleCardBlur}
        style={{
          ...cardSizingStyle,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        aria-label={pack.title}
      >
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: thumbAspect,
          overflow: 'hidden',
          background: '#1a1a1a',
        }}
      >
        {enhancements.premiereRibbon && isHero ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: loungeTvGlassCqw(0.8, 2, 4),
              left: loungeTvGlassCqw(0.8, 2, 4),
              zIndex: 5,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              letterSpacing: '0.08em',
              color: LOUNGE_TV_TEXT_WHITE,
              background: 'rgba(235, 28, 36, 0.92)',
              padding: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} ${loungeTvGlassCqw(0.6, 1.4, 2.8)}`,
            }}
          >
            {enhancements.premiereRibbon}
          </span>
        ) : null}

        {posterSrc ? (
          <img
            src={posterSrc}
            alt=""
            draggable={false}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: ticketLocked ? 'blur(4px)' : 'none',
              transform: ticketLocked ? 'scale(1.04)' : 'none',
              opacity: imgLoaded && !previewActive ? 1 : previewActive ? 0 : 0.35,
              transition: 'filter 0.2s ease, transform 0.2s ease, opacity 0.45s ease',
            }}
          />
        ) : (
          <span style={{ display: 'block', width: '100%', height: '100%', background: '#111' }} />
        )}

        <CardThumbnailPreview
          previewSrc={previewSrc}
          posterSrc={posterSrc}
          previewActive={previewActive}
          ticketLocked={ticketLocked}
          ariaLabel={`Preview: ${pack.title}`}
        />

        {ticketLocked ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
              pointerEvents: 'none',
            }}
          >
            <LoungeTvTicketLockWatermark variant="card" />
          </span>
        ) : null}

        {enhancements.progressPercent != null &&
        enhancements.progressPercent > 0 &&
        enhancements.progressPercent < 100 ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: loungeTvGlassCqw(0.4, 1, 2),
              background: 'rgba(255,255,255,0.15)',
              zIndex: 5,
            }}
          >
            <span
              style={{
                display: 'block',
                height: '100%',
                width: `${enhancements.progressPercent}%`,
                background: LOUNGE_TV_BRAND_RED,
                transition: 'width 0.4s ease',
              }}
            />
          </span>
        ) : null}

        {enhancements.showCompletionCheck ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: loungeTvGlassCqw(0.7, 1.5, 3),
              left: loungeTvGlassCqw(0.7, 1.5, 3),
              zIndex: 6,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l3,
              color: LOUNGE_TV_BRAND_RED,
              background: 'rgba(0,0,0,0.55)',
              width: loungeTvGlassCqw(3.5, 8, 16),
              height: loungeTvGlassCqw(3.5, 8, 16),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✓
          </span>
        ) : null}
      </span>

      {!isHero ? (
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: loungeTvGlassCqw(0.5, 1.2, 2.4),
            paddingTop: loungeTvGlassCqw(isFeature ? 1.2 : 0.8, isFeature ? 2.8 : 2, isFeature ? 5.5 : 4),
            width: '100%',
          }}
        >
          <span style={cardTitleStyle}>{loungeTvDisplayTitle(pack.title)}</span>
          {captionLines.map((line, idx) => (
            <span
              key={`${line.text}-${idx}`}
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: isFeature ? LOUNGE_TV_TYPE.l2 : LOUNGE_TV_TYPE.l3,
                lineHeight: 1.35,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {line.segments?.length
                ? line.segments.map((seg, segIdx) => (
                    <Fragment key={`${seg.text}-${segIdx}`}>
                      {segIdx > 0 ? (
                        <span
                          style={{
                            color: loungeTvCardMetaSeparatorColor(line.segments![segIdx - 1], seg),
                          }}
                        >
                          {' · '}
                        </span>
                      ) : null}
                      <span style={{ color: loungeTvCardMetaSegmentColor(seg) }}>{seg.text}</span>
                    </Fragment>
                  ))
                : (
                    <span style={{ color: line.accent ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_GRAY }}>
                      {line.text}
                    </span>
                  )}
            </span>
          ))}
          {!isHero ? (
            <LoungeEngagementMetaRow
              contentTitle={pack.title}
              summary={engagementSummary}
              helpfulActive={engagementHelpfulActive}
              helpfulPending={engagementHelpfulPending}
              onHelpfulClick={onEngagementHelpful}
              onCommentsClick={onEngagementComments}
            />
          ) : null}
        </span>
      ) : (
        <span
          style={{
            display: 'block',
            paddingTop: loungeTvGlassCqw(0.8, 2, 4),
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l2,
            lineHeight: 1.25,
            color: LOUNGE_TV_TEXT_WHITE,
            textTransform: 'uppercase',
          }}
        >
          {loungeTvDisplayTitle(pack.title)}
        </span>
      )}
      </div>

      {onToggleSave && !ticketLocked ? (
        <CardSaveControl pack={pack} onToggleSave={onToggleSave} />
      ) : null}
    </div>
  );
}
