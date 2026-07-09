import { readDependencyMapStore } from '../persistence';
import type {
  CircularDependencyReport,
  DependencyGraphEdge,
  DependencyGraphView,
  MissingDependencyReport,
} from '../types';
import { listDependencySystemRegistry } from '../system-registry/registry';

function isImplemented(status: string): boolean {
  return status === 'implemented';
}

/** Dependency Graph */
export function getDependencyGraphView(): DependencyGraphView {
  const systems = listDependencySystemRegistry();
  const nodeSet = new Set<string>();
  const edges: DependencyGraphEdge[] = [];

  for (const system of systems) {
    nodeSet.add(system.systemId);
    for (const dep of system.upstreamDependencies) {
      nodeSet.add(dep);
      edges.push({ from: system.systemId, to: dep });
    }
  }

  return {
    nodes: [...nodeSet],
    edges,
  };
}

export function detectDependencyMapCircularities(): CircularDependencyReport {
  const systems = listDependencySystemRegistry();
  const graph = new Map<string, string[]>();

  for (const system of systems) {
    graph.set(system.systemId, [...system.upstreamDependencies]);
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

  return {
    hasCycles: cycles.length > 0,
    cycles,
  };
}

export function detectMissingDependencies(): MissingDependencyReport[] {
  const systems = listDependencySystemRegistry();
  const reports: MissingDependencyReport[] = [];

  for (const system of systems) {
    const missingUpstream: string[] = [];
    const unknownUpstream: string[] = [];

    for (const dep of system.upstreamDependencies) {
      const upstream = systems.find((s) => s.systemId === dep);
      if (!upstream) {
        unknownUpstream.push(dep);
        continue;
      }
      if (!isImplemented(upstream.status) && upstream.status !== 'in_progress') {
        missingUpstream.push(dep);
      }
    }

    if (missingUpstream.length > 0 || unknownUpstream.length > 0) {
      reports.push({
        systemId: system.systemId,
        name: system.name,
        missingUpstream,
        unknownUpstream,
      });
    }
  }

  return reports;
}

export function computeDownstreamDependents(systemId: string): string[] {
  const systems = readDependencyMapStore().systems;
  return systems
    .filter((s) => s.upstreamDependencies.includes(systemId))
    .map((s) => s.systemId);
}

export function computeBlockedBy(
  system: { systemId: string; upstreamDependencies: string[] },
  systems: { systemId: string; status: string }[]
): string[] {
  return system.upstreamDependencies.filter((depId) => {
    const dep = systems.find((s) => s.systemId === depId);
    if (!dep) return true;
    return !isImplemented(dep.status);
  });
}

export function listDependencyMapOutboundDependencies(systemId: string): string[] {
  return getDependencySystemUpstream(systemId);
}

export function listDependencyMapInboundDependents(systemId: string): string[] {
  return computeDownstreamDependents(systemId);
}

function getDependencySystemUpstream(systemId: string): string[] {
  const system = readDependencyMapStore().systems.find((s) => s.systemId === systemId);
  return system?.upstreamDependencies ?? [];
}
