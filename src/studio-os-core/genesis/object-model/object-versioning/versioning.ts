import { mutateObjectModelStore, readObjectModelStore } from '../persistence';
import { getCanonicalObject } from '../object-factory/factory';
import { bumpGenesisVersion } from '../../versioning/semver';
import type { CanonicalObjectRevision } from '../types';
import type { GenesisVersion } from '../../types';

function now(): string {
  return new Date().toISOString();
}

function createRevisionId(objectId: string): string {
  return `com-rev-${objectId}-${Date.now().toString(36)}`;
}

/** Object Versioning™ — semver revisions for canonical objects */
export function createCanonicalObjectRevision(
  objectId: string,
  input: {
    summary: string;
    author: string;
    changeNote: string;
    versionLevel?: 'major' | 'minor' | 'patch';
    snapshot?: Partial<import('../types').CanonicalObject>;
  }
): CanonicalObjectRevision | undefined {
  let revision: CanonicalObjectRevision | undefined;

  mutateObjectModelStore((store) => {
    const idx = store.objects.findIndex((o) => o.objectId === objectId);
    if (idx < 0) return store;

    const object = store.objects[idx];
    const nextVersion = bumpGenesisVersion(object.version, input.versionLevel ?? 'patch');

    revision = {
      revisionId: createRevisionId(objectId),
      version: nextVersion,
      summary: input.summary.trim(),
      author: input.author,
      changeNote: input.changeNote.trim(),
      createdAt: now(),
      snapshot: input.snapshot,
    };

    const objects = [...store.objects];
    objects[idx] = {
      ...object,
      version: nextVersion,
      updatedAt: now(),
      revisionHistory: [...object.revisionHistory, revision],
    };

    return { ...store, objects };
  });

  return revision;
}

export function listCanonicalObjectRevisions(objectId: string): CanonicalObjectRevision[] {
  return getCanonicalObject(objectId)?.revisionHistory ?? [];
}

export function getCanonicalObjectVersion(objectId: string): GenesisVersion | undefined {
  return getCanonicalObject(objectId)?.version;
}

export function listCanonicalObjectVersionHistory(): {
  objectId: string;
  officialName: string;
  revisionCount: number;
  currentVersion: GenesisVersion;
}[] {
  return readObjectModelStore().objects.map((o) => ({
    objectId: o.objectId,
    officialName: o.officialName,
    revisionCount: o.revisionHistory.length,
    currentVersion: o.version,
  }));
}
