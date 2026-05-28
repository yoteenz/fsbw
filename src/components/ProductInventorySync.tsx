import { useEffect } from 'react';
import { PRODUCT_INVENTORY_UPDATED_EVENT } from '../utils/productInventoryAvailability';
import { syncStoredLinesStockStatus } from '../utils/syncStoredLinesStockStatus';
import { processUnitStockNotifyWaitlistOnInventoryUpdate } from '../utils/unitStockNotify';

/** Keeps cart / wishlist `stockStatus` aligned with admin inventory. */
export default function ProductInventorySync() {
  useEffect(() => {
    const run = () => {
      syncStoredLinesStockStatus();
      processUnitStockNotifyWaitlistOnInventoryUpdate();
    };
    run();
    window.addEventListener('focus', run);
    window.addEventListener('cartUpdated', run);
    window.addEventListener('storage', run);
    window.addEventListener(PRODUCT_INVENTORY_UPDATED_EVENT, run);
    return () => {
      window.removeEventListener('focus', run);
      window.removeEventListener('cartUpdated', run);
      window.removeEventListener('storage', run);
      window.removeEventListener(PRODUCT_INVENTORY_UPDATED_EVENT, run);
    };
  }, []);
  return null;
}
