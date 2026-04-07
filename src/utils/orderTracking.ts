/**
 * Shared order tracking fields (localStorage userOrders_${email}) for admin, Orders, and Concierge.
 */

/** Inject once per page (e.g. `<style>{ORDER_TRACKING_PULSATE_KEYFRAMES_CSS}</style>`). Matches Concierge `pulsate`. */
export const ORDER_TRACKING_PULSATE_KEYFRAMES_CSS = `
@keyframes orderTrackingPulsate {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
`;

export const ORDER_TRACKING_PULSATE_ANIMATION = 'orderTrackingPulsate 1s ease-in-out infinite';

import { getAccountNotifications, mergeAccountNotifications } from '../pages/account/notifications/page';
import { getNotificationsStorageKeyForUserEmail } from './orderAccountAlerts';

/** Nine pipeline stages (indices 0–8); labels match Concierge ORDER TRACKING UI. */
export const ORDER_TRACKING_STAGE_LABELS = [
  'ORDER CONFIRMED',
  'SOURCING + COLLECTING',
  'CONSTRUCTING UNIT',
  'MATERIALS SHIPPED',
  'ARRIVED AT HUB',
  'CLEANSING',
  'CUSTOMIZING',
  'FINALIZING',
  'PACKAGE SHIPPED',
] as const;

export const ORDER_TRACKING_CARRIERS = ['USPS', 'UPS', 'DHL', 'FEDEX', 'OTHER'] as const;
export type OrderTrackingCarrier = (typeof ORDER_TRACKING_CARRIERS)[number];

export type TrackingStageNotesMap = Record<string, string>;

export type OrderTrackingPersistedFields = {
  trackingNumber?: string;
  trackingCarrier?: string;
  /** Positive = delay (slower progress); negative = expedite (faster). Applied to timeline anchor date. */
  trackingTimelineShiftDays?: number;
  /** Optional 0–8; when set (and order not terminal), drives visible current stage. */
  adminTrackingStageOverride?: number | null;
  /** Client-visible notes per stage index key "0".."8". */
  trackingStageNotes?: TrackingStageNotesMap;
};

const UPS_RE = /^ups$/i;
const DHL_RE = /^dhl$/i;
const FEDEX_RE = /^fedex|fed\s*ex$/i;

