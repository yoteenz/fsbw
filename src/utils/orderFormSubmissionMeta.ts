/**
 * Client + server metadata captured on order authorization form submit (fraud/chargeback evidence).
 */
import {
  ORDER_FORM_PAYMENT_METHOD_OPTIONS,
  type OrderFormPaymentMethodValue,
} from '../constants/orderFormAcknowledgments';

export type OrderFormSubmissionMeta = {
  clientSubmittedAt: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  /** Set server-side from request headers when posted to `/api/client/submissions`. */
  ipAddress?: string;
  serverReceivedAt?: string;
};

const ORDER_FORM_PAYMENT_METHOD_VALUES = new Set(
  ORDER_FORM_PAYMENT_METHOD_OPTIONS.map((o) => o.value)
);

function uaLower(ua: string): string {
  return ua.toLowerCase();
}

/** Human-readable device label from user agent (mobile-first project). */
export function orderFormDeviceTypeFromUserAgent(ua: string): string {
  const u = uaLower(ua);
  if (/iphone/.test(u)) return 'iPhone';
  if (/ipad/.test(u)) return 'iPad';
  if (/ipod/.test(u)) return 'iPod';
  if (/android/.test(u)) return /mobile/.test(u) ? 'Android phone' : 'Android tablet';
  if (/mobile/.test(u)) return 'Mobile';
  return 'Desktop';
}

export function orderFormBrowserFromUserAgent(ua: string): string {
  const u = uaLower(ua);
  if (/edg\//.test(u)) return 'Edge';
  if (/crios/.test(u)) return 'Chrome (iOS)';
  if (/fxios/.test(u)) return 'Firefox (iOS)';
  if (/chrome/.test(u) && !/edg/.test(u)) return 'Chrome';
  if (/firefox/.test(u)) return 'Firefox';
  if (/safari/.test(u) && !/chrome/.test(u)) return 'Safari';
  if (/samsungbrowser/.test(u)) return 'Samsung Internet';
  return 'Unknown';
}

/** Capture on the client at submit time (IP added on server). */
export function captureOrderFormClientSubmissionMeta(): OrderFormSubmissionMeta {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  return {
    clientSubmittedAt: new Date().toISOString(),
    userAgent: ua,
    deviceType: orderFormDeviceTypeFromUserAgent(ua),
    browser: orderFormBrowserFromUserAgent(ua),
  };
}

/** Map checkout / order payment label to form radio value. */
export function mapCheckoutPaymentMethodToFormValue(raw: string | null | undefined): string {
  const s = String(raw || '').trim().toUpperCase();
  if (!s) return '';
  if (s.includes('SHOP PAY') || s === 'SHOP_PAY') return 'SHOP_PAY';
  if (s.includes('AFFIRM')) return 'AFFIRM';
  if (s.includes('KLARNA')) return 'KLARNA';
  if (s.includes('AFTERPAY') || s.includes('PAY IN 4') || s === 'PAY_IN_4') return 'AFTERPAY';
  if (s.includes('PAYPAL')) return 'PAYPAL';
  if (s.includes('DEBIT')) return 'DEBIT_CARD';
  if (s.includes('CARD') || s.includes('STRIPE') || s.includes('APPLE PAY') || s.includes('GOOGLE PAY')) {
    return 'CREDIT_CARD';
  }
  if (ORDER_FORM_PAYMENT_METHOD_VALUES.has(s as OrderFormPaymentMethodValue)) return s;
  return 'OTHER';
}

export function orderFormPaymentMethodLabel(value: string): string {
  const hit = ORDER_FORM_PAYMENT_METHOD_OPTIONS.find((o) => o.value === value);
  return hit?.label || value;
}
