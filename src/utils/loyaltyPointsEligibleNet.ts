/**
 * Loyalty base (USD) for 1:1 points before tier multipliers: merchandise that earns points,
 * minus discounts that apply to that pool (codes, referral, digital cash, vouchers, consult codes).
 * Matches intent: $100 cart − $20 discount → 80 base points (before tier multiplier).
 *
 * No points from: gift cards, `digital` lines, premium membership subscription/upgrade lines,
 * or `booking-consult`. Appointment deposits (`booking-appointment`) earn points.
 */

import { isSubscriptionTierId } from '../constants/subscriptionPricing';

type CartItemLike = {
  name?: string;
  type?: string;
  isSpecialOffer?: boolean;
  price?: number;
  quantity?: number;
  subscriptionTier?: string;
};

export type PointsEligibleNetParams = {
  cartItems: CartItemLike[];
  hasSpecialOfferInCart: boolean;
  hasOnlySpecialOfferInCart: boolean;
  orderAmount: number;
  orderAmountExcludingSpecialOffer: number;
  effectiveDiscount: number;
  effectiveReferralDiscount: number;
  effectiveGiftCardDiscount: number;
  voucherDiscount: number;
  consultDiscountAmount: number;
};

function isGiftCard(item: CartItemLike): boolean {
  return item.name === 'GIFT CARD' || item.type === 'gift-card';
}

function isDigital(item: CartItemLike): boolean {
  return item.type === 'digital';
}

/** Premium membership cart line (upgrade / new subscription) — same shape as checkout confirm. */
export function isMembershipSubscriptionCartLine(item: CartItemLike | null | undefined): boolean {
  if (!item || isGiftCard(item)) return false;
  const st = item.subscriptionTier;
  if (typeof st === 'string' && isSubscriptionTierId(st)) return true;
  return (
    item.type === 'digital' && /\b(3|6|12)\s*MONTHS\b/i.test(String(item.name || ''))
  );
}

/** True if the cart contains at least one line that can earn loyalty points at checkout. */
export function cartHasAnyLoyaltyEarningLine(cartItems: CartItemLike[] | null | undefined): boolean {
  if (!cartItems || cartItems.length === 0) return false;
  for (const item of cartItems) {
    if (isGiftCard(item) || isDigital(item) || isMembershipSubscriptionCartLine(item)) continue;
    if (item.type === 'booking-consult') continue;
    return true;
  }
  return false;
}

function lineTotal(item: CartItemLike): number {
  return (item.price || 0) * (item.quantity || 1);
}

/** Any A/C line — excluded from "merchandise" when allocating stack discounts to merch vs booking. */
function isAnyBookingLine(item: CartItemLike): boolean {
  return item.type === 'booking-appointment' || item.type === 'booking-consult';
}

/** Only appointment deposits earn loyalty points (consult excluded). */
function isAppointmentBookingLine(item: CartItemLike): boolean {
  return item.type === 'booking-appointment';
}

export function computePointsEligibleNetUsd(p: PointsEligibleNetParams): number {
  const { cartItems, hasSpecialOfferInCart, hasOnlySpecialOfferInCart, orderAmount, orderAmountExcludingSpecialOffer } =
    p;

  let peGross = 0;
  let peBookingForMerchSplit = 0;
  let peAppointmentBooking = 0;
  for (const item of cartItems) {
    if (isGiftCard(item) || isDigital(item) || isMembershipSubscriptionCartLine(item)) continue;
    const lt = lineTotal(item);
    peGross += lt;
    if (isAnyBookingLine(item)) {
      peBookingForMerchSplit += lt;
      if (isAppointmentBookingLine(item)) peAppointmentBooking += lt;
    }
  }

  const peMerch = Math.max(0, peGross - peBookingForMerchSplit);
  const consultSubMerch = Math.min(p.consultDiscountAmount, peMerch);

  const stackAndVoucher =
    p.effectiveDiscount + p.effectiveReferralDiscount + p.effectiveGiftCardDiscount + p.voucherDiscount;

  const mixedSpecial = hasSpecialOfferInCart && !hasOnlySpecialOfferInCart;

  if (!mixedSpecial) {
    const pool =
      !hasSpecialOfferInCart || hasOnlySpecialOfferInCart ? orderAmount : orderAmountExcludingSpecialOffer;
    // Allocate codes / digital cash / vouchers only against merchandise; appointment deposits add 1:1 after merch net.
    const allocatedToMerch = pool > 0 && peMerch >= 0 ? (stackAndVoucher * peMerch) / pool : 0;
    const merchNet = Math.max(0, peMerch - consultSubMerch - allocatedToMerch);
    const net = merchNet + peAppointmentBooking;
    return Math.round(net * 100) / 100;
  }

  const pool = orderAmountExcludingSpecialOffer;
  let peSpecialPhysical = 0;
  let pePool = 0;
  for (const item of cartItems) {
    if (isGiftCard(item) || isDigital(item) || isMembershipSubscriptionCartLine(item)) continue;
    const lt = lineTotal(item);
    if (item.isSpecialOffer) peSpecialPhysical += lt;
    else pePool += lt;
  }

  let peAppointmentBookingInPool = 0;
  let peConsultInPool = 0;
  for (const item of cartItems) {
    if (isGiftCard(item) || isDigital(item) || isMembershipSubscriptionCartLine(item)) continue;
    if (item.isSpecialOffer) continue;
    if (isAppointmentBookingLine(item)) peAppointmentBookingInPool += lineTotal(item);
    else if (item.type === 'booking-consult') peConsultInPool += lineTotal(item);
  }
  const peNonBookingPool = Math.max(0, pePool - peAppointmentBookingInPool - peConsultInPool);
  const consultSubPool = Math.min(p.consultDiscountAmount, peNonBookingPool);

  const allocatedToMerchInPool = pool > 0 ? (stackAndVoucher * peNonBookingPool) / pool : 0;
  const merchNetInPool = Math.max(0, peNonBookingPool - allocatedToMerchInPool - consultSubPool);
  const netPool = merchNetInPool + peAppointmentBookingInPool;
  return Math.round((peSpecialPhysical + netPool) * 100) / 100;
}
