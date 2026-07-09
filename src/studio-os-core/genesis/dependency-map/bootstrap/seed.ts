import { mutateDependencyMapStore, readDependencyMapStore } from '../persistence';
import { STUDIO_OS_DEPENDENCY_SEED } from '../seeds/studio-os-systems';
import {
  computeBlockedBy,
  computeDownstreamDependents,
} from '../system-dependencies/graph';
import { computeReadinessScore } from '../readiness/scoring';
import type { DependencySystemRecord } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function recomputeDependencyMap(): void {
  const store = readDependencyMapStore();
  const timestamp = now();

  const systems: DependencySystemRecord[] = store.systems.map((system) => {
    const blockedBy = computeBlockedBy(system, store.systems);
    const downstreamDependents = computeDownstreamDependents(system.systemId);
    const readinessScore = computeReadinessScore(blockedBy, system.implementationRisk);

    let status = system.status;
    if (status === 'planned' && blockedBy.length > 0 && readinessScore < 40) {
      status = 'blocked';
    } else if (status === 'blocked' && blockedBy.length === 0) {
      status = 'planned';
    }

    return {
      ...system,
      downstreamDependents,
      blockedBy,
      readinessScore,
      status,
      updatedAt: timestamp,
    };
  });

  mutateDependencyMapStore((current) => ({
    ...current,
    systems,
    lastRecomputedAt: timestamp,
  }));
}

export function seedDependencyMapStore(): void {
  const existing = readDependencyMapStore();
  if (existing.seededAt && existing.systems.length > 0) {
    recomputeDependencyMap();
    return;
  }

  const timestamp = now();
  const systems: DependencySystemRecord[] = STUDIO_OS_DEPENDENCY_SEED.map((seed) => {
    const blockedBy: string[] = [];
    const readinessScore = computeReadinessScore(blockedBy, seed.implementationRisk);
    return {
      ...seed,
      downstreamDependents: [],
      blockedBy,
      readinessScore,
      seededAt: timestamp,
      updatedAt: timestamp,
    };
  });

  mutateDependencyMapStore(() => ({
    version: existing.version,
    systems,
    seededAt: timestamp,
    bootstrappedAt: timestamp,
  }));

  recomputeDependencyMap();
}

export function ensureDependencyMapStore() {
  const store = readDependencyMapStore();
  if (!store.seededAt || store.systems.length === 0) {
    seedDependencyMapStore();
    return readDependencyMapStore();
  }
  if (!store.bootstrappedAt) {
    mutateDependencyMapStore((current) => ({
      ...current,
      bootstrappedAt: now(),
    }));
  }
  recomputeDependencyMap();
  return readDependencyMapStore();
}
