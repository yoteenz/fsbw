import { type CSSProperties } from 'react';
import type { LoungeTvVideoTile } from './loungeTvContent';
import { LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC } from '../../constants/slayTicketAssets';
import {
  loungeTvContentIsAccessible,
  loungeTvTileActionLabel,
  loungeTvTicketCostLabel,
  loungeTvTileShowsTicketLock,
  resolveLoungeTvBadgeCost,
} from './loungeTvTicketAccess';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';

const BRAND_RED = '#EB1C24';

type LoungeTvTileTicketChromeProps = {
  tile: LoungeTvVideoTile;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
};

const badgeBase: CSSProperties = {
  position: 'absolute',
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
  lineHeight: 1,
  textTransform: 'uppercase',
  padding: `${loungeTvGlassCqw(0.5, 1, 2)} ${loungeTvGlassCqw(0.8, 2, 4)}`,
  pointerEvents: 'none',
  zIndex: 4,
};

const ticketLockDimOverlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.08)',
  zIndex: 0,
  pointerEvents: 'none',
};

/** Shared acrylic lock art — high opacity, no blur, so IMG_3405 reads clearly on thumbs. */
export const loungeTvTicketLockWatermarkImageStyle: CSSProperties = {
  objectFit: 'contain',
  pointerEvents: 'none',
  opacity: 0.95,
  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.28))',
};

const ticketLockWatermarkStyle: CSSProperties = {
  ...loungeTvTicketLockWatermarkImageStyle,
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  height: '90%',
  zIndex: 1,
};

/** Slay Tips list row thumbs (44×44). */
export const loungeTvBlogThumbLockWatermarkStyle: CSSProperties = {
  ...loungeTvTicketLockWatermarkImageStyle,
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '92%',
  height: '92%',
};

export function LoungeTvTileTicketLockWatermark({
  tile,
  isUnlocked,
  unlocks,
}: LoungeTvTileTicketChromeProps) {
  if (!loungeTvTileShowsTicketLock(tile, unlocks, isUnlocked)) return null;
  return (
    <img
      src={LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC}
      alt=""
      aria-hidden
      draggable={false}
      style={ticketLockWatermarkStyle}
    />
  );
}

export function LoungeTvTileTicketChrome({
  tile,
  isUnlocked,
  unlocks,
}: LoungeTvTileTicketChromeProps) {
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const badgeCost = resolveLoungeTvBadgeCost(tile, unlocks);
  const action = loungeTvTileActionLabel(tile, unlocks ?? isUnlocked);
  const showLock = loungeTvTileShowsTicketLock(tile, unlocks, isUnlocked);

  return (
    <>
      {showLock ? <span aria-hidden style={ticketLockDimOverlayStyle} /> : null}
      <LoungeTvTileTicketLockWatermark tile={tile} isUnlocked={isUnlocked} unlocks={unlocks} />
      <span
        style={{
          ...badgeBase,
          top: loungeTvGlassCqw(0.8, 2, 4),
          right: loungeTvGlassCqw(0.8, 2, 4),
          background: 'rgba(0,0,0,0.72)',
          color: badgeCost > 0 ? '#ffffff' : BRAND_RED,
          border: badgeCost > 0 ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${BRAND_RED}`,
        }}
      >
        {loungeTvTicketCostLabel(badgeCost)}
      </span>
      {tile.isFreePreview ? (
        <span
          style={{
            ...badgeBase,
            top: loungeTvGlassCqw(0.8, 2, 4),
            left: loungeTvGlassCqw(0.8, 2, 4),
            background: 'rgba(235, 28, 36, 0.88)',
            color: '#ffffff',
          }}
        >
          FREE PREVIEW
        </span>
      ) : null}
      <span
        style={{
          ...badgeBase,
          bottom: loungeTvGlassCqw(0.8, 2, 4),
          left: '50%',
          transform: 'translateX(-50%)',
          background: accessible ? 'rgba(235, 28, 36, 0.92)' : 'rgba(0,0,0,0.78)',
          color: '#ffffff',
          border: accessible ? 'none' : `1px solid ${BRAND_RED}`,
        }}
      >
        {action}
      </span>
    </>
  );
}
