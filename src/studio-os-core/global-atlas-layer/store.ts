import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { GlobalAtlasMemoryStore, GlobalAtlasVisitRecord } from './types';
import { GLOBAL_ATLAS_LAYER_EVENT } from './types';

const STORAGE_KEY = 'studioOsGlobalAtlasLayer_v1';
const MAX_VISITS = 64;

const EMPTY: GlobalAtlasMemoryStore = {
  version: 1,
  visits: [],
  lastWorkspacePath: null,
};

function dispatch(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GLOBAL_ATLAS_LAYER_EVENT));
}

export function readGlobalAtlasStore(): GlobalAtlasMemoryStore {
  return readStudioOsJson(STORAGE_KEY, () => ({ ...EMPTY, visits: [] }));
}

export function recordGlobalAtlasVisit(record: Omit<GlobalAtlasVisitRecord, 'visitedAt'>): void {
  const store = readGlobalAtlasStore();
  const entry: GlobalAtlasVisitRecord = { ...record, visitedAt: new Date().toISOString() };
  const filtered = store.visits.filter((v) => v.path !== record.path);
  store.visits = [entry, ...filtered].slice(0, MAX_VISITS);
  store.lastWorkspacePath = record.path;
  writeStudioOsJson(STORAGE_KEY, store);
  dispatch();
}

export function getLastWorkspacePath(): string | null {
  return readGlobalAtlasStore().lastWorkspacePath;
}

export function listGlobalAtlasVisits(limit = 12): GlobalAtlasVisitRecord[] {
  return readGlobalAtlasStore().visits.slice(0, limit);
}
