import type { VisionEngineStore, VisionModeDefinition, VisionShareLink } from './types';
import { VISION_ENGINE_STORAGE_KEY, VISION_ENGINE_VERSION } from './constants';

function emptyStore(): VisionEngineStore {
  return {
    manifests: {},
    customModes: [],
    shareLinks: [],
    analytics: [],
    recorderJobs: [],
    version: VISION_ENGINE_VERSION,
  };
}

export function readVisionEngineStore(): VisionEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(VISION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    return { ...emptyStore(), ...(JSON.parse(raw) as VisionEngineStore), version: VISION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeVisionEngineStore(store: VisionEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VISION_ENGINE_STORAGE_KEY, JSON.stringify(store));
}

export function registerWorkspaceManifest(manifest: VisionEngineStore['manifests'][string]): void {
  const store = readVisionEngineStore();
  writeVisionEngineStore({
    ...store,
    manifests: { ...store.manifests, [manifest.workspaceId]: manifest },
  });
}

export function getVisionModeById(modeId: string, workspaceId: string): VisionModeDefinition | undefined {
  const store = readVisionEngineStore();
  const manifest = store.manifests[workspaceId];
  const builtIn = manifest?.modes.find((m) => m.id === modeId);
  if (builtIn) return builtIn;
  return store.customModes.find((m) => m.id === modeId && m.workspaceId === workspaceId);
}

export function upsertCustomVisionMode(mode: VisionModeDefinition): void {
  const store = readVisionEngineStore();
  const filtered = store.customModes.filter((m) => m.id !== mode.id);
  writeVisionEngineStore({ ...store, customModes: [...filtered, mode] });
}

export function createVisionShareLink(input: Omit<VisionShareLink, 'id' | 'views' | 'createdAt'>): VisionShareLink {
  const store = readVisionEngineStore();
  const link: VisionShareLink = {
    ...input,
    id: `vshare-${Date.now()}`,
    views: 0,
    createdAt: new Date().toISOString(),
  };
  writeVisionEngineStore({ ...store, shareLinks: [...store.shareLinks, link] });
  return link;
}

export function getVisionShareBySlug(slug: string): VisionShareLink | undefined {
  return readVisionEngineStore().shareLinks.find((l) => l.slug === slug);
}

export function recordVisionAnalyticsEvent(
  event: Omit<VisionEngineStore['analytics'][number], 'id' | 'at'>
): void {
  const store = readVisionEngineStore();
  writeVisionEngineStore({
    ...store,
    analytics: [
      ...store.analytics,
      { ...event, id: `van-${Date.now()}`, at: new Date().toISOString() },
    ],
  });
}

export function queueVisionRecorderJob(
  job: Omit<VisionEngineStore['recorderJobs'][number], 'id' | 'createdAt' | 'status' | 'note'>
): void {
  const store = readVisionEngineStore();
  writeVisionEngineStore({
    ...store,
    recorderJobs: [
      ...store.recorderJobs,
      {
        ...job,
        id: `vrec-${Date.now()}`,
        status: 'queued',
        createdAt: new Date().toISOString(),
        note: 'Vision Recorder™ — AI cinematographer queued (demo). Not a screen recorder.',
      },
    ],
  });
}
