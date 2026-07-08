import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type {
  AtlasBuildingMemory,
  AtlasConstructionJob,
  AtlasDiscoveryStore,
  AtlasFutureVisionConcept,
  AtlasMasterPlanReservation,
  AtlasPlanFeature,
  AtlasSimulationResult,
  AtlasWorldForecastYear,
} from './types';
import { STUDIO_WORLD_ATLAS_EVENT } from './types';
import { defaultDemoConstructions } from './world-construction';
import { ATLAS_HIDDEN_DISCOVERIES } from './world-discovery';
import {
  defaultFutureVisionConcepts,
  defaultMasterPlanReservations,
  defaultPlanFeatures,
} from './master-planner';
import { nextMasterPlanPhase } from './master-planner-phases';

const STORAGE_KEY = 'studioWorldAtlasDiscovery_v3';
const LEGACY_V2_KEY = 'studioWorldAtlasDiscovery_v2';
const LEGACY_V1_KEY = 'studioWorldAtlasDiscovery_v1';

const EMPTY: AtlasDiscoveryStore = {
  version: 3,
  discoveredNodeIds: [],
  achievements: [],
  hiddenFinds: [],
  collectibles: [],
  buildingMemories: [],
  masterPlan: [],
  activeConstructions: [],
  planFeatures: [],
  futureVisionConcepts: [],
  forecastHorizon: 3,
  lastSimulations: {},
};

const DEFAULT_DISCOVERED = [
  'studio-command-center',
  'creative-direction-studio',
  'studio-archives',
  'architecture-observatory',
  'flagship-studio-command-center',
  'flagship-creative-direction-studio',
];

function migrateV2(raw: unknown): AtlasDiscoveryStore {
  const v2 = raw as AtlasDiscoveryStore;
  return {
    version: 3,
    discoveredNodeIds: v2.discoveredNodeIds ?? [],
    achievements: v2.achievements ?? [],
    hiddenFinds: v2.hiddenFinds ?? [],
    collectibles: v2.collectibles ?? [],
    buildingMemories: v2.buildingMemories ?? [],
    masterPlan: (v2.masterPlan?.length ? v2.masterPlan : defaultMasterPlanReservations()).map((p) => ({
      ...p,
      phase: p.phase ?? 'reserved-land',
      category: p.category ?? 'district',
      amenities: p.amenities ?? [],
    })),
    activeConstructions: v2.activeConstructions?.length
      ? v2.activeConstructions
      : defaultDemoConstructions(),
    planFeatures: defaultPlanFeatures(),
    futureVisionConcepts: defaultFutureVisionConcepts(),
    forecastHorizon: 3,
    lastSimulations: {},
  };
}

function migrateV1(raw: unknown): AtlasDiscoveryStore {
  return migrateV2({
    ...(raw as object),
    masterPlan: defaultMasterPlanReservations(),
    activeConstructions: defaultDemoConstructions(),
  });
}

function loadRaw(): unknown {
  const v3 = readStudioOsJson(STORAGE_KEY, () => null);
  if (v3) return v3;
  const v2 = readStudioOsJson(LEGACY_V2_KEY, () => null);
  if (v2) return migrateV2(v2);
  const v1 = readStudioOsJson(LEGACY_V1_KEY, () => null);
  if (v1) return migrateV1(v1);
  return null;
}

export function readAtlasDiscovery(): AtlasDiscoveryStore {
  const raw = loadRaw();
  if (!raw || typeof raw !== 'object') {
    return {
      ...EMPTY,
      discoveredNodeIds: [...DEFAULT_DISCOVERED],
      masterPlan: defaultMasterPlanReservations(),
      activeConstructions: defaultDemoConstructions(),
      planFeatures: defaultPlanFeatures(),
      futureVisionConcepts: defaultFutureVisionConcepts(),
      forecastHorizon: 3,
    };
  }
  const store = raw as AtlasDiscoveryStore;
  const merged = new Set([...DEFAULT_DISCOVERED, ...(store.discoveredNodeIds ?? [])]);
  return {
    version: 3,
    discoveredNodeIds: [...merged],
    achievements: store.achievements ?? [],
    hiddenFinds: store.hiddenFinds ?? [],
    collectibles: store.collectibles ?? [],
    buildingMemories: store.buildingMemories ?? [],
    masterPlan: store.masterPlan?.length ? store.masterPlan : defaultMasterPlanReservations(),
    activeConstructions: store.activeConstructions?.length
      ? store.activeConstructions
      : defaultDemoConstructions(),
    planFeatures: store.planFeatures?.length ? store.planFeatures : defaultPlanFeatures(),
    futureVisionConcepts: store.futureVisionConcepts?.length
      ? store.futureVisionConcepts
      : defaultFutureVisionConcepts(),
    forecastHorizon: store.forecastHorizon ?? 3,
    lastSimulations: store.lastSimulations ?? {},
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

export function removeMasterPlanReservation(planId: string): void {
  const store = readAtlasDiscovery();
  writeStore({
    ...store,
    masterPlan: store.masterPlan.filter((p) => p.id !== planId),
  });
}

export function upsertPlanFeature(feature: AtlasPlanFeature): void {
  const store = readAtlasDiscovery();
  const rest = store.planFeatures.filter((f) => f.id !== feature.id);
  writeStore({
    ...store,
    planFeatures: [feature, ...rest],
  });
}

export function upsertFutureVisionConcept(concept: AtlasFutureVisionConcept): void {
  const store = readAtlasDiscovery();
  const rest = store.futureVisionConcepts.filter((c) => c.id !== concept.id);
  writeStore({
    ...store,
    futureVisionConcepts: [concept, ...rest],
  });
}

export function setForecastHorizon(horizon: AtlasWorldForecastYear): void {
  const store = readAtlasDiscovery();
  writeStore({ ...store, forecastHorizon: horizon });
}

export function saveSimulationResult(result: AtlasSimulationResult): void {
  const store = readAtlasDiscovery();
  writeStore({
    ...store,
    lastSimulations: { ...store.lastSimulations, [result.planId]: result },
  });
}

export function advanceMasterPlanPhase(planId: string): void {
  const store = readAtlasDiscovery();
  const plan = store.masterPlan.find((p) => p.id === planId);
  if (!plan || !plan.phase) return;
  const updated = { ...plan, phase: nextMasterPlanPhase(plan.phase) };
  const rest = store.masterPlan.filter((p) => p.id !== planId);
  writeStore({ ...store, masterPlan: [updated, ...rest] });
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
