/**
 * Shared admin revenue & inventory stats. Used by admin revenue page and dashboard.
 * Orders are read from localStorage userOrders_* (same keys as client overview).
 */

export type RevenueOrderForStats = {
  id: string;
  date?: string;
  total?: number;
  amount?: number;
  status?: string;
  lineItems?: Array<{ productName?: string }>;
  items?: number;
  productName?: string;
  addOns?: string[];
  options?: Record<string, unknown>;
  [k: string]: unknown;
};

const PRODUCT_NAMES = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'] as const;

/** Starting inventory: products (10 each), packaging counts. */
export const STARTING_INVENTORY = {
  products: Object.fromEntries(PRODUCT_NAMES.map((p) => [p, 10])) as Record<string, number>,
  /**
   * Sellable **digital** gift-card “slots” for admin Products tab (**sold / inventory**).
   * (Not decreased by `getDepletedInventory` — wigs only.)
   */
  giftCards: 500,
  packaging: {
    'MAILER BOXES': 250,
    'DUST BAGS': 500,
    'BUSINESS CARDS': 1000,
    'HANG TAGS': 497,
    'LABELS': 500,
    'ENVELOPES': 500,
    'THANK YOU NOTES': 500,
    'CAMPAIGN FLYERS': 510,
    'MESH POUCH': 1000,
    'WHITE HAIR TIES': 498,
    'WHITE DUCK CLIPS': 998,
    'LASHES': 250,
    'BRUSH': 250,
    'GLUE SPREADER': 249,
    'MELT BANDS': 250,
  } as Record<string, number>,
} as const;

function isGiftCardLineItem(line: { type?: string; productName?: string; name?: string }): boolean {
  const t = String(line.type || '').toLowerCase();
  if (t === 'gift-card') return true;
  const n = String(line.name || line.productName || '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
  return n === 'GIFT CARD' || n.includes('GIFT CARD');
}

function orderLinesForStats(order: RevenueOrderForStats): Array<{
  type?: string;
  productName?: string;
  name?: string;
  quantity?: number;
}> {
  if (order.lineItems && order.lineItems.length > 0) {
    return order.lineItems as Array<{
      type?: string;
      productName?: string;
      name?: string;
      quantity?: number;
    }>;
  }
  if (order.productName) {
    const q = Math.max(1, Math.floor(Number(order.items) || 1));
    return [{ productName: order.productName, name: String(order.productName), quantity: q, type: (order as { type?: string }).type }];
  }
  return [];
}

/** Count **gift card** line items across non-canceled orders (same `userOrders_*` source as revenue). */
export function countGiftCardsSoldFromOrders(orders: RevenueOrderForStats[]): number {
  let total = 0;
  for (const order of orders) {
    if (orderInventoryCanceled(order)) continue;
    for (const line of orderLinesForStats(order)) {
      if (!isGiftCardLineItem(line)) continue;
      const q = Math.max(1, Math.floor(Number(line.quantity) || 1));
      total += q;
    }
  }
  return total;
}

function orderInventoryCanceled(order: RevenueOrderForStats): boolean {
  const s = String(order.status || '').toUpperCase();
  return s === 'CANCELED' || s === 'CANCELLED';
}

/** Wig SKU depletion only; gift cards, digital, bookings excluded. */
function lineItemConsumesWigInventory(line: { type?: string; productName?: string; name?: string }): boolean {
  const t = String(line.type || '').toLowerCase();
  if (t === 'gift-card' || t === 'digital' || t === 'booking-appointment' || t === 'booking-consult') return false;
  return true;
}

function hasFreeGift(order: RevenueOrderForStats, key: 'brush' | 'melt'): boolean {
  const addOns = order.addOns ?? [];
  const opts = order.options ?? {};
  const str = JSON.stringify({ addOns, opts }).toLowerCase();
  if (key === 'brush') return /brush|free\s*gift/.test(str) || (opts as Record<string, string>)?.freeGift === 'brush';
  if (key === 'melt') return /melt|band/.test(str) || (opts as Record<string, string>)?.freeGift === 'melt';
  return false;
}

export function buildRevenueOrdersList(): RevenueOrderForStats[] {
  const out: RevenueOrderForStats[] = [];
  try {
    // Same source as client overview: localStorage userOrders_* (client overview uses this too; mock clients use getMockOrdersForClient only when viewing that client)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('userOrders_')) continue;
      const email = key.replace('userOrders_', '');
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      const active = Array.isArray(data?.activeOrders) ? data.activeOrders : [];
      const past = Array.isArray(data?.pastOrders) ? data.pastOrders : [];
      [...active, ...past].forEach((o: RevenueOrderForStats) => out.push({ ...o, userEmail: email } as RevenueOrderForStats & { userEmail?: string }));
    }
    out.sort((a, b) => {
      const ta = new Date((a.date || '').toString()).getTime();
      const tb = new Date((b.date || '').toString()).getTime();
      return tb - ta;
    });
  } catch {
    // Fallback mock data aligned with client overview mock shape (same products/statuses)
    const now = new Date();
    const d = (n: number) => {
      const x = new Date(now);
      x.setDate(x.getDate() - n);
      return x.toISOString().slice(0, 10);
    };
    return [
      { id: 'rev-1', date: d(2), total: 899, status: 'UNFULFILLED', orderNumber: '1001', lineItems: [{ productName: 'NOIR' }] },
      { id: 'rev-2', date: d(5), total: 749, status: 'AWAITING FORM', orderNumber: '1002', lineItems: [{ productName: 'BLANCO' }] },
      { id: 'rev-3', date: d(14), total: 649, status: 'SHIPPED', orderNumber: '1003', lineItems: [{ productName: 'SOFT CURL' }] },
      { id: 'rev-4', date: d(45), total: 899, status: 'DELIVERED', orderNumber: '1004', lineItems: [{ productName: 'BEACH WAVE' }] },
    ];
  }
  return out;
}

