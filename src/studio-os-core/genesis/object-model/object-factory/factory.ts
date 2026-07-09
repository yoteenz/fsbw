import { INITIAL_GENESIS_VERSION } from '../../versioning/semver';
import { mutateObjectModelStore, readObjectModelStore } from '../persistence';
import { isCanonicalObjectType } from '../object-types/registry';
import { assertCanonicalObjectIntegrity } from '../object-validation/engine';
import type { CanonicalObjectTypeId, CanonicalLifecycleState } from '../constants';
import type {
  CanonicalCanonicalStatus,
  CanonicalObject,
  CanonicalObjectOwner,
  CanonicalObjectReference,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

export function createCanonicalObjectId(objectType: CanonicalObjectTypeId, slug: string): string {
  const typeToken = objectType.toUpperCase().replace(/-/g, '-');
  const slugToken = (slug.trim() || 'object')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `COM-${typeToken}-${slugToken}`;
}

export type RegisterCanonicalObjectInput = {
  objectType: CanonicalObjectTypeId | string;
  officialName: string;
  description: string;
  slug: string;
  owner: CanonicalObjectOwner;
  lifecycleState?: CanonicalLifecycleState;
  canonicalStatus?: CanonicalCanonicalStatus;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  references?: CanonicalObjectReference[];
  inheritsFrom?: CanonicalObjectTypeId;
};

/** Object Factory™ — register canonical objects */
export function registerCanonicalObject(input: RegisterCanonicalObjectInput): CanonicalObject {
  if (!isCanonicalObjectType(input.objectType)) {
    throw new Error(`Unknown canonical object type: ${input.objectType}`);
  }

  const timestamp = now();
  const object: CanonicalObject = {
    objectId: createCanonicalObjectId(input.objectType, input.slug),
    objectType: input.objectType,
    officialName: input.officialName.trim(),
    description: input.description.trim(),
    version: { ...INITIAL_GENESIS_VERSION },
    lifecycleState: input.lifecycleState ?? 'proposed',
    owner: input.owner,
    dependencies: input.dependencies ?? [],
    tags: input.tags ?? [],
    metadata: input.metadata ?? {},
    references: input.references ?? [],
    revisionHistory: [],
    canonicalStatus: input.canonicalStatus ?? 'non-canonical',
    inheritsFrom: input.inheritsFrom,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  assertCanonicalObjectIntegrity(object);

  mutateObjectModelStore((store) => {
    if (store.objects.some((o) => o.objectId === object.objectId)) {
      throw new Error(`Canonical object already exists: ${object.objectId}`);
    }
    return { ...store, objects: [...store.objects, object] };
  });

  return object;
}

export function getCanonicalObject(objectId: string): CanonicalObject | undefined {
  return readObjectModelStore().objects.find((o) => o.objectId === objectId);
}

export function listCanonicalObjects(filter?: {
  objectType?: CanonicalObjectTypeId;
  lifecycleState?: CanonicalLifecycleState;
  canonicalStatus?: CanonicalCanonicalStatus;
  tag?: string;
}): CanonicalObject[] {
  let objects = readObjectModelStore().objects;
  if (filter?.objectType) objects = objects.filter((o) => o.objectType === filter.objectType);
  if (filter?.lifecycleState) {
    objects = objects.filter((o) => o.lifecycleState === filter.lifecycleState);
  }
  if (filter?.canonicalStatus) {
    objects = objects.filter((o) => o.canonicalStatus === filter.canonicalStatus);
  }
  if (filter?.tag) objects = objects.filter((o) => o.tags.includes(filter.tag!));
  return objects;
}

export function updateCanonicalObject(
  objectId: string,
  patch: Partial<
    Pick<
      CanonicalObject,
      | 'officialName'
      | 'description'
      | 'lifecycleState'
      | 'canonicalStatus'
      | 'owner'
      | 'dependencies'
      | 'tags'
      | 'metadata'
      | 'references'
      | 'inheritsFrom'
    >
  >
): CanonicalObject | undefined {
  let updated: CanonicalObject | undefined;

  mutateObjectModelStore((store) => {
    const idx = store.objects.findIndex((o) => o.objectId === objectId);
    if (idx < 0) return store;

    updated = {
      ...store.objects[idx],
      ...patch,
      updatedAt: now(),
    };

    assertCanonicalObjectIntegrity(updated);

    const objects = [...store.objects];
    objects[idx] = updated;
    return { ...store, objects };
  });

  return updated;
}

export function removeCanonicalObject(objectId: string): boolean {
  let removed = false;

  mutateObjectModelStore((store) => {
    if (!store.objects.some((o) => o.objectId === objectId)) return store;
    removed = true;
    return {
      ...store,
      objects: store.objects.filter((o) => o.objectId !== objectId),
      relationships: store.relationships.filter(
        (r) => r.fromObjectId !== objectId && r.toObjectId !== objectId
      ),
    };
  });

  return removed;
}
