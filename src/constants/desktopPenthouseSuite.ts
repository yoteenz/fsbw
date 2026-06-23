import type { FinalSceneHitRect } from './finalLobbySceneAssets';
import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
} from './desktopRoomHeroArt';

/** Full-bleed 21:9 Penthouse Suite account dashboard — do not crop or edit. */
export const DESKTOP_PENTHOUSE_SUITE_BACKGROUND_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/NO%20TEXT%20BG/97EC97C2-BE02-46BA-8D62-AD8107B35670.png';

export const PENTHOUSE_SUITE_IMAGE = {
  width: DESKTOP_ROOM_HERO_ART_WIDTH,
  height: DESKTOP_ROOM_HERO_ART_HEIGHT,
} as const;

export type PenthouseSuitePanelId =
  | 'hero'
  | 'loyaltyPoints'
  | 'slayTickets'
  | 'vouchers'
  | 'digitalCash'
  | 'myOrders'
  | 'rewardsCollection'
  | 'referrals'
  | 'wishlist'
  | 'myActivity'
  | 'affiliate'
  | 'accountSettings';

export type PenthouseSuitePopupId = 'slayTickets' | 'vouchers' | 'digitalCash';

export type PenthouseSuitePanelAction =
  | { type: 'navigate'; href: string }
  | { type: 'popup'; popup: PenthouseSuitePopupId };

export type PenthouseSuitePanelDef = {
  id: PenthouseSuitePanelId;
  label: string;
  ariaLabel: string;
  rect: FinalSceneHitRect;
  action: PenthouseSuitePanelAction;
};

/** Marble UI wall on the hero — tune with `?penthouseSuiteDebug=1`. */
const WALL: FinalSceneHitRect = {
  left: 0.228,
  top: 0.1,
  width: 0.544,
  height: 0.795,
};

const PAD = { x: 0.022, y: 0.018 };
const GAP = { x: 0.012, y: 0.013 };

/** Row height fractions inside the padded wall (hero, row1, row2, row3). */
const ROW_HEIGHT_FR = [0.19, 0.205, 0.27, 0.205] as const;

function buildInnerWall(): FinalSceneHitRect {
  return {
    left: WALL.left + WALL.width * PAD.x,
    top: WALL.top + WALL.height * PAD.y,
    width: WALL.width * (1 - PAD.x * 2),
    height: WALL.height * (1 - PAD.y * 2),
  };
}

function rowMetrics(inner: FinalSceneHitRect, rowIndex: number): { top: number; height: number } {
  let top = inner.top;
  for (let i = 0; i < rowIndex; i++) {
    top += inner.height * ROW_HEIGHT_FR[i] + inner.height * GAP.y;
  }
  return {
    top,
    height: inner.height * ROW_HEIGHT_FR[rowIndex],
  };
}

function fourColumnRect(
  inner: FinalSceneHitRect,
  rowIndex: number,
  column: number,
): FinalSceneHitRect {
  const row = rowMetrics(inner, rowIndex);
  const gapX = inner.width * GAP.x;
  const colWidth = (inner.width - gapX * 3) / 4;
  const step = colWidth + gapX;
  return {
    left: inner.left + column * step,
    top: row.top,
    width: colWidth,
    height: row.height,
  };
}

function threeColumnRect(
  inner: FinalSceneHitRect,
  rowIndex: number,
  column: number,
  widths: readonly [number, number, number] = [0.28, 0.42, 0.28],
): FinalSceneHitRect {
  const row = rowMetrics(inner, rowIndex);
  const gapX = inner.width * GAP.x;
  const available = inner.width - gapX * 2;
  const colWidths = widths.map((fraction) => available * fraction);
  const leftOffsets = [
    inner.left,
    inner.left + colWidths[0] + gapX,
    inner.left + colWidths[0] + gapX + colWidths[1] + gapX,
  ];
  return {
    left: leftOffsets[column],
    top: row.top,
    width: colWidths[column],
    height: row.height,
  };
}

