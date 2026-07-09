import {
  BUSINESS_DISCOVERY_ENGINE_VERSION,
  BUSINESS_DISCOVERY_STORAGE_KEY,
  BUSINESS_DISCOVERY_UPDATED_EVENT,
} from '../constants';
import { createDiscoverySession, normalizeDiscoverySession } from './schemas';
import type { BusinessDiscoveryStore, DiscoverySession } from '../types';

function emptyStore(): BusinessDiscoveryStore {
  return {
    version: BUSINESS_DISCOVERY_ENGINE_VERSION,
    sessions: [],
    updatedAt: new Date().toISOString(),
  };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BUSINESS_DISCOVERY_UPDATED_EVENT));
  }
}

export function discoverySessionKey(organizationId: string): string {
  return organizationId;
}

export function readBusinessDiscoveryStore(): BusinessDiscoveryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(BUSINESS_DISCOVERY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as BusinessDiscoveryStore;
    return {
      ...emptyStore(),
      ...parsed,
      version: BUSINESS_DISCOVERY_ENGINE_VERSION,
      sessions: Array.isArray(parsed.sessions)
        ? parsed.sessions.map((session) => normalizeDiscoverySession(session))
        : [],
    };
  } catch {
    return emptyStore();
  }
}

export function writeBusinessDiscoveryStore(store: BusinessDiscoveryStore): void {
  if (typeof localStorage === 'undefined') return;
  const next: BusinessDiscoveryStore = {
    ...store,
    version: BUSINESS_DISCOVERY_ENGINE_VERSION,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(BUSINESS_DISCOVERY_STORAGE_KEY, JSON.stringify(next));
  dispatchUpdated();
}

export function getDiscoverySession(organizationId: string): DiscoverySession | null {
  return (
    readBusinessDiscoveryStore().sessions.find(
      (session) => discoverySessionKey(session.organizationId) === discoverySessionKey(organizationId)
    ) ?? null
  );
}

export function ensureDiscoverySession(
  organizationId: string,
  options: {
    founderId?: string;
    founderName?: string;
    companyName?: string;
    industryId?: string;
  } = {}
): DiscoverySession {
  const existing = getDiscoverySession(organizationId);
  if (existing) return normalizeDiscoverySession(existing);

  const session = createDiscoverySession(organizationId, options);
  const store = readBusinessDiscoveryStore();
  writeBusinessDiscoveryStore({ ...store, sessions: [...store.sessions, session] });
  return session;
}

export function upsertDiscoverySession(session: DiscoverySession): DiscoverySession {
  const normalized = normalizeDiscoverySession(session);
  const key = discoverySessionKey(normalized.organizationId);
  const store = readBusinessDiscoveryStore();
  const sessions = store.sessions.filter((item) => discoverySessionKey(item.organizationId) !== key);
  writeBusinessDiscoveryStore({ ...store, sessions: [...sessions, normalized] });
  return normalized;
}

export type BusinessDiscoveryPersistenceAdapter = {
  load: (organizationId: string) => Promise<DiscoverySession | null>;
  save: (session: DiscoverySession) => Promise<void>;
};
