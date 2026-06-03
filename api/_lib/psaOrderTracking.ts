/**
 * Server-side order tracking stage (mirror src/utils/orderTracking.ts for PSA tools).
 */

const ORDER_TRACKING_STAGE_LABELS = [
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

function orderFormAwaitingAdminApproval(order: Record<string, unknown>): boolean {
  if (order.orderFormSigned !== true) return false;
  if (order.orderFormAdminDeclined === true) return false;
  if (order.orderFormAdminApproved === true) return false;
  return order.orderFormClientSubmitted === true;
}

function orderFormEffectiveSignedForPipeline(order: Record<string, unknown>): boolean {
  if (order.orderFormSigned !== true) return false;
  if (orderFormAwaitingAdminApproval(order)) return false;
  return true;
}

function orderRequiresOrderAuthorizationForm(order: Record<string, unknown>): boolean {
  const v = order.requiresOrderAuthorizationForm;
  if (v === false) return false;
  if (v === true) return true;
  const digital =
    order.digitalFulfillmentOnly === true ||
    order.bookingFlowType != null ||
    String(order.productName || '').toUpperCase().includes('GIFT CARD');
  return !digital;
}

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
  if (
    (st === 'PLACED' || st === 'CONFIRMED') &&
    orderFormEffectiveSignedForPipeline(order) &&
    orderRequiresOrderAuthorizationForm(order)
  ) {
    return Math.max(1, baseStage);
  }
  return baseStage;
}

export function getOrderTrackingStageLabel(stageIndex: number): string {
  const i = Math.min(8, Math.max(0, Math.floor(stageIndex)));
  return ORDER_TRACKING_STAGE_LABELS[i] ?? ORDER_TRACKING_STAGE_LABELS[0];
}

export function getCarrierTrackingUrl(carrier: string | undefined, trackingNumber: string): string | null {
  const tn = (trackingNumber || '').trim();
  if (!tn) return null;
  const c = (carrier || 'USPS').trim().toUpperCase();
  if (c === 'UPS') return `https://www.ups.com/track?tracknum=${encodeURIComponent(tn)}`;
  if (c === 'DHL') return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(tn)}`;
  if (c === 'FEDEX') return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(tn)}`;
  return `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${encodeURIComponent(tn)}`;
}

export function summarizeOrderForPsa(order: Record<string, unknown>): Record<string, unknown> {
  const stage = getOrderTrackingStageFromOrder(order);
  const trackingNumber = typeof order.trackingNumber === 'string' ? order.trackingNumber.trim() : '';
  const carrier = typeof order.trackingCarrier === 'string' ? order.trackingCarrier : 'USPS';
  return {
    id: order.id ?? null,
    orderNumber: order.orderNumber ?? null,
    status: order.status ?? null,
    productName: order.productName ?? null,
    total: order.total ?? null,
    placedAt: order.placedAt ?? order.date ?? null,
    trackingStageIndex: stage,
    trackingStageLabel: getOrderTrackingStageLabel(stage),
    trackingNumber: trackingNumber || null,
    trackingUrl: trackingNumber ? getCarrierTrackingUrl(carrier, trackingNumber) : null,
    requiresOrderForm: orderRequiresOrderAuthorizationForm(order),
    orderFormSigned: order.orderFormSigned === true,
    bookingFlowType: order.bookingFlowType ?? null,
  };
}
