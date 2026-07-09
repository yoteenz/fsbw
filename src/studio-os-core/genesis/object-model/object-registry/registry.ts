import { readObjectModelStore } from '../persistence';
import { getCanonicalObject } from '../object-factory/factory';
import type { CanonicalObject, ObjectModelRegistryStats } from '../types';
import { CANONICAL_OBJECT_TYPES } from '../constants';

/** Canonical Object Registry™ */
export function listCanonicalObjectRegistry(): CanonicalObject[] {
  return readObjectModelStore().objects;
}

export function getCanonicalObjectRegistryStats(): ObjectModelRegistryStats {
  const store = readObjectModelStore();
  const typeSet = new Set(store.objects.map((o) => o.objectType));
  const contradictions = store.relationships.filter((r) => r.type === 'contradicts');

  let brokenReferenceCount = 0;
  for (const obj of store.objects) {
    for (const dep of obj.dependencies) {
      if (!getCanonicalObject(dep)) brokenReferenceCount += 1;
    }
    for (const ref of obj.references) {
      if (!getCanonicalObject(ref.refId)) brokenReferenceCount += 1;
    }
  }

  return {
    objectCount: store.objects.length,
    canonicalCount: store.objects.filter((o) => o.canonicalStatus === 'canonical').length,
    relationshipCount: store.relationships.length,
    typeCount: typeSet.size,
    contradictionCount: contradictions.length,
    brokenReferenceCount,
    historicalEntryCount: store.historicalArchive.length,
  };
}

export function searchCanonicalObjectRegistry(query: string, limit = 20): CanonicalObject[] {
  const q = query.trim().toLowerCase();
  if (!q) return listCanonicalObjectRegistry().slice(0, limit);

  return listCanonicalObjectRegistry()
    .map((obj) => {
      let score = 0;
      if (obj.objectId.toLowerCase().includes(q)) score += 6;
      if (obj.officialName.toLowerCase().includes(q)) score += 5;
      if (obj.objectType.toLowerCase().includes(q)) score += 4;
      if (obj.description.toLowerCase().includes(q)) score += 2;
      if (obj.tags.some((t) => t.toLowerCase().includes(q))) score += 2;
      return { obj, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ obj }) => obj);
}

export function listCanonicalObjectsByType(objectType: CanonicalObject['objectType']): CanonicalObject[] {
  return listCanonicalObjectRegistry().filter((o) => o.objectType === objectType);
}

export function listCanonicalObjectsByStatus(
  canonicalStatus: CanonicalObject['canonicalStatus']
): CanonicalObject[] {
  return listCanonicalObjectRegistry().filter((o) => o.canonicalStatus === canonicalStatus);
}

export function getObjectTypeCoverage(): { type: string; count: number }[] {
  return CANONICAL_OBJECT_TYPES.map((type) => ({
    type,
    count: listCanonicalObjectsByType(type).length,
  }));
}
