import { getMockClientsForAyoteenz } from '../pages/admin/clients/page';
import { WIG_UNIT_PRODUCT_NAMES } from './productInventoryAvailability';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';
import {
  loadUnitStockNotifyWaitlist,
  type UnitStockNotifyWaitlistEntry,
  UNIT_STOCK_NOTIFY_UPDATED_EVENT,
} from './unitStockNotify';

export { UNIT_STOCK_NOTIFY_UPDATED_EVENT };

export type WaitlistClientLookup = {
  email: string;
  displayName: string | null;
  hasClientRecord: boolean;
};

export type WaitlistProductGroup = {
  productName: string;
  count: number;
  signups: WaitlistClientLookup[];
};

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

function normalizeProductName(raw: string): string {
  return normalizeCartLineProductName({ name: raw, productName: raw }) || String(raw || '').trim().toUpperCase();
}

type ClientRow = { email?: string; firstName?: string; lastName?: string };

function loadRegisteredUsers(): ClientRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('registeredUsers');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ClientRow[]) : [];
  } catch {
    return [];
  }
}

function displayNameFromRow(row: ClientRow): string | null {
  const name = [row.firstName, row.lastName]
    .map((p) => String(p || '').trim())
    .filter(Boolean)
    .join(' ');
  return name ? name.toUpperCase() : null;
}

/** Resolve name + whether email exists in admin client details data (registered + mock clients). */
export function lookupWaitlistClientByEmail(email: string): WaitlistClientLookup {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return { email: '', displayName: null, hasClientRecord: false };
  }

  const rows: ClientRow[] = [...loadRegisteredUsers(), ...getMockClientsForAyoteenz()];
  const match = rows.find((r) => normalizeEmail(r.email || '') === normalized);
  if (!match) {
    return { email: normalized, displayName: null, hasClientRecord: false };
  }
  return {
    email: normalized,
    displayName: displayNameFromRow(match),
    hasClientRecord: true,
  };
}

function groupWaitlistEntries(entries: UnitStockNotifyWaitlistEntry[]): Map<string, UnitStockNotifyWaitlistEntry[]> {
  const byProduct = new Map<string, UnitStockNotifyWaitlistEntry[]>();
  for (const entry of entries) {
    const product = normalizeProductName(entry.productName);
    if (!product) continue;
    const list = byProduct.get(product) ?? [];
    const email = normalizeEmail(entry.email);
    if (!email) continue;
    if (list.some((e) => normalizeEmail(e.email) === email)) continue;
    list.push({ ...entry, email, productName: product });
    byProduct.set(product, list);
  }
  return byProduct;
}

/** Products with waitlist signups, fixed unit order then any extras alphabetically. */
export function buildWaitlistProductGroups(): WaitlistProductGroup[] {
  const byProduct = groupWaitlistEntries(loadUnitStockNotifyWaitlist());
  const ordered: string[] = [];
  for (const name of WIG_UNIT_PRODUCT_NAMES) {
    if (byProduct.has(name)) ordered.push(name);
  }
  const extras = [...byProduct.keys()].filter((k) => !ordered.includes(k)).sort();
  ordered.push(...extras);

  return ordered.map((productName) => {
    const signups = (byProduct.get(productName) ?? []).map((e) => lookupWaitlistClientByEmail(e.email));
    signups.sort((a, b) => {
      const na = a.displayName || a.email;
      const nb = b.displayName || b.email;
      return na.localeCompare(nb);
    });
    return { productName, count: signups.length, signups };
  });
}

/** All six units for display (count 0 when no signups). */
export function buildWaitlistProductGroupsWithZeros(): WaitlistProductGroup[] {
  const withSignups = buildWaitlistProductGroups();
  const byName = new Map(withSignups.map((g) => [g.productName, g]));
  return WIG_UNIT_PRODUCT_NAMES.map((productName) => {
    return (
      byName.get(productName) ?? {
        productName,
        count: 0,
        signups: [],
      }
    );
  });
}
