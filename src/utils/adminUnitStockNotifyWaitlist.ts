import { getMockClientsForAyoteenz } from '../pages/admin/clients/page';
import { WIG_UNIT_PRODUCT_NAMES } from './productInventoryAvailability';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';
import {
  BCF_NOTIFY_PRODUCT_NAMES,
  isBcfNotifyProductName,
  loadUnitStockNotifyWaitlist,
  stockNotifyProductActionRoute,
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
  const upper = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s*·\s*/g, ' · ');
  if (isBcfNotifyProductName(upper)) return upper;
  return normalizeCartLineProductName({ name: raw, productName: raw }) || upper;
}

export const ALL_NOTIFY_WAITLIST_PRODUCT_NAMES = [
  ...WIG_UNIT_PRODUCT_NAMES,
  ...BCF_NOTIFY_PRODUCT_NAMES,
];

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

/** Products with waitlist signups, fixed unit + BCF order then any extras alphabetically. */
export function buildWaitlistProductGroups(): WaitlistProductGroup[] {
  const byProduct = groupWaitlistEntries(loadUnitStockNotifyWaitlist());
  const ordered: string[] = [];
  for (const name of ALL_NOTIFY_WAITLIST_PRODUCT_NAMES) {
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

/** All wig units + BCF SKUs for display (count 0 when no signups). */
export function buildWaitlistProductGroupsWithZeros(): WaitlistProductGroup[] {
  const withSignups = buildWaitlistProductGroups();
  const byName = new Map(withSignups.map((g) => [g.productName, g]));
  return ALL_NOTIFY_WAITLIST_PRODUCT_NAMES.map((productName) => {
    return (
      byName.get(productName) ?? {
        productName,
        count: 0,
        signups: [],
      }
    );
  });
}

const WAITLIST_TEXTURES = ['STRAIGHT', 'WAVY', 'CURLY'] as const;
type WaitlistTextureLabel = (typeof WAITLIST_TEXTURES)[number];

export type WaitlistCatalogSubsection = {
  textureLabel: WaitlistTextureLabel | null;
  products: WaitlistProductGroup[];
};

export type WaitlistCatalogSection = {
  id: 'units' | 'bundles' | 'closures' | 'frontals';
  label: string;
  subsections: WaitlistCatalogSubsection[];
};

function emptyGroup(productName: string): WaitlistProductGroup {
  return { productName, count: 0, signups: [] };
}

function groupFor(
  byName: Map<string, WaitlistProductGroup>,
  productName: string
): WaitlistProductGroup {
  return byName.get(productName) ?? emptyGroup(productName);
}

/** Units, then BCF categories each with STRAIGHT / WAVY / CURLY subsections. */
export function buildWaitlistCatalogSections(groups: WaitlistProductGroup[]): WaitlistCatalogSection[] {
  const byName = new Map(groups.map((g) => [g.productName, g]));

  const bcfSection = (
    id: 'bundles' | 'closures' | 'frontals',
    label: 'BUNDLES' | 'CLOSURES' | 'FRONTALS'
  ): WaitlistCatalogSection => ({
    id,
    label,
    subsections: WAITLIST_TEXTURES.map((textureLabel) => ({
      textureLabel,
      products: [groupFor(byName, `${label} · ${textureLabel}`)],
    })),
  });

  return [
    {
      id: 'units',
      label: 'UNITS',
      subsections: [
        {
          textureLabel: null,
          products: WIG_UNIT_PRODUCT_NAMES.map((name) => groupFor(byName, name)),
        },
      ],
    },
    bcfSection('bundles', 'BUNDLES'),
    bcfSection('closures', 'CLOSURES'),
    bcfSection('frontals', 'FRONTALS'),
  ];
}

function sortSignups(signups: WaitlistClientLookup[]): WaitlistClientLookup[] {
  return [...signups].sort((a, b) => {
    const na = a.displayName || a.email;
    const nb = b.displayName || b.email;
    return na.localeCompare(nb);
  });
}

/**
 * Spread mock clients from admin clients overview across products so VIEW WAITLIST UI can be tested.
 * Merges with real signups (deduped by email).
 */
export function enrichWaitlistGroupsWithMockSignups(groups: WaitlistProductGroup[]): WaitlistProductGroup[] {
  const mocks = getMockClientsForAyoteenz();
  if (!mocks.length) return groups;

  return groups.map((group, productIdx) => {
    const existingEmails = new Set(group.signups.map((s) => normalizeEmail(s.email)));
    const extra: WaitlistClientLookup[] = [];
    for (let slot = 0; slot < 2; slot += 1) {
      const mock = mocks[(productIdx * 2 + slot) % mocks.length];
      const email = normalizeEmail(mock?.email || '');
      if (!email || existingEmails.has(email)) continue;
      existingEmails.add(email);
      extra.push(lookupWaitlistClientByEmail(email));
    }
    if (extra.length === 0) return group;
    const signups = sortSignups([...group.signups, ...extra]);
    return { ...group, count: signups.length, signups };
  });
}

export function waitlistProductShopRoute(productName: string): string {
  return stockNotifyProductActionRoute(productName);
}
