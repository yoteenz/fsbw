/** Bump when re-baking `public/assets/lobby-payment/*` (Vercel caches `/assets/*` for 1 year). */
export const LOBBY_PAYMENT_ICONS_VERSION = 'taW3ckz4';

const PAYMENT_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder';

/** Multi-logo sheet — only Mastercard + Klarna still cropped here. */
export const LOBBY_PAYMENT_ICONS_SHEET_SRC_REMOTE = `${PAYMENT_BASE}/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz.jpeg`;

/** Per-logo Supabase sources (re-bake with `npm run lobby:bake-payment-icons`). */
export const LOBBY_PAYMENT_ICON_REMOTES = {
  visa: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(8).jpeg`,
  amex: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(6).jpeg`,
  discover: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(7).jpeg`,
  affirm: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz.jpeg`,
  'apple-pay': `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(3).jpeg`,
  paypal: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(4).jpeg`,
  'shop-pay': `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(1).jpeg`,
  'google-pay': `${PAYMENT_BASE}/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(1).jpeg`,
  afterpay: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(2).jpeg`,
} as const;

/** @deprecated Use LOBBY_PAYMENT_ICONS_SHEET_SRC_REMOTE */
export const LOBBY_PAYMENT_ICONS_SRC_REMOTE = LOBBY_PAYMENT_ICONS_SHEET_SRC_REMOTE;

/** @deprecated Use LOBBY_PAYMENT_ICON_REMOTES */
export const LOBBY_GOOGLE_PAY_ICON_SRC_REMOTE = LOBBY_PAYMENT_ICON_REMOTES['google-pay'];

/** @deprecated Use LOBBY_PAYMENT_ICON_REMOTES */
export const LOBBY_SHOP_PAY_ICON_SRC_REMOTE = LOBBY_PAYMENT_ICON_REMOTES['shop-pay'];

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

/** Row-major in a 2-column grid: cards → express → pay over time. */
export const LOBBY_PAYMENT_ICONS: readonly LobbyPaymentIcon[] = [
  { id: 'visa', label: 'Visa', src: paymentIconPath('visa') },
  { id: 'mastercard', label: 'Mastercard', src: paymentIconPath('mastercard') },
  { id: 'amex', label: 'American Express', src: paymentIconPath('amex') },
  { id: 'discover', label: 'Discover', src: paymentIconPath('discover') },
  { id: 'apple-pay', label: 'Apple Pay', src: paymentIconPath('apple-pay') },
  { id: 'shop-pay', label: 'Shop Pay', src: paymentIconPath('shop-pay') },
  { id: 'paypal', label: 'PayPal', src: paymentIconPath('paypal') },
  { id: 'google-pay', label: 'Google Pay', src: paymentIconPath('google-pay') },
  { id: 'afterpay', label: 'Afterpay', src: paymentIconPath('afterpay') },
  { id: 'affirm', label: 'Affirm', src: paymentIconPath('affirm') },
  { id: 'klarna', label: 'Klarna', src: paymentIconPath('klarna') },
];
