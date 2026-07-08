import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type { AtlasBuildingMemory, AtlasConstructionJob, AtlasDiscoveryStore, AtlasMasterPlanReservation } from './types';
import { STUDIO_WORLD_ATLAS_EVENT } from './types';
import { defaultDemoConstructions } from './world-construction';
import { ATLAS_HIDDEN_DISCOVERIES } from './world-discovery';
import { defaultMasterPlanReservations } from './master-planner';

const STORAGE_KEY = 'studioWorldAtlasDiscovery_v2';
const LEGACY_KEY = 'studioWorldAtlasDiscovery_v1';

const EMPTY: AtlasDiscoveryStore = {
  version: 2,
  discoveredNodeIds: [],
  achievements: [],
  hiddenFinds: [],
  collectibles: [],
  buildingMemories: [],
  masterPlan: [],
  activeConstructions: [],
};

const DEFAULT_DISCOVERED = [
  'studio-command-center',
  'creative-direction-studio',
  'studio-archives',
  'architecture-observatory',
  'flagship-studio-command-center',
  'flagship-creative-direction-studio',
];

function migrateV1(raw: unknown): AtlasDiscoveryStore {
  const v1 = raw as { discoveredNodeIds?: string[]; achievements?: string[] };
  return {
    version: 2,
    discoveredNodeIds: v1.discoveredNodeIds ?? [],
    achievements: v1.achievements ?? [],
    hiddenFinds: [],
    collectibles: [],
    buildingMemories: [],
    masterPlan: defaultMasterPlanReservations(),
    activeConstructions: defaultDemoConstructions(),
  };
}

export function readAtlasDiscovery(): AtlasDiscoveryStore {
  const raw = readStudioOsJson(STORAGE_KEY, () => {
    const legacy = readStudioOsJson(LEGACY_KEY, () => null);
    if (legacy) return migrateV1(legacy);
    return EMPTY;
  });
  if (!raw || typeof raw !== 'object') {
    return {
      ...EMPTY,
      discoveredNodeIds: [...DEFAULT_DISCOVERED],
      masterPlan: defaultMasterPlanReservations(),
      activeConstructions: defaultDemoConstructions(),
    };
  }
  const store = raw as AtlasDiscoveryStore;
  const merged = new Set([...DEFAULT_DISCOVERED, ...(store.discoveredNodeIds ?? [])]);
  return {
    version: 2,
    discoveredNodeIds: [...merged],
    achievements: store.achievements ?? [],
    hiddenFinds: store.hiddenFinds ?? [],
    collectibles: store.collectibles ?? [],
    buildingMemories: store.buildingMemories ?? [],
    masterPlan: store.masterPlan?.length ? store.masterPlan : defaultMasterPlanReservations(),
    activeConstructions: store.activeConstructions?.length
      ? store.activeConstructions
      : defaultDemoConstructions(),
  };
}

function writeStore(store: AtlasDiscoveryStore): void {
  writeStudioOsJson(STORAGE_KEY, store);
  window.dispatchEvent(new CustomEvent(STUDIO_WORLD_ATLAS_EVENT));
}

export function recordAtlasDiscovery(nodeId: string): void {
  const store = readAtlasDiscovery();
  if (store.discoveredNodeIds.includes(nodeId)) return;
  writeStore({
    ...store,
    discoveredNodeIds: [nodeId, ...store.discoveredNodeIds],
  });
}

export function recordAtlasAchievement(label: string): void {
  const store = readAtlasDiscovery();
  if (store.achievements.includes(label)) return;
  writeStore({
    ...store,
    achievements: [label, ...store.achievements].slice(0, 50),
  });
}

export function recordHiddenFind(findId: string, collectible?: string): void {
  const store = readAtlasDiscovery();
  if (store.hiddenFinds.includes(findId)) return;
  const discovery = ATLAS_HIDDEN_DISCOVERIES.find((d) => d.id === findId);
  const achievements = discovery?.achievement
    ? [discovery.achievement, ...store.achievements].slice(0, 50)
    : store.achievements;
  writeStore({
    ...store,
    hiddenFinds: [findId, ...store.hiddenFinds],
    collectibles: collectible || discovery?.collectible
      ? [collectible ?? discovery!.collectible!, ...store.collectibles].slice(0, 30)
      : store.collectibles,
    achievements,
  });
}

export function upsertBuildingMemory(memory: AtlasBuildingMemory): void {
  const store = readAtlasDiscovery();
  const rest = store.buildingMemories.filter((m) => m.nodeId !== memory.nodeId);
  writeStore({
    ...store,
    buildingMemories: [memory, ...rest],
  });
}

export function upsertMasterPlanReservation(reservation: AtlasMasterPlanReservation): void {
  const store = readAtlasDiscovery();
  const rest = store.masterPlan.filter((p) => p.id !== reservation.id);
  writeStore({
    ...store,
    masterPlan: [reservation, ...rest],
  });
}

export function upsertConstructionJob(job: AtlasConstructionJob): void {
  const store = readAtlasDiscovery();
  const rest = store.activeConstructions.filter((j) => j.nodeId !== job.nodeId);
  writeStore({
    ...store,
    activeConstructions: [job, ...rest],
  });
}

export function seedBuildingMemoriesIfEmpty(memories: AtlasBuildingMemory[]): void {
  const store = readAtlasDiscovery();
  if (store.buildingMemories.length > 0) return;
  writeStore({ ...store, buildingMemories: memories });
}
