import { isSubscriptionTierId } from '../constants/subscriptionPricing';
import { bcfResolveCartLineUnitPriceUsd } from './bcfProductOptions';
import { giftCardLineTotalUsd, isGiftCardCartLine } from './giftCardCheckout';
import { isLineItemOutOfStock } from './productInventoryAvailability';

function isMembershipSubscriptionCartLine(item: {
  name?: string;
  type?: string;
  subscriptionTier?: string;
}): boolean {
  if (isGiftCardCartLine(item)) return false;
  const st = item.subscriptionTier;
  if (typeof st === 'string' && isSubscriptionTierId(st)) return true;
  return item.type === 'digital' && /\b(3|6|12)\s*MONTHS\b/i.test(String(item.name || ''));
}

/** Lines that count toward cart/bag/checkout totals (excludes sold-out wig units). */
export function isBillableCartLine(item?: {
  name?: string;
  productName?: string;
  type?: string;
  isSpecialOffer?: boolean;
} | null): boolean {
  if (!item) return false;
  return !isLineItemOutOfStock(item);
}

export function filterBillableCartLines<T extends { name?: string; productName?: string; type?: string }>(
  items: T[] | null | undefined
): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => isBillableCartLine(item));
}

/** Extended line price in USD (quantity-aware; gift cards use line total helper). */
export function cartLineExtendedPriceUsd(item: {
  price?: number;
  quantity?: number;
  name?: string;
  type?: string;
  category?: string;
  texture?: string;
  length?: string;
  color?: string;
  lace?: string;
  hairWeight?: string;
  laceTreatment?: string[];
  bcfBundleDeal?: boolean;
  id?: string;
}): number {
  if (isGiftCardCartLine(item)) return giftCardLineTotalUsd(item);
  const qty = item.quantity ?? 1;
  const unit =
    String(item.type || '') === 'shop-texture-category' && !item.bcfBundleDeal
      ? bcfResolveCartLineUnitPriceUsd(item)
      : Number(item.price) || 0;
  return unit * qty;
}

/** Sum of billable line totals only. */
export function cartBillableSubtotal(
  items: Array<{ price?: number; quantity?: number; name?: string; type?: string; productName?: string }> | null | undefined
): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    if (!isBillableCartLine(item)) return sum;
    return sum + cartLineExtendedPriceUsd(item);
  }, 0);
}

/** Billable lines excluding special-offer rows. */
export function cartBillableSubtotalExcludingSpecialOffer(
  items: Array<{
    price?: number;
    quantity?: number;
    name?: string;
    type?: string;
    productName?: string;
    isSpecialOffer?: boolean;
  }> | null | undefined
): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    if (!isBillableCartLine(item) || item.isSpecialOffer) return sum;
    return sum + cartLineExtendedPriceUsd(item);
  }, 0);
}

/** Taxable merchandise (excludes gift cards, digital, and sold-out wig units). */
export function cartBillableTaxableSubtotal(
  items: Array<{ price?: number; quantity?: number; name?: string; type?: string; productName?: string }> | null | undefined
): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    if (!isBillableCartLine(item)) return sum;
    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
    const isDigital = item.type === 'digital';
    if (isGiftCard || isDigital) return sum;
    return sum + cartLineExtendedPriceUsd(item);
  }, 0);
}

/** Quantity units that count toward checkout header / payment (billable lines only). */
/** Points-eligible subtotal (excludes gift cards, digital, consult, membership, sold-out wig units). */
export function cartBillablePointsEligibleSubtotal(
  items: Array<{
    price?: number;
    quantity?: number;
    name?: string;
    type?: string;
    productName?: string;
    subscriptionTier?: string;
  }> | null | undefined
): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    if (!isBillableCartLine(item)) return sum;
    const isGiftCard = item.name === 'GIFT CARD' || item.type === 'gift-card';
    const isDigital = item.type === 'digital';
    const isConsult = item.type === 'booking-consult';
    if (isGiftCard || isDigital || isConsult || isMembershipSubscriptionCartLine(item)) return sum;
    return sum + cartLineExtendedPriceUsd(item);
  }, 0);
}

export function cartBillableQuantityUnits(
  items: Array<{ quantity?: number; name?: string; productName?: string; type?: string }> | null | undefined
): number {
  if (!Array.isArray(items)) return 0;
  return filterBillableCartLines(items).reduce((sum, ci) => sum + (ci.quantity ?? 1), 0);
}
