const SLAY_TICKET_PREVIEW_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Slay%20Ticket';

/** Slay Ticket PDP hero gallery only (not cart/tools thumbnails). */
export const SLAY_TICKET_PREVIEW_IMAGES = [
  `${SLAY_TICKET_PREVIEW_BASE}/IMG_3392.png`,
  `${SLAY_TICKET_PREVIEW_BASE}/IMG_3397.png`,
  `${SLAY_TICKET_PREVIEW_BASE}/IMG_3396.png`,
] as const;

/** Tools hub, cart, bag, checkout strip — icon asset (not PDP hero). */
export const SLAY_TICKET_CART_THUMBNAIL_SRC = `${SLAY_TICKET_PREVIEW_BASE}/IMG_3403.png`;

/** Lounge TV ticket-gate frame watermark on locked thumbnails. */
export const LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC = `${SLAY_TICKET_PREVIEW_BASE}/E0F41BC1-D053-44B1-83F5-A0940718ACFF.png`;
