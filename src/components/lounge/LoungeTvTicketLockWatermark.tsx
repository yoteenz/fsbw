import type { CSSProperties } from 'react';
import { LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC } from '../../constants/slayTicketAssets';
import { LOUNGE_TV_BRAND_RED } from './loungeTvTheme';

/** Wide ticket frame on locked thumbnails. */
export const LOUNGE_TV_TICKET_LOCK_WATERMARK_SIZE = {
  card: '54.9%',
  blogThumb: '56.8%',
} as const;

export type LoungeTvTicketLockWatermarkVariant = keyof typeof LOUNGE_TV_TICKET_LOCK_WATERMARK_SIZE;

export function loungeTvTicketLockWatermarkImageStyle(
  variant: LoungeTvTicketLockWatermarkVariant
): CSSProperties {
  const size = LOUNGE_TV_TICKET_LOCK_WATERMARK_SIZE[variant];
  return {
    width: size,
    height: 'auto',
    maxWidth: size,
    maxHeight: size,
    objectFit: 'contain',
    opacity: 0.92,
    filter: [
      'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.5))',
      'drop-shadow(0 0 1px rgba(255, 255, 255, 0.35))',
    ].join(' '),
    transform: 'rotate(-2deg)',
    pointerEvents: 'none',
    userSelect: 'none',
  };
}

export function LoungeTvTicketLockWatermark({ variant }: { variant: LoungeTvTicketLockWatermarkVariant }) {
  const size = LOUNGE_TV_TICKET_LOCK_WATERMARK_SIZE[variant];
  const imgStyle = loungeTvTicketLockWatermarkImageStyle(variant);

  return (
    <span
      className="lounge-tv-ticket-lock-watermark"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        maxWidth: size,
      }}
    >
      <span
        aria-hidden
        className="lounge-tv-ticket-lock-watermark__glow"
        style={{
          position: 'absolute',
          width: '92%',
          height: '78%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${LOUNGE_TV_BRAND_RED}66 0%, ${LOUNGE_TV_BRAND_RED}38 42%, ${LOUNGE_TV_BRAND_RED}14 62%, transparent 78%)`,
          filter: 'blur(10px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <img
        src={LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC}
        alt=""
        aria-hidden
        draggable={false}
        style={{ ...imgStyle, position: 'relative', zIndex: 1, width: '100%' }}
      />
    </span>
  );
}
