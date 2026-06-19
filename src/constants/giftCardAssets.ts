const GIFT_CARD_PREVIEW_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Stock%20Content';

/** Gift card PDP hero + thumbnail gallery (Supabase live-preview). */
export const GIFT_CARD_PREVIEW_IMAGES = [
  `${GIFT_CARD_PREVIEW_BASE}/IMG_1799.png`,
  `${GIFT_CARD_PREVIEW_BASE}/IMG_1788.png`,
] as const;

/** Load-card account view uses the second gift-card PDP thumbnail. */
export const GIFT_CARD_LOAD_CARD_THUMBNAIL_SRC = GIFT_CARD_PREVIEW_IMAGES[1];