function heroRect(inner: FinalSceneHitRect): FinalSceneHitRect {
  const row = rowMetrics(inner, 0);
  return {
    left: inner.left,
    top: row.top,
    width: inner.width,
    height: row.height,
  };
}

function buildPanelRects(): Record<PenthouseSuitePanelId, FinalSceneHitRect> {
  const inner = buildInnerWall();
  return {
    hero: heroRect(inner),
    loyaltyPoints: fourColumnRect(inner, 1, 0),
    slayTickets: fourColumnRect(inner, 1, 1),
    vouchers: fourColumnRect(inner, 1, 2),
    digitalCash: fourColumnRect(inner, 1, 3),
    myOrders: threeColumnRect(inner, 2, 0),
    rewardsCollection: threeColumnRect(inner, 2, 1),
    referrals: threeColumnRect(inner, 2, 2),
    wishlist: fourColumnRect(inner, 3, 0),
    myActivity: fourColumnRect(inner, 3, 1),
    affiliate: fourColumnRect(inner, 3, 2),
    accountSettings: fourColumnRect(inner, 3, 3),
  };
}

const PANEL_RECTS = buildPanelRects();

export const PENTHOUSE_SUITE_PANELS: readonly PenthouseSuitePanelDef[] = [
  {
    id: 'hero',
    label: 'Membership',
    ariaLabel: 'Membership overview',
    rect: PANEL_RECTS.hero,
    action: { type: 'navigate', href: '/account/rewards' },
  },
  {
    id: 'loyaltyPoints',
    label: 'Loyalty Points',
    ariaLabel: 'Loyalty points and rewards',
    rect: PANEL_RECTS.loyaltyPoints,
    action: { type: 'navigate', href: '/account/rewards' },
  },
  {
    id: 'slayTickets',
    label: 'Slay Tickets',
    ariaLabel: 'Slay tickets balance and history',
    rect: PANEL_RECTS.slayTickets,
    action: { type: 'popup', popup: 'slayTickets' },
  },
  {
    id: 'vouchers',
    label: 'Vouchers',
    ariaLabel: 'Vouchers and voucher history',
    rect: PANEL_RECTS.vouchers,
    action: { type: 'popup', popup: 'vouchers' },
  },
  {
    id: 'digitalCash',
    label: 'Digital Cash',
    ariaLabel: 'Digital cash balance and transactions',
    rect: PANEL_RECTS.digitalCash,
    action: { type: 'popup', popup: 'digitalCash' },
  },
  {
    id: 'myOrders',
    label: 'My Orders',
    ariaLabel: 'My orders',
    rect: PANEL_RECTS.myOrders,
    action: { type: 'navigate', href: '/account/orders' },
  },
  {
    id: 'rewardsCollection',
    label: 'Rewards Collection',
    ariaLabel: 'Rewards collection and collectibles',
    rect: PANEL_RECTS.rewardsCollection,
    action: { type: 'navigate', href: '/account/rewards' },
  },
  {
    id: 'referrals',
    label: 'Referrals',
    ariaLabel: 'Referrals',
    rect: PANEL_RECTS.referrals,
    action: { type: 'navigate', href: '/account/referrals' },
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    ariaLabel: 'Wishlist and saved items',
    rect: PANEL_RECTS.wishlist,
    action: { type: 'navigate', href: '/wishlist' },
  },
  {
    id: 'myActivity',
    label: 'My Activity',
    ariaLabel: 'Activity history',
    rect: PANEL_RECTS.myActivity,
    action: { type: 'navigate', href: '/account/alerts' },
  },
  {
    id: 'affiliate',
    label: 'Affiliate',
    ariaLabel: 'Affiliate dashboard',
    rect: PANEL_RECTS.affiliate,
    action: { type: 'navigate', href: '/account/affiliate' },
  },
  {
    id: 'accountSettings',
    label: 'Account Settings',
    ariaLabel: 'Account settings, security, addresses, and payment',
    rect: PANEL_RECTS.accountSettings,
    action: { type: 'navigate', href: '/account/settings' },
  },
] as const;

export function isPenthouseSuiteHotspotDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('penthouseSuiteDebug') === '1';
  } catch {
    return false;
  }
}
