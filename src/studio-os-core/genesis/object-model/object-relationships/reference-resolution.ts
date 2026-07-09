import { getCanonicalObject } from '../object-factory/factory';
import { listOutgoingCanonicalRelationships } from '../object-relationships/engine';
import type { CanonicalObjectReference } from '../types';

/** Reference Resolution™ — resolve and validate cross-references */
export function resolveCanonicalReference(refId: string) {
  const object = getCanonicalObject(refId);
  if (!object) {
    return { refId, resolved: false as const, object: undefined };
  }
  return {
    refId,
    resolved: true as const,
    object,
    label: object.officialName,
    objectType: object.objectType,
  };
}

export function listCanonicalCrossReferences(objectId: string): CanonicalObjectReference[] {
  const object = getCanonicalObject(objectId);
  if (!object) return [];

  const fromRelationships = listOutgoingCanonicalRelationships(objectId)
    .filter((r) => r.type === 'references')
    .map((r) => ({
      refId: r.toObjectId,
      label: getCanonicalObject(r.toObjectId)?.officialName ?? r.toObjectId,
      relationship: r.type,
    }));

  return [...object.references, ...fromRelationships];
}

export function validateCanonicalCrossReferences(objectId: string): {
  valid: boolean;
  broken: string[];
} {
  const refs = listCanonicalCrossReferences(objectId);
  const broken = refs.filter((r) => !getCanonicalObject(r.refId)).map((r) => r.refId);
  return { valid: broken.length === 0, broken };
}

export function formatCanonicalCitation(objectId: string): string {
  const object = getCanonicalObject(objectId);
  if (!object) return objectId;
  return `${object.objectId} — ${object.officialName}`;
}

export function resolveCanonicalReferenceGraph(objectId: string, depth = 2): string[] {
  const visited = new Set<string>();
  const queue: { id: string; d: number }[] = [{ id: objectId, d: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    if (current.d >= depth) continue;

    for (const ref of listCanonicalCrossReferences(current.id)) {
      if (!visited.has(ref.refId)) queue.push({ id: ref.refId, d: current.d + 1 });
    }
  }

  return [...visited];
}
