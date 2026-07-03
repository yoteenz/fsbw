import type { CSSProperties } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import {
  contentPackRuntimeOrRead,
  resolveContentPackFormat,
} from './loungeTvContentPack';
import { contentPackToTile, type LoungeTvVideoTile } from './loungeTvContent';
import { LoungeTvTileTicketChrome } from './LoungeTvTileTicketChrome';
import {
  loungeTvContentIsAccessible,
  loungeTvTicketCostLabel,
  resolveLoungeTvBadgeCost,
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

export function LoungeTvContentPackCard({
  pack,
  onSelect,
  onToggleSave,
  variant = 'row',
  isUnlocked,
  unlocks,
}: LoungeTvContentPackCardProps) {
  const tile: LoungeTvVideoTile = contentPackToTile(pack);
  const formatBadge = resolveContentPackFormat(pack);
  const runtimeLabel = contentPackRuntimeOrRead(pack);
  const showNew = loungeTvTileShowsAsNew(tile);
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const badgeCost = resolveLoungeTvBadgeCost(tile, unlocks);
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
            filter: showNew ? 'blur(4px)' : accessible ? 'none' : 'brightness(0.72)',
            transform: showNew ? 'scale(1.04)' : 'none',
            transition: 'filter 0.2s ease, transform 0.2s ease',
          }}
        />
      ) : (
        <span style={{ display: 'block', width: '100%', height: '100%', background: '#111' }} />
      )}

      <LoungeTvTileTicketChrome tile={tile} isUnlocked={isUnlocked} unlocks={unlocks} />

      <span
        style={{
          position: 'absolute',
          top: loungeTvGlassCqw(0.7, 1.5, 3),
          left: loungeTvGlassCqw(0.7, 1.5, 3),
          display: 'flex',
          gap: loungeTvGlassCqw(0.4, 1, 2),
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
            padding: `${loungeTvGlassCqw(0.35, 0.8, 1.5)} ${loungeTvGlassCqw(0.6, 1.2, 2.5)}`,
            background: 'rgba(0,0,0,0.78)',
            color: LOUNGE_TV_BRAND_RED,
            border: `1px solid ${LOUNGE_TV_BRAND_RED}`,
            textTransform: 'uppercase',
          }}
        >
          {formatBadge}
        </span>
        {pack.isPremium ? (
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
              padding: `${loungeTvGlassCqw(0.35, 0.8, 1.5)} ${loungeTvGlassCqw(0.6, 1.2, 2.5)}`,
              background: 'rgba(235,28,36,0.9)',
              color: LOUNGE_TV_TEXT_WHITE,
              textTransform: 'uppercase',
            }}
          >
            PREMIUM
          </span>
        ) : null}
      </span>

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
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: loungeTvGlassCqw(0.8, 2, 4),
          }}
        >
          {runtimeLabel ? (
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
                color: LOUNGE_TV_TEXT_GRAY,
              }}
            >
              {runtimeLabel}
            </span>
          ) : (
            <span />
          )}
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
              color: pack.isFreePreview ? LOUNGE_TV_BRAND_RED : badgeCost > 0 ? LOUNGE_TV_TEXT_WHITE : LOUNGE_TV_BRAND_RED,
            }}
          >
            {pack.isFreePreview ? 'FREE PREVIEW' : loungeTvTicketCostLabel(badgeCost)}
          </span>
        </span>
      </span>
    </button>
  );
}
