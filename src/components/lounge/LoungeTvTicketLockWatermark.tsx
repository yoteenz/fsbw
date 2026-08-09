import type { CSSProperties } from 'react';
import { LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC } from '../../constants/slayTicketAssets';

/** Prior full-bleed watermark was ~90% (grid) / ~92% (Slay Tips thumb); show at half size. */
export const LOUNGE_TV_TICKET_LOCK_WATERMARK_SIZE = {
  card: '45%',
  blogThumb: '46%',
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
    opacity: 0.95,
    filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.5))',
    pointerEvents: 'none',
    userSelect: 'none',
  };
}

export function LoungeTvTicketLockWatermark({ variant }: { variant: LoungeTvTicketLockWatermarkVariant }) {
  return (
    <img
      src={LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC}
      alt=""
      aria-hidden
      draggable={false}
      style={loungeTvTicketLockWatermarkImageStyle(variant)}
    />
  );
}
