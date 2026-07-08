/**
 * Foundry Asset Registry™ — local-first storage abstraction.
 * Future: Supabase persistence layer replaces localStorage without changing resolver API.
 */

import {
  FOUNDRY_REGISTRY_STORAGE_KEY,
  FOUNDRY_REGISTRY_UPDATED_EVENT,
  FOUNDRY_REGISTRY_VERSION,
  type FoundryAsset,
  type FoundryAssetRegistryStore,
  type FoundryAssetSeed,
  type FoundryAssetStatus,
  type FoundryAssetVersionRecord,
} from './foundryTypes';
import { HERO_ICON_SEEDS } from './productLines/heroIcons';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyStore(): FoundryAssetRegistryStore {
  return {
    version: FOUNDRY_REGISTRY_VERSION,
    assets: {},
    versionHistory: {},
    updatedAt: nowIso(),
  };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FOUNDRY_REGISTRY_UPDATED_EVENT));
  }
}

export function readFoundryRegistryStore(): FoundryAssetRegistryStore {
  if (typeof localStorage === 'undefined') return seedFoundryRegistryStore();
  try {
    const raw = localStorage.getItem(FOUNDRY_REGISTRY_STORAGE_KEY);
    if (!raw) return seedFoundryRegistryStore();
    const parsed = JSON.parse(raw) as FoundryAssetRegistryStore;
    return mergeWithSeeds({ ...emptyStore(), ...parsed, version: FOUNDRY_REGISTRY_VERSION });
  } catch {
    return seedFoundryRegistryStore();
  }
}

export function writeFoundryRegistryStore(store: FoundryAssetRegistryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    FOUNDRY_REGISTRY_STORAGE_KEY,
    JSON.stringify({ ...store, updatedAt: nowIso() })
  );
  dispatchUpdated();
}

function buildAssetFromSeed(seed: FoundryAssetSeed, status: FoundryAssetStatus = 'missing'): FoundryAsset {
  const ts = nowIso();
  return {
    assetId: seed.slug,
    slug: seed.slug,
    name: seed.name,
    assetClass: seed.assetClass,
    recipeId: seed.recipeId,
    version: '0.0.0',
    status,
    metadata: {
      description: seed.description,
      promptIntent: seed.promptIntent,
      defaultUsage: seed.defaultUsage,
      registryDestination: seed.registryDestination,
    },
    tags: seed.tags,
    createdAt: ts,
    updatedAt: ts,
    usedBy: seed.defaultUsage,
    worldGraphRefs: {
      usedByDepartments: [],
      usedByScenes: [],
      usedByComponents: seed.defaultUsage,
      originRecipe: seed.recipeId,
      relatedAssets: [],
    },
  };
}

function allProductLineSeeds(): FoundryAssetSeed[] {
  return [...HERO_ICON_SEEDS];
}

function mergeWithSeeds(store: FoundryAssetRegistryStore): FoundryAssetRegistryStore {
  const assets = { ...store.assets };
  for (const seed of allProductLineSeeds()) {
    if (!assets[seed.slug]) {
      assets[seed.slug] = buildAssetFromSeed(seed, 'missing');
    }
  }
  return { ...store, assets };
}

export function seedFoundryRegistryStore(): FoundryAssetRegistryStore {
  const assets: Record<string, FoundryAsset> = {};
  for (const seed of allProductLineSeeds()) {
    assets[seed.slug] = buildAssetFromSeed(seed, 'missing');
  }
  const store: FoundryAssetRegistryStore = {
    version: FOUNDRY_REGISTRY_VERSION,
    assets,
    versionHistory: {},
    updatedAt: nowIso(),
  };
  writeFoundryRegistryStore(store);
  return store;
}

export function getFoundryAssetBySlug(slug: string): FoundryAsset | null {
  const store = readFoundryRegistryStore();
  return store.assets[slug] ?? null;
}

export function getFoundryAssetById(assetId: string): FoundryAsset | null {
  return getFoundryAssetBySlug(assetId);
}

export function listFoundryAssets(filter?: {
  assetClass?: FoundryAsset['assetClass'];
  status?: FoundryAssetStatus;
}): FoundryAsset[] {
  const store = readFoundryRegistryStore();
  return Object.values(store.assets).filter((asset) => {
    if (filter?.assetClass && asset.assetClass !== filter.assetClass) return false;
    if (filter?.status && asset.status !== filter.status) return false;
    return true;
  });
}

export function upsertFoundryAsset(asset: FoundryAsset): FoundryAsset {
  const store = readFoundryRegistryStore();
  const previous = store.assets[asset.slug];
  const nextAsset: FoundryAsset = {
    ...asset,
    updatedAt: nowIso(),
    createdAt: previous?.createdAt ?? asset.createdAt,
  };

  const versionHistory = { ...store.versionHistory };
  if (previous && previous.version !== nextAsset.version) {
    const history = versionHistory[asset.slug] ?? [];
    const record: FoundryAssetVersionRecord = {
      version: previous.version,
      asset: previous,
      archivedAt: nowIso(),
    };
    versionHistory[asset.slug] = [record, ...history].slice(0, 20);
  }

  const nextStore: FoundryAssetRegistryStore = {
    ...store,
    assets: { ...store.assets, [asset.slug]: nextAsset },
    versionHistory,
  };
  writeFoundryRegistryStore(nextStore);
  return nextAsset;
}

export function updateFoundryAssetStatus(
  slug: string,
  status: FoundryAssetStatus,
  patch?: Partial<FoundryAsset>
): FoundryAsset | null {
  const existing = getFoundryAssetBySlug(slug);
  if (!existing) return null;
  return upsertFoundryAsset({ ...existing, ...patch, status });
}

export function recordFoundryAssetUsage(slug: string, componentRef: string): void {
  const asset = getFoundryAssetBySlug(slug);
  if (!asset) return;
  const usedBy = Array.from(new Set([...asset.usedBy, componentRef]));
  const worldGraphRefs = {
    ...asset.worldGraphRefs,
    usedByComponents: Array.from(new Set([...asset.worldGraphRefs.usedByComponents, componentRef])),
  };
  upsertFoundryAsset({ ...asset, usedBy, worldGraphRefs });
}

export function getFoundryAssetVersionHistory(slug: string): FoundryAssetVersionRecord[] {
  const store = readFoundryRegistryStore();
  return store.versionHistory[slug] ?? [];
}

/** Documented future persistence hook — swap implementation when Supabase tables exist. */
export type FoundryRegistryPersistenceAdapter = {
  load: () => Promise<FoundryAssetRegistryStore>;
  save: (store: FoundryAssetRegistryStore) => Promise<void>;
};

export const LOCAL_FOUNDRY_PERSISTENCE: FoundryRegistryPersistenceAdapter = {
  async load() {
    return readFoundryRegistryStore();
  },
  async save(store) {
    writeFoundryRegistryStore(store);
  },
};
