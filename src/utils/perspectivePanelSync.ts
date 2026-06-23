import type { PerspectivePanelMap } from '../types/perspectivePanel';
import {
  loadPerspectivePanelOverrides,
  mergePerspectivePanelMaps,
  readPerspectivePanelStoragePayload,
  savePerspectivePanelOverrides,
  dispatchPerspectivePanelMapUpdated,
} from './perspectivePanelStorage';

export type PerspectivePanelCloudPayload = {
  version: number;
  revision: number;
  panels: PerspectivePanelMap;
  updatedAt: number;
};

export async function fetchPerspectivePanelConfigFromCloud(): Promise<PerspectivePanelCloudPayload | null> {
  const { getAdminPerspectivePanelConfig } = await import('./api');
  const config = await getAdminPerspectivePanelConfig();
  if (!config || typeof config !== 'object') return null;
  const payload = config as PerspectivePanelCloudPayload;
  if (!payload.panels || typeof payload.panels !== 'object') return null;
  if (typeof payload.updatedAt !== 'number') return null;
  return payload;
}

export async function syncPerspectivePanelMapToCloud(map?: PerspectivePanelMap): Promise<void> {
  const { putAdminPerspectivePanelConfig } = await import('./api');
  const panels = map ?? loadPerspectivePanelOverrides();
  const localPayload = readPerspectivePanelStoragePayload();
  await putAdminPerspectivePanelConfig({
    version: 1,
    revision: 1,
    panels,
    updatedAt: localPayload?.updatedAt ?? Date.now(),
  });
}

export async function fetchAndMergePerspectivePanelConfigFromCloud(): Promise<PerspectivePanelMap> {
  const localPayload = readPerspectivePanelStoragePayload();
  const localPanels = localPayload?.panels ?? loadPerspectivePanelOverrides();
  const localUpdatedAt = localPayload?.updatedAt ?? 0;

  try {
    const remotePayload = await fetchPerspectivePanelConfigFromCloud();
    if (!remotePayload?.panels) return localPanels;

    if (remotePayload.updatedAt > localUpdatedAt) {
      const merged = mergePerspectivePanelMaps(localPanels, remotePayload.panels);
      savePerspectivePanelOverrides(merged, { updatedAt: remotePayload.updatedAt, syncCloud: false });
      return merged;
    }

    if (localUpdatedAt > remotePayload.updatedAt) {
      await syncPerspectivePanelMapToCloud(localPanels);
    }

    return localPanels;
  } catch {
    return localPanels;
  }
}

export function notifyPerspectivePanelMapUpdated(): void {
  dispatchPerspectivePanelMapUpdated();
}
