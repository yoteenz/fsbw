import { readCoreSystemsStore } from '../persistence';
import type { CoreSystemBlueprint, CoreSystemsRegistryStats } from '../types';
import { CANONICAL_CORE_SYSTEMS, CORE_SYSTEM_DOMAINS } from '../constants';

/** System Registry™ */
export function listSystemRegistry(): CoreSystemBlueprint[] {
  return readCoreSystemsStore().systems;
}

export function getCoreSystem(systemId: string): CoreSystemBlueprint | undefined {
  return listSystemRegistry().find((s) => s.systemId === systemId);
}

export function listSystemsByDomain(domain: string): CoreSystemBlueprint[] {
  return listSystemRegistry().filter((s) => s.domain === domain);
}

export function listSystemsByLifecycleState(
  state: CoreSystemBlueprint['lifecycleState']
): CoreSystemBlueprint[] {
  return listSystemRegistry().filter((s) => s.lifecycleState === state);
}

export function searchSystemRegistry(query: string, limit = 20): CoreSystemBlueprint[] {
  const q = query.trim().toLowerCase();
  if (!q) return listSystemRegistry().slice(0, limit);

  return listSystemRegistry()
    .map((item) => {
      let score = 0;
      if (item.systemId.toLowerCase().includes(q)) score += 6;
      if (item.officialName.toLowerCase().includes(q)) score += 5;
      if (item.domain.toLowerCase().includes(q)) score += 4;
      if (item.purpose?.toLowerCase().includes(q)) score += 3;
      if (item.responsibilities.some((r) => r.toLowerCase().includes(q))) score += 2;
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function getSystemRegistryStats(): Pick<
  CoreSystemsRegistryStats,
  'systemCount' | 'activeSystemCount' | 'domainCoverage'
> {
  const systems = listSystemRegistry();
  return {
    systemCount: systems.length,
    activeSystemCount: systems.filter((s) => s.lifecycleState === 'active').length,
    domainCoverage: CORE_SYSTEM_DOMAINS.map((domain) => ({
      domain,
      count: systems.filter((s) => s.domain === domain).length,
    })),
  };
}

export function getCanonicalSystemCoverage(): {
  systemId: string;
  registered: boolean;
  officialName: string;
}[] {
  return CANONICAL_CORE_SYSTEMS.map((meta) => ({
    systemId: meta.systemId,
    officialName: meta.officialName,
    registered: Boolean(getCoreSystem(meta.systemId)),
  }));
}

export function listSystemsDependingOn(systemId: string): CoreSystemBlueprint[] {
  return listSystemRegistry().filter((s) => s.dependencies.includes(systemId));
}
