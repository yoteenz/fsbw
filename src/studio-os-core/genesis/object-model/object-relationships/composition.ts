import { COMPOSITION_PATTERNS, type CanonicalObjectTypeId } from '../constants';
import { getCanonicalObject } from '../object-factory/factory';
import { listOutgoingCanonicalRelationships } from './engine';
import type { CanonicalObject } from '../types';

/** Composition Framework™ — structural assembly without inheritance */
export function getAllowedCompositionChildren(
  parentType: CanonicalObjectTypeId
): CanonicalObjectTypeId[] {
  return COMPOSITION_PATTERNS[parentType] ?? [];
}

export function canCompose(parentType: CanonicalObjectTypeId, childType: CanonicalObjectTypeId): boolean {
  return getAllowedCompositionChildren(parentType).includes(childType);
}

export function validateComposition(objectId: string): string[] {
  const errors: string[] = [];
  const parent = getCanonicalObject(objectId);
  if (!parent) return errors;

  const containsEdges = listOutgoingCanonicalRelationships(objectId).filter(
    (r) => r.type === 'contains' || r.type === 'composes'
  );

  for (const edge of containsEdges) {
    const child = getCanonicalObject(edge.toObjectId);
    if (!child) {
      errors.push(`Composition target missing: ${edge.toObjectId}`);
      continue;
    }

    const allowed = getAllowedCompositionChildren(parent.objectType);
    if (allowed.length > 0 && !allowed.includes(child.objectType)) {
      errors.push(
        `${parent.objectType} contains ${child.objectType} outside approved composition pattern`
      );
    }
  }

  return errors;
}

export function listComposedObjects(objectId: string): CanonicalObject[] {
  return listOutgoingCanonicalRelationships(objectId)
    .filter((r) => r.type === 'contains' || r.type === 'composes')
    .map((r) => getCanonicalObject(r.toObjectId))
    .filter((o): o is CanonicalObject => Boolean(o));
}

export function getCompositionSummary(): { parentType: string; childTypes: string[] }[] {
  return Object.entries(COMPOSITION_PATTERNS).map(([parentType, childTypes]) => ({
    parentType,
    childTypes: childTypes ?? [],
  }));
}
