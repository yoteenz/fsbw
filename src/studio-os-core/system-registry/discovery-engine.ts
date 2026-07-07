import { getAllRegisteredSystems } from './registration';
import type { SystemDiscoveryHit } from './types';

const SEMANTIC_CLUSTERS: Record<string, string[]> = {
  memory: ['module:memory-engine', 'module:legacy-vault', 'module:profession-brain', 'feature:organizational-consciousness'],
  ai: ['module:studio-intelligence', 'module:model-orchestrator', 'module:studio-foundation-models', 'module:profession-brain'],
  documentation: ['module:knowledge-registry', 'module:documentation-governance', 'module:documentation-sync', 'module:knowledge-hub'],
  executive: ['module:executive-council', 'module:mission-control', 'module:organization-pulse', 'concierge:chief-of-staff'],
  registry: ['module:system-registry', 'module:knowledge-registry'],
};

function scoreEntry(entry: ReturnType<typeof getAllRegisteredSystems>[number], terms: string[]): { score: number; reason: string } {
  const blob = `${entry.officialName} ${entry.description} ${entry.keywords.join(' ')} ${entry.aliases.join(' ')} ${entry.category}`.toLowerCase();
  let score = 0;
  let reason = 'keyword';

  for (const term of terms) {
    if (entry.uniqueId.includes(term)) score += 12;
    if (entry.officialName.toLowerCase().includes(term)) score += 10;
    if (blob.includes(term)) score += 6;
    if (entry.aliases.some((a) => a.toLowerCase().includes(term))) {
      score += 8;
      reason = 'alias';
    }
  }

  return { score, reason };
}

/** System discovery — master directory search for Command Dock, developers, architecture. */
export function querySystemRegistry(query: string, limit = 12): SystemDiscoveryHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const systems = getAllRegisteredSystems();
  const hits: SystemDiscoveryHit[] = [];

  for (const [cluster, ids] of Object.entries(SEMANTIC_CLUSTERS)) {
    if (q.includes(cluster) || terms.includes(cluster)) {
      for (const id of ids) {
        const entry = systems.find((s) => s.uniqueId === id || s.moduleId === id.replace(/^module:/, ''));
        if (entry) {
          hits.push({ entry, score: 20, matchReason: `semantic:${cluster}` });
        }
      }
    }
  }

  for (const entry of systems) {
    const { score, reason } = scoreEntry(entry, terms);
    if (score > 0 && !hits.some((h) => h.entry.uniqueId === entry.uniqueId)) {
      hits.push({ entry, score, matchReason: reason });
    }
  }

  return hits
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function explainSystem(uniqueId: string): string | null {
  const entry = systemsFind(uniqueId);
  if (!entry) return null;
  return `${entry.officialName} (${entry.category}) — ${entry.description} Status: ${entry.status} · v${entry.version}. Dependencies: ${entry.dependencies.slice(0, 3).join(', ') || 'none'}.`;
}

function systemsFind(id: string) {
  return getAllRegisteredSystems().find((e) => e.uniqueId === id || e.moduleId === id);
}

export function findSystemsByRoute(pathname: string): ReturnType<typeof getAllRegisteredSystems> {
  return getAllRegisteredSystems().filter(
    (e) => e.route && pathname.includes(e.route.replace('/admin/studio', ''))
  );
}