export type DepletedInventory = {
  products: Record<string, number>;
  packaging: Record<string, number>;
  totalUnits: number;
};

const INVENTORY_OVERRIDE_KEY = 'adminInventoryOverride';

export function getInventoryOverride(): DepletedInventory | null {
  try {
    const raw = localStorage.getItem(INVENTORY_OVERRIDE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { products?: Record<string, number>; packaging?: Record<string, number> };
    if (!data || typeof data !== 'object') return null;
    const products = { ...STARTING_INVENTORY.products, ...(data.products || {}) };
    const packaging = { ...STARTING_INVENTORY.packaging, ...(data.packaging || {}) };
    const totalUnits =
      Object.values(products).reduce((s, n) => s + Number(n), 0) +
      Object.values(packaging).reduce((s, n) => s + Number(n), 0);
    return { products, packaging, totalUnits };
  } catch {
    return null;
  }
}

export function setInventoryOverride(data: { products: Record<string, number>; packaging: Record<string, number> }): void {
  try {
    localStorage.setItem(INVENTORY_OVERRIDE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getDepletedInventory(orders: RevenueOrderForStats[]): DepletedInventory {
  const override = getInventoryOverride();
  if (override) return override;

  const products = { ...STARTING_INVENTORY.products };
  const packaging = { ...STARTING_INVENTORY.packaging };

  for (const order of orders) {
    if (orderInventoryCanceled(order)) continue;
    if (order.digitalFulfillmentOnly) continue;

    const rawLines =
      order.lineItems && order.lineItems.length > 0
        ? order.lineItems
        : order.items
          ? [
              {
                productName: order.productName || 'NOIR',
                name: order.productName,
                quantity: Math.max(1, Math.floor(Number(order.items)) || 1),
              },
            ]
          : [{ productName: order.productName || 'NOIR', quantity: 1 }];

    let anyPhysicalShippable = false;
    for (const line of rawLines) {
      if (!lineItemConsumesWigInventory(line as { type?: string })) continue;
      anyPhysicalShippable = true;
      const qty = Math.max(1, Math.floor(Number((line as { quantity?: number }).quantity) || 1));
      const label = ((line as { productName?: string; name?: string }).productName ||
        (line as { name?: string }).name ||
        order.productName ||
        'NOIR') as string;
      const name = label.toString().toUpperCase().replace(/\s+/g, ' ').trim();
      const key =
        PRODUCT_NAMES.find((p) => name === p.replace(/\s+/g, ' ') || name.includes(p)) || 'NOIR';
      if (products[key] != null) products[key] = Math.max(0, (products[key] ?? 0) - qty);
    }

    if (!anyPhysicalShippable) continue;

    const useBrush = hasFreeGift(order, 'brush') ? 1 : 0;
    const useMelt = hasFreeGift(order, 'melt') ? 1 : 0;

    packaging['MAILER BOXES'] = Math.max(0, (packaging['MAILER BOXES'] ?? 0) - 1);
    packaging['DUST BAGS'] = Math.max(0, (packaging['DUST BAGS'] ?? 0) - 1);
    packaging['BUSINESS CARDS'] = Math.max(0, (packaging['BUSINESS CARDS'] ?? 0) - 2);
    packaging['HANG TAGS'] = Math.max(0, (packaging['HANG TAGS'] ?? 0) - 1);
    packaging['LABELS'] = Math.max(0, (packaging['LABELS'] ?? 0) - 1);
    packaging['ENVELOPES'] = Math.max(0, (packaging['ENVELOPES'] ?? 0) - 1);
    packaging['THANK YOU NOTES'] = Math.max(0, (packaging['THANK YOU NOTES'] ?? 0) - 1);
    packaging['CAMPAIGN FLYERS'] = Math.max(0, (packaging['CAMPAIGN FLYERS'] ?? 0) - 1);
    packaging['MESH POUCH'] = Math.max(0, (packaging['MESH POUCH'] ?? 0) - 1);
    packaging['WHITE HAIR TIES'] = Math.max(0, (packaging['WHITE HAIR TIES'] ?? 0) - 2);
    packaging['WHITE DUCK CLIPS'] = Math.max(0, (packaging['WHITE DUCK CLIPS'] ?? 0) - 2);
    packaging['LASHES'] = Math.max(0, (packaging['LASHES'] ?? 0) - 1);
    if (useBrush) packaging['BRUSH'] = Math.max(0, (packaging['BRUSH'] ?? 0) - 1);
    if (useMelt) packaging['MELT BANDS'] = Math.max(0, (packaging['MELT BANDS'] ?? 0) - 1);
  }

  const totalUnits =
    Object.values(products).reduce((s, n) => s + n, 0) +
    Object.values(packaging).reduce((s, n) => s + n, 0);

  return { products, packaging, totalUnits };
}

/** Per-unit line-item sales counts (same normalization as admin Revenue overview TOP PRODUCTS). */
export type ProductSalesRow = { label: string; count: number };

/**
 * Count how many order line items map to each canonical product (NOIR, BLANCO, …).
 * Same rules as admin Revenue page `topProductsBySales`; sorted by count descending.
 */
export function getProductSalesCounts(orders: RevenueOrderForStats[]): ProductSalesRow[] {
  const counts: Record<string, number> = Object.fromEntries(PRODUCT_NAMES.map((p) => [p, 0])) as Record<string, number>;
  const normalize = (name: string) => (name || '').toUpperCase().replace(/\s+/g, ' ').trim();
  for (const order of orders) {
    if (orderInventoryCanceled(order)) continue;
    const items = order.lineItems?.length ? order.lineItems : [{ productName: order.productName, quantity: 1 }];
    for (const item of items) {
      if (!lineItemConsumesWigInventory(item as { type?: string })) continue;
      const n = normalize((item as { productName?: string; name?: string }).productName || (item as { name?: string }).name || '');
      const key = PRODUCT_NAMES.find((p) => n === p || n.includes(p) || p.replace(/\s+/g, ' ').includes(n));
      if (key) {
        const q = Math.max(1, Math.floor(Number((item as { quantity?: number }).quantity) || 1));
        counts[key] += q;
      }
    }
  }
  return PRODUCT_NAMES.map((name) => ({ label: name, count: counts[name] ?? 0 })).sort((a, b) => b.count - a.count);
}

/** Best-selling unit by line-item count; null if no product sales recorded. */
export function getTopProductBySales(orders: RevenueOrderForStats[]): ProductSalesRow | null {
  const rows = getProductSalesCounts(orders);
  const top = rows[0];
  if (!top || top.count === 0) return null;
  return top;
}

export function getOrdersStats(
  orders: RevenueOrderForStats[],
  totalRevenue: number
): { thisMonth: number; avgOrder: number; unfulfilledCount: number } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const thisMonth = orders.filter((o) => {
    const d = new Date((o.date || '').toString());
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;

  const fulfilled = ['DELIVERED', 'SHIPPED', 'CANCELED', 'CANCELLED'];
  const unfulfilledCount = orders.filter(
    (o) => !fulfilled.includes((o.status || '').toUpperCase().trim())
  ).length;

  const count = orders.length || 1;
  const avgOrder = totalRevenue / count;

  return { thisMonth, avgOrder, unfulfilledCount };
}

export function getTotalStartingInventoryUnits(): number {
  const p = Object.values(STARTING_INVENTORY.products).reduce((s, n) => s + n, 0);
  const k = Object.values(STARTING_INVENTORY.packaging).reduce((s, n) => s + n, 0);
  return p + k;
}
