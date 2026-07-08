import {
  KNOWLEDGE_RETENTION_ENGINE_VERSION,
  KNOWLEDGE_RETENTION_STORAGE_KEY,
  KNOWLEDGE_RETENTION_UPDATED_EVENT,
} from '../constants';
import { LAUNCH_INDUSTRY_UPDATES, LAUNCH_RETENTION_PROFILES } from '../retention-profiles/catalog';
import { mergeWithLaunchCatalog } from '../retention-profiles/profile-store';
import type {
  KnowledgeIndustryUpdate,
  KnowledgeRetentionProfile,
  KnowledgeRetentionStore,
  RefresherExperienceSpec,
  RetentionReviewRecord,
} from '../types';

function emptyStore(organizationId: string, learnerId: string): KnowledgeRetentionStore {
  const now = new Date().toISOString();
  return {
    version: KNOWLEDGE_RETENTION_ENGINE_VERSION,
    organizationId,
    learnerId,
    profiles: LAUNCH_RETENTION_PROFILES,
    industryUpdates: LAUNCH_INDUSTRY_UPDATES,
    reviewHistory: [],
    queuedRefreshers: [],
    updatedAt: now,
  };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(KNOWLEDGE_RETENTION_UPDATED_EVENT));
  }
}

export function readKnowledgeRetentionStore(): KnowledgeRetentionStore[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KNOWLEDGE_RETENTION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KnowledgeRetentionStore[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeKnowledgeRetentionStores(stores: KnowledgeRetentionStore[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KNOWLEDGE_RETENTION_STORAGE_KEY, JSON.stringify(stores));
  dispatchUpdated();
}

export function storeKey(organizationId: string, learnerId: string): string {
  return `${organizationId}:${learnerId}`;
}

export function getKnowledgeRetentionStore(
  organizationId: string,
  learnerId: string
): KnowledgeRetentionStore | null {
  const key = storeKey(organizationId, learnerId);
  return readKnowledgeRetentionStore().find((store) => storeKey(store.organizationId, store.learnerId) === key) ?? null;
}

export function ensureKnowledgeRetentionStore(
  organizationId: string,
  learnerId: string
): KnowledgeRetentionStore {
  const existing = getKnowledgeRetentionStore(organizationId, learnerId);
  if (existing) {
    return {
      ...existing,
      version: KNOWLEDGE_RETENTION_ENGINE_VERSION,
      profiles: mergeWithLaunchCatalog(existing.profiles),
    };
  }

  const store = emptyStore(organizationId, learnerId);
  const stores = readKnowledgeRetentionStore();
  writeKnowledgeRetentionStores([...stores, store]);
  return store;
}

export function upsertKnowledgeRetentionStore(store: KnowledgeRetentionStore): KnowledgeRetentionStore {
  const next: KnowledgeRetentionStore = {
    ...store,
    version: KNOWLEDGE_RETENTION_ENGINE_VERSION,
    profiles: mergeWithLaunchCatalog(store.profiles),
    updatedAt: new Date().toISOString(),
  };
  const key = storeKey(next.organizationId, next.learnerId);
  const stores = readKnowledgeRetentionStore().filter(
    (item) => storeKey(item.organizationId, item.learnerId) !== key
  );
  writeKnowledgeRetentionStores([...stores, next]);
  return next;
}

export function updateRetentionProfiles(
  organizationId: string,
  learnerId: string,
  profiles: KnowledgeRetentionProfile[]
): KnowledgeRetentionStore {
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  return upsertKnowledgeRetentionStore({ ...store, profiles: mergeWithLaunchCatalog(profiles) });
}

export function appendIndustryUpdates(
  organizationId: string,
  learnerId: string,
  updates: KnowledgeIndustryUpdate[]
): KnowledgeRetentionStore {
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  const byId = new Map(store.industryUpdates.map((update) => [update.id, update]));
  for (const update of updates) byId.set(update.id, update);
  return upsertKnowledgeRetentionStore({ ...store, industryUpdates: Array.from(byId.values()) });
}

export function appendReviewRecord(
  organizationId: string,
  learnerId: string,
  record: RetentionReviewRecord
): KnowledgeRetentionStore {
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  return upsertKnowledgeRetentionStore({
    ...store,
    reviewHistory: [...store.reviewHistory.filter((item) => item.id !== record.id), record],
  });
}

export function queueRefresherSpecs(
  organizationId: string,
  learnerId: string,
  specs: RefresherExperienceSpec[]
): KnowledgeRetentionStore {
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  const byId = new Map(store.queuedRefreshers.map((spec) => [spec.id, spec]));
  for (const spec of specs) byId.set(spec.id, spec);
  return upsertKnowledgeRetentionStore({
    ...store,
    queuedRefreshers: Array.from(byId.values()),
  });
}

/** Future: Supabase adapter replaces localStorage without changing orchestration API. */
export type KnowledgeRetentionPersistenceAdapter = {
  load: (organizationId: string, learnerId: string) => Promise<KnowledgeRetentionStore | null>;
  save: (store: KnowledgeRetentionStore) => Promise<void>;
};
