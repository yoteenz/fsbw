import type { CSSProperties } from 'react';
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
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { loungeTvTileShowsAsNew } from '../../utils/loungeTvViewedTiles';
import { loungeTvCardMetaLines } from './loungeTvCardMetadata';

type LoungeTvContentPackCardProps = {
  pack: LoungeContentPack;
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  variant?: 'row' | 'hero';
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
};

function SaveIcon({ saved }: { saved: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={saved ? LOUNGE_TV_BRAND_RED : 'none'} aria-hidden>
      <path
        d="M5 3h14v18l-7-5-7 5V3z"
        stroke={saved ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_WHITE}
        strokeWidth="2"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

const cardTitleStyle: CSSProperties = {
  fontFamily: LOUNGE_TV_FONT_MEDIUM,
  fontSize: loungeTvGlassCqw(1.45, 3.2, 7),
  lineHeight: 1.2,
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
  const metaLines = loungeTvCardMetaLines(pack, tile, unlocks, isUnlocked);
  const showNew = loungeTvTileShowsAsNew(tile);
  const ticketLocked = loungeTvTileShowsTicketLock(tile, unlocks, isUnlocked);
  const lockedOverlayLabel = loungeTvLockedThumbnailOverlayLabel(tile, unlocks, isUnlocked);
  const saved = isPackSaved(pack.id);
  const isHero = variant === 'hero';

  const aspectRatio = isHero ? '16 / 9' : '1';
  const minWidth = isHero ? '100%' : loungeTvGlassCqw(22, 52, 88);

  return (
    <button
      type="button"
      onClick={() => onSelect(pack)}
      style={{
        position: 'relative',
        flex: isHero ? '1 1 100%' : `0 0 ${minWidth}`,
        width: isHero ? '100%' : minWidth,
        aspectRatio,
        padding: 0,
        border: 'none',
        background: '#1a1a1a',
        cursor: 'pointer',
        overflow: 'hidden',
        textAlign: 'left',
      }}
      aria-label={pack.title}
    >
      {pack.thumbnail ? (
        <img
          src={pack.thumbnail}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: ticketLocked ? 'blur(4px)' : 'none',
            transform: ticketLocked ? 'scale(1.04)' : 'none',
            transition: 'filter 0.2s ease, transform 0.2s ease',
          }}
        />
      ) : (
        <span style={{ display: 'block', width: '100%', height: '100%', background: '#111' }} />
      )}

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
        <span
          role="presentation"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(pack);
          }}
          style={{
            position: 'absolute',
            top: loungeTvGlassCqw(0.7, 1.5, 3),
            right: loungeTvGlassCqw(0.7, 1.5, 3),
            zIndex: 6,
            width: loungeTvGlassCqw(3.5, 8, 16),
            height: loungeTvGlassCqw(3.5, 8, 16),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)',
            borderRadius: '1px',
            cursor: 'pointer',
          }}
        >
          <SaveIcon saved={saved} />
        </span>
      ) : null}

      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: loungeTvGlassCqw(1, 2.5, 5),
          background: 'linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.15) 55%, transparent)',
          zIndex: 4,
          pointerEvents: 'none',
          gap: loungeTvGlassCqw(0.4, 1, 2),
        }}
      >
        {showNew ? (
          <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5), color: LOUNGE_TV_BRAND_RED }}>
            *NEW*
          </span>
        ) : null}
        <span style={cardTitleStyle}>{pack.title}</span>
        {metaLines.map((line, idx) => (
          <span
            key={`${line.text}-${idx}`}
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.15, 2.6, 5),
              lineHeight: 1.25,
              color: line.accent ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_GRAY,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {line.text}
          </span>
        ))}
      </span>
    </button>
  );
}
