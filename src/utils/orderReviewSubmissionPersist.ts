/** Per–line-item review completion for post-delivery order reviews (localStorage). */

export type OrderLineItemLike = {
  productName: string;
  options?: Record<string, string>;
};

export type OrderLikeForReviewEligibility = {
  status: string;
  productName: string;
  items: number;
  lineItems?: OrderLineItemLike[];
};

/** Same rules as leave-review order page: delivered only; unique by product + options. */
export function getEligibleReviewLineItemsForOrder(order: OrderLikeForReviewEligibility): OrderLineItemLike[] {
  if (order.status !== 'DELIVERED') return [];
  if (order.lineItems && order.lineItems.length > 0) {
    const seen = new Set<string>();
    return order.lineItems.filter((item) => {
      const key = orderReviewItemStorageKey(item.productName, item.options);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const count = Math.max(1, order.items);
  return Array.from({ length: count }, (_, i) => ({
    productName: order.productName,
    options: count > 1 ? { _item: String(i) } : undefined
  }));
}

export function orderReviewItemStorageKey(productName: string, options?: Record<string, string>): string {
  return `${productName}|${JSON.stringify(options || {})}`;
}

const reviewedItemsKey = (orderId: string) => `orderReviewItems_${orderId}`;

export function loadReviewedOrderItemKeys(orderId: string): Set<string> {
  try {
    const raw = localStorage.getItem(reviewedItemsKey(orderId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

export function saveReviewedOrderItemKeys(orderId: string, keys: Set<string>): void {
  try {
    localStorage.setItem(reviewedItemsKey(orderId), JSON.stringify([...keys]));
  } catch {
    /* ignore */
  }
}

export function appendReviewedOrderItemKey(orderId: string, itemKey: string): void {
  const next = loadReviewedOrderItemKeys(orderId);
  next.add(itemKey);
  saveReviewedOrderItemKeys(orderId, next);
}

/** Legacy single flag set on any submit in older builds; still honored when no per-item keys exist. */
export function hasLegacyOrderReviewSubmitted(orderId: string): boolean {
  try {
    return localStorage.getItem(`reviewSubmitted_${orderId}`) === 'true';
  } catch {
    return false;
  }
}

export function allOrderLineItemsReviewed(orderId: string, order: OrderLikeForReviewEligibility): boolean {
  const eligible = getEligibleReviewLineItemsForOrder(order);
  if (eligible.length === 0) return false;
  const keys = loadReviewedOrderItemKeys(orderId);
  if (keys.size === 0 && hasLegacyOrderReviewSubmitted(orderId)) return true;
  return eligible.every((item) => keys.has(orderReviewItemStorageKey(item.productName, item.options)));
}
