import type { BusinessSystem } from '../business-types';

export function listBusinessSystems(systems: BusinessSystem[]): BusinessSystem[] {
  return [...systems].sort((a, b) => a.officialName.localeCompare(b.officialName));
}

export function getBusinessSystem(systems: BusinessSystem[], systemId: string): BusinessSystem | null {
  return systems.find((s) => s.systemId === systemId) ?? null;
}

export function getSystemsByEngine(systems: BusinessSystem[], engineClass: BusinessSystem['engineClass']): BusinessSystem[] {
  return systems.filter((s) => s.engineClass === engineClass);
}

export function getSystemsByClass(systems: BusinessSystem[], systemClass: BusinessSystem['systemClass']): BusinessSystem[] {
  return systems.filter((s) => s.systemClass === systemClass);
}

export function searchBusinessSystems(systems: BusinessSystem[], query: string): BusinessSystem[] {
  const q = query.trim().toLowerCase();
  if (!q) return systems;
  return systems.filter((s) => {
    const hay = [
      s.officialName,
      s.purpose,
      s.owner,
      ...s.ownedData,
      ...s.eventsProduced,
      ...s.eventsConsumed,
    ]
      .join(' ')
      .toLowerCase();
    return q.split(/\s+/).some((token) => token.length > 1 && hay.includes(token));
  });
}

export function computeDependents(systems: BusinessSystem[]): BusinessSystem[] {
  const depMap = new Map<string, Set<string>>();
  for (const s of systems) {
    for (const depId of s.dependencies) {
      if (!depMap.has(depId)) depMap.set(depId, new Set());
      depMap.get(depId)!.add(s.systemId);
    }
  }
  return systems.map((s) => ({
    ...s,
    dependents: [...(depMap.get(s.systemId) ?? [])].sort(),
  }));
}

export function registerBusinessSystem(systems: BusinessSystem[], system: BusinessSystem): BusinessSystem[] {
  const existing = systems.findIndex((s) => s.systemId === system.systemId);
  const next = existing >= 0 ? systems.map((s, i) => (i === existing ? system : s)) : [...systems, system];
  return computeDependents(next);
}

export function getSystemStats(systems: BusinessSystem[]) {
  const active = systems.filter((s) => s.operationalStatus === 'active').length;
  const avgAutomation =
    systems.length === 0 ? 0 : Math.round(systems.reduce((n, s) => n + s.automationScore, 0) / systems.length);
  const avgAi =
    systems.length === 0 ? 0 : Math.round(systems.reduce((n, s) => n + s.aiReadiness, 0) / systems.length);
  return { total: systems.length, active, avgAutomation, avgAi };
}
