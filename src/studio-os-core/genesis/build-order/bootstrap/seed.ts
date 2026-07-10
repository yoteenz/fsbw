import { mutateBuildOrderStore, readBuildOrderStore } from '../persistence';
import { computeBlockedBy, computeDependents } from '../dependency-engine/resolver';
import { STUDIO_OS_BUILD_ORDER_SEED } from '../seeds/studio-os-systems';
import type { BuildOrderSystemRecord } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function recomputeBuildOrder(): void {
  const store = readBuildOrderStore();
  const timestamp = now();

  const systems: BuildOrderSystemRecord[] = store.systems.map((system) => {
    const blockedBy = computeBlockedBy(system, store.systems);
    const dependents = computeDependents(system.systemId, store.systems);

    let currentStatus = system.currentStatus;
    if (
      (currentStatus === 'planned' || currentStatus === 'blocked') &&
      blockedBy.length > 0
    ) {
      currentStatus = 'blocked';
    } else if (currentStatus === 'blocked' && blockedBy.length === 0) {
      currentStatus = 'planned';
    }

    return {
      ...system,
      dependents,
      blockedBy,
      updatedAt: system.updatedAt,
    };
  });

  const changed =
    systems.length !== store.systems.length ||
    systems.some((s, i) => {
      const prev = store.systems[i];
      if (!prev || prev.systemId !== s.systemId) return true;
      return (
        s.currentStatus !== prev.currentStatus ||
        JSON.stringify(s.blockedBy) !== JSON.stringify(prev.blockedBy) ||
        JSON.stringify(s.dependents) !== JSON.stringify(prev.dependents)
      );
    });

  if (!changed) return;

  const nextSystems = systems.map((s) => ({ ...s, updatedAt: timestamp }));

  mutateBuildOrderStore((current) => ({
    ...current,
    systems: nextSystems,
    lastRecomputedAt: timestamp,
  }));
}

export function seedBuildOrderStore(): void {
  const existing = readBuildOrderStore();
  if (existing.seededAt && existing.systems.length > 0) {
    recomputeBuildOrder();
    return;
  }

  const timestamp = now();

  const systems: BuildOrderSystemRecord[] = STUDIO_OS_BUILD_ORDER_SEED.map((seed) => ({
    ...seed,
    dependents: [],
    blockedBy: [],
    seededAt: timestamp,
    updatedAt: timestamp,
  }));

  mutateBuildOrderStore(() => ({
    version: existing.version,
    systems,
    seededAt: timestamp,
    bootstrappedAt: timestamp,
  }));

  recomputeBuildOrder();
}

export function ensureBuildOrderStore() {
  const store = readBuildOrderStore();
  if (!store.seededAt || store.systems.length === 0) {
    seedBuildOrderStore();
    return readBuildOrderStore();
  }
  if (!store.bootstrappedAt) {
    mutateBuildOrderStore((current) => ({
      ...current,
      bootstrappedAt: now(),
    }));
    recomputeBuildOrder();
    return readBuildOrderStore();
  }
  return store;
}
