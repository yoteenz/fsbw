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
