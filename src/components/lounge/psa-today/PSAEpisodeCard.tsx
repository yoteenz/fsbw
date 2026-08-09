import type { PSATodayEpisode } from './types';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { resolvePsaEpisodeTicketCost } from './psaTodayAccess';
import { isPsaEpisodeSaved } from './psaTodayProgress';

type PSAEpisodeCardProps = {
  episode: PSATodayEpisode;
  onSelect: (episode: PSATodayEpisode) => void;
  progressPercent?: number;
  entitlementBadge?: string;
};

export function PSAEpisodeCard({ episode, onSelect, progressPercent, entitlementBadge }: PSAEpisodeCardProps) {
  const poster = episode.thumbnailUrl ?? episode.heroPosterUrl ?? episode.cameraA?.posterUrl;
  const ticketCost = resolvePsaEpisodeTicketCost(episode);
  const saved = isPsaEpisodeSaved(episode);

  return (
    <button
      type="button"
      data-lounge-tv-focusable
      onClick={() => onSelect(episode)}
      aria-label={episode.title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: `0 0 ${loungeTvGlassCqw(22, 52, 88)}`,
        width: loungeTvGlassCqw(22, 52, 88),
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        scrollSnapAlign: 'start',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: '1',
          overflow: 'hidden',
          background: '#1a1a1a',
        }}
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : null}
        {episode.comingSoon ? (
          <span
            style={{
              position: 'absolute',
              top: loungeTvGlassCqw(0.5, 1.2, 2.4),
              left: loungeTvGlassCqw(0.5, 1.2, 2.4),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
              color: LOUNGE_TV_BRAND_RED,
              background: 'rgba(0,0,0,0.65)',
              padding: `${loungeTvGlassCqw(0.25, 0.6, 1.2)} ${loungeTvGlassCqw(0.45, 1, 2)}`,
            }}
          >
            COMING SOON
          </span>
        ) : null}
        {saved ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: loungeTvGlassCqw(0.5, 1.2, 2.4),
              right: loungeTvGlassCqw(0.5, 1.2, 2.4),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
              color: LOUNGE_TV_BRAND_RED,
            }}
          >
            ✓
          </span>
        ) : null}
        {entitlementBadge ? (
          <span
            style={{
              position: 'absolute',
              bottom: loungeTvGlassCqw(0.5, 1.2, 2.4),
              left: loungeTvGlassCqw(0.5, 1.2, 2.4),
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
              color: LOUNGE_TV_TEXT_GRAY,
              background: 'rgba(0,0,0,0.72)',
              padding: `${loungeTvGlassCqw(0.2, 0.5, 1)} ${loungeTvGlassCqw(0.4, 0.9, 1.8)}`,
              letterSpacing: '0.04em',
            }}
          >
            {entitlementBadge}
          </span>
        ) : null}
        {progressPercent != null && progressPercent > 0 && progressPercent < 100 ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: loungeTvGlassCqw(0.35, 0.9, 1.8),
              background: 'rgba(255,255,255,0.15)',
            }}
          >
            <span
              style={{
                display: 'block',
                height: '100%',
                width: `${progressPercent}%`,
                background: LOUNGE_TV_BRAND_RED,
              }}
            />
          </span>
        ) : null}
      </span>
      <span
        style={{
          display: 'block',
          paddingTop: loungeTvGlassCqw(0.55, 1.4, 2.8),
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
          lineHeight: 1.25,
          color: LOUNGE_TV_TEXT_WHITE,
        }}
      >
        {episode.title}
      </span>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
          color: LOUNGE_TV_TEXT_GRAY,
          marginTop: loungeTvGlassCqw(0.3, 0.8, 1.6),
        }}
      >
        EP {String(episode.episodeNumber).padStart(2, '0')}
        {ticketCost > 0 ? ` · ${ticketCost} SLAY TICKET${ticketCost === 1 ? '' : 'S'}` : ' · FREE'}
      </span>
    </button>
  );
}
