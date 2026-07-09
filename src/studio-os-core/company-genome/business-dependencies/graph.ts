import type { BusinessDependency, BusinessSystem, DependencyGraphNode } from '../business-types';

export function listDependencies(dependencies: BusinessDependency[]): BusinessDependency[] {
  return [...dependencies].sort((a, b) => b.strength - a.strength);
}

export function getDependenciesForSystem(
  dependencies: BusinessDependency[],
  systemId: string,
  direction: 'inbound' | 'outbound' | 'both' = 'both'
): BusinessDependency[] {
  return dependencies.filter((d) => {
    if (direction === 'inbound') return d.toSystemId === systemId;
    if (direction === 'outbound') return d.fromSystemId === systemId;
    return d.fromSystemId === systemId || d.toSystemId === systemId;
  });
}

export function buildDependencyGraphNodes(
  systems: BusinessSystem[],
  dependencies: BusinessDependency[]
): DependencyGraphNode[] {
  return systems.map((s) => {
    const inbound = dependencies.filter((d) => d.toSystemId === s.systemId).length;
    const outbound = dependencies.filter((d) => d.fromSystemId === s.systemId).length;
    return {
      systemId: s.systemId,
      officialName: s.officialName,
      engineClass: s.engineClass,
      systemClass: s.systemClass,
      inbound,
      outbound,
    };
  });
}

export function deriveDependenciesFromSystems(systems: BusinessSystem[]): BusinessDependency[] {
  const edges: BusinessDependency[] = [];
  for (const system of systems) {
    for (const depId of system.dependencies) {
      edges.push({
        id: `dep-${depId}-to-${system.systemId}`,
        fromSystemId: depId,
        toSystemId: system.systemId,
        relationshipType: 'upstream',
        strength: 80,
        description: `${system.officialName} depends on upstream system`,
      });
    }
  }
  const seen = new Set<string>();
  return edges.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

export function getCriticalPathSystems(
  systems: BusinessSystem[],
  dependencies: BusinessDependency[]
): DependencyGraphNode[] {
  return buildDependencyGraphNodes(systems, dependencies)
    .filter((n) => n.inbound + n.outbound >= 4)
    .sort((a, b) => b.inbound + b.outbound - (a.inbound + a.outbound));
}
