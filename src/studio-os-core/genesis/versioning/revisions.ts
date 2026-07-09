import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { bumpGenesisVersion } from './semver';
import type {
  GenesisObjectRevision,
  GenesisHistoricalRevision,
  GenesisVersion,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

function createRevisionId(objectId: string): string {
  return `rev-${objectId}-${Date.now().toString(36)}`;
}

export function createObjectRevision(
  objectId: string,
  input: {
    summary: string;
    author: string;
    changeNote: string;
    versionLevel?: 'major' | 'minor' | 'patch';
    snapshot?: Record<string, unknown>;
  }
): GenesisObjectRevision | undefined {
  let revision: GenesisObjectRevision | undefined;

  mutateGenesisStore((store) => {
    const idx = store.objects.findIndex((o) => o.objectId === objectId);
    if (idx < 0) return store;

    const object = store.objects[idx];
    const nextVersion = bumpGenesisVersion(
      object.version,
      input.versionLevel ?? 'patch'
    );

    revision = {
      revisionId: createRevisionId(objectId),
      version: nextVersion,
      summary: input.summary.trim(),
      author: input.author,
      createdAt: now(),
      changeNote: input.changeNote.trim(),
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

export function archiveHistoricalRevision(
  objectId: string,
  reason: string
): GenesisHistoricalRevision | undefined {
  let archived: GenesisHistoricalRevision | undefined;

  mutateGenesisStore((store) => {
    const object = store.objects.find((o) => o.objectId === objectId);
    if (!object || object.revisionHistory.length === 0) return store;

    const latest = object.revisionHistory[object.revisionHistory.length - 1];
    archived = {
      historyId: `hist-${objectId}-${Date.now().toString(36)}`,
      objectId,
      revision: latest,
      archivedAt: now(),
      reason,
    };

    return {
      ...store,
      historicalRevisions: [...store.historicalRevisions, archived],
    };
  });

  return archived;
}

export function listObjectRevisions(objectId: string): GenesisObjectRevision[] {
  return readGenesisStore().objects.find((o) => o.objectId === objectId)?.revisionHistory ?? [];
}

export function listHistoricalRevisions(objectId?: string): GenesisHistoricalRevision[] {
  const history = readGenesisStore().historicalRevisions;
  return objectId ? history.filter((h) => h.objectId === objectId) : history;
}

export function getObjectVersion(objectId: string): GenesisVersion | undefined {
  return readGenesisStore().objects.find((o) => o.objectId === objectId)?.version;
}
