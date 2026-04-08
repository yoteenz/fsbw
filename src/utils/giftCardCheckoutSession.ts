import { isGiftCardCartLine } from './giftCardCheckout';

export type WriteGiftCardCheckoutOpts = {
  balanceUsd: number;
  /** Cart line image; tools hub and PDP use different assets */
  image?: string;
};

/**
 * Puts exactly one gift-card line at the front of the bag (removes prior gift-card lines),
 * updates cartCount from line quantities, persists, and dispatches cart sync events.
 * Caller should navigate to `/checkout/gift-card` after.
 */
export function writeGiftCardSelectionForCheckoutSession(opts: WriteGiftCardCheckoutOpts): number {
  const balanceUsd = opts.balanceUsd;
  const image = opts.image ?? '/assets/giftcard-product.png';

  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  const prior = Array.isArray(cartItems) ? cartItems : [];
  const newItem = {
    id: `gift-card-${balanceUsd}-${Date.now()}`,
    name: 'GIFT CARD',
    price: balanceUsd,
    quantity: 1,
    balance: balanceUsd,
    image,
    type: 'gift-card',
  };
  const withoutGiftLines = prior.filter((i: { type?: string; name?: string }) => !isGiftCardCartLine(i));
  const updatedCartItems = [newItem, ...withoutGiftLines];
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
