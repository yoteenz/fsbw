import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type {
  AtlasBuildingMemory,
  AtlasConstructionJob,
  AtlasDiscoveryStore,
  AtlasFutureVisionConcept,
  AtlasMasterPlanReservation,
  AtlasParallelFuture,
  AtlasPlanFeature,
  AtlasSimulationResult,
  AtlasWorldForecastYear,
  ParallelFutureWalkSimulation,
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
import { defaultParallelFutures, forkParallelFuture } from './parallel-futures';
import { buildFutureCommitSummary } from './parallel-futures-simulation';
import {
  libraryEntryFromFuture,
  seedMasterPlanningLibrary,
  versionSnapshotFromFuture,
} from './master-planning-library';

const STORAGE_KEY = 'studioWorldAtlasDiscovery_v4';
const LEGACY_V3_KEY = 'studioWorldAtlasDiscovery_v3';

const EMPTY: AtlasDiscoveryStore = {
  version: 4,
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
  parallelFutures: [],
  activeParallelFutureId: null,
  parallelFutureWalks: {},
  masterPlanningLibrary: [],
  futureVersionHistory: [],
  committedFutureId: null,
};

const DEFAULT_DISCOVERED = [
  'studio-command-center',
  'creative-direction-studio',
  'studio-archives',
  'architecture-observatory',
  'flagship-studio-command-center',
  'flagship-creative-direction-studio',
];

function migrateV3(raw: unknown): AtlasDiscoveryStore {
  const v3 = raw as AtlasDiscoveryStore;
  const futures = defaultParallelFutures();
  return {
    version: 4,
    discoveredNodeIds: v3.discoveredNodeIds ?? [],
    achievements: v3.achievements ?? [],
    hiddenFinds: v3.hiddenFinds ?? [],
    collectibles: v3.collectibles ?? [],
    buildingMemories: v3.buildingMemories ?? [],
    masterPlan: v3.masterPlan ?? defaultMasterPlanReservations(),
    activeConstructions: v3.activeConstructions ?? defaultDemoConstructions(),
    planFeatures: v3.planFeatures ?? defaultPlanFeatures(),
    futureVisionConcepts: v3.futureVisionConcepts ?? defaultFutureVisionConcepts(),
    forecastHorizon: v3.forecastHorizon ?? 3,
    lastSimulations: v3.lastSimulations ?? {},
    parallelFutures: futures,
    activeParallelFutureId: futures[0]?.id ?? null,
    parallelFutureWalks: {},
    masterPlanningLibrary: seedMasterPlanningLibrary(futures),
    futureVersionHistory: futures.map(versionSnapshotFromFuture),
    committedFutureId: null,
  };
}

function migrateV2(raw: unknown): AtlasDiscoveryStore {
  const v2 = raw as Partial<AtlasDiscoveryStore>;
  return migrateV3({
    ...v2,
    version: 3,
    masterPlan: v2.masterPlan?.length ? v2.masterPlan : defaultMasterPlanReservations(),
    activeConstructions: v2.activeConstructions?.length
      ? v2.activeConstructions
      : defaultDemoConstructions(),
  });
}

function migrateV1(raw: unknown): AtlasDiscoveryStore {
  return migrateV2(raw);
}

function loadRaw(): unknown {
  const v4 = readStudioOsJson(STORAGE_KEY, () => null);
  if (v4) return v4;
  const v3 = readStudioOsJson(LEGACY_V3_KEY, () => null);
  if (v3) return migrateV3(v3);
  const v2 = readStudioOsJson('studioWorldAtlasDiscovery_v2', () => null);
  if (v2) return migrateV2(v2);
  const v1 = readStudioOsJson('studioWorldAtlasDiscovery_v1', () => null);
  if (v1) return migrateV1(v1);
  return null;
}

export function readAtlasDiscovery(): AtlasDiscoveryStore {
  const raw = loadRaw();
  if (!raw || typeof raw !== 'object') {
    const futures = defaultParallelFutures();
    return {
      ...EMPTY,
      discoveredNodeIds: [...DEFAULT_DISCOVERED],
      masterPlan: defaultMasterPlanReservations(),
      activeConstructions: defaultDemoConstructions(),
      planFeatures: defaultPlanFeatures(),
      futureVisionConcepts: defaultFutureVisionConcepts(),
      forecastHorizon: 3,
      parallelFutures: futures,
      activeParallelFutureId: futures[0]?.id ?? null,
      masterPlanningLibrary: seedMasterPlanningLibrary(futures),
      futureVersionHistory: futures.map(versionSnapshotFromFuture),
    };
  }
  const store = raw as AtlasDiscoveryStore;
  const merged = new Set([...DEFAULT_DISCOVERED, ...(store.discoveredNodeIds ?? [])]);
  const futures =
    store.parallelFutures?.length ? store.parallelFutures : defaultParallelFutures();
  return {
    version: 4,
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
    parallelFutures: futures,
    activeParallelFutureId: store.activeParallelFutureId ?? futures[0]?.id ?? null,
    parallelFutureWalks: store.parallelFutureWalks ?? {},
    masterPlanningLibrary: store.masterPlanningLibrary?.length
      ? store.masterPlanningLibrary
      : seedMasterPlanningLibrary(futures),
    futureVersionHistory: store.futureVersionHistory ?? futures.map(versionSnapshotFromFuture),
    committedFutureId: store.committedFutureId ?? null,
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

export function setActiveParallelFuture(futureId: string): void {
  const store = readAtlasDiscovery();
  writeStore({ ...store, activeParallelFutureId: futureId });
}

export function upsertParallelFuture(future: AtlasParallelFuture): void {
  const store = readAtlasDiscovery();
  const rest = store.parallelFutures.filter((f) => f.id !== future.id);
  writeStore({ ...store, parallelFutures: [{ ...future, updatedAt: new Date().toISOString() }, ...rest] });
}

export function saveParallelFutureWalk(sim: ParallelFutureWalkSimulation): void {
  const store = readAtlasDiscovery();
  writeStore({
    ...store,
    parallelFutureWalks: { ...store.parallelFutureWalks, [sim.futureId]: sim },
  });
}

export function commitParallelFuture(futureId: string): AtlasParallelFuture | null {
  const store = readAtlasDiscovery();
  const future = store.parallelFutures.find((f) => f.id === futureId);
  if (!future) return null;
  const commitSummary = buildFutureCommitSummary(future);
  const committed: AtlasParallelFuture = {
    ...future,
    status: 'committed',
    commitSummary,
    updatedAt: new Date().toISOString(),
  };
  const rest = store.parallelFutures.filter((f) => f.id !== futureId);
  const libEntry = libraryEntryFromFuture(committed, 'Committed — awaiting Scene Stack generation');
  const versionSnap = versionSnapshotFromFuture(committed);
  writeStore({
    ...store,
    parallelFutures: [committed, ...rest],
    committedFutureId: futureId,
    masterPlanningLibrary: [libEntry, ...store.masterPlanningLibrary],
    futureVersionHistory: [versionSnap, ...store.futureVersionHistory].slice(0, 40),
  });
  return committed;
}

export function forkParallelFutureInStore(sourceId: string, newLabel: string): AtlasParallelFuture | null {
  const store = readAtlasDiscovery();
  const source = store.parallelFutures.find((f) => f.id === sourceId);
  if (!source) return null;
  const forked = forkParallelFuture(source, newLabel);
  writeStore({
    ...store,
    parallelFutures: [forked, ...store.parallelFutures],
    masterPlanningLibrary: [libraryEntryFromFuture(forked), ...store.masterPlanningLibrary],
    futureVersionHistory: [versionSnapshotFromFuture(forked), ...store.futureVersionHistory],
  });
  return forked;
}

export function reviveParallelFutureFromLibrary(entryId: string): void {
  const store = readAtlasDiscovery();
  const entry = store.masterPlanningLibrary.find((e) => e.id === entryId);
  if (!entry) return;
  const future = store.parallelFutures.find((f) => f.id === entry.futureSnapshotId);
  if (!future) return;
  writeStore({
    ...store,
    activeParallelFutureId: future.id,
    parallelFutures: store.parallelFutures.map((f) =>
      f.id === future.id ? { ...f, status: 'draft', updatedAt: new Date().toISOString() } : f
    ),
  });
}
