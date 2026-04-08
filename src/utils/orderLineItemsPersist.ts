/**
 * Line items persisted on `userOrders_*` orders for inventory + refunds.
 */

export type PersistedOrderLineItem = {
  name?: string;
  productName?: string;
  quantity: number;
  type?: string;
};

/** Snapshot cart lines at checkout (name doubles as product label for admin revenue inventory). */
export function buildPersistedLineItemsFromCart(cartItems: unknown[] | null | undefined): PersistedOrderLineItem[] {
  if (!cartItems || !Array.isArray(cartItems)) return [];
  const out: PersistedOrderLineItem[] = [];
  for (const raw of cartItems) {
    const i = raw as Record<string, unknown>;
    const qty = Math.max(1, Math.floor(Number(i.quantity) || 1));
    const name = String(i.name ?? '').trim() || 'ITEM';
    out.push({
      name,
      productName: name,
      quantity: qty,
      type: typeof i.type === 'string' ? i.type : undefined,
    });
  }
  return out;
}
