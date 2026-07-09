import { INITIAL_GENESIS_VERSION } from '../versioning/semver';
import { assertGenesisObjectValid } from '../schemas/validate';
import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import type {
  GenesisCanonicalStatus,
  GenesisObject,
  GenesisObjectStatus,
  GenesisObjectType,
  GenesisPipelineStage,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

export function createGenesisObjectId(type: GenesisObjectType, slug: string): string {
  const typeToken = type.toUpperCase().replace(/-/g, '-');
  const slugToken = (slug.trim() || 'object')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `GEN-${typeToken}-${slugToken}`;
}

export function createGenesisObject(input: {
  type: GenesisObjectType;
  title: string;
  category: string;
  author: string;
  slug: string;
  summary?: string;
  tags?: string[];
  contributors?: string[];
  dependencies?: string[];
  references?: GenesisObject['references'];
  payload?: Record<string, unknown>;
  pipelineStage?: GenesisPipelineStage;
  status?: GenesisObjectStatus;
  canonicalStatus?: GenesisCanonicalStatus;
}): GenesisObject {
  const timestamp = now();
  const object: GenesisObject = {
    objectId: createGenesisObjectId(input.type, input.slug),
    type: input.type,
    title: input.title.trim(),
    category: input.category.trim(),
    status: input.status ?? 'proposed',
    pipelineStage: input.pipelineStage ?? 'proposal',
    version: { ...INITIAL_GENESIS_VERSION },
    canonicalStatus: input.canonicalStatus ?? 'non-canonical',
    createdAt: timestamp,
    updatedAt: timestamp,
    author: input.author,
    contributors: input.contributors ?? [input.author],
    dependencies: input.dependencies ?? [],
    relationships: [],
    reviewHistory: [],
    tags: input.tags ?? [],
    references: input.references ?? [],
    revisionHistory: [],
    summary: input.summary,
    payload: input.payload,
  };

  assertGenesisObjectValid(object);

  mutateGenesisStore((store) => ({
    ...store,
    objects: [...store.objects, object],
  }));

  return object;
}

export function getGenesisObject(objectId: string): GenesisObject | undefined {
  return readGenesisStore().objects.find((o) => o.objectId === objectId);
}

export function listGenesisObjects(filter?: {
  type?: GenesisObjectType;
  status?: GenesisObjectStatus;
  pipelineStage?: GenesisPipelineStage;
  canonicalStatus?: GenesisCanonicalStatus;
  tag?: string;
}): GenesisObject[] {
  let objects = readGenesisStore().objects;

  if (filter?.type) objects = objects.filter((o) => o.type === filter.type);
  if (filter?.status) objects = objects.filter((o) => o.status === filter.status);
  if (filter?.pipelineStage) {
    objects = objects.filter((o) => o.pipelineStage === filter.pipelineStage);
  }
  if (filter?.canonicalStatus) {
    objects = objects.filter((o) => o.canonicalStatus === filter.canonicalStatus);
  }
  if (filter?.tag) objects = objects.filter((o) => o.tags.includes(filter.tag!));

  return objects;
}

export function updateGenesisObject(
  objectId: string,
  patch: Partial<
    Pick<
      GenesisObject,
      | 'title'
      | 'category'
      | 'summary'
      | 'status'
      | 'pipelineStage'
      | 'canonicalStatus'
      | 'tags'
      | 'dependencies'
      | 'references'
      | 'payload'
      | 'contributors'
    >
  >
): GenesisObject | undefined {
  let updated: GenesisObject | undefined;

  mutateGenesisStore((store) => {
    const idx = store.objects.findIndex((o) => o.objectId === objectId);
    if (idx < 0) return store;

    updated = {
      ...store.objects[idx],
      ...patch,
      updatedAt: now(),
    };

    const objects = [...store.objects];
    objects[idx] = updated;
    return { ...store, objects };
  });

  return updated;
}
