import { readBuildOrderStore } from '../persistence';
import type { BuildOrderCircularDependencyReport, DependencyResolution } from '../types';

function listSystems() {
  return readBuildOrderStore().systems;
}

function isImplemented(status: string): boolean {
  return status === 'implemented';
}

/** Dependency Resolver™ */
export function computeDependents(
  systemId: string,
  systems: { systemId: string; dependencies: string[] }[]
): string[] {
  return systems.filter((s) => s.dependencies.includes(systemId)).map((s) => s.systemId);
}

export function computeBlockedBy(
  system: { dependencies: string[] },
  systems: { systemId: string; currentStatus: string }[]
): string[] {
  return system.dependencies.filter((depId) => {
    const dep = systems.find((s) => s.systemId === depId);
    if (!dep) return true;
    return !isImplemented(dep.currentStatus);
  });
}

export function resolveBuildOrderDependencies(): DependencyResolution[] {
  const systems = listSystems();
  return systems.map((system) => ({
    systemId: system.systemId,
    officialName: system.officialName,
    dependencies: system.dependencies,
    dependents: system.dependents,
    blockedBy: system.blockedBy,
    blocks: system.blocks,
    resolved: system.blockedBy.length === 0 && system.currentStatus !== 'implemented',
  }));
}

export function detectBuildOrderCircularities(): BuildOrderCircularDependencyReport {
  const systems = listSystems();
  const graph = new Map<string, string[]>();

  for (const system of systems) {
    graph.set(system.systemId, [...system.dependencies]);
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): void {
    if (stack.has(node)) {
      const start = path.indexOf(node);
      if (start >= 0) cycles.push([...path.slice(start), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const next of graph.get(node) ?? []) dfs(next);
    path.pop();
    stack.delete(node);
  }

  for (const node of graph.keys()) dfs(node);

  return { hasCycles: cycles.length > 0, cycles };
}

export function listBuildOrderOutboundDependencies(systemId: string): string[] {
  const system = listSystems().find((s) => s.systemId === systemId);
  return system?.dependencies ?? [];
}

export function listBuildOrderInboundDependents(systemId: string): string[] {
  return computeDependents(
    systemId,
    listSystems().map((s) => ({ systemId: s.systemId, dependencies: s.dependencies }))
  );
}
