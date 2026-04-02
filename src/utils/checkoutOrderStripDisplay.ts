/**
 * Checkout + `/checkout/summary` horizontal order strip: thumbnails and copy aligned with `CartDropdown` by default.
 * Pass `{ checkoutStrip: true }` to `orderStripThumbMetrics` on **checkout** + **confirm** only for larger BCF/booking
 * thumbs and a **120px** slot so black titles line up with unit tiles.
 *
 * **A/C** (internal shorthand): **appointment** + **consult** booking lines (`booking-appointment`, `booking-consult`).
 */

import {
  bookingCartItemThumbnailSrc,
  BOOKING_APPOINTMENT_CART_BADGE_IMG_PX,
  BOOKING_CART_BADGE_IMG_PX,
  isBookingCartBadgeItem
} from './bookingBadges';
import { shopBcfCartLineThumbnailSrc } from './bcfProductOptions';
import { CART_RED_LINE_BCF_BOOKING } from './cartLineRedAndDetails';

export const ORDER_STRIP_UNIT_SLOT_PX = 88;
/** Matches cart dropdown BCF thumb: 85% × 1.05 of unit slot. */
export const ORDER_STRIP_BCF_THUMB_PX = Math.round(ORDER_STRIP_UNIT_SLOT_PX * 0.85 * 1.05);
/** Booking badge image size in strip — consult / default (same as cart consult). */
export const ORDER_STRIP_BOOKING_BADGE_PX = BOOKING_CART_BADGE_IMG_PX;
/** Unit strip uses 120×120 image slot — BCF/booking checkout rows use this min slot so black title lines align. */
export const ORDER_STRIP_UNIT_IMG_SLOT_PX = 120;
/**
 * Checkout + `/checkout/summary` only: scale BCF + booking strip images (~30%) and use {@link ORDER_STRIP_UNIT_IMG_SLOT_PX}
 * for vertical alignment with Noir/Blanco/etc. (cart dropdown / bag keep base sizes).
 */
export const ORDER_STRIP_CHECKOUT_BCF_BOOKING_SCALE = 1.3;

export type OrderStripThumbOptions = {
  checkoutStrip?: boolean;
};

export type OrderStripThumbKind = 'gift' | 'booking' | 'bcf' | 'membership' | 'unit';

function hairOriginForProductName(productName: string): string {
  switch (productName) {
    case 'NOIR':
      return 'CAMBODIAN';
    case 'BLANCO':
      return 'RUSSIAN';
    case 'SOFT CURL':
      return 'FILIPINO';
    case 'OCEAN CURL':
      return 'VIETNAMESE';
    case 'SOFT WAVE':
      return 'INDIAN';
    case 'BEACH WAVE':
      return 'INDONESIAN';
    default:
      return 'CAMBODIAN';
  }
}

/** Black title line — same rules as cart dropdown / shopping bag. */
export function orderStripTitleLine(item: { name?: string; type?: string; category?: string }): string {
  if (item.type === 'booking-appointment') {
    return 'BOOKING';
  }
  if (item.type === 'booking-consult') {
    return 'CONSULT';
  }
  if (item.type === 'shop-texture-category') {
    const c = item.category;
    if (c === 'bundles') return 'BUNDLES';
    if (c === 'closures') return 'CLOSURES';
    if (c === 'frontals') return 'FRONTALS';
    const head = (item.name || '').split('·')[0]?.trim();
    return head ? head.toUpperCase() : (item.name || '').replace(/WIG/gi, '').trim();
  }
  return (item.name || 'NOIR').replace(/WIG/gi, '').trim();
}

/** Red subtitle — same rules as cart dropdown / shopping bag. */
export function orderStripRedSubtitle(item: any, itemLength: string): string {
  if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
    return 'DIGITAL ONLY';
  }
  if (item.type === 'digital') {
    return 'DIGITAL ONLY';
  }
  if (item.type === 'booking-consult' || item.type === 'booking-appointment') {
    return CART_RED_LINE_BCF_BOOKING;
  }
  if (item.type === 'shop-texture-category') {
    return CART_RED_LINE_BCF_BOOKING;
  }
  return `${itemLength} RAW ${hairOriginForProductName(item.name || 'NOIR')}`;
}

function isMembershipTierStripItem(item: any, isSubscriptionUpgrade: boolean): boolean {
  if (!item || item.name === 'GIFT CARD' || item.type === 'gift-card') return false;
  if (
    item.subscriptionTier === '12months' ||
    item.subscriptionTier === '6months' ||
    item.subscriptionTier === '3months'
  ) {
    return true;
  }
  return (
    isSubscriptionUpgrade &&
    /\b(3|6|12)\s*MONTHS\b/i.test(String(item.name || ''))
  );
}

/**
 * Thumbnail URL — aligned with cart dropdown resolution (BCF, booking, units, tiers).
 */
