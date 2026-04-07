/**
 * Consult-only checkout orders (`bookingFlowType: 'consult'`):
 * - After **24h** **PLACED** → **PROCESSING**
 * - After **72h** from **placedAt** → **COMPLETE** (3-day client tracking window)
 * - When admin sends a consult quote (client alert), matching order → **COMPLETE** (can be before 72h)
 */

export function normalizeOrderNumberForConsultMatch(raw: unknown): string {
  return String(raw ?? '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/^ORDER/, '')
    .replace(/#/g, '')
    .trim();
}

export function consultOrderNumbersMatch(a: unknown, b: unknown): boolean {
  const na = normalizeOrderNumberForConsultMatch(a);
  const nb = normalizeOrderNumberForConsultMatch(b);
  return Boolean(na && nb && na === nb);
}

export type ConsultOrderLike = {
  id?: string;
  orderNumber?: string;
  status?: string;
  bookingFlowType?: string;
  placedAt?: number;
  consultProcessingStartedAt?: number;
  completedAt?: number;
  consultQuoteId?: string;
};

const TWENTY_FOUR_H_MS = 24 * 60 * 60 * 1000;
const SEVENTY_TWO_H_MS = 72 * 60 * 60 * 1000;

function consultPlacedAtMs(o: ConsultOrderLike): number | null {
  if (typeof o.placedAt === 'number' && Number.isFinite(o.placedAt)) return o.placedAt;
  return null;
}

/**
 * Consult lifecycle: **PLACED** → **PROCESSING** after **24h**; **COMPLETE** after **72h** from **placedAt**
 * (matches 3-day client tracking bar + estimated duration).
 */
export function advanceConsultOrdersPlacedToProcessing<T extends ConsultOrderLike>(orders: T[]): T[] {
  const now = Date.now();
  let touched = false;
  const next = orders.map((o) => {
    if (String(o.bookingFlowType || '').toLowerCase() !== 'consult') return o;
    const st = String(o.status || '').toUpperCase();
    const placedMs = consultPlacedAtMs(o);
    if (placedMs == null) return o;

    if (st === 'PLACED' || st === 'PROCESSING') {
      if (now - placedMs >= SEVENTY_TWO_H_MS) {
        touched = true;
        return {
          ...o,
          status: 'COMPLETE',
          completedAt: o.completedAt ?? now,
        };
      }
    }

    if (st !== 'PLACED') return o;
    if (now - placedMs < TWENTY_FOUR_H_MS) return o;
    touched = true;
    return {
      ...o,
      status: 'PROCESSING',
      consultProcessingStartedAt: o.consultProcessingStartedAt ?? now,
    };
  });
  return touched ? next : orders;
}

export type MarkConsultCompleteParams = {
  clientEmail: string;
  /** From meeting `metadata.orderNumber` (checkout `#NNN` or `ORDER #NNN`). */
  orderNumberFromCheckout: string;
  consultQuoteId: string;
};

/**
 * After admin **POST /api/admin/consult-quotes**: set matching **`userOrders_${email}`** row to **COMPLETE**.
 * Returns whether any row was updated.
 */
export function markConsultOrderCompleteAfterQuoteSent(params: MarkConsultCompleteParams): boolean {
  const email = String(params.clientEmail || '')
    .trim()
    .toLowerCase();
  const quoteId = String(params.consultQuoteId || '').trim();
  if (!email || !quoteId) return false;
  const orderRef = String(params.orderNumberFromCheckout || '').trim();
  if (!orderRef) return false;

  try {
    const key = `userOrders_${email}`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const data = JSON.parse(raw) as {
      activeOrders?: ConsultOrderLike[];
      pastOrders?: ConsultOrderLike[];
    };
    const active = Array.isArray(data.activeOrders) ? [...data.activeOrders] : [];
    const past = Array.isArray(data.pastOrders) ? [...data.pastOrders] : [];
    const now = Date.now();

    const patch = (arr: ConsultOrderLike[]): { list: ConsultOrderLike[]; hit: boolean } => {
      let hit = false;
      const list = arr.map((o) => {
        if (String(o.bookingFlowType || '').toLowerCase() !== 'consult') return o;
        const st = String(o.status || '').toUpperCase();
        if (st !== 'PLACED' && st !== 'PROCESSING') return o;
        if (!consultOrderNumbersMatch(o.orderNumber, orderRef)) return o;
        hit = true;
        return {
          ...o,
          status: 'COMPLETE',
          completedAt: now,
          consultQuoteId: quoteId,
        };
      });
      return { list, hit };
    };

    const a = patch(active);
    const p = patch(past);
    if (!a.hit && !p.hit) return false;

    localStorage.setItem(key, JSON.stringify({ activeOrders: a.list, pastOrders: p.list }));
    window.dispatchEvent(new CustomEvent('ordersUpdated'));
    return true;
  } catch {
    return false;
  }
}
