import { mutateCoreSystemsStore, readCoreSystemsStore } from '../persistence';
import type { SystemDependencyRecord } from '../types';
import type { DependencyRelationType, SystemDependencyClass } from '../constants';

function now(): string {
  return new Date().toISOString();
}

export function createDependencyId(fromSystemId: string, toSystemId: string): string {
  return `DEP-${fromSystemId}-${toSystemId}-${Date.now().toString(36)}`;
}

export type RegisterDependencyInput = {
  fromSystemId: string;
  toSystemId: string;
  relationType: DependencyRelationType | string;
  dependencyClass?: SystemDependencyClass | string;
  description?: string;
};

/** Dependency Registry™ */
export function registerSystemDependency(input: RegisterDependencyInput): SystemDependencyRecord {
  const record: SystemDependencyRecord = {
    dependencyId: createDependencyId(input.fromSystemId, input.toSystemId),
    fromSystemId: input.fromSystemId.trim(),
    toSystemId: input.toSystemId.trim(),
    relationType: input.relationType,
    dependencyClass: input.dependencyClass,
    description: input.description,
    createdAt: now(),
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    dependencies: [...store.dependencies, record],
  }));

  return record;
}

export function listDependencyRegistry(): SystemDependencyRecord[] {
  return readCoreSystemsStore().dependencies;
}

export function listDependenciesForSystem(systemId: string): SystemDependencyRecord[] {
  return listDependencyRegistry().filter(
    (d) => d.fromSystemId === systemId || d.toSystemId === systemId
  );
}

export function listOutboundDependencies(systemId: string): SystemDependencyRecord[] {
  return listDependencyRegistry().filter((d) => d.fromSystemId === systemId);
}

export function listInboundDependencies(systemId: string): SystemDependencyRecord[] {
  return listDependencyRegistry().filter((d) => d.toSystemId === systemId);
}

export function getDependencyGraph(): {
  nodes: string[];
  edges: { from: string; to: string; relationType: string }[];
} {
  const deps = listDependencyRegistry();
  const nodeSet = new Set<string>();
  for (const d of deps) {
    nodeSet.add(d.fromSystemId);
    nodeSet.add(d.toSystemId);
  }
  return {
    nodes: [...nodeSet],
    edges: deps.map((d) => ({
      from: d.fromSystemId,
      to: d.toSystemId,
      relationType: d.relationType,
    })),
  };
}

export function detectCircularDependencies(): string[][] {
  const graph = new Map<string, string[]>();
  for (const d of listDependencyRegistry()) {
    if (d.relationType !== 'requires') continue;
    const edges = graph.get(d.fromSystemId) ?? [];
    edges.push(d.toSystemId);
    graph.set(d.fromSystemId, edges);
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): void {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) cycles.push([...path.slice(cycleStart), node]);
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
  return cycles;
}
