import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { AtlasDiscoveryStore } from './types';
import { STUDIO_WORLD_ATLAS_EVENT } from './types';

const STORAGE_KEY = 'studioWorldAtlasDiscovery_v1';

const EMPTY: AtlasDiscoveryStore = { version: 1, discoveredNodeIds: [], achievements: [] };

const DEFAULT_DISCOVERED = [
  'studio-command-center',
  'creative-direction-studio',
  'studio-archives',
  'architecture-observatory',
];

export function readAtlasDiscovery(): AtlasDiscoveryStore {
  const raw = readStudioOsJson(STORAGE_KEY, () => EMPTY);
  if (!raw || typeof raw !== 'object') return { ...EMPTY, discoveredNodeIds: [...DEFAULT_DISCOVERED] };
  const store = raw as AtlasDiscoveryStore;
  const merged = new Set([...DEFAULT_DISCOVERED, ...(store.discoveredNodeIds ?? [])]);
  return { version: 1, discoveredNodeIds: [...merged], achievements: store.achievements ?? [] };
}

export function recordAtlasDiscovery(nodeId: string): void {
  const store = readAtlasDiscovery();
  if (store.discoveredNodeIds.includes(nodeId)) return;
  writeStudioOsJson(STORAGE_KEY, {
    version: 1,
    discoveredNodeIds: [nodeId, ...store.discoveredNodeIds],
    achievements: store.achievements,
  });
  window.dispatchEvent(new CustomEvent(STUDIO_WORLD_ATLAS_EVENT));
}

export function recordAtlasAchievement(label: string): void {
  const store = readAtlasDiscovery();
  if (store.achievements.includes(label)) return;
  writeStudioOsJson(STORAGE_KEY, {
    version: 1,
    discoveredNodeIds: store.discoveredNodeIds,
    achievements: [label, ...store.achievements].slice(0, 50),
  });
}
