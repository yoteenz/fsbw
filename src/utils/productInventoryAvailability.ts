import { normalizeCartLineProductName } from './cartCapSizeLineMargin';
import { buildRevenueOrdersList, getDepletedInventory, STARTING_INVENTORY } from './adminRevenueStats';

export type ProductStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export const PRODUCT_INVENTORY_UPDATED_EVENT = 'productInventoryUpdated';

/** Canonical build-a-wig unit SKUs tracked in admin inventory. */
export const WIG_UNIT_PRODUCT_NAMES = Object.keys(STARTING_INVENTORY.products) as string[];

const LOW_STOCK_THRESHOLD = 2;

/**
 * Packaging/supplies consumed to ship ONE order, by product kind. A physical product can only
 * be sold (in stock) when every packaging item it needs still has enough remaining for one
 * order; if any required item is depleted the product is treated as sold out even if the hair
 * itself is in stock — you cannot ship a unit without its box/supplies.
 *
 * Quantities mirror the per-order packaging depletion in `getDepletedInventory`.
 */
export const UNIT_PACKAGING_PER_ORDER: Record<string, number> = {
  'MAILER BOXES': 1,
  'DUST BAGS': 1,
  'BUSINESS CARDS': 2,
  'HANG TAGS': 1,
  'LABELS': 1,
  'ENVELOPES': 1,
  'THANK YOU NOTES': 1,
  'CAMPAIGN FLYERS': 1,
  'MESH POUCH': 1,
  'WHITE HAIR TIES': 2,
  'WHITE DUCK CLIPS': 2,
  'LASHES': 1,
};

/**
 * BCF (bundles / closures / frontals) packaging: same as a unit order EXCEPT label, flyer and
 * dust bag — BCF ships with its own pouch/packaging (the mesh pouch), no label/flyer/dust bag.
 */
export const BCF_PACKAGING_PER_ORDER: Record<string, number> = {
  'MAILER BOXES': 1,
  'BUSINESS CARDS': 2,
  'HANG TAGS': 1,
  'ENVELOPES': 1,
  'THANK YOU NOTES': 1,
  'MESH POUCH': 1,
  'WHITE HAIR TIES': 2,
  'WHITE DUCK CLIPS': 2,
  'LASHES': 1,
};

export function isWigUnitProductName(productName?: string): boolean {
  const name = normalizeCartLineProductName({ name: productName, productName });
  if (!name) return false;
  return WIG_UNIT_PRODUCT_NAMES.includes(name);
}

export function getWigProductRemainingUnits(productName?: string): number {
  const name = normalizeCartLineProductName({ name: productName, productName });
  if (!name || !isWigUnitProductName(name)) return 0;
  const depleted = getDepletedInventory(buildRevenueOrdersList());
  return Math.max(0, Number(depleted.products[name] ?? 0));
}

/**
 * How many orders can still ship given current packaging stock — the smallest
 * `floor(remaining / perOrder)` across every required packaging item. `Infinity` means no
 * packaging item is a constraint (treated as effectively unlimited for the min() below).
 */
export function getPackagingShippableUnits(requirements: Record<string, number>): number {
  const packaging = getDepletedInventory(buildRevenueOrdersList()).packaging || {};
  let limit = Infinity;
  for (const [key, perOrder] of Object.entries(requirements)) {
    if (!perOrder || perOrder <= 0) continue;
    const remaining = Math.max(0, Number(packaging[key] ?? 0));
    limit = Math.min(limit, Math.floor(remaining / perOrder));
  }
  return limit;
}

function stockStatusFromCount(remaining: number): ProductStockStatus {
  if (remaining <= 0) return 'out_of_stock';
  if (remaining <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

export function getWigProductStockStatus(productName?: string): ProductStockStatus {
  if (!isWigUnitProductName(productName)) return 'in_stock';
  const remaining = getWigProductRemainingUnits(productName);
  // Effective availability is capped by both the hair units AND the packaging needed to ship.
  const packagingLimit = getPackagingShippableUnits(UNIT_PACKAGING_PER_ORDER);
  return stockStatusFromCount(Math.min(remaining, packagingLimit));
}

export function isWigUnitSoldOut(productName?: string): boolean {
  return getWigProductStockStatus(productName) === 'out_of_stock';
}

/**
 * BCF products have no per-unit hair cap, so their availability is gated purely by their
 * (label/flyer/dust-bag-free) packaging supplies.
 */
export function getBcfStockStatus(): ProductStockStatus {
  const packagingLimit = getPackagingShippableUnits(BCF_PACKAGING_PER_ORDER);
  if (!Number.isFinite(packagingLimit)) return 'in_stock';
  return stockStatusFromCount(packagingLimit);
}

export function isBcfSoldOut(): boolean {
  return getBcfStockStatus() === 'out_of_stock';
}

/** Live status for a cart / wishlist line (wig units + BCF, both packaging-aware). */
export function getLineItemStockStatus(item?: {
  name?: string;
  productName?: string;
  type?: string;
}): ProductStockStatus {
  if (!item) return 'in_stock';
  const type = String(item.type || '').toLowerCase();
  if (type === 'gift-card' || type === 'digital' || type === 'booking-appointment' || type === 'booking-consult') {
    return 'in_stock';
  }
  if (type === 'shop-texture-category') return getBcfStockStatus();
  const name = item.name ?? item.productName;
  if (!isWigUnitProductName(name)) return 'in_stock';
  return getWigProductStockStatus(name);
}

export function isLineItemOutOfStock(item?: { name?: string; productName?: string; type?: string }): boolean {
  return getLineItemStockStatus(item) === 'out_of_stock';
}

export function attachStockStatusToLineItem<T extends Record<string, unknown>>(item: T): T & { stockStatus: ProductStockStatus } {
  return { ...item, stockStatus: getLineItemStockStatus(item) };
}

export function dispatchProductInventoryUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PRODUCT_INVENTORY_UPDATED_EVENT));
}
