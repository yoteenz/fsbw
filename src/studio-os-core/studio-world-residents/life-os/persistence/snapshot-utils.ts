import type { ResidentId } from '../../types';
import { buildSeason1LifeOsSeed } from '../life-os-seed';
import type { InMemoryLifeOsStore } from '../life-os-store';
import type { ResidentLifePersistedSnapshot } from './snapshot';

export function exportStoreToSnapshot(store: InMemoryLifeOsStore): ResidentLifePersistedSnapshot {
  const bundles: ResidentLifePersistedSnapshot['bundles'] = {} as ResidentLifePersistedSnapshot['bundles'];
  for (const [id, bundle] of store.bundles) {
    bundles[id] = structuredClone(bundle);
  }
  const memories: ResidentLifePersistedSnapshot['memories'] = {} as ResidentLifePersistedSnapshot['memories'];
  for (const [id, list] of store.memories) {
    memories[id] = structuredClone(list);
  }
  const beliefs: ResidentLifePersistedSnapshot['beliefs'] = {} as ResidentLifePersistedSnapshot['beliefs'];
  for (const [id, list] of store.beliefs) {
    beliefs[id] = structuredClone(list);
  }
  return {
    worldId: store.worldId,
    organizationId: store.organizationId,
    bundles,
    events: structuredClone(store.events),
    truthEvents: [...store.truthEvents.values()].map((t) => structuredClone(t)),
    rumors: structuredClone(store.rumors),
    memories,
    beliefs,
    interventions: structuredClone(store.interventions),
    decisions: structuredClone(store.decisions),
    orgMemory: structuredClone(store.orgMemory),
    pairingOutcomes: structuredClone(store.pairingOutcomes),
    worldStories: structuredClone(store.worldStories),
    privateDisclosures: structuredClone(store.privateDisclosures),
    residentRequests: structuredClone(store.residentRequests),
    activeCastRoles: structuredClone(store.activeCastRoles),
    humanEmployees: [...store.humanEmployees.values()].map((h) => structuredClone(h)),
    trainingCanons: [...store.trainingCanons.values()].map((c) => structuredClone(c)),
    proposedCorrections: structuredClone(store.proposedCorrections),
    trainingEscalations: structuredClone(store.trainingEscalations),
    alumni: [...store.alumni],
    relationshipLife: store.relationshipLife ? structuredClone(store.relationshipLife) : [],
    careerRequests: store.careerRequests ? structuredClone(store.careerRequests) : [],
    completedTickWindows: store.completedTickWindows ? [...store.completedTickWindows] : [],
  };
}

export function applySnapshotToStore(
  store: InMemoryLifeOsStore,
  snapshot: ResidentLifePersistedSnapshot,
): void {
  store.worldId = snapshot.worldId;
  store.organizationId = snapshot.organizationId;
  store.bundles = new Map(Object.entries(snapshot.bundles) as [ResidentId, (typeof snapshot.bundles)[ResidentId]][]);
  store.events = structuredClone(snapshot.events);
  store.truthEvents = new Map(snapshot.truthEvents.map((t) => [t.truthEventId, t]));
  store.rumors = structuredClone(snapshot.rumors);
  store.memories = new Map(
    Object.entries(snapshot.memories) as [ResidentId, (typeof snapshot.memories)[ResidentId]][],
  );
  store.beliefs = new Map(
    Object.entries(snapshot.beliefs) as [ResidentId, (typeof snapshot.beliefs)[ResidentId]][],
  );
  store.interventions = structuredClone(snapshot.interventions);
  store.decisions = structuredClone(snapshot.decisions);
  store.orgMemory = structuredClone(snapshot.orgMemory);
  store.pairingOutcomes = structuredClone(snapshot.pairingOutcomes);
  store.worldStories = structuredClone(snapshot.worldStories);
  store.privateDisclosures = structuredClone(snapshot.privateDisclosures);
  store.residentRequests = structuredClone(snapshot.residentRequests);
  store.activeCastRoles = structuredClone(snapshot.activeCastRoles);
  store.humanEmployees = new Map(snapshot.humanEmployees.map((h) => [h.employeeId, h]));
  store.trainingCanons = new Map(snapshot.trainingCanons.map((c) => [c.canonId, c]));
  store.proposedCorrections = structuredClone(snapshot.proposedCorrections);
  store.trainingEscalations = structuredClone(snapshot.trainingEscalations);
  store.alumni = new Set(snapshot.alumni);
  store.relationshipLife = structuredClone(snapshot.relationshipLife ?? []);
  store.careerRequests = structuredClone(snapshot.careerRequests ?? []);
  store.completedTickWindows = [...(snapshot.completedTickWindows ?? [])];
}

export function defaultEmptySnapshot(): ResidentLifePersistedSnapshot {
  const seed = buildSeason1LifeOsSeed();
  const storeLike = {
    worldId: seed.worldId,
    organizationId: seed.organizationId,
    bundles: seed.bundles,
    events: [...seed.seedEvents],
    truthEvents: new Map(),
    rumors: [],
    memories: new Map(),
    beliefs: new Map(),
    interventions: [],
    decisions: [],
    orgMemory: [],
    pairingOutcomes: [],
    worldStories: [],
    privateDisclosures: [],
    residentRequests: [],
    activeCastRoles: [],
    humanEmployees: new Map(),
    trainingCanons: new Map(),
    proposedCorrections: [],
    trainingEscalations: [],
    alumni: new Set<ResidentId>(),
    relationshipLife: [],
    careerRequests: [],
    completedTickWindows: [],
  } as InMemoryLifeOsStore;
  return exportStoreToSnapshot(storeLike);
}
