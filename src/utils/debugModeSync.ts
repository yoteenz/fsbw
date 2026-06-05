import type { DebugModeStore, DebugPageConfig } from './debugMode';
import {
  DEBUG_MODE_UPDATED_EVENT,
  loadDebugModeStore,
  saveDebugModeStore,
} from './debugMode';

export type PageDebugCloudPayload = {
  store: DebugModeStore;
  updatedAt: number;
};

function isPageConfig(v: unknown): v is DebugPageConfig {
  if (!v || typeof v !== 'object') return false;
  const c = v as DebugPageConfig;
  return typeof c.updatedAt === 'number' && c.elements != null && typeof c.elements === 'object';
}

export function mergeDebugModeStores(local: DebugModeStore, remote: DebugModeStore): DebugModeStore {
  const merged: DebugModeStore = { ...local };
  for (const [pageKey, remotePage] of Object.entries(remote)) {
    if (!isPageConfig(remotePage)) continue;
    const localPage = merged[pageKey];
    if (!localPage || !isPageConfig(localPage) || remotePage.updatedAt >= localPage.updatedAt) {
      merged[pageKey] = remotePage;
    }
  }
  return merged;
}

export function buildPageDebugCloudPayload(store: DebugModeStore): PageDebugCloudPayload {
  const pageTimes = Object.values(store).map((p) => p?.updatedAt ?? 0);
  return {
    store,
    updatedAt: Math.max(Date.now(), ...pageTimes, 0),
  };
}

export async function fetchPageDebugConfigFromCloud(): Promise<PageDebugCloudPayload | null> {
  const { getAdminPageDebugConfig } = await import('./api');
  const config = await getAdminPageDebugConfig();
  if (!config || typeof config !== 'object') return null;
  const payload = config as PageDebugCloudPayload;
  if (!payload.store || typeof payload.store !== 'object') return null;
  return payload;
}

export async function syncPageDebugStoreToCloud(store?: DebugModeStore): Promise<void> {
  const { putAdminPageDebugConfig } = await import('./api');
  const nextStore = store ?? loadDebugModeStore();
  await putAdminPageDebugConfig(buildPageDebugCloudPayload(nextStore) as unknown as Record<string, unknown>);
}

export async function fetchAndMergePageDebugConfigFromCloud(): Promise<DebugModeStore> {
  const local = loadDebugModeStore();
  try {
    const remotePayload = await fetchPageDebugConfigFromCloud();
    if (!remotePayload?.store) return local;
    const merged = mergeDebugModeStores(local, remotePayload.store);
    saveDebugModeStore(merged);
    return merged;
  } catch {
    return local;
  }
}

/** Re-apply after cloud merge without full reload. */
export function notifyPageDebugOverridesUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DEBUG_MODE_UPDATED_EVENT));
}
