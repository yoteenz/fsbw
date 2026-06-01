/** Bump when re-baking `public/assets/lobby-payment/*` (Vercel caches `/assets/*` for 1 year). */
export const LOBBY_PAYMENT_ICONS_VERSION = 'G7FSLKz4';

const PAYMENT_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/wig-preview-live/Untitled%20folder';

/** Multi-logo sheet — only Mastercard, Discover, Apple Pay still cropped here. */
export const LOBBY_PAYMENT_ICONS_SHEET_SRC_REMOTE = `${PAYMENT_BASE}/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz.jpeg`;

/** Per-logo Supabase sources (re-bake with `npm run lobby:bake-payment-icons`). */
export const LOBBY_PAYMENT_ICON_REMOTES = {
  visa: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(8).jpeg`,
  amex: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(6).jpeg`,
  affirm: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz.jpeg`,
  paypal: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(4).jpeg`,
  'shop-pay': `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(1).jpeg`,
  'google-pay': `${PAYMENT_BASE}/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(1).jpeg`,
  afterpay: `${PAYMENT_BASE}/Payment/taW3ckzkvXh5AtWqFCTrG_0QGW1Akz%20(2).jpeg`,
  klarna: `${PAYMENT_BASE}/Payment/G7FSLK_RM0zy4fC1qM1ab_UWvrk83X.jpeg`,
} as const;

/** @deprecated Use LOBBY_PAYMENT_ICONS_SHEET_SRC_REMOTE */
export const LOBBY_PAYMENT_ICONS_SRC_REMOTE = LOBBY_PAYMENT_ICONS_SHEET_SRC_REMOTE;

/** @deprecated Use LOBBY_PAYMENT_ICON_REMOTES */
export const LOBBY_GOOGLE_PAY_ICON_SRC_REMOTE = LOBBY_PAYMENT_ICON_REMOTES['google-pay'];

/** @deprecated Use LOBBY_PAYMENT_ICON_REMOTES */
export const LOBBY_SHOP_PAY_ICON_SRC_REMOTE = LOBBY_PAYMENT_ICON_REMOTES['shop-pay'];

/** Shared popover scale (phone contact + register payment) — 35% smaller than base. */
export const LOBBY_CASE_POPOVER_SCALE = 0.65;

const LOBBY_CASE_POPOVER_BASE_WIDTH_PX = 220;
const LOBBY_CASE_POPOVER_BASE_MIN_HEIGHT_PX = 200;

/** Shared popover shell size (phone contact + register payment). */
export const LOBBY_CASE_POPOVER_WIDTH_PX = Math.round(
  LOBBY_CASE_POPOVER_BASE_WIDTH_PX * LOBBY_CASE_POPOVER_SCALE
);
export const LOBBY_CASE_POPOVER_MIN_HEIGHT_PX = Math.round(
  LOBBY_CASE_POPOVER_BASE_MIN_HEIGHT_PX * LOBBY_CASE_POPOVER_SCALE
);

/** Full-viewport dimmer when register/phone popover is open (`createPortal` to `document.body`). */
export const LOBBY_CASE_POPOVER_SCRIM_Z_INDEX = 10000;

/** 25% lighter than cap-chart modal scrim (`0.7` → `0.525`) — register/phone popovers only. */
export const LOBBY_CASE_POPOVER_SCRIM_ALPHA = 0.525;

/** @deprecated Stack wrapper removed — asset/panel use separate body portals. */
export const LOBBY_CASE_POPOVER_STACK_Z_INDEX = 10002;

/** Register / phone bitmap — `createPortal` on `document.body`, above scrim (10000). */
export const LOBBY_CASE_POPOVER_ASSET_Z_INDEX = 10005;

/** Popover card — `createPortal` on `document.body`, above prop asset. */
export const LOBBY_CASE_POPOVER_PANEL_Z_INDEX = 10006;

export type LobbyPaymentIcon = {
  id: string;
  label: string;
  src: string;
  /** Tilt in degrees (positive = clockwise, negative = counterclockwise). */
  rotationDeg?: number;
};

function paymentIconPath(slug: string): string {
  return `/assets/lobby-payment/${slug}.png?v=${LOBBY_PAYMENT_ICONS_VERSION}`;
}

export type LobbyPaymentPopoverLayout = {
  cards: readonly LobbyPaymentIcon[];
  express: readonly LobbyPaymentIcon[];
  payOverTime: readonly LobbyPaymentIcon[];
};

const visa = { id: 'visa', label: 'Visa', src: paymentIconPath('visa') };
const mastercard = { id: 'mastercard', label: 'Mastercard', src: paymentIconPath('mastercard') };
const amex = { id: 'amex', label: 'American Express', src: paymentIconPath('amex') };
const discover = { id: 'discover', label: 'Discover', src: paymentIconPath('discover') };
const applePay = { id: 'apple-pay', label: 'Apple Pay', src: paymentIconPath('apple-pay') };
const shopPay = {
  id: 'shop-pay',
  label: 'Shop Pay',
  src: paymentIconPath('shop-pay'),
  rotationDeg: 3,
};
const paypal = { id: 'paypal', label: 'PayPal', src: paymentIconPath('paypal') };
const googlePay = { id: 'google-pay', label: 'Google Pay', src: paymentIconPath('google-pay') };
const afterpay = {
  id: 'afterpay',
  label: 'Afterpay',
  src: paymentIconPath('afterpay'),
  rotationDeg: -3,
};
const affirm = { id: 'affirm', label: 'Affirm', src: paymentIconPath('affirm') };
/** Clockwise tilt in register popover — bottom-right lower than bottom-left. */
export const LOBBY_KLARNA_PAYMENT_ICON_ROTATION_DEG = 8;

const klarna = {
  id: 'klarna',
  label: 'Klarna',
  src: paymentIconPath('klarna'),
  rotationDeg: LOBBY_KLARNA_PAYMENT_ICON_ROTATION_DEG,
};

/** Register popover: three Bohemy-labeled single rows (cards, express, pay over time). */
export const LOBBY_PAYMENT_POPOVER_LAYOUT: LobbyPaymentPopoverLayout = {
  cards: [visa, mastercard, discover, amex],
  express: [paypal, applePay, googlePay, shopPay],
  payOverTime: [afterpay, affirm, klarna],
};

/** Bohemy subheadings (gray, 15px) above each payment row in the register popover. */
export const LOBBY_PAYMENT_ACCEPTED_CARDS_LABEL = 'accepted cards';
export const LOBBY_PAYMENT_EXPRESS_LABEL = 'express payment';
export const LOBBY_PAYMENT_PAY_OVER_TIME_LABEL = 'pay in four';

/** Flat list (legacy / tests). */
export const LOBBY_PAYMENT_ICONS: readonly LobbyPaymentIcon[] = [
  ...LOBBY_PAYMENT_POPOVER_LAYOUT.cards,
  ...LOBBY_PAYMENT_POPOVER_LAYOUT.express,
  ...LOBBY_PAYMENT_POPOVER_LAYOUT.payOverTime,
];
