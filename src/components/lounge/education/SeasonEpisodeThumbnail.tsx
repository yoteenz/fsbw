import type { CSSProperties, FocusEvent } from 'react';
import {
  loungeTvFocusBorderIn,
  loungeTvFocusBorderOut,
  loungeTvFocusGlowIn,
  loungeTvFocusGlowOut,
} from '../loungeTvFocusHandlers';
import { LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC } from '../../../constants/slayTicketAssets';
import type { SeasonEpisodePreviewItem } from './seasonPreviewMeta';

type SeasonEpisodeThumbnailProps = {
  item: SeasonEpisodePreviewItem;
  onActivate?: (episodeId: string) => void;
  focusId: string;
};

export function SeasonEpisodeThumbnail({ item, onActivate, focusId }: SeasonEpisodeThumbnailProps) {
  const isComingSoon = item.state === 'coming-soon';
  const isInteractive = item.navigable && Boolean(item.psaEpisodeId) && Boolean(onActivate);

  const sharedFocusHandlers = {
    onFocusCapture: (e: FocusEvent<HTMLElement>) => {
      if (e.currentTarget.hasAttribute('data-lounge-tv-focus-silent')) return;
      e.currentTarget.style.transform = 'scale(1.025)';
      loungeTvFocusGlowIn(e);
      loungeTvFocusBorderIn(e);
    },
    onBlurCapture: (e: FocusEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'scale(1)';
      loungeTvFocusGlowOut(e);
      loungeTvFocusBorderOut(e, 'transparent');
    },
  };

  const inner = (
    <>
      <span className="lounge-tv-season-episode-thumb__media" aria-hidden>
        {item.artworkUrl ? (
          <img
            src={item.artworkUrl}
            alt=""
            draggable={false}
            className="lounge-tv-season-episode-thumb__image"
            loading="lazy"
          />
        ) : (
          <span className="lounge-tv-season-episode-thumb__placeholder" />
        )}
        <span className="lounge-tv-season-episode-thumb__veil" />
        {item.state === 'coming-soon' ? (
          <span className="lounge-tv-season-episode-thumb__soon">
            {item.statusLabel ?? 'COMING SOON'}
          </span>
        ) : null}
        {item.state === 'access-gated' && item.ticketCost != null ? (
          <span className="lounge-tv-season-episode-thumb__access" aria-hidden>
            <img src={LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC} alt="" draggable={false} />
            <span>{item.ticketCost}</span>
          </span>
        ) : null}
        {item.state === 'completed' ? (
          <span className="lounge-tv-season-episode-thumb__complete" aria-hidden>
            ✓
          </span>
        ) : null}
        {item.state === 'in-progress' && item.progressPercent != null ? (
          <span className="lounge-tv-season-episode-thumb__progress" aria-hidden>
            <span style={{ width: `${item.progressPercent}%` } as CSSProperties} />
          </span>
        ) : null}
      </span>
      <span className="lounge-tv-season-episode-thumb__meta">
        <span className="lounge-tv-season-episode-thumb__ep">
          EP {String(item.episodeNumber).padStart(2, '0')}
        </span>
        <span className="lounge-tv-season-episode-thumb__title">{item.title}</span>
      </span>
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        className={`lounge-tv-season-episode-thumb lounge-tv-season-episode-thumb--${item.state}`}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={focusId}
        aria-label={item.ariaLabel}
        onClick={() => onActivate?.(item.psaEpisodeId!)}
        {...sharedFocusHandlers}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className={`lounge-tv-season-episode-thumb lounge-tv-season-episode-thumb--${item.state}`}
      data-lounge-tv-focusable={isComingSoon ? undefined : true}
      data-lounge-tv-focus-id={isComingSoon ? undefined : focusId}
      role={isComingSoon ? 'img' : undefined}
      aria-label={item.ariaLabel}
      aria-disabled={isComingSoon ? true : undefined}
      {...(isComingSoon ? {} : sharedFocusHandlers)}
    >
      {inner}
    </div>
  );
}
