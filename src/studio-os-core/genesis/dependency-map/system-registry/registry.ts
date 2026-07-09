import { mutateDependencyMapStore } from '../persistence';
import { recomputeDependencyMap } from '../bootstrap/seed';
import type { DependencySystemRecord } from '../types';
import { readDependencyMapStore } from '../persistence';

/** System Registry */
export function listDependencySystemRegistry(): DependencySystemRecord[] {
  return [...readDependencyMapStore().systems].sort((a, b) => a.buildOrder - b.buildOrder);
}

export function getDependencySystem(systemId: string): DependencySystemRecord | undefined {
  return readDependencyMapStore().systems.find((s) => s.systemId === systemId);
}

export function listSystemsByStatus(
  status: DependencySystemRecord['status']
): DependencySystemRecord[] {
  return listDependencySystemRegistry().filter((s) => s.status === status);
}

export function listSystemsByBuildPhase(phase: DependencySystemRecord['buildPhase']): DependencySystemRecord[] {
  return listDependencySystemRegistry().filter((s) => s.buildPhase === phase);
}

export function listSystemsByPriority(
  priority: DependencySystemRecord['priority']
): DependencySystemRecord[] {
  return listDependencySystemRegistry().filter((s) => s.priority === priority);
}

export function searchDependencySystemRegistry(query: string, limit = 20): DependencySystemRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return listDependencySystemRegistry().slice(0, limit);

  return listDependencySystemRegistry()
    .map((item) => {
      let score = 0;
      if (item.systemId.toLowerCase().includes(q)) score += 6;
      if (item.name.toLowerCase().includes(q)) score += 5;
      if (item.purpose.toLowerCase().includes(q)) score += 3;
      if (item.notes?.toLowerCase().includes(q)) score += 2;
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function updateDependencySystemStatus(
  systemId: string,
  status: DependencySystemRecord['status']
): DependencySystemRecord | undefined {
  const system = getDependencySystem(systemId);
  if (!system) return undefined;

  mutateDependencyMapStore((store) => ({
    ...store,
    systems: store.systems.map((s) =>
      s.systemId === systemId
        ? { ...s, status, updatedAt: new Date().toISOString() }
        : s
    ),
  }));

  recomputeDependencyMap();
  return getDependencySystem(systemId);
}

export function validateDependencyMapStore(): {
  valid: boolean;
  issues: { code: string; message: string; systemId?: string }[];
} {
  const systems = readDependencyMapStore().systems;
  const knownIds = new Set(systems.map((s) => s.systemId));
  const issues: { code: string; message: string; systemId?: string }[] = [];

  for (const system of systems) {
    for (const dep of system.upstreamDependencies) {
      if (!knownIds.has(dep)) {
        issues.push({
          code: 'UNKNOWN_UPSTREAM',
          message: `Unknown upstream dependency: ${dep}`,
          systemId: system.systemId,
        });
      }
    }
    if (!system.systemId?.trim()) {
      issues.push({ code: 'MISSING_ID', message: 'Missing systemId' });
    }
    if (!system.name?.trim()) {
      issues.push({ code: 'MISSING_NAME', message: 'Missing name', systemId: system.systemId });
    }
  }

  return { valid: issues.length === 0, issues };
}
