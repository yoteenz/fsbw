export type WriteGiftCardCheckoutOpts = {
  balanceUsd: number;
  /** Cart line image; tools hub and PDP use different assets */
  image?: string;
};

/**
 * Isolated gift-card checkout: **replaces** the bag with exactly one gift-card line (same idea as
 * `/checkout/gift-card` filtering — no units, BCF, bookings, etc. left in storage).
 * Updates cartCount, persists, and dispatches cart sync events. Caller navigates to `/checkout/gift-card`.
 */
export function writeGiftCardSelectionForCheckoutSession(opts: WriteGiftCardCheckoutOpts): number {
  const balanceUsd = opts.balanceUsd;
  const image = opts.image ?? '/assets/giftcard-product.png';

  const newItem = {
    id: `gift-card-${balanceUsd}-${Date.now()}`,
    name: 'GIFT CARD',
    price: balanceUsd,
    quantity: 1,
    balance: balanceUsd,
    giftCardUnitUsd: balanceUsd,
    image,
    type: 'gift-card',
  };
  const updatedCartItems = [newItem];
  localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

  const newCartCount = updatedCartItems.reduce(
    (sum: number, row: { quantity?: number }) => sum + (row.quantity || 1),
    0
  );
  localStorage.setItem('cartCount', String(newCartCount));

  window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
  window.dispatchEvent(new CustomEvent('cartItemsChanged'));
  window.dispatchEvent(new Event('cartUpdated'));

  return newCartCount;
}
