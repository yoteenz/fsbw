import {
  buildRevenueOrdersList,
  getBcfProductSalesCounts,
  getProductSalesCounts,
  type RevenueOrderForStats,
} from './adminRevenueStats';

export type AccountingSpreadsheetRow = {
  key: string;
  line: string;
  units: number;
  listPriceUsd: number;
  avgSalePriceUsd: number;
  revenueUsd: number;
  unitCostUsd: number;
  cogsUsd: number;
  profitUsd: number;
  marginPct: number | null;
  isTotal?: boolean;
  isSection?: boolean;
};

export type AccountingSpreadsheetModel = {
  rows: AccountingSpreadsheetRow[];
  totals: {
    revenueUsd: number;
    cogsUsd: number;
    profitUsd: number;
    marginPct: number | null;
    packagingCogsUsd: number;
    physicalOrders: number;
  };
};

const WIG_LIST_PRICES: Record<string, number> = {
  NOIR: 740,
  BLANCO: 820,
  'SOFT WAVE': 760,
  'BEACH WAVE': 780,
  'SOFT CURL': 780,
  'OCEAN CURL': 780,
};

/** Estimated landed unit cost (materials + production) — admin planning baseline, not tax filing. */
const WIG_UNIT_COSTS: Record<string, number> = {
  NOIR: 310,
  BLANCO: 345,
  'SOFT WAVE': 320,
  'BEACH WAVE': 328,
  'SOFT CURL': 328,
  'OCEAN CURL': 328,
};

const BCF_LIST_PRICE_USD = 380;
const BCF_UNIT_COST_USD = 165;
const GIFT_CARD_UNIT_COST_USD = 0;
const PACKAGING_COST_PER_PHYSICAL_ORDER_USD = 26;
const BOOKING_UNIT_COST_USD = 45;
const MEMBERSHIP_UNIT_COST_USD = 0;

type LineAgg = {
  line: string;
  listPriceUsd: number;
  unitCostUsd: number;
  units: number;
  revenueUsd: number;
};

function orderCanceled(order: RevenueOrderForStats): boolean {
  const s = String(order.status || '').toUpperCase();
  return s === 'CANCELED' || s === 'CANCELLED';
}

function normalizeWigKey(name: string): string | null {
  const n = name.toUpperCase().replace(/\s+/g, ' ').trim();
  for (const key of Object.keys(WIG_LIST_PRICES)) {
    if (n === key || n.includes(key)) return key;
  }
  return null;
}

function parseBcfLineLabel(raw: string): string | null {
  const upper = raw.toUpperCase().replace(/\s+/g, ' ').trim();
  const texture =
    (['STRAIGHT', 'WAVY', 'CURLY'] as const).find((t) => upper.includes(t)) ?? null;
  const category =
    (['BUNDLES', 'CLOSURES', 'FRONTALS'] as const).find((c) => upper.includes(c)) ?? null;
  if (texture && category) return `${texture} ${category}`;
  if (category && !texture) return `STRAIGHT ${category}`;
  return null;
}

function lineKeyForItem(line: {
  type?: string;
  productName?: string;
  name?: string;
}): { key: string; label: string; listPriceUsd: number; unitCostUsd: number } | null {
  const type = String(line.type || '').toLowerCase();
  const raw = String(line.productName || line.name || '').toUpperCase().replace(/\s+/g, ' ').trim();

  if (type === 'gift-card' || raw.includes('GIFT CARD')) {
    return { key: 'GIFT CARD', label: 'GIFT CARD (DIGITAL)', listPriceUsd: 100, unitCostUsd: GIFT_CARD_UNIT_COST_USD };
  }
  if (type === 'booking-consult' || type === 'booking-appointment' || raw.includes('CONSULT') || raw.includes('APPOINTMENT')) {
    return { key: 'BOOKING', label: 'BOOKING / CONSULT', listPriceUsd: 150, unitCostUsd: BOOKING_UNIT_COST_USD };
  }
  if (type === 'shop-texture-category' || raw.includes('BUNDLES') || raw.includes('CLOSURES') || raw.includes('FRONTALS')) {
    const bcfLabel = parseBcfLineLabel(raw) ?? 'STRAIGHT BUNDLES';
    return { key: `BCF:${bcfLabel}`, label: bcfLabel, listPriceUsd: BCF_LIST_PRICE_USD, unitCostUsd: BCF_UNIT_COST_USD };
  }
  if (raw.includes('MEMBERSHIP') || raw.includes('PREMIUM') || raw.includes('SUBSCRIPTION')) {
    return { key: 'MEMBERSHIP', label: 'MEMBERSHIP / PREMIUM', listPriceUsd: 199, unitCostUsd: MEMBERSHIP_UNIT_COST_USD };
  }

  const wig = normalizeWigKey(raw);
  if (wig) {
    return {
      key: wig,
      label: wig,
      listPriceUsd: WIG_LIST_PRICES[wig],
      unitCostUsd: WIG_UNIT_COSTS[wig],
    };
  }
  if (raw) {
    return { key: `OTHER:${raw}`, label: raw, listPriceUsd: 580, unitCostUsd: 240 };
  }
  return null;
}

