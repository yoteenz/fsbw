const SLAY_TICKET_PREVIEW_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Slay%20Ticket';

/** Slay Ticket PDP hero + thumbnail gallery (Supabase live-preview). */
export const SLAY_TICKET_PREVIEW_IMAGES = [
  `${SLAY_TICKET_PREVIEW_BASE}/IMG_3392.png`,
  `${SLAY_TICKET_PREVIEW_BASE}/IMG_3397.png`,
  `${SLAY_TICKET_PREVIEW_BASE}/IMG_3396.png`,
] as const;

/** Cart / checkout strip thumbnail — first hero shot. */
export const SLAY_TICKET_CART_THUMBNAIL_SRC = SLAY_TICKET_PREVIEW_IMAGES[0];
