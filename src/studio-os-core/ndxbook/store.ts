import { NDXBOOK_STORAGE_KEY, NDXBOOK_VERSION } from './constants';
import type { NdxbookDashboardSnapshot, NdxbookStore } from './types';

function defaultDashboard(): NdxbookDashboardSnapshot {
  return {
    brand: 'ndxbook',
    positioning: 'the index for everyday knowledge.',
    launchVolumes: 5,
    pagesCreated: 0,
    pagesScheduled: 0,
    socialsConnected: 0,
    labsExperiments: 0,
    nextAction: 'connect socials & create first 10 pages',
  };
}

function emptyStore(): NdxbookStore {
  return {
    brand: null,
    taxonomy: null,
    volumes: [],
    programming: [],
    programmingSlots: [],
    pages: [],
    talentHosts: [],
    socialAccounts: [],
    voiceRules: null,
    creativeDna: null,
    launchChecklist: [],
    nextPageNumber: 1,
    dashboard: defaultDashboard(),
    version: NDXBOOK_VERSION,
  };
}

export function readNdxbookStore(): NdxbookStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(NDXBOOK_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as NdxbookStore;
    return { ...emptyStore(), ...parsed, version: NDXBOOK_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeNdxbookStore(store: NdxbookStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(NDXBOOK_STORAGE_KEY, JSON.stringify(store));
}

export function mergeNdxbookPatch(patch: Partial<NdxbookStore>): void {
  const store = readNdxbookStore();
  writeNdxbookStore({ ...store, ...patch, version: NDXBOOK_VERSION });
}

export function bootstrapNdxbookStore(seed?: Partial<NdxbookStore>): void {
  const existing = readNdxbookStore();
  if (existing.brand?.id === 'ndxbook') return;
  writeNdxbookStore({ ...emptyStore(), ...seed, version: NDXBOOK_VERSION });
}

export function getNdxbookForWorkspace(workspaceId: string) {
  const store = readNdxbookStore();
  if (store.brand?.workspaceId !== workspaceId) {
    return {
      ...store,
      pages: [],
      programmingSlots: [],
    };
  }
  return store;
}

export function refreshNdxbookDashboardMetrics(): NdxbookDashboardSnapshot {
  const store = readNdxbookStore();
  const dashboard: NdxbookDashboardSnapshot = {
    brand: store.brand?.publicName ?? 'ndxbook',
    positioning: store.brand?.positioning ?? 'the index for everyday knowledge.',
    launchVolumes: store.volumes.length || 5,
    pagesCreated: store.pages.length,
    pagesScheduled: store.pages.filter((p) => p.status === 'scheduled').length,
    socialsConnected: store.socialAccounts.filter((s) => s.status === 'connected').length,
    labsExperiments: store.pages.filter((p) => p.experimentId).length,
    nextAction:
      store.pages.length === 0
        ? 'connect socials & create first 10 pages'
        : store.dashboard.nextAction,
  };
  mergeNdxbookPatch({ dashboard });
  return dashboard;
}

export function countPagesByStatus(status: NdxbookStore['pages'][0]['status']): number {
  return readNdxbookStore().pages.filter((p) => p.status === status).length;
}
