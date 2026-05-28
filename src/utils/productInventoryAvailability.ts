import { normalizeCartLineProductName } from './cartCapSizeLineMargin';
import { buildRevenueOrdersList, getDepletedInventory, STARTING_INVENTORY } from './adminRevenueStats';

export type ProductStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export const PRODUCT_INVENTORY_UPDATED_EVENT = 'productInventoryUpdated';

/** Canonical build-a-wig unit SKUs tracked in admin inventory. */
export const WIG_UNIT_PRODUCT_NAMES = Object.keys(STARTING_INVENTORY.products) as string[];

const LOW_STOCK_THRESHOLD = 2;

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

export function getWigProductStockStatus(productName?: string): ProductStockStatus {
  if (!isWigUnitProductName(productName)) return 'in_stock';
  const remaining = getWigProductRemainingUnits(productName);
  if (remaining <= 0) return 'out_of_stock';
  if (remaining <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

export function isWigUnitSoldOut(productName?: string): boolean {
  return getWigProductStockStatus(productName) === 'out_of_stock';
}

/** Live status for a cart / wishlist line (wig units only). */
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
  if (type === 'shop-texture-category') return 'in_stock';
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
