import { useCallback, useEffect, useMemo, useState } from 'react';
import { sortCartPremiumBookingFirst } from '../utils/bookingCart';
import { cartBillableSubtotal, cartLineExtendedPriceUsd } from '../utils/cartBillableLines';
import { cartTotalQuantityUnits } from '../utils/cartTotalQuantityUnits';
import {
  giftCardLineTotalUsd,
  isGiftCardCartLine,
  migrateGiftCardCartLinesForStorage,
} from '../utils/giftCardCheckout';
import { applyGiftCardBagQuantityDelta } from '../utils/giftCardCheckout';
import { maybeRestoreGiftCardCheckoutCartAfterAbandon } from '../utils/giftCardCheckoutSession';
import { isBookingCartLine } from '../utils/bookingCheckout';
import { isSlayTicketPackCartLine } from '../utils/slayTicketCheckout';
import { attachStockStatusToLineItem } from '../utils/productInventoryAvailability';
import { stripIneligibleBcfBundleDealLines } from '../utils/premiumMemberAccess';
import { trackActivity } from '../utils/activity';

function clampCartRows(items: any[]): any[] {
  return items.map((i: any) => {
    let row = i;
    if (i.consultOfferQtyLocked === true) row = { ...row, quantity: 1 };
    if (i.isSpecialOffer && (i.quantity ?? 1) > 2) row = { ...row, quantity: 2 };
    if (i.bcfBundleDeal) row = { ...row, quantity: 3 };
    return row;
  });
}

function persistCart(items: any[]) {
  localStorage.setItem('cartItems', JSON.stringify(items));
  const newCount = items.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
  localStorage.setItem('cartCount', String(newCount));
  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
  window.dispatchEvent(new Event('cartUpdated'));
  return newCount;
}

function loadCartFromStorage(): any[] {
  try {
    const stored = localStorage.getItem('cartItems');
    if (!stored) return [];
    const items = JSON.parse(stored);
    if (!Array.isArray(items)) return [];

    const clamped = clampCartRows(items);
    const cartChanged = items.some(
      (i: any, idx: number) => (i.quantity ?? 1) !== (clamped[idx].quantity ?? 1),
    );
    if (cartChanged) {
      persistCart(clamped);
    }

    const giftMigrated = migrateGiftCardCartLinesForStorage(clamped);
    let afterGift = giftMigrated.next;
    if (giftMigrated.changed) {
      persistCart(afterGift);
    }

    const strip = stripIneligibleBcfBundleDealLines(afterGift);
    if (strip.removedUnitCount > 0) {
      persistCart(strip.next);
      return sortCartPremiumBookingFirst(
        strip.next.map((row: any) => attachStockStatusToLineItem(row)),
      );
    }

    return sortCartPremiumBookingFirst(
      afterGift.map((row: any) => attachStockStatusToLineItem(row)),
    );
  } catch {
    return [];
  }
}

export function resolveCartLineDisplayPriceUsd(item: any): number {
  if (isGiftCardCartLine(item)) {
    return giftCardLineTotalUsd(item);
  }
  if (item.type === 'shop-texture-category') {
    return cartLineExtendedPriceUsd(item);
  }
  const qty = item.quantity ?? 1;
  return (Number(item.price) || 0) * qty;
}

export function formatCuratedCollectionPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function useDesktopShoppingBagCart() {
  const [cartItems, setCartItems] = useState<any[]>(() => loadCartFromStorage());
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set());

  const reload = useCallback(() => {
    setCartItems(loadCartFromStorage());
  }, []);

  useEffect(() => {
    const onChange = () => reload();
    window.addEventListener('cartUpdated', onChange);
    window.addEventListener('cartItemsChanged', onChange);
    window.addEventListener('storage', onChange);
    window.addEventListener('focus', onChange);
    return () => {
      window.removeEventListener('cartUpdated', onChange);
      window.removeEventListener('cartItemsChanged', onChange);
      window.removeEventListener('storage', onChange);
      window.removeEventListener('focus', onChange);
    };
  }, [reload]);

  const itemCount = useMemo(() => cartTotalQuantityUnits(cartItems), [cartItems]);
  const subtotal = useMemo(() => cartBillableSubtotal(cartItems), [cartItems]);

  const removeItem = useCallback((itemId: string) => {
    setRemovingIds((prev) => new Set(prev).add(itemId));

    window.setTimeout(() => {
      try {
        const current = loadCartFromStorage();
        const removed = current.find((i) => i.id === itemId);
        const label = (removed?.name || removed?.productName || '').toString().trim();
        const newItems = current.filter((i) => i.id !== itemId);

        const restoredCount = maybeRestoreGiftCardCheckoutCartAfterAbandon(newItems);
        let finalItems = newItems;
        if (restoredCount != null) {
          try {
            finalItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
          } catch {
            finalItems = newItems;
          }
          persistCart(finalItems);
        } else {
          persistCart(newItems);
        }

        setCartItems(finalItems);
        trackActivity('remove_from_cart', {
          source: 'desktop_shopping_bag',
          change: 'removed_line',
          productName: label || undefined,
        });
      } catch {
        /* ignore */
      } finally {
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    }, 280);
  }, []);

  const changeQuantity = useCallback(
    (itemId: string, delta: number) => {
      try {
        const current = loadCartFromStorage();
        const currentItem = current.find((i) => i.id === itemId);
        if (!currentItem) return;
        if (currentItem.consultOfferQtyLocked === true) return;
        if (currentItem.bcfBundleDeal) return;
        if (isBookingCartLine(currentItem) || isSlayTicketPackCartLine(currentItem)) return;

        const giftDelta = applyGiftCardBagQuantityDelta(currentItem, delta > 0 ? 1 : -1);
        if (giftDelta) {
          if (giftDelta.atMax) return;
          if (giftDelta.removeLine) {
            removeItem(itemId);
            return;
          }
          const next = current.map((i) => (i.id === itemId ? giftDelta.next : i));
          persistCart(next);
          setCartItems(next);
          return;
        }

        const maxQty = currentItem.isSpecialOffer ? 2 : 10;
        const currentQty = currentItem.quantity ?? 1;
        const newQty = currentQty + delta;
        if (newQty <= 0) {
          removeItem(itemId);
          return;
        }
        const clampedQty = Math.max(1, Math.min(maxQty, newQty));
        const next = current.map((i) => (i.id === itemId ? { ...i, quantity: clampedQty } : i));
        persistCart(next);
        setCartItems(next);
        trackActivity(delta > 0 ? 'add_to_cart' : 'remove_from_cart', {
          source: 'desktop_acquisition',
          change: delta > 0 ? 'quantity_up' : 'quantity_down',
          productName: (currentItem.name || currentItem.productName || '').toString().trim() || undefined,
        });
      } catch {
        /* ignore */
      }
    },
    [removeItem],
  );

  return {
    cartItems,
    itemCount,
    subtotal,
    removingIds,
    removeItem,
    changeQuantity,
    reload,
  };
}