export function getCarrierTrackingUrl(carrier: string | undefined, trackingNumber: string): string {
  const tn = (trackingNumber || '').trim();
  const c = (carrier || 'USPS').trim().toUpperCase();
  if (!tn) return '#';
  if (c === 'UPS' || UPS_RE.test(carrier || '')) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(tn)}`;
  }
  if (c === 'DHL' || DHL_RE.test(carrier || '')) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(tn)}`;
  }
  if (c === 'FEDEX' || FEDEX_RE.test(carrier || '')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(tn)}`;
  }
  return `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${encodeURIComponent(tn)}`;
}

function userOrdersKey(email: string): string {
  return `userOrders_${email.trim()}`;
}

export function patchOrderInUserOrders(
  clientEmail: string,
  orderId: string,
  patch: Record<string, unknown>
): boolean {
  const email = (clientEmail || '').trim();
  if (!email || !orderId) return false;
  try {
    const key = userOrdersKey(email);
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : { activeOrders: [], pastOrders: [] };
    const updateList = (list: unknown[]) => {
      const arr = Array.isArray(list) ? list : [];
      const idx = arr.findIndex((o) => (o as { id?: string })?.id === orderId);
      if (idx < 0) return arr;
      const next = [...arr];
      next[idx] = { ...(next[idx] as object), ...patch };
      return next;
    };
    data.activeOrders = updateList(data.activeOrders || []);
    data.pastOrders = updateList(data.pastOrders || []);
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
    return true;
  } catch {
    return false;
  }
}

/** Append unread account notification + merge with system alerts. */
export function appendOrderTrackingClientNotification(
  clientEmail: string,
  opts: { orderId: string; stageLabel: string; note: string }
): void {
  const email = (clientEmail || '').trim().toLowerCase();
  if (!email || !opts.orderId) return;
  try {
    const rawUser = localStorage.getItem('currentUser');
    const user = rawUser ? JSON.parse(rawUser) : { email: clientEmail };
    const key = getNotificationsStorageKeyForUserEmail(clientEmail);
    const raw = localStorage.getItem(key);
    const stored: Array<{
      id: string;
      title: string;
      message: string;
      date: string;
      isRead: boolean;
      icon: string;
      actionText?: string;
      actionRoute?: string;
    }> = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    const today = (() => {
      const d = new Date();
      return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
    })();
    const title = 'ORDER TRACKING UPDATE';
    const message = `${opts.stageLabel}: ${(opts.note || '').trim()}`.trim().toUpperCase();
    const ts = Date.now();
    const n = {
      id: `order_track_${opts.orderId}_${ts}`,
      title,
      message: message || 'VIEW YOUR ORDER FOR DETAILS.',
      date: today,
      sortAt: ts,
      isRead: false,
      icon: 'f',
      actionText: 'VIEW TRACKING',
      actionRoute: `/account/concierge?orderId=${encodeURIComponent(opts.orderId)}`,
    };
    const account = getAccountNotifications(user?.email ? user : { email: clientEmail });
    const merged = mergeAccountNotifications([...stored, n], account);
    localStorage.setItem(key, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
  } catch {
    /* ignore */
  }
}

const CONCIERGE_TRACKING_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'SHIPPED_TO_HUB',
  'IN_TRANSIT',
  'PROCESSING',
  'CUSTOMIZING',
  'FINALIZING',
  'SHIPPED',
  'DELIVERED',
];

/** Mirror Concierge getOrderTrackingStage for Orders and admin display (single source). */
export function getOrderTrackingStageFromOrder(order: Record<string, unknown> | null | undefined): number {
  if (!order) return 0;
  if (order.status === 'CANCELED' || order.status === 'CANCELLED') {
    const ts = order.trackingStage;
    return ts !== undefined ? Math.min(Math.max(0, Number(ts)), 8) : 0;
  }
  if (order.status === 'DELIVERED') return 8;

  const ov = order.adminTrackingStageOverride;
  if (ov !== undefined && ov !== null && ov !== '') {
    const n = Number(ov);
    if (!Number.isNaN(n)) return Math.min(8, Math.max(0, Math.floor(n)));
  }

  const statusMap: Record<string, number> = {
    PLACED: 0,
    CONFIRMED: 1,
    PREPARING: 2,
    SHIPPED_TO_HUB: 3,
    IN_TRANSIT: 4,
    PROCESSING: 5,
    CUSTOMIZING: 6,
    FINALIZING: 7,
    SHIPPED: 8,
  };

  if (order.trackingStage !== undefined && order.trackingStage !== null) {
    return Math.min(Math.max(0, Number(order.trackingStage)), 8);
  }

  const st = String(order.status || '').toUpperCase();
  const baseStage = statusMap[st] ?? 0;
  if ((st === 'PLACED' || st === 'CONFIRMED') && order.orderFormSigned === true) {
    return Math.max(1, baseStage);
  }
  return baseStage;
}

export function orderHasConciergeStyleStatus(order: Record<string, unknown> | null | undefined): boolean {
  const s = String(order?.status || '').toUpperCase();
  return CONCIERGE_TRACKING_STATUSES.includes(s);
}

/** True when expanded tracking should show a DELIVERED row after PACKAGE SHIPPED. */
export function orderShowsDeliveredTrackingLine(order: Record<string, unknown> | null | undefined): boolean {
  return String(order?.status || '').toUpperCase() === 'DELIVERED';
}

/**
 * Bubble + red text for a standard stage row (0–8). When order is DELIVERED, `getOrderTrackingStageFromOrder` is 8
 * for both SHIPPED and DELIVERED — highlight DELIVERED only, not PACKAGE SHIPPED.
 */
export function orderTrackingStageRowIsCurrent(
  order: Record<string, unknown> | null | undefined,
  stageIndex: number,
  computedStage: number
): boolean {
  if (stageIndex !== computedStage) return false;
  if (stageIndex === 8 && orderShowsDeliveredTrackingLine(order) && computedStage === 8) return false;
  return true;
}

/** Current row for the extra DELIVERED line below PACKAGE SHIPPED. */
export function orderTrackingDeliveredRowIsCurrent(order: Record<string, unknown> | null | undefined, computedStage: number): boolean {
  return orderShowsDeliveredTrackingLine(order) && computedStage === 8;
}
