/**
 * Loyalty base (USD) for 1:1 points before tier multipliers: merchandise that earns points,
 * minus discounts that apply to that pool (codes, referral, digital cash, vouchers, consult codes).
 * Matches intent: $100 cart − $20 discount → 80 base points (before tier multiplier).
 */

type CartItemLike = {
  name?: string;
  type?: string;
  isSpecialOffer?: boolean;
  price?: number;
  quantity?: number;
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

function lineTotal(item: CartItemLike): number {
  return (item.price || 0) * (item.quantity || 1);
}

function isBookingLine(item: CartItemLike): boolean {
  return item.type === 'booking-appointment' || item.type === 'booking-consult';
}

export function computePointsEligibleNetUsd(p: PointsEligibleNetParams): number {
  const { cartItems, hasSpecialOfferInCart, hasOnlySpecialOfferInCart, orderAmount, orderAmountExcludingSpecialOffer } =
    p;

  let peGross = 0;
  let peBooking = 0;
  for (const item of cartItems) {
    if (isGiftCard(item) || isDigital(item)) continue;
    const lt = lineTotal(item);
    peGross += lt;
    if (isBookingLine(item)) peBooking += lt;
  }

  const peMerch = Math.max(0, peGross - peBooking);
  const consultSubMerch = Math.min(p.consultDiscountAmount, peMerch);

  const stackAndVoucher =
    p.effectiveDiscount + p.effectiveReferralDiscount + p.effectiveGiftCardDiscount + p.voucherDiscount;

  const mixedSpecial = hasSpecialOfferInCart && !hasOnlySpecialOfferInCart;

  if (!mixedSpecial) {
    const pool =
      !hasSpecialOfferInCart || hasOnlySpecialOfferInCart ? orderAmount : orderAmountExcludingSpecialOffer;
    // Allocate codes / digital cash / vouchers only against merchandise; booking deposits (consult, etc.) earn 1:1 on line total — not “doubled” via full-cart proration.
    const allocatedToMerch = pool > 0 && peMerch >= 0 ? (stackAndVoucher * peMerch) / pool : 0;
    const merchNet = Math.max(0, peMerch - consultSubMerch - allocatedToMerch);
    const net = merchNet + peBooking;
    return Math.round(net * 100) / 100;
  }

  const pool = orderAmountExcludingSpecialOffer;
  let peSpecialPhysical = 0;
  let pePool = 0;
  for (const item of cartItems) {
    if (isGiftCard(item) || isDigital(item)) continue;
    const lt = lineTotal(item);
    if (item.isSpecialOffer) peSpecialPhysical += lt;
    else pePool += lt;
  }

  let peBookingInPool = 0;
  for (const item of cartItems) {
    if (isGiftCard(item) || isDigital(item)) continue;
    if (item.isSpecialOffer) continue;
    if (isBookingLine(item)) peBookingInPool += lineTotal(item);
  }
  const peNonBookingPool = Math.max(0, pePool - peBookingInPool);
  const consultSubPool = Math.min(p.consultDiscountAmount, peNonBookingPool);

  const allocatedToMerchInPool = pool > 0 ? (stackAndVoucher * peNonBookingPool) / pool : 0;
  const merchNetInPool = Math.max(0, peNonBookingPool - allocatedToMerchInPool - consultSubPool);
  const netPool = merchNetInPool + peBookingInPool;
  return Math.round((peSpecialPhysical + netPool) * 100) / 100;
}
