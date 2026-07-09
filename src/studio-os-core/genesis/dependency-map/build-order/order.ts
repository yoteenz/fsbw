import type { BuildOrderEntry } from '../types';
import { listDependencySystemRegistry } from '../system-registry/registry';

/** Build Order View */
export function getBuildOrderView(): BuildOrderEntry[] {
  return listDependencySystemRegistry().map((system) => ({
    systemId: system.systemId,
    name: system.name,
    buildOrder: system.buildOrder,
    buildPhase: system.buildPhase,
    priority: system.priority,
    status: system.status,
    readinessScore: system.readinessScore,
  }));
}

export function getNextSystemsToBuild(limit = 5): BuildOrderEntry[] {
  return getBuildOrderView()
    .filter((s) => (s.status === 'planned' || s.status === 'in_progress') && s.readinessScore >= 60)
    .slice(0, limit);
}

export function getBuildOrderByPhase(): Map<number, BuildOrderEntry[]> {
  const map = new Map<number, BuildOrderEntry[]>();
  for (const entry of getBuildOrderView()) {
    const list = map.get(entry.buildPhase) ?? [];
    list.push(entry);
    map.set(entry.buildPhase, list);
  }
  return map;
}
