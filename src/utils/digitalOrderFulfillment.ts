/**
 * Digital / non-shipping orders: gift cards, membership upgrades, A/C booking checkouts.
 * Use a 3-stage client timeline (placed → processing → complete) instead of live shipping tracking.
 */

export type DigitalFulfillmentOrder = {
  digitalFulfillmentOnly?: boolean;
  bookingFlowType?: string;
  status?: string;
  placedAt?: number;
  date?: string;
};

const DIGITAL_FULFILLMENT_STAGES = ['PLACED', 'PROCESSING', 'COMPLETE'] as const;

export function orderUsesDigitalFulfillmentTimeline(order: DigitalFulfillmentOrder | null | undefined): boolean {
  if (!order || order.digitalFulfillmentOnly === true) return true;
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
 * Consult-only: bar fills **10% → 100%** linearly over **3 days** from **placedAt** (or order **date**).
 * **PLACED**: same curve but **capped below 30%** until status advances.
 * **PROCESSING** (and mapped shipping statuses): **at least 30%**, same curve.
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
  const elapsed = Math.max(0, Math.min(nowMs - anchor, CONSULT_ORDER_TRACKING_WINDOW_MS));
  const linear = 10 + (elapsed / CONSULT_ORDER_TRACKING_WINDOW_MS) * 90;

  const processingLike =
    st === 'PROCESSING' || st === 'CONFIRMED' || st === 'PREPARING' || st === 'SHIPPED';
  if (processingLike) return Math.min(100, Math.max(30, linear));
  if (st === 'PLACED') return Math.min(29.99, linear);
  return Math.min(100, linear);
}

export function digitalFulfillmentStageLabels(): readonly string[] {
  return DIGITAL_FULFILLMENT_STAGES;
}
