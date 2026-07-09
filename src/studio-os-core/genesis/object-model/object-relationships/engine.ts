import { mutateObjectModelStore, readObjectModelStore } from '../persistence';
import { getCanonicalObject } from '../object-factory/factory';
import type { CanonicalRelationship } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createRelationshipId(from: string, to: string, type: string): string {
  return `com-rel-${from}-${type}-${to}-${Date.now().toString(36)}`;
}

/** Relationship Engine™ — extensible typed graph edges */
export function listCanonicalObjectRelationships(): CanonicalRelationship[] {
  return readObjectModelStore().relationships;
}

export function getCanonicalObjectRelationship(
  relationshipId: string
): CanonicalRelationship | undefined {
  return readObjectModelStore().relationships.find((r) => r.id === relationshipId);
}

export function listRelationshipsForCanonicalObject(objectId: string): CanonicalRelationship[] {
  const store = readObjectModelStore();
  return store.relationships.filter(
    (r) => r.fromObjectId === objectId || r.toObjectId === objectId
  );
}

export function listOutgoingCanonicalRelationships(objectId: string): CanonicalRelationship[] {
  return readObjectModelStore().relationships.filter((r) => r.fromObjectId === objectId);
}

export function listIncomingCanonicalRelationships(objectId: string): CanonicalRelationship[] {
  return readObjectModelStore().relationships.filter((r) => r.toObjectId === objectId);
}

export function addCanonicalObjectRelationship(input: {
  fromObjectId: string;
  toObjectId: string;
  type: string;
  required?: boolean;
  rationale?: string;
  metadata?: Record<string, unknown>;
}): CanonicalRelationship {
  const from = getCanonicalObject(input.fromObjectId);
  const to = getCanonicalObject(input.toObjectId);

  if (!from) throw new Error(`Source object not found: ${input.fromObjectId}`);
  if (!to) throw new Error(`Target object not found: ${input.toObjectId}`);
  if (input.fromObjectId === input.toObjectId && input.type !== 'references') {
    throw new Error('Self-relationships are only allowed for references');
  }

  const relationship: CanonicalRelationship = {
    id: createRelationshipId(input.fromObjectId, input.toObjectId, input.type),
    fromObjectId: input.fromObjectId,
    toObjectId: input.toObjectId,
    type: input.type.trim(),
    required: input.required,
    rationale: input.rationale,
    metadata: input.metadata,
    createdAt: now(),
  };

  mutateObjectModelStore((store) => ({
    ...store,
    relationships: [...store.relationships, relationship],
  }));

  return relationship;
}

export function removeCanonicalObjectRelationship(relationshipId: string): boolean {
  let removed = false;

  mutateObjectModelStore((store) => {
    if (!store.relationships.some((r) => r.id === relationshipId)) return store;
    removed = true;
    return {
      ...store,
      relationships: store.relationships.filter((r) => r.id !== relationshipId),
    };
  });

  return removed;
}

export function findCanonicalContradictions(): CanonicalRelationship[] {
  return readObjectModelStore().relationships.filter((r) => r.type === 'contradicts');
}

export function getCanonicalObjectGraphNeighbors(objectId: string) {
  const outgoing = listOutgoingCanonicalRelationships(objectId);
  const incoming = listIncomingCanonicalRelationships(objectId);
  return { outgoing, incoming, total: outgoing.length + incoming.length };
}

export function syncDependenciesFromRelationships(objectId: string): string[] {
  const deps = listOutgoingCanonicalRelationships(objectId)
    .filter((r) => r.type === 'depends_on' || r.type === 'requires')
    .map((r) => r.toObjectId);

  mutateObjectModelStore((store) => ({
    ...store,
    objects: store.objects.map((o) =>
      o.objectId === objectId
        ? { ...o, dependencies: [...new Set([...o.dependencies, ...deps])], updatedAt: now() }
        : o
    ),
  }));

  return deps;
}
