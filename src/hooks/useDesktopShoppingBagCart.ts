import { useCallback, useEffect, useMemo, useState } from 'react';
import { cartBillableSubtotal, cartLineExtendedPriceUsd } from '../utils/cartBillableLines';
import { cartTotalQuantityUnits } from '../utils/cartTotalQuantityUnits';
import {
  giftCardLineTotalUsd,
  isGiftCardCartLine,
} from '../utils/giftCardCheckout';
import { applyGiftCardBagQuantityDelta } from '../utils/giftCardCheckout';
import { maybeRestoreGiftCardCheckoutCartAfterAbandon } from '../utils/giftCardCheckoutSession';
import { isBookingCartLine } from '../utils/bookingCheckout';
import { isSlayTicketPackCartLine } from '../utils/slayTicketCheckout';
import { trackActivity } from '../utils/activity';
import {
  ACCOUNT_COMMERCE_SYNC_EVENT,
  loadCommerceCartFromStorage,
  persistCartItemsToLocalStorage,
} from '../utils/cartLocalStorage';

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
  const [cartItems, setCartItems] = useState<any[]>(() => loadCommerceCartFromStorage());
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set());

  const reload = useCallback(() => {
    setCartItems(loadCommerceCartFromStorage());
  }, []);

  useEffect(() => {
    // Guard hydrates localStorage before this page mounts; re-read on mount so the tablet
    // never sticks on an empty initial snapshot from a parallel sync race.
    reload();
  }, [reload]);

  useEffect(() => {
    const onChange = () => reload();
    window.addEventListener('cartUpdated', onChange);
    window.addEventListener('cartItemsChanged', onChange);
    window.addEventListener(ACCOUNT_COMMERCE_SYNC_EVENT, onChange);
    const onStorage = (event: StorageEvent) => {
      if (event.key != null && event.key !== 'cartItems' && event.key !== 'cartCount') return;
      reload();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cartUpdated', onChange);
      window.removeEventListener('cartItemsChanged', onChange);
      window.removeEventListener(ACCOUNT_COMMERCE_SYNC_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [reload]);

  const itemCount = useMemo(() => cartTotalQuantityUnits(cartItems), [cartItems]);
  const subtotal = useMemo(() => cartBillableSubtotal(cartItems), [cartItems]);

  const removeItem = useCallback((itemId: string) => {
    setRemovingIds((prev) => new Set(prev).add(itemId));

    window.setTimeout(() => {
      try {
        const current = loadCommerceCartFromStorage();
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
          persistCartItemsToLocalStorage(finalItems);
        } else {
          persistCartItemsToLocalStorage(newItems);
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
        const current = loadCommerceCartFromStorage();
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
          persistCartItemsToLocalStorage(next);
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
        persistCartItemsToLocalStorage(next);
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