export function orderStripThumbnailSrc(item: any, isSubscriptionUpgrade: boolean): string {
  if (item.name === 'GIFT CARD' || item.type === 'gift-card') {
    return '/assets/gift-card asset.png';
  }
  const bookingThumb = bookingCartItemThumbnailSrc(item);
  if (bookingThumb) return bookingThumb;
  if (item.type === 'shop-texture-category') {
    const bcf = shopBcfCartLineThumbnailSrc(item);
    if (bcf) return bcf;
    if (item.image) return item.image;
  }
  if (
    item.subscriptionTier === '12months' ||
    (isSubscriptionUpgrade && /\b12\s*MONTHS\b/i.test(String(item.name || '')))
  ) {
    return '/assets/12-months-premium.png';
  }
  if (
    item.subscriptionTier === '6months' ||
    (isSubscriptionUpgrade && /\b6\s*MONTHS\b/i.test(String(item.name || '')))
  ) {
    return '/assets/6-months-premium.png';
  }
  if (
    item.subscriptionTier === '3months' ||
    (isSubscriptionUpgrade && /\b3\s*MONTHS\b/i.test(String(item.name || '')))
  ) {
    return '/assets/3-months-premium.png';
  }

  const productName = item.name || 'NOIR';
  if (productName.toUpperCase() === 'NOIR') {
    const hairline = item.hairline || 'NATURAL';
    const hairlineUpper = hairline.toUpperCase();
    const hasPeak = hairlineUpper.includes('PEAK');
    const hasLagos = hairlineUpper.includes('LAGOS');
    if (hasPeak) return '/assets/peak front.png';
    if (hasLagos) return '/assets/lagos front.png';
    return '/assets/natural front.png';
  }

  switch (productName.toUpperCase()) {
    case 'BLANCO':
      return '/assets/2D BLANCO FRONT.png';
    case 'SOFT WAVE':
    case 'BEACH WAVE':
      return '/assets/2D WAVY FRONT.png';
    case 'SOFT CURL':
    case 'OCEAN CURL':
      return '/assets/2D CURLY FRONT.png';
    default:
      return '/assets/natural front.png';
  }
}

export interface OrderStripThumbMetrics {
  kind: OrderStripThumbKind;
  cellWidthPx: number;
  imgPx: number;
  slotPx: number;
  imgWrapperTransform?: string;
  objectContain: boolean;
}

/**
 * Sizing + nudges for the horizontal strip (matches cart dropdown thumb column).
 */
export function orderStripThumbMetrics(
  item: any,
  isSubscriptionUpgrade: boolean,
  options?: OrderStripThumbOptions
): OrderStripThumbMetrics {
  const checkout = Boolean(options?.checkoutStrip);
  const isGift = item.name === 'GIFT CARD' || item.type === 'gift-card';
  const isBooking = isBookingCartBadgeItem(item);
  const isBcf = item.type === 'shop-texture-category';
  const isMem = isMembershipTierStripItem(item, isSubscriptionUpgrade);

  if (isGift) {
    return {
      kind: 'gift',
      cellWidthPx: 165,
      imgPx: 165,
      slotPx: 165,
      objectContain: true
    };
  }
  if (isBooking) {
    if (checkout) {
      const baseImgPx = Math.round(BOOKING_CART_BADGE_IMG_PX * ORDER_STRIP_CHECKOUT_BCF_BOOKING_SCALE);
      /** Hair-install row: prior +6 vs consult, then +5% vs that size (appointment only). */
      const imgPx =
        item?.type === 'booking-appointment'
          ? Math.round((baseImgPx + 6) * 1.05)
          : baseImgPx;
      return {
        kind: 'booking',
        cellWidthPx: Math.max(ORDER_STRIP_UNIT_SLOT_PX + 16, imgPx + 24),
        imgPx,
        slotPx: ORDER_STRIP_UNIT_IMG_SLOT_PX,
        imgWrapperTransform: 'translateX(2px)',
        objectContain: true
      };
    }
    return {
      kind: 'booking',
      cellWidthPx: ORDER_STRIP_UNIT_SLOT_PX + 16,
      imgPx:
        item?.type === 'booking-appointment'
          ? BOOKING_APPOINTMENT_CART_BADGE_IMG_PX
          : BOOKING_CART_BADGE_IMG_PX,
      slotPx: ORDER_STRIP_UNIT_SLOT_PX,
      imgWrapperTransform: 'translateX(2px)',
      objectContain: true
    };
  }
  if (isBcf) {
    if (checkout) {
      const imgPx = Math.round(ORDER_STRIP_BCF_THUMB_PX * ORDER_STRIP_CHECKOUT_BCF_BOOKING_SCALE);
      return {
        kind: 'bcf',
        cellWidthPx: imgPx + 24,
        imgPx,
        slotPx: ORDER_STRIP_UNIT_IMG_SLOT_PX,
        imgWrapperTransform: 'translateX(4px)',
        objectContain: true
      };
    }
    return {
      kind: 'bcf',
      cellWidthPx: ORDER_STRIP_BCF_THUMB_PX + 24,
      imgPx: ORDER_STRIP_BCF_THUMB_PX,
      slotPx: ORDER_STRIP_BCF_THUMB_PX,
      imgWrapperTransform: 'translateX(4px)',
      objectContain: true
    };
  }
  if (isMem) {
    return {
      kind: 'membership',
      cellWidthPx: 173,
      imgPx: 138,
      slotPx: 138,
      objectContain: true
    };
  }
  return {
    kind: 'unit',
    cellWidthPx: 150,
    imgPx: 120,
    slotPx: 120,
    objectContain: true
  };
}

/**
 * Black product title (`orderStripTitleLine`) font size — BCF & A/C use **21px** like Blanco/etc. so they sit on the
 * same visual row as unit names; Noir wig stays **22px**.
 */
export function orderStripTitleFontPx(item: any): string {
  if (item.name === '6 MONTHS PREMIUM') return '14.8px';
  if (
    item.type === 'shop-texture-category' ||
    item.type === 'booking-consult' ||
    item.type === 'booking-appointment'
  ) {
    return '21px';
  }
  if (item.name === 'NOIR') return '22px';
  return '21px';
}

/** Gift / membership / generic digital rows use the tighter vertical stack treatment (not A/C or BCF). */
export function orderStripUseDigitalStackLayout(item: any, isSubscriptionUpgrade: boolean): boolean {
  if (item.name === 'GIFT CARD' || item.type === 'gift-card') return true;
  if (item.type === 'digital' && isSubscriptionUpgrade) return true;
  return isMembershipTierStripItem(item, isSubscriptionUpgrade);
}
