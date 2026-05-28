import { useEffect, useMemo, useState } from 'react';
import {
  PRODUCT_INVENTORY_UPDATED_EVENT,
  getWigProductRemainingUnits,
  getWigProductStockStatus,
  isWigUnitSoldOut,
  type ProductStockStatus,
} from '../utils/productInventoryAvailability';
import { syncStoredLinesStockStatus } from '../utils/syncStoredLinesStockStatus';

/**
 * Re-read admin inventory (local orders + optional override) when cart/focus/inventory changes.
 */
export function useProductInventorySnapshot() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => {
      syncStoredLinesStockStatus();
      setVersion((v) => v + 1);
    };
    bump();
    window.addEventListener('focus', bump);
    window.addEventListener('cartUpdated', bump);
    window.addEventListener('wishlistUpdated', bump);
    window.addEventListener(PRODUCT_INVENTORY_UPDATED_EVENT, bump);
    return () => {
      window.removeEventListener('focus', bump);
      window.removeEventListener('cartUpdated', bump);
      window.removeEventListener('wishlistUpdated', bump);
      window.removeEventListener(PRODUCT_INVENTORY_UPDATED_EVENT, bump);
    };
  }, []);

  return useMemo(
    () => ({
      version,
      getStatus: (productName?: string): ProductStockStatus => getWigProductStockStatus(productName),
      isSoldOut: (productName?: string): boolean => isWigUnitSoldOut(productName),
      remainingUnits: (productName?: string): number => getWigProductRemainingUnits(productName),
    }),
    [version]
  );
}
