import { type CSSProperties } from 'react';
import type { LoungeTvVideoTile } from './loungeTvContent';
import {
  loungeTvContentIsAccessible,
  loungeTvTileActionLabel,
  loungeTvTicketCostLabel,
  resolveLoungeTvTicketCost,
} from './loungeTvTicketAccess';
import { loungeTvGlassCqw } from './loungeTvResponsive';

const BRAND_RED = '#EB1C24';

type LoungeTvTileTicketChromeProps = {
  tile: LoungeTvVideoTile;
  isUnlocked: (contentId: string) => boolean;
};

const badgeBase: CSSProperties = {
  position: 'absolute',
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
  lineHeight: 1,
  textTransform: 'uppercase',
  padding: `${loungeTvGlassCqw(0.5, 1, 2)} ${loungeTvGlassCqw(0.8, 2, 4)}`,
  pointerEvents: 'none',
  zIndex: 2,
};

export function LoungeTvTileTicketChrome({ tile, isUnlocked }: LoungeTvTileTicketChromeProps) {
  const cost = resolveLoungeTvTicketCost(tile);
  const accessible = loungeTvContentIsAccessible(tile, isUnlocked);
  const action = loungeTvTileActionLabel(tile, isUnlocked);

  return (
    <>
      <span
        style={{
          ...badgeBase,
          top: loungeTvGlassCqw(0.8, 2, 4),
          right: loungeTvGlassCqw(0.8, 2, 4),
          background: 'rgba(0,0,0,0.72)',
          color: cost > 0 ? '#ffffff' : BRAND_RED,
          border: cost > 0 ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${BRAND_RED}`,
        }}
      >
        {loungeTvTicketCostLabel(cost)}
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
      {!accessible && cost > 0 ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.42)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
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
