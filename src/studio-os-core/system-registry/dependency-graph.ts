import { getAllRegisteredSystems } from './registration';
import type { SystemDependencyNode } from './types';

/** Build dependency graph — what connects to what across Studio OS. */
export function buildDependencyGraph(): SystemDependencyNode[] {
  const systems = getAllRegisteredSystems();

  return systems.map((entry) => {
    const dependents = systems
      .filter(
        (other) =>
          other.uniqueId !== entry.uniqueId &&
          (other.dependencies.includes(entry.uniqueId) ||
            other.dependencies.includes(entry.moduleId ?? '') ||
            other.relatedSystems.includes(entry.moduleId ?? '') ||
            other.relatedSystems.includes(entry.uniqueId.replace(/^module:/, '')))
      )
      .map((d) => d.uniqueId);

    return {
      uniqueId: entry.uniqueId,
      officialName: entry.officialName,
      category: entry.category,
      dependencies: entry.dependencies,
      dependents,
    };
  });
}

export function getSystemDependents(uniqueId: string): string[] {
  return buildDependencyGraph().find((n) => n.uniqueId === uniqueId)?.dependents ?? [];
}

export function getSystemDependencies(uniqueId: string): string[] {
  return getAllRegisteredSystems().find((e) => e.uniqueId === uniqueId)?.dependencies ?? [];
}

export function findImpactRadius(uniqueId: string): { upstream: string[]; downstream: string[] } {
  const node = buildDependencyGraph().find((n) => n.uniqueId === uniqueId);
  return {
    upstream: node?.dependencies ?? [],
    downstream: node?.dependents ?? [],
  };
}

export function summarizeDependencyGraph(): string {
  const nodes = buildDependencyGraph();
  const withDeps = nodes.filter((n) => n.dependencies.length > 0).length;
  const withDependents = nodes.filter((n) => n.dependents.length > 0).length;
  return `${nodes.length} systems indexed · ${withDeps} with dependencies · ${withDependents} have dependents.`;
}