function orderLines(order: RevenueOrderForStats): Array<{
  type?: string;
  productName?: string;
  name?: string;
  quantity?: number;
  subtotal?: number;
  price?: number;
}> {
  if (order.lineItems && order.lineItems.length > 0) {
    return order.lineItems as Array<{
      type?: string;
      productName?: string;
      name?: string;
      quantity?: number;
      subtotal?: number;
      price?: number;
    }>;
  }
  if (order.productName) {
    return [
      {
        productName: order.productName,
        name: String(order.productName),
        quantity: Math.max(1, Math.floor(Number(order.items) || 1)),
        type: (order as { type?: string }).type,
      },
    ];
  }
  return [];
}

function lineRevenueUsd(
  line: { quantity?: number; subtotal?: number; price?: number },
  order: RevenueOrderForStats,
  lineCount: number
): number {
  const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
  if (typeof line.subtotal === 'number' && !Number.isNaN(line.subtotal) && line.subtotal > 0) {
    return line.subtotal;
  }
  if (typeof line.price === 'number' && !Number.isNaN(line.price) && line.price > 0) {
    return line.price * qty;
  }
  const orderTotal = Number(order.total ?? order.amount) || 0;
  if (orderTotal > 0 && lineCount > 0) return orderTotal / lineCount;
  return 0;
}

function isPhysicalOrder(order: RevenueOrderForStats): boolean {
  if (order.digitalFulfillmentOnly) return false;
  const lines = orderLines(order);
  return lines.some((line) => {
    const type = String(line.type || '').toLowerCase();
    return type !== 'gift-card' && type !== 'digital' && type !== 'booking-consult' && type !== 'booking-appointment';
  });
}

function buildRowFromAgg(key: string, agg: LineAgg): AccountingSpreadsheetRow {
  const cogsUsd = agg.unitCostUsd * agg.units;
  const profitUsd = agg.revenueUsd - cogsUsd;
  const marginPct = agg.revenueUsd > 0 ? (profitUsd / agg.revenueUsd) * 100 : null;
  return {
    key,
    line: agg.line,
    units: agg.units,
    listPriceUsd: agg.listPriceUsd,
    avgSalePriceUsd: agg.units > 0 ? agg.revenueUsd / agg.units : 0,
    revenueUsd: agg.revenueUsd,
    unitCostUsd: agg.unitCostUsd,
    cogsUsd,
    profitUsd,
    marginPct,
  };
}

function ensureZeroSalesProductRows(aggMap: Map<string, LineAgg>): void {
  for (const [label, listPrice] of Object.entries(WIG_LIST_PRICES)) {
    if (!aggMap.has(label)) {
      aggMap.set(label, {
        line: label,
        listPriceUsd: listPrice,
        unitCostUsd: WIG_UNIT_COSTS[label],
        units: 0,
        revenueUsd: 0,
      });
    }
  }
  for (const row of getBcfProductSalesCounts(buildRevenueOrdersList())) {
    const label = `${row.textureLabel} ${row.categoryLabel}`;
    const key = `BCF:${label}`;
    if (!aggMap.has(key)) {
      aggMap.set(key, {
        line: label,
        listPriceUsd: BCF_LIST_PRICE_USD,
        unitCostUsd: BCF_UNIT_COST_USD,
        units: 0,
        revenueUsd: 0,
      });
    }
  }
}

