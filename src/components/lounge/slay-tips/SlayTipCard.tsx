import type { SlayTip } from '../../../content/education/types';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';

type SlayTipCardProps = {
  tip: SlayTip;
  onSelect: (tip: SlayTip) => void;
  progressLabel?: string;
  unlocked?: boolean;
};

/** Scrapbook-style card — visually distinct from PSA Today video tiles. */
export function SlayTipCard({ tip, onSelect, progressLabel, unlocked }: SlayTipCardProps) {
  const cover = tip.thumbnailUrl ?? tip.coverImageUrl;

  return (
    <button
      type="button"
      data-lounge-tv-focusable
      onClick={() => onSelect(tip)}
      aria-label={tip.title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: `0 0 ${loungeTvGlassCqw(20, 46, 78)}`,
        width: loungeTvGlassCqw(20, 46, 78),
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
          aspectRatio: '3 / 4',
          overflow: 'hidden',
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: 'contrast(1.02) saturate(0.92)',
            }}
          />
        ) : null}
        <span
          style={{
            position: 'absolute',
            top: loungeTvGlassCqw(0.45, 1, 2),
            left: loungeTvGlassCqw(0.45, 1, 2),
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
            letterSpacing: '0.08em',
            color: LOUNGE_TV_TEXT_WHITE,
            background: 'rgba(0,0,0,0.72)',
            padding: `${loungeTvGlassCqw(0.2, 0.5, 1)} ${loungeTvGlassCqw(0.35, 0.85, 1.7)}`,
          }}
        >
          SLAY TIP
        </span>
        {tip.comingSoon ? (
          <span
            style={{
              position: 'absolute',
              bottom: loungeTvGlassCqw(0.45, 1, 2),
              left: loungeTvGlassCqw(0.45, 1, 2),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
              color: LOUNGE_TV_BRAND_RED,
              background: 'rgba(0,0,0,0.72)',
              padding: `${loungeTvGlassCqw(0.2, 0.5, 1)} ${loungeTvGlassCqw(0.35, 0.85, 1.7)}`,
            }}
          >
            COMING SOON
          </span>
        ) : null}
        {unlocked ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: loungeTvGlassCqw(0.45, 1, 2),
              right: loungeTvGlassCqw(0.45, 1, 2),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
              color: LOUNGE_TV_BRAND_RED,
            }}
          >
            ✓
          </span>
        ) : null}
        {progressLabel ? (
          <span
            style={{
              position: 'absolute',
              bottom: loungeTvGlassCqw(0.45, 1, 2),
              right: loungeTvGlassCqw(0.45, 1, 2),
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(0.75, 1.7, 3.4),
              color: LOUNGE_TV_TEXT_GRAY,
              background: 'rgba(0,0,0,0.72)',
              padding: `${loungeTvGlassCqw(0.15, 0.4, 0.8)} ${loungeTvGlassCqw(0.3, 0.7, 1.4)}`,
            }}
          >
            {progressLabel}
          </span>
        ) : null}
      </span>
      <span
        style={{
          display: 'block',
          paddingTop: loungeTvGlassCqw(0.5, 1.2, 2.4),
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
          lineHeight: 1.25,
          color: LOUNGE_TV_TEXT_WHITE,
        }}
      >
        {tip.title}
      </span>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
          color: LOUNGE_TV_TEXT_GRAY,
          marginTop: loungeTvGlassCqw(0.25, 0.6, 1.2),
          lineHeight: 1.35,
        }}
      >
        {String(tip.pillar).toUpperCase()}
        {tip.slayTicketCost > 0
          ? ` · ${tip.slayTicketCost} SLAY TICKET${tip.slayTicketCost === 1 ? '' : 'S'}`
          : ' · FREE'}
      </span>
    </button>
  );
}
