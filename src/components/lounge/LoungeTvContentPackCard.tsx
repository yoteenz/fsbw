import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { contentPackToTile } from './loungeTvContent';
import {
  loungeTvLockedThumbnailOverlayLabel,
  loungeTvTileShowsTicketLock,
} from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { isPackSaved } from '../../utils/loungeTvLibrary';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { loungeTvGlassCqw, LOUNGE_TV_RAIL_CARD_WIDTH } from './loungeTvResponsive';
import { loungeTvTileShowsAsNew } from '../../utils/loungeTvViewedTiles';
import { loungeTvCardCaptionLines } from './loungeTvCardMetadata';
import { resolvePackArtwork } from './loungeTvArtwork';
import { resolvePackCardEnhancements } from './loungeTvCardEnhancements';
import { LoungeTvVideoPreview } from './LoungeTvVideoPreview';
import { AcrylicSaveBookmarkControl } from './AcrylicSaveBookmarkControl';

const PREVIEW_HOVER_DELAY_MS = 450;

/** Only one rail thumbnail preview plays at a time. */
let activeCardPreviewId: string | null = null;
const previewListeners = new Set<(id: string | null) => void>();

function setActiveCardPreview(id: string | null) {
  activeCardPreviewId = id;
  previewListeners.forEach((fn) => fn(id));
}

type LoungeTvContentPackCardProps = {
  pack: LoungeContentPack;
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  variant?: 'row' | 'hero';
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
};

const cardTitleStyle: CSSProperties = {
  fontFamily: LOUNGE_TV_FONT_MEDIUM,
  fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
  lineHeight: 1.25,
  color: LOUNGE_TV_TEXT_WHITE,
  textTransform: 'uppercase',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const lockedOverlayTextStyle: CSSProperties = {
  fontFamily: LOUNGE_TV_FONT_MEDIUM,
  fontSize: loungeTvGlassCqw(1.35, 3, 6.5),
  lineHeight: 1.35,
  color: LOUNGE_TV_TEXT_WHITE,
  textTransform: 'uppercase',
  textAlign: 'center',
  textShadow: '0 2px 12px rgba(0,0,0,0.9)',
  letterSpacing: '0.04em',
  maxWidth: '92%',
};

export function LoungeTvContentPackCard({
  pack,
  onSelect,
  onToggleSave,
  variant = 'row',
  isUnlocked,
  unlocks,
}: LoungeTvContentPackCardProps) {
  const tile = contentPackToTile(pack);
  const saved = isPackSaved(pack.id);
  const isHero = variant === 'hero';
  const captionLines = loungeTvCardCaptionLines(pack, tile, unlocks, isUnlocked);
  const enhancements = resolvePackCardEnhancements(pack, tile, unlocks, isUnlocked);
  const posterSrc = resolvePackArtwork(pack, isHero ? 'hero' : 'card');
  const previewSrc = !isHero ? (pack.previewVideo ?? pack.fullVideo) : undefined;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const showNew = loungeTvTileShowsAsNew(tile);
  const ticketLocked = loungeTvTileShowsTicketLock(tile, unlocks, isUnlocked);
  const lockedOverlayLabel = loungeTvLockedThumbnailOverlayLabel(tile, unlocks, isUnlocked);

  const thumbAspect = '16 / 9';
  const cardWidth = isHero ? '100%' : LOUNGE_TV_RAIL_CARD_WIDTH;

  return (
    <button
      type="button"
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={pack.id}
      onClick={() => onSelect(pack)}
      onMouseEnter={beginPreview}
      onMouseLeave={endPreview}
      onFocus={beginPreview}
      onBlur={endPreview}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        flex: isHero ? '1 1 100%' : `0 0 ${cardWidth}`,
        width: cardWidth,
        minWidth: isHero ? undefined : cardWidth,
        maxWidth: isHero ? '100%' : cardWidth,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        scrollSnapAlign: 'start',
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onFocusCapture={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.zIndex = '2';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.85), 0 8px 32px rgba(0,0,0,0.55)';
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.zIndex = '';
        e.currentTarget.style.boxShadow = '';
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
              fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
              letterSpacing: '0.08em',
              color: LOUNGE_TV_TEXT_WHITE,
              background: 'rgba(235, 28, 36, 0.92)',
              padding: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} ${loungeTvGlassCqw(0.6, 1.4, 2.8)}`,
            }}
          >
            {enhancements.premiereRibbon}
          </span>
        ) : null}

        {showNew && !isHero ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: loungeTvGlassCqw(0.5, 1.2, 2.4),
              left: loungeTvGlassCqw(0.5, 1.2, 2.4),
              zIndex: 5,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
              color: LOUNGE_TV_BRAND_RED,
              textShadow: '0 1px 4px rgba(0,0,0,0.75)',
            }}
          >
            *NEW*
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

        {previewSrc && !ticketLocked ? (
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
              ariaLabel={`Preview: ${pack.title}`}
            />
          </div>
        ) : null}

        {ticketLocked && lockedOverlayLabel ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              pointerEvents: 'none',
              padding: loungeTvGlassCqw(1, 2.5, 5),
            }}
          >
            <span style={lockedOverlayTextStyle}>{lockedOverlayLabel}</span>
          </span>
        ) : null}

        {onToggleSave ? (
          <AcrylicSaveBookmarkControl
            saved={saved}
            glyphSize="13px"
            hitSize={loungeTvGlassCqw(3.5, 8, 16)}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(pack);
            }}
            style={{
              position: 'absolute',
              top: loungeTvGlassCqw(0.7, 1.5, 3),
              right: loungeTvGlassCqw(0.7, 1.5, 3),
              zIndex: 6,
            }}
          />
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
              height: loungeTvGlassCqw(0.35, 0.9, 1.8),
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
              fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
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
            gap: loungeTvGlassCqw(0.35, 0.8, 1.6),
            paddingTop: loungeTvGlassCqw(0.55, 1.4, 2.8),
            width: '100%',
          }}
        >
          <span style={cardTitleStyle}>{pack.title}</span>
          {captionLines.map((line, idx) => (
            <span
              key={`${line.text}-${idx}`}
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
                lineHeight: 1.3,
                color: line.accent ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_GRAY,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {line.text}
            </span>
          ))}
        </span>
      ) : (
        <span
          style={{
            display: 'block',
            paddingTop: loungeTvGlassCqw(0.6, 1.5, 3),
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.45, 3.2, 6.5),
            lineHeight: 1.25,
            color: LOUNGE_TV_TEXT_WHITE,
            textTransform: 'uppercase',
          }}
        >
          {pack.title}
        </span>
      )}
    </button>
  );
}
