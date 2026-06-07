/**
 * Client cache of PSA member context from GET /api/psa/thread (purchase contexts, archetype).
 * SLAY DNA is server-only — not stored for member-visible UI.
 */
export type CachedPurchaseContext = {
  id: string;
  occasion: string;
  monthYear?: string;
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
  createdAt: string;
};

export type CachedPsaMemberContext = {
  slayArchetype?: string | null;
  purchaseContexts: CachedPurchaseContext[];
  refreshedAt?: string;
};

let cache: CachedPsaMemberContext | null = null;

export function setCachedPsaMemberContext(raw: unknown): void {
  if (!raw || typeof raw !== 'object') {
    cache = null;
    return;
  }
  const row = raw as {
    slayArchetype?: string | null;
    purchaseContexts?: CachedPurchaseContext[];
    refreshedAt?: string;
  };
  cache = {
    slayArchetype: row.slayArchetype ?? null,
    purchaseContexts: Array.isArray(row.purchaseContexts) ? row.purchaseContexts : [],
    refreshedAt: row.refreshedAt,
  };
}

export function getCachedPsaMemberContext(): CachedPsaMemberContext | null {
  return cache;
}

export function getCachedSlayArchetype(): string | null {
  return cache?.slayArchetype?.trim() || null;
}
