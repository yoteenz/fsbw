/**
 * Digital / non-shipping orders: gift cards, membership upgrades, A/C booking checkouts.
 * Use a 3-stage client timeline (placed → processing → complete) instead of live shipping tracking.
 */

export type DigitalFulfillmentOrder = {
  digitalFulfillmentOnly?: boolean;
  bookingFlowType?: string;
  status?: string;
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

/** Consult-only: single progress bar fill — PLACED ⅓, PROCESSING ⅔, COMPLETE (or DELIVERED) 100%. */
export function consultDigitalOrderTrackingBarFillPct(
  order: DigitalFulfillmentOrder | null | undefined
): number | null {
  if (!order || String(order.bookingFlowType || '').trim().toLowerCase() !== 'consult') return null;
  const st = String(order.status || '').trim().toUpperCase();
  if (st === 'COMPLETE' || st === 'DELIVERED') return 100;
  if (st === 'PROCESSING') return (200 / 3);
  return 100 / 3;
}

export function digitalFulfillmentStageLabels(): readonly string[] {
  return DIGITAL_FULFILLMENT_STAGES;
}
