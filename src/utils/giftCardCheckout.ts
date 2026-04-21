/** Gift card cart lines — isolated checkout at `/checkout/gift-card`. */

export function isGiftCardCartLine(item: { type?: string; name?: string } | null | undefined): boolean {
  return item?.name === 'GIFT CARD' || item?.type === 'gift-card';
}

/**
 * USD total for one gift-card line (single line = full card value). Prefer `balance` then `price`;
 * multiply by `quantity` only for legacy rows before migration (multiple physical cards).
 */
export function giftCardLineTotalUsd(item: { price?: number; balance?: number; quantity?: number } | null | undefined): number {
  if (!item) return 0;
  const per = Math.round(Number(item.balance ?? item.price) || 0);
  const q = Math.max(1, Math.floor(Number(item.quantity) || 1));
  return Math.round(per * q);
}

/**
 * Gift-card **step count** for QTY display (matches shopping bag: total value / unit step).
 */
export function giftCardStripQuantitySteps(item: {
  type?: string;
  name?: string;
  giftCardUnitUsd?: number;
  price?: number;
  balance?: number;
}): number {
  if (!isGiftCardCartLine(item)) return 0;
  const u = Math.round(Number(item.giftCardUnitUsd) || Number(item.price) || Number(item.balance) || 0);
  const total = Math.round(Number(item.balance ?? item.price) || 0);
  if (u <= 0) return total > 0 ? 1 : 0;
  return Math.max(0, Math.round(total / u));
}

export function filterGiftCardCartLines<T extends { type?: string; name?: string }>(items: T[]): T[] {
  return (items || []).filter((i) => isGiftCardCartLine(i));
}

export function isGiftCardCheckoutPath(pathname: string): boolean {
  return pathname.includes('/checkout/gift-card');
}

/** True when `/checkout/gift-card` is showing a non-empty cart of only gift card lines. */
export function isGiftCardOnlyCheckoutState(
  pathname: string,
  items: { type?: string; name?: string }[]
): boolean {
  return isGiftCardCheckoutPath(pathname) && items.length > 0 && items.every((i) => isGiftCardCartLine(i));
}

type GiftCardLineish = {
  name?: string;
  type?: string;
  price?: number;
  balance?: number;
  quantity?: number;
  giftCardUnitUsd?: number;
};

/**
 * Shopping-bag +/- for gift cards: one line = one purchasable card whose **value** is `price`/`balance`
 * (quantity stays **1**). `giftCardUnitUsd` remembers the per-step increment (defaults to initial `price`).
 * Returns `null` for non–gift lines.
 */
const GIFT_CARD_BAG_MAX_UNITS = 10;

export function applyGiftCardBagQuantityDelta<T extends GiftCardLineish>(
  item: T,
  delta: 1 | -1
): { next: T; removeLine: boolean; atMax?: boolean } | null {
  if (!isGiftCardCartLine(item)) return null;
  const unitUsd = Math.max(
    0,
    Math.round(Number(item.giftCardUnitUsd) || Number(item.price) || Number(item.balance) || 0)
  );
  const lineTotalUsd = Math.round(Number(item.balance ?? item.price) || 0);
  if (unitUsd <= 0 && lineTotalUsd <= 0) {
    return { next: item, removeLine: true };
  }
  const u = unitUsd > 0 ? unitUsd : lineTotalUsd;
  if (delta === 1) {
    const nextTotal = lineTotalUsd + u;
    if (nextTotal > u * GIFT_CARD_BAG_MAX_UNITS) {
      return { next: item, removeLine: false, atMax: true };
    }
    return {
      next: {
        ...item,
        quantity: 1,
        price: nextTotal,
        balance: nextTotal,
        giftCardUnitUsd: u,
        name: 'GIFT CARD',
        type: 'gift-card',
      } as T,
      removeLine: false,
    };
  }
  if (lineTotalUsd > u) {
    const nextTotal = lineTotalUsd - u;
    return {
      next: {
        ...item,
        quantity: 1,
        price: nextTotal,
        balance: nextTotal,
        giftCardUnitUsd: u,
        name: 'GIFT CARD',
        type: 'gift-card',
      } as T,
      removeLine: false,
    };
  }
  return {
    next: { ...item, quantity: 0, price: 0, balance: 0, giftCardUnitUsd: u } as T,
    removeLine: true,
  };
}

/**
 * Normalize legacy gift rows: `quantity` > 1 meant multiple cards at `price` each → one line, total value, step unit.
 * Adds `giftCardUnitUsd` when missing so bag +/- stays consistent after reload.
 */
export function migrateGiftCardCartLinesForStorage<T extends GiftCardLineish>(items: T[]): { next: T[]; changed: boolean } {
  let changed = false;
  const next = items.map((item) => {
    if (!isGiftCardCartLine(item)) return item;
    const q = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const perUsd = Math.round(Number(item.price) || Number(item.balance) || 0);
    const existingUnit = item.giftCardUnitUsd != null ? Math.round(Number(item.giftCardUnitUsd)) : null;
    if (q > 1) {
      changed = true;
      const totalUsd = Math.round(perUsd * q);
      const unitUsd = Math.round(totalUsd / q) || perUsd;
      return {
        ...item,
        quantity: 1,
        price: totalUsd,
        balance: totalUsd,
        giftCardUnitUsd: unitUsd,
        name: 'GIFT CARD',
        type: 'gift-card',
      } as T;
    }
    const unitUsd = existingUnit != null && existingUnit > 0 ? existingUnit : perUsd;
    if (existingUnit == null && perUsd > 0) {
      changed = true;
      return {
        ...item,
        quantity: 1,
        price: perUsd,
        balance: perUsd,
        giftCardUnitUsd: unitUsd,
        name: 'GIFT CARD',
        type: 'gift-card',
      } as T;
    }
    return item;
  });
  return { next, changed };
}
