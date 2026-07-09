import { readGenesisStore } from '../persistence/store';
import { listGenesisObjects } from './factory';
import type { GenesisObject, GenesisRegistryStats } from '../types';

/** Genesis Registry™ — canonical directory of all Genesis objects. */
export function listGenesisRegistry(): GenesisObject[] {
  return readGenesisStore().objects;
}

export function getGenesisRegistryStats(): GenesisRegistryStats {
  const store = readGenesisStore();

  return {
    objectCount: store.objects.length,
    canonicalCount: store.objects.filter((o) => o.canonicalStatus === 'canonical').length,
    proposalCount: store.proposals.length,
    adrCount: store.adrs.length,
    reviewQueue: store.reviews.filter(
      (r) => r.status === 'pending' || r.status === 'in-progress'
    ).length,
    relationshipCount: store.relationships.length,
    compileRunCount: store.compileManifests.length,
  };
}

export function searchGenesisRegistry(query: string, limit = 20): GenesisObject[] {
  const q = query.trim().toLowerCase();
  if (!q) return listGenesisObjects().slice(0, limit);

  return listGenesisObjects()
    .map((obj) => {
      let score = 0;
      if (obj.objectId.toLowerCase().includes(q)) score += 6;
      if (obj.title.toLowerCase().includes(q)) score += 5;
      if (obj.category.toLowerCase().includes(q)) score += 3;
      if (obj.summary?.toLowerCase().includes(q)) score += 2;
      if (obj.tags.some((t) => t.toLowerCase().includes(q))) score += 2;
      return { obj, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ obj }) => obj);
}

export function listCanonicalGenesisObjects(): GenesisObject[] {
  return listGenesisObjects({ canonicalStatus: 'canonical' });
}

export function listObjectsByPipelineStage(stage: GenesisObject['pipelineStage']): GenesisObject[] {
  return listGenesisObjects({ pipelineStage: stage });
}
