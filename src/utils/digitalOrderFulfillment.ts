/**
 * Digital / non-shipping orders: gift cards, membership upgrades, A/C booking checkouts.
 * Use a 3-stage client timeline (placed → processing → complete) instead of live shipping tracking.
 */

import { CONSULT_PLACED_TO_PROCESSING_MS } from './consultOrderLifecycle';

export type DigitalFulfillmentOrder = {
  digitalFulfillmentOnly?: boolean;
  bookingFlowType?: string;
  status?: string;
  placedAt?: number;
  date?: string;
  /** First gift-only purchase: ID form required before treating as normal digital timeline. */
  requiresGiftCardIdentityForm?: boolean;
  orderFormSigned?: boolean;
};

const DIGITAL_FULFILLMENT_STAGES = ['PLACED', 'PROCESSING', 'COMPLETE'] as const;

export function orderUsesDigitalFulfillmentTimeline(order: DigitalFulfillmentOrder | null | undefined): boolean {
  if (!order) return false;
  if (
    order.digitalFulfillmentOnly === true &&
    order.requiresGiftCardIdentityForm === true &&
    order.orderFormSigned !== true
  ) {
    return false;
  }
  if (order.digitalFulfillmentOnly === true) return true;
  const t = String(order.bookingFlowType || '').trim().toLowerCase();
  return t === 'appointment' || t === 'consult';
}

export function getDigitalFulfillmentStageIndex(order: DigitalFulfillmentOrder | null | undefined): number {
  if (!order) return 0;
  const st = String(order.status || '').trim().toUpperCase();
  if (st === 'COMPLETE' || st === 'DELIVERED') return 2;
  if (st === 'PROCESSING' || st === 'CONFIRMED' || st === 'PREPARING' || st === 'SHIPPED') return 1;
  return 0;
}

export const CONSULT_ORDER_TRACKING_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

function consultOrderTimelineAnchorMs(order: DigitalFulfillmentOrder): number {
  const placed = order.placedAt;
  if (typeof placed === 'number' && Number.isFinite(placed)) return placed;
  const d = String(order.date || '').trim();
  if (d) {
    try {
      if (d.includes('-')) {
        const [month, day, year] = d.split('-').map(Number);
        if (year && month && day) return new Date(year, month - 1, day).getTime();
      }
      const t = new Date(d).getTime();
      if (!Number.isNaN(t)) return t;
    } catch {
      /* ignore */
    }
  }
  return Date.now();
}

/**
 * Consult-only: progress from **placedAt** (or order **date**).
 * **PLACED** (first **2h**): **10% → ~30%** over that window (still below **30%** until **PROCESSING**).
 * **PROCESSING** (and mapped shipping statuses): **30% → 100%** over the remaining time until **72h** from **placedAt**.
 * **COMPLETE** / **DELIVERED**: **100%**.
 */
export function consultDigitalOrderTrackingBarFillPct(
  order: DigitalFulfillmentOrder | null | undefined,
  nowMs: number = Date.now()
): number | null {
  if (!order || String(order.bookingFlowType || '').trim().toLowerCase() !== 'consult') return null;
  const st = String(order.status || '').trim().toUpperCase();
  if (st === 'COMPLETE' || st === 'DELIVERED') return 100;

  const anchor = consultOrderTimelineAnchorMs(order);
  const elapsedRaw = nowMs - anchor;
  const elapsed = Math.max(0, Math.min(elapsedRaw, CONSULT_ORDER_TRACKING_WINDOW_MS));

  const phase1Ms = CONSULT_PLACED_TO_PROCESSING_MS;
  const phase2Ms = Math.max(1, CONSULT_ORDER_TRACKING_WINDOW_MS - phase1Ms);

  const processingLike =
    st === 'PROCESSING' || st === 'CONFIRMED' || st === 'PREPARING' || st === 'SHIPPED';

  if (processingLike) {
    const afterPhase1 = Math.max(0, elapsed - phase1Ms);
    const t = Math.min(1, afterPhase1 / phase2Ms);
    return Math.min(100, Math.max(30, 30 + t * 70));
  }
  if (st === 'PLACED') {
    const t = Math.min(1, elapsed / phase1Ms);
    return Math.min(29.99, 10 + t * 19.99);
  }
  const t = Math.min(1, elapsed / CONSULT_ORDER_TRACKING_WINDOW_MS);
  return Math.min(100, 10 + t * 90);
}

export function digitalFulfillmentStageLabels(): readonly string[] {
  return DIGITAL_FULFILLMENT_STAGES;
}
