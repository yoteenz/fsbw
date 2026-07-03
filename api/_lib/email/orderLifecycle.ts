import type { EmailTemplateType } from './types.js';

/** Map order status / admin action to transactional email template. */
export function emailTemplateForOrderStatus(status: string): EmailTemplateType | null {
  const s = String(status || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  const map: Record<string, EmailTemplateType> = {
    RECEIVED: 'order_received',
    PLACED: 'order_received',
    PAID: 'order_confirmed',
    CONFIRMED: 'order_confirmed',
    PROCESSING: 'order_processing',
    SHIPPED: 'order_shipped',
    OUT_FOR_DELIVERY: 'order_out_for_delivery',
    DELIVERED: 'order_delivered',
    DELAYED: 'order_delayed',
    CANCELED: 'order_canceled',
    CANCELLED: 'order_canceled',
    FULFILLED: 'order_delivered',
    PARTIALLY_SHIPPED: 'partially_shipped',
    PARTIAL: 'partially_shipped',
  };
  return map[s] ?? null;
}

/** Infer template when admin saves tracking without explicit status. */
export function emailTemplateForTrackingUpdate(hasTrackingNumber: boolean, status?: string): EmailTemplateType | null {
  if (status) {
    const fromStatus = emailTemplateForOrderStatus(status);
    if (fromStatus) return fromStatus;
  }
  if (hasTrackingNumber) return 'order_shipped';
  return null;
}
