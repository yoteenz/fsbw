/** Bump when re-baking `public/assets/lobby-payment/*` (Vercel caches `/assets/*` for 1 year). */
export const LOBBY_PAYMENT_ICONS_VERSION = 'taW3ckz1';

/** Supabase green-screen sheet (re-bake with `npm run lobby:bake-payment-icons`). */
export const LOBBY_PAYMENT_ICONS_SRC_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz.jpeg';

/** Shared popover shell size (phone contact + register payment). */
export const LOBBY_CASE_POPOVER_WIDTH_PX = 220;
export const LOBBY_CASE_POPOVER_MIN_HEIGHT_PX = 200;

export type LobbyPaymentIcon = {
  id: string;
  label: string;
  src: string;
};

function paymentIconPath(slug: string): string {
  return `/assets/lobby-payment/${slug}.png?v=${LOBBY_PAYMENT_ICONS_VERSION}`;
}

/** Checkout-aligned methods present on the payment sheet (no Google Pay in source art). */
/** Row-major in a 2-column grid: cards → express → pay over time. */
export const LOBBY_PAYMENT_ICONS: readonly LobbyPaymentIcon[] = [
  { id: 'visa', label: 'Visa', src: paymentIconPath('visa') },
  { id: 'mastercard', label: 'Mastercard', src: paymentIconPath('mastercard') },
  { id: 'amex', label: 'American Express', src: paymentIconPath('amex') },
  { id: 'discover', label: 'Discover', src: paymentIconPath('discover') },
  { id: 'apple-pay', label: 'Apple Pay', src: paymentIconPath('apple-pay') },
  { id: 'shop-pay', label: 'Shop Pay', src: paymentIconPath('shop-pay') },
  { id: 'paypal', label: 'PayPal', src: paymentIconPath('paypal') },
  { id: 'afterpay', label: 'Afterpay', src: paymentIconPath('afterpay') },
  { id: 'affirm', label: 'Affirm', src: paymentIconPath('affirm') },
  { id: 'klarna', label: 'Klarna', src: paymentIconPath('klarna') },
];
