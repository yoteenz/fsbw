/** Hair install NEW INSTALL: attach custom unit from build-a-wig + optional prior order. */

export const BUILD_WIG_APPOINTMENT_MODE_KEY = 'buildWigAppointmentMode';
export const BUILD_WIG_APPOINTMENT_RETURN_KEY = 'buildWigAppointmentReturn';
export const BOOKING_NEW_INSTALL_ATTACHED_UNIT_KEY = 'bookingNewInstallAttachedUnit';
export const BOOKING_NEW_INSTALL_ATTACHED_ORDER_KEY = 'bookingNewInstallAttachedOrder';

export type BuildWigHubUnit = {
  slug: string;
  label: string;
  path: string;
};

export const BUILD_WIG_HUB_UNITS: BuildWigHubUnit[] = [
  { slug: 'noir', label: 'NOIR', path: '/build-a-wig/noir' },
  { slug: 'blanco', label: 'BLANCO', path: '/build-a-wig/blanco' },
  { slug: 'soft-wave', label: 'SOFT WAVE', path: '/build-a-wig/soft-wave' },
  { slug: 'beach-wave', label: 'BEACH WAVE', path: '/build-a-wig/beach-wave' },
  { slug: 'soft-curl', label: 'SOFT CURL', path: '/build-a-wig/soft-curl' },
  { slug: 'ocean-curl', label: 'OCEAN CURL', path: '/build-a-wig/ocean-curl' }
];

const UNIT_LABELS_UPPER = BUILD_WIG_HUB_UNITS.map((u) => u.label.toUpperCase());

export type BookingAttachedOrderPayload = {
  orderId: string;
  orderNumber?: string;
  label: string;
  /** Stable key for `<select>` when restoring draft. */
  key?: string;
};

export type EligiblePurchasedUnitOption = BookingAttachedOrderPayload & { key: string };

function norm(s: string): string {
  return String(s || '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** True if this order line looks like a build-a-wig unit (not BCF-only, etc.). */
export function productNameLooksLikeWigUnit(name: string): boolean {
  const n = norm(name);
  if (!n) return false;
  return UNIT_LABELS_UPPER.some((u) => n === u || n.includes(u));
}

export function isActiveBuildWigAppointmentMode(): boolean {
  if (typeof localStorage === 'undefined') return false;
  if (localStorage.getItem(BUILD_WIG_APPOINTMENT_MODE_KEY) !== '1') return false;
  const ret = localStorage.getItem(BUILD_WIG_APPOINTMENT_RETURN_KEY) || '';
  return ret.startsWith('/booking');
}

export function setBuildWigAppointmentMode(returnPath: string): void {
  try {
    localStorage.setItem(BUILD_WIG_APPOINTMENT_MODE_KEY, '1');
    localStorage.setItem(BUILD_WIG_APPOINTMENT_RETURN_KEY, returnPath);
  } catch {
    /* ignore */
  }
}

export function clearBuildWigAppointmentMode(): void {
  try {
    localStorage.removeItem(BUILD_WIG_APPOINTMENT_MODE_KEY);
    localStorage.removeItem(BUILD_WIG_APPOINTMENT_RETURN_KEY);
  } catch {
    /* ignore */
  }
}

export function readBookingNewInstallAttachedUnitJson(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BOOKING_NEW_INSTALL_ATTACHED_UNIT_KEY);
    return raw && raw.length > 2 ? raw : null;
  } catch {
    return null;
  }
}

export function clearBookingNewInstallAttachedUnit(): void {
  try {
    localStorage.removeItem(BOOKING_NEW_INSTALL_ATTACHED_UNIT_KEY);
  } catch {
    /* ignore */
  }
}

export function readBookingNewInstallAttachedOrder(): BookingAttachedOrderPayload | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BOOKING_NEW_INSTALL_ATTACHED_ORDER_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<BookingAttachedOrderPayload>;
    if (!o?.orderId || !o?.label) return null;
    return {
      orderId: String(o.orderId),
      orderNumber: o.orderNumber,
      label: String(o.label),
      key: o.key
    };
  } catch {
    return null;
  }
}

export function persistBookingNewInstallAttachedOrder(payload: BookingAttachedOrderPayload | null): void {
  try {
    if (!payload) {
      localStorage.removeItem(BOOKING_NEW_INSTALL_ATTACHED_ORDER_KEY);
      return;
    }
    localStorage.setItem(BOOKING_NEW_INSTALL_ATTACHED_ORDER_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function clearBookingNewInstallAttachedOrder(): void {
  persistBookingNewInstallAttachedOrder(null);
}

export function clearAllBookingNewInstallAttachments(): void {
  clearBookingNewInstallAttachedUnit();
  clearBookingNewInstallAttachedOrder();
}

type OrderLineItem = { productName: string };
type OrderShape = {
  id: string;
  orderNumber?: string;
  productName?: string;
  lineItems?: OrderLineItem[];
};

/** Prior purchased units for ATTACH ORDER dropdown (local `userOrders_${email}`). */
export function loadEligiblePurchasedWigUnitsFromStorage(): EligiblePurchasedUnitOption[] {
  if (typeof localStorage === 'undefined') return [];
  let email = '';
  try {
    const u = localStorage.getItem('currentUser');
    if (u) email = JSON.parse(u)?.email || '';
  } catch {
    return [];
  }
  if (!email) return [];

  const key = `userOrders_${email}`;
  let active: OrderShape[] = [];
  let past: OrderShape[] = [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw) as { activeOrders?: OrderShape[]; pastOrders?: OrderShape[] };
    active = Array.isArray(data.activeOrders) ? data.activeOrders : [];
    past = Array.isArray(data.pastOrders) ? data.pastOrders : [];
  } catch {
    return [];
  }

  const out: EligiblePurchasedUnitOption[] = [];
  const seen = new Set<string>();

  const pushLine = (order: OrderShape, label: string, suffix: string) => {
    const k = `${order.id}::${suffix}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({
      key: k,
      orderId: order.id,
      orderNumber: order.orderNumber,
      label
    });
  };

  for (const order of [...active, ...past]) {
    if (!order?.id) continue;
    const rootName = order.productName || '';
    if (productNameLooksLikeWigUnit(rootName)) {
      const ord = order.orderNumber ? `#${order.orderNumber}` : '';
      pushLine(order, `${rootName.trim()}${ord ? ` ${ord}` : ''}`.trim(), 'root');
    }
    const lines = order.lineItems;
    if (Array.isArray(lines)) {
      lines.forEach((li, idx) => {
        const pn = li?.productName || '';
        if (productNameLooksLikeWigUnit(pn)) {
          const ord = order.orderNumber ? `#${order.orderNumber}` : '';
          pushLine(order, `${pn.trim()}${ord ? ` ${ord}` : ''}`.trim(), `li${idx}`);
        }
      });
    }
  }

  return out;
}
