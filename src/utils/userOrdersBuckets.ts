/** Keep canceled orders out of active list; merge into past for orders UI + localStorage. */

export function orderStatusIsCanceled(status: unknown): boolean {
  const s = String(status ?? '').toUpperCase();
  return s === 'CANCELED' || s === 'CANCELLED';
}

/**
 * Remove CANCELED/CANCELLED from `active`; append each to `past` if not already present (by `id` when set).
 */
export function normalizeUserOrdersBuckets<T extends { id?: string; status?: string }>(
  active: T[] | undefined,
  past: T[] | undefined
): { activeOrders: T[]; pastOrders: T[] } {
  const pastList = [...(past || [])];
  const pastIds = new Set(pastList.map((o) => o.id).filter(Boolean) as string[]);
  const appended: T[] = [];
  const nextActive: T[] = [];

  for (const o of active || []) {
    if (!orderStatusIsCanceled(o.status)) {
      nextActive.push(o);
      continue;
    }
    const id = o.id;
    if (id && pastIds.has(id)) {
      continue;
    }
    if (id) pastIds.add(id);
    appended.push(o);
  }

  return { activeOrders: nextActive, pastOrders: [...pastList, ...appended] };
}

/** Parse MM-DD-YYYY (common order `date` field) to epoch ms; 0 if invalid. */
function parseOrderDateField(dateStr: unknown): number {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return 0;
  const m = dateStr.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    const ms = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  const d = Date.parse(dateStr);
  return Number.isNaN(d) ? 0 : d;
}

/**
 * Best-effort "when did this order last move" for sorting (newest first).
 * Prefers explicit timestamps; falls back to `date` string.
 */
export function orderSortTimeMs(o: Record<string, unknown>): number {
  const keys = [
    'deliveredAt',
    'completedAt',
    'canceledAt',
    'placedAt',
    'updatedAt',
    'updated_at',
    'createdAt',
    'created_at',
  ] as const;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      if (/^\d+$/.test(v)) {
        const n = Number(v);
        if (Number.isFinite(n)) return n;
      }
      if (v.includes('T') || v.includes('GMT') || /^\d{4}-\d{2}-\d{2}/.test(v)) {
        const t = Date.parse(v);
        if (!Number.isNaN(t)) return t;
      }
    }
  }
  return parseOrderDateField(o.date);
}

export function sortOrdersNewestFirst<T>(orders: T[]): T[] {
  return [...orders].sort((a, b) => {
    const dt = orderSortTimeMs(b as Record<string, unknown>) - orderSortTimeMs(a as Record<string, unknown>);
    if (dt !== 0) return dt;
    const idA = (a as { id?: string }).id ?? '';
    const idB = (b as { id?: string }).id ?? '';
    return String(idB).localeCompare(String(idA));
  });
}
