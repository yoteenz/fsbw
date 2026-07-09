import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import type { GenesisRelationship, GenesisRelationshipType } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createRelationshipId(from: string, to: string, type: GenesisRelationshipType): string {
  return `rel-${from}-${type}-${to}-${Date.now().toString(36)}`;
}

export function listGenesisRelationships(): GenesisRelationship[] {
  return readGenesisStore().relationships;
}

export function getGenesisRelationship(relationshipId: string): GenesisRelationship | undefined {
  return readGenesisStore().relationships.find((r) => r.id === relationshipId);
}

export function listRelationshipsForObject(objectId: string): GenesisRelationship[] {
  const store = readGenesisStore();
  return store.relationships.filter(
    (r) => r.fromObjectId === objectId || r.toObjectId === objectId
  );
}

export function listOutgoingRelationships(objectId: string): GenesisRelationship[] {
  return readGenesisStore().relationships.filter((r) => r.fromObjectId === objectId);
}

export function listIncomingRelationships(objectId: string): GenesisRelationship[] {
  return readGenesisStore().relationships.filter((r) => r.toObjectId === objectId);
}

export function addGenesisRelationship(input: {
  fromObjectId: string;
  toObjectId: string;
  type: GenesisRelationshipType;
  required?: boolean;
  rationale?: string;
}): GenesisRelationship {
  const relationship: GenesisRelationship = {
    id: createRelationshipId(input.fromObjectId, input.toObjectId, input.type),
    fromObjectId: input.fromObjectId,
    toObjectId: input.toObjectId,
    type: input.type,
    required: input.required,
    rationale: input.rationale,
    createdAt: now(),
  };

  mutateGenesisStore((store) => ({
    ...store,
    relationships: [...store.relationships, relationship],
    objects: store.objects.map((obj) => {
      if (obj.objectId !== input.fromObjectId) return obj;
      return {
        ...obj,
        relationships: [...obj.relationships, relationship],
        updatedAt: now(),
      };
    }),
  }));

  return relationship;
}

export function removeGenesisRelationship(relationshipId: string): boolean {
  let removed = false;

  mutateGenesisStore((store) => {
    const relationship = store.relationships.find((r) => r.id === relationshipId);
    if (!relationship) return store;

    removed = true;
    return {
      ...store,
      relationships: store.relationships.filter((r) => r.id !== relationshipId),
      objects: store.objects.map((obj) => ({
        ...obj,
        relationships: obj.relationships.filter((r) => r.id !== relationshipId),
      })),
    };
  });

  return removed;
}

export function findContradictions(): GenesisRelationship[] {
  return readGenesisStore().relationships.filter((r) => r.type === 'contradicts');
}

export function getRelationshipGraphNeighbors(objectId: string) {
  const outgoing = listOutgoingRelationships(objectId);
  const incoming = listIncomingRelationships(objectId);
  return { outgoing, incoming, total: outgoing.length + incoming.length };
}
