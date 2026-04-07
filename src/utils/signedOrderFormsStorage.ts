/**
 * Client-submitted order authorization forms (localStorage) for admin "view signed forms".
 * Keyed by normalized client email; entries keyed by order id when available.
 */

export type StoredSignedOrderForm = {
  id: string;
  orderId?: string;
  orderNumber: string;
  orderDate: string;
  signedAt: number;
  email: string;
  formFields: Record<string, string>;
  /** data URL or empty when not captured */
  photoIdDataUrl?: string;
  cardLastFourDataUrl?: string;
  signatureDataUrl?: string;
  /** True when row is inferred from order flag only (no full snapshot). */
  summaryOnly?: boolean;
};

const STORAGE_KEY = 'signedOrderFormsByEmail';

function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function loadSignedOrderFormsForEmail(email: string): StoredSignedOrderForm[] {
  const key = normalizeEmail(email);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, StoredSignedOrderForm[]>;
    const list = all[key];
    return Array.isArray(list) ? [...list] : [];
  } catch {
    return [];
  }
}

export function appendSignedOrderForm(entry: StoredSignedOrderForm): void {
  const key = normalizeEmail(entry.email);
  if (!key) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, StoredSignedOrderForm[]> = raw ? JSON.parse(raw) : {};
    const prev = Array.isArray(all[key]) ? all[key] : [];
    const withoutDup = prev.filter((e) => {
      if (entry.orderId && e.orderId && e.orderId === entry.orderId) return false;
      if (e.orderNumber === entry.orderNumber && e.signedAt === entry.signedAt) return false;
      return true;
    });
    all[key] = [entry, ...withoutDup];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    try {
      window.dispatchEvent(new CustomEvent('signedOrderFormsUpdated'));
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}

/** Merge stored snapshots with orders marked signed but missing a stored row. */
export function getSignedFormsForClientDisplay(
  email: string,
  orders: Array<Record<string, unknown>>
): StoredSignedOrderForm[] {
  const stored = loadSignedOrderFormsForEmail(email);
  const byOrderId = new Set(stored.map((s) => s.orderId).filter(Boolean) as string[]);
  const byOrderNum = new Set(stored.map((s) => s.orderNumber.replace(/\s+/g, ' ').trim().toUpperCase()));

  const synthetic: StoredSignedOrderForm[] = [];
  let synIdx = 0;
  for (const o of orders) {
    if (o.orderFormSigned !== true) continue;
    const id = (o.id != null ? String(o.id) : '') || '';
    const orderNumber = String(o.orderNumber || o.order_number || '').trim() || '—';
    const normNum = orderNumber.replace(/\s+/g, ' ').trim().toUpperCase();
    if (id && byOrderId.has(id)) continue;
    if (normNum && byOrderNum.has(normNum)) continue;

    const signedAt = (() => {
      const t = o.signedAt ?? o.orderFormSignedAt ?? o.placedAt ?? o.updatedAt;
      if (typeof t === 'number' && Number.isFinite(t)) return t;
      if (typeof t === 'string') {
        const ms = new Date(t).getTime();
        return Number.isFinite(ms) ? ms : Date.now();
      }
      return Date.now();
    })();

    synIdx += 1;
    synthetic.push({
      id: `inferred-${id || normNum || synIdx}-${synIdx}`,
      orderId: id || undefined,
      orderNumber,
      orderDate: String(o.date || o.orderDate || '—'),
      signedAt,
      email: normalizeEmail(email),
      formFields: {
        status: String(o.status || ''),
      },
      summaryOnly: true,
    });
    if (id) byOrderId.add(id);
    if (normNum) byOrderNum.add(normNum);
  }

  const merged = [...stored, ...synthetic];
  merged.sort((a, b) => b.signedAt - a.signedAt);
  return merged;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Normalize "#123", "ORDER 123", "ORDER #123" for matching stored orders. */
function normalizeOrderNumberToken(s: string): string {
  return s.replace(/^ORDER\s*#?/i, '').replace(/^#/, '').trim();
}

/**
 * Set orderFormSigned on the matching row in userOrders_{email} (best-effort).
 */
export function markOrderFormSignedInUserOrders(email: string, orderNumberFromForm: string): void {
  const key = normalizeEmail(email);
  const token = normalizeOrderNumberToken(orderNumberFromForm);
  if (!key || !token) return;
  try {
    const raw = localStorage.getItem(`userOrders_${key}`);
    if (!raw) return;
    const data = JSON.parse(raw);
    const active = Array.isArray(data.activeOrders) ? data.activeOrders : [];
    const past = Array.isArray(data.pastOrders) ? data.pastOrders : [];
    const now = Date.now();
    const match = (o: Record<string, unknown>) => {
      const on = String(o.orderNumber || '')
        .replace(/^ORDER\s+/i, '')
        .trim();
      const n = normalizeOrderNumberToken(on);
      return n === token || on.includes(token);
    };
    let changed = false;
    for (const arr of [active, past]) {
      for (let i = 0; i < arr.length; i++) {
        if (match(arr[i] as Record<string, unknown>)) {
          arr[i] = { ...(arr[i] as object), orderFormSigned: true, orderFormSignedAt: now };
          changed = true;
        }
      }
    }
    if (changed) {
      localStorage.setItem(`userOrders_${key}`, JSON.stringify({ ...data, activeOrders: active, pastOrders: past }));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
    }
  } catch {
    /* ignore */
  }
}