/** Surgical P&L-style breakdown from the same order feed as admin Revenue. */
export function buildAdminAccountingSpreadsheet(
  orders: RevenueOrderForStats[] = buildRevenueOrdersList(),
  totalRevenueHint = 0
): AccountingSpreadsheetModel {
  const aggMap = new Map<string, LineAgg>();
  let physicalOrders = 0;

  for (const order of orders) {
    if (orderCanceled(order)) continue;
    const lines = orderLines(order);
    if (lines.length === 0) continue;
    if (isPhysicalOrder(order)) physicalOrders += 1;

    lines.forEach((line) => {
      const meta = lineKeyForItem(line);
      if (!meta) return;
      const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
      const revenue = lineRevenueUsd(line, order, lines.length);
      const existing = aggMap.get(meta.key);
      if (existing) {
        existing.units += qty;
        existing.revenueUsd += revenue;
      } else {
        aggMap.set(meta.key, {
          line: meta.label,
          listPriceUsd: meta.listPriceUsd,
          unitCostUsd: meta.unitCostUsd,
          units: qty,
          revenueUsd: revenue,
        });
      }
    });
  }

  ensureZeroSalesProductRows(aggMap);

  const wigRows = getProductSalesCounts(orders)
    .map((p) => aggMap.get(p.label))
    .filter(Boolean) as LineAgg[];
  const bcfRows = getBcfProductSalesCounts(orders)
    .map((p) => aggMap.get(`BCF:${p.textureLabel} ${p.categoryLabel}`))
    .filter(Boolean) as LineAgg[];
  const otherKeys = [...aggMap.keys()].filter(
    (k) => !WIG_LIST_PRICES[k] && !k.startsWith('BCF:') && k !== 'GIFT CARD' && k !== 'BOOKING' && k !== 'MEMBERSHIP'
  );

  const rows: AccountingSpreadsheetRow[] = [];

  if (wigRows.length > 0) {
    rows.push({
      key: 'section-wigs',
      line: 'BUILD-A-WIG UNITS',
      units: 0,
      listPriceUsd: 0,
      avgSalePriceUsd: 0,
      revenueUsd: 0,
      unitCostUsd: 0,
      cogsUsd: 0,
      profitUsd: 0,
      marginPct: null,
      isSection: true,
    });
    for (const agg of wigRows) {
      rows.push(buildRowFromAgg(agg.line, agg));
    }
  }

  const bcfWithSales = bcfRows.filter((r) => r.units > 0);
  const bcfZero = bcfRows.filter((r) => r.units === 0);
  if (bcfWithSales.length > 0 || bcfZero.length > 0) {
    rows.push({
      key: 'section-bcf',
      line: 'BCF (BUNDLES · CLOSURES · FRONTALS)',
      units: 0,
      listPriceUsd: 0,
      avgSalePriceUsd: 0,
      revenueUsd: 0,
      unitCostUsd: 0,
      cogsUsd: 0,
      profitUsd: 0,
      marginPct: null,
      isSection: true,
    });
    for (const agg of [...bcfWithSales, ...bcfZero]) {
      rows.push(buildRowFromAgg(`BCF:${agg.line}`, agg));
    }
  }

  for (const key of ['GIFT CARD', 'BOOKING', 'MEMBERSHIP']) {
    const agg = aggMap.get(key);
    if (agg && agg.units > 0) rows.push(buildRowFromAgg(key, agg));
  }

  for (const key of otherKeys) {
    const agg = aggMap.get(key);
    if (agg && agg.units > 0) rows.push(buildRowFromAgg(key, agg));
  }

  const productRevenue = rows.filter((r) => !r.isSection && !r.isTotal).reduce((s, r) => s + r.revenueUsd, 0);
  const productCogs = rows.filter((r) => !r.isSection && !r.isTotal).reduce((s, r) => s + r.cogsUsd, 0);
  const packagingCogsUsd = physicalOrders * PACKAGING_COST_PER_PHYSICAL_ORDER_USD;

  rows.push({
    key: 'packaging',
    line: 'PACKAGING & FULFILLMENT (PER PHYSICAL ORDER)',
    units: physicalOrders,
    listPriceUsd: 0,
    avgSalePriceUsd: PACKAGING_COST_PER_PHYSICAL_ORDER_USD,
    revenueUsd: 0,
    unitCostUsd: PACKAGING_COST_PER_PHYSICAL_ORDER_USD,
    cogsUsd: packagingCogsUsd,
    profitUsd: -packagingCogsUsd,
    marginPct: null,
  });

  let revenueUsd = productRevenue;
  let cogsUsd = productCogs + packagingCogsUsd;

  if (totalRevenueHint > 0 && productRevenue === 0) {
    revenueUsd = totalRevenueHint;
    cogsUsd = Math.round(totalRevenueHint * 0.46);
  }

  const profitUsd = revenueUsd - cogsUsd;
  const marginPct = revenueUsd > 0 ? (profitUsd / revenueUsd) * 100 : null;

  rows.push({
    key: 'total',
    line: 'TOTAL (YTD)',
    units: rows.filter((r) => !r.isSection && !r.isTotal && r.key !== 'packaging').reduce((s, r) => s + r.units, 0),
    listPriceUsd: 0,
    avgSalePriceUsd: 0,
    revenueUsd,
    unitCostUsd: 0,
    cogsUsd,
    profitUsd,
    marginPct,
    isTotal: true,
  });

  return {
    rows,
    totals: {
      revenueUsd,
      cogsUsd,
      profitUsd,
      marginPct,
      packagingCogsUsd,
      physicalOrders,
    },
  };
}

export function formatAccountingUsd(value: number): string {
  const n = Math.round(value);
  const prefix = n < 0 ? '-$' : '$';
  return `${prefix}${Math.abs(n).toLocaleString('en-US')}`;
}

export function formatAccountingMargin(marginPct: number | null): string {
  if (marginPct === null || Number.isNaN(marginPct)) return '—';
  return `${marginPct.toFixed(1)}%`;
}
