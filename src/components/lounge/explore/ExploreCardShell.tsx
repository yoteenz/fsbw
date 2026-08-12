import { useCallback, useEffect, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import type { LoungeContentPack } from '../loungeTvContentPack';
import { contentPackToTile } from '../loungeTvContent';
import { AcrylicSaveBookmarkControl } from '../AcrylicSaveBookmarkControl';
import { LoungeTvTicketLockWatermark } from '../LoungeTvTicketLockWatermark';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { resolvePackArtwork } from '../loungeTvArtwork';
import {
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { isPackSaved, LOUNGE_TV_LIBRARY_UPDATED_EVENT } from '../../../utils/loungeTvLibrary';
import { loungeTvDisplayTitle } from '../loungeTvDisplayText';
import { contentPackPrimaryRuntimeForCard } from '../loungeTvContentPack';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { loungeTvTileShowsTicketLock } from '../loungeTvTicketAccess';

const BOOKMARK_INSET = loungeTvGlassCqw(0.55, 1.2, 2.4);

type ExploreCardShellProps = {
  pack?: LoungeContentPack;
  imageSrc: string;
  title: string;
  categoryLabel?: string;
  runtimeLabel?: string;
  comingSoon?: boolean;
  premiere?: boolean;
  disabled?: boolean;
  focusId: string;
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  onSelect?: () => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked?: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  overlay?: ReactNode;
  metaExtra?: ReactNode;
};

function isBookmarkTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('.lounge-tv-explore-card__bookmark'));
}

export function ExploreCardShell({
  pack,
  imageSrc,
  title,
  categoryLabel,
  runtimeLabel,
  comingSoon = false,
  premiere = false,
  disabled = false,
  focusId,
  className = '',
  imageClassName = '',
  style,
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
  overlay,
  metaExtra,
}: ExploreCardShellProps) {
  const [, setRevision] = useState(0);
  const saved = pack ? isPackSaved(pack.id) : false;
  const tile = pack ? contentPackToTile(pack) : null;
  const ticketLocked = tile ? loungeTvTileShowsTicketLock(tile, unlocks, isUnlocked) : false;
  const resolvedRuntime =
    runtimeLabel ?? (pack ? contentPackPrimaryRuntimeForCard(pack) ?? undefined : undefined);
  const displayTitle = pack ? loungeTvDisplayTitle(contentPackToTile(pack).title) : title;

  useEffect(() => {
    const onLibraryUpdated = () => setRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  const activate = useCallback(() => {
    if (disabled || comingSoon) return;
    onSelect?.();
  }, [comingSoon, disabled, onSelect]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (isBookmarkTarget(e.target)) return;
    activate();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (isBookmarkTarget(e.target)) return;
      e.preventDefault();
      activate();
    }
  };

  return (
    <article
      className={`lounge-tv-explore-card ${className}`.trim()}
      style={style}
      data-coming-soon={comingSoon ? 'true' : undefined}
    >
      <button
        type="button"
        className="lounge-tv-explore-card__hit"
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={focusId}
        disabled={disabled || comingSoon}
        aria-label={displayTitle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocusCapture={loungeTvFocusGlowIn}
        onBlurCapture={loungeTvFocusGlowOut}
      >
        <span className={`lounge-tv-explore-card__media ${imageClassName}`.trim()}>
          <img
            src={imageSrc}
            alt=""
            className="lounge-tv-explore-card__image"
            loading="lazy"
            decoding="async"
            style={
              ticketLocked
                ? { filter: 'blur(4px)', transform: 'scale(1.04)' }
                : undefined
            }
          />
          <span className="lounge-tv-explore-card__veil" aria-hidden />
          {ticketLocked ? (
            <span className="lounge-tv-explore-card__lock">
              <LoungeTvTicketLockWatermark variant="card" />
            </span>
          ) : null}
          {premiere ? (
            <span className="lounge-tv-explore-card__premiere-tag" aria-hidden>
              PREMIERE
            </span>
          ) : null}
          {overlay}
        </span>
        <span className="lounge-tv-explore-card__meta">
          <span
            className="lounge-tv-explore-card__title"
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l3,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.04em',
            }}
          >
            {displayTitle}
          </span>
          <span className="lounge-tv-explore-card__meta-row">
            {categoryLabel ? (
              <span
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.06em',
                }}
              >
                {categoryLabel}
              </span>
            ) : null}
            {resolvedRuntime ? (
              <span
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.06em',
                }}
              >
                {resolvedRuntime}
              </span>
            ) : null}
            {comingSoon ? (
              <span
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.06em',
                }}
              >
                COMING SOON
              </span>
            ) : null}
            {metaExtra}
          </span>
        </span>
      </button>
      {pack && onToggleSave && !ticketLocked ? (
        <AcrylicSaveBookmarkControl
          saved={saved}
          glyphSize="12px"
          hitSize={loungeTvGlassCqw(3.2, 7, 14)}
          data-lounge-tv-focusable
          className="lounge-tv-explore-card__bookmark"
          onClick={(e) => {
            e.preventDefault();
            onToggleSave(pack);
          }}
          style={{
            position: 'absolute',
            bottom: BOOKMARK_INSET,
            right: BOOKMARK_INSET,
            zIndex: 4,
          }}
        />
      ) : null}
    </article>
  );
}

export function explorePackImage(pack: LoungeContentPack, role: 'card' | 'portrait' | 'hero' | 'landscape' = 'card'): string {
  return resolvePackArtwork(pack, role === 'card' ? 'card' : role);
}
