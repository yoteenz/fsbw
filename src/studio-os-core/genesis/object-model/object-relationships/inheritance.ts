import {
  INHERITANCE_FAMILIES,
  type CanonicalObjectTypeId,
} from '../constants';
import { getCanonicalObject } from '../object-factory/factory';
import { readObjectModelStore } from '../persistence';
import { addCanonicalObjectRelationship } from './engine';
import type { CanonicalObject } from '../types';

/** Inheritance Model™ — validate subtype identity */
export function canInheritFrom(
  childType: CanonicalObjectTypeId,
  parentType: CanonicalObjectTypeId
): boolean {
  const allowed = INHERITANCE_FAMILIES[parentType];
  return allowed?.includes(childType) ?? false;
}

export function validateInheritance(object: CanonicalObject): string[] {
  const errors: string[] = [];

  if (!object.inheritsFrom) return errors;

  if (!canInheritFrom(object.objectType, object.inheritsFrom)) {
    errors.push(
      `${object.objectType} may not inherit from ${object.inheritsFrom} per inheritance doctrine`
    );
  }

  const inheritEdges = readObjectModelStore().relationships.filter(
    (r) => r.toObjectId === object.objectId && r.type === 'inherits'
  );

  for (const edge of inheritEdges) {
    const parent = getCanonicalObject(edge.fromObjectId);
    if (parent && parent.objectType !== object.inheritsFrom) {
      errors.push(
        `Inheritance edge parent type ${parent.objectType} does not match inheritsFrom ${object.inheritsFrom}`
      );
    }
  }

  return errors;
}

export function listInheritanceChain(objectId: string): CanonicalObjectTypeId[] {
  const object = getCanonicalObject(objectId);
  if (!object) return [];

  const chain: CanonicalObjectTypeId[] = [object.objectType];
  let current = object.inheritsFrom;

  while (current) {
    chain.push(current);
    const inheritEdge = readObjectModelStore().relationships.find(
      (r) =>
        r.toObjectId === objectId &&
        r.type === 'inherits' &&
        getCanonicalObject(r.fromObjectId)?.objectType === current
    );
    const parentObj = inheritEdge ? getCanonicalObject(inheritEdge.fromObjectId) : undefined;
    current = parentObj?.inheritsFrom;
  }

  return chain;
}

export function applyInheritanceRelationship(
  childObjectId: string,
  parentObjectId: string,
  rationale?: string
): void {
  const child = getCanonicalObject(childObjectId);
  const parent = getCanonicalObject(parentObjectId);
  if (!child || !parent) throw new Error('Child and parent objects must exist');

  if (!canInheritFrom(child.objectType, parent.objectType)) {
    throw new Error(`Inheritance not allowed: ${child.objectType} -> ${parent.objectType}`);
  }

  addCanonicalObjectRelationship({
    fromObjectId: childObjectId,
    toObjectId: parentObjectId,
    type: 'inherits',
    rationale: rationale ?? 'Inheritance Model™ subtype link',
    required: true,
  });
}
