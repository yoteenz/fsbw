import { mutateObjectModelStore, readObjectModelStore } from '../persistence';
import { getCanonicalObject } from '../object-factory/factory';
import type { CanonicalHistoricalEntry, CanonicalObjectRevision } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** Object History™ — append-only canonical archive */
export function listCanonicalObjectHistory(objectId?: string): CanonicalHistoricalEntry[] {
  const archive = readObjectModelStore().historicalArchive;
  return objectId ? archive.filter((h) => h.objectId === objectId) : archive;
}

export function archiveCanonicalObjectRevision(
  objectId: string,
  input: { reason: string; revision?: CanonicalObjectRevision }
): CanonicalHistoricalEntry | undefined {
  const object = getCanonicalObject(objectId);
  if (!object) return undefined;

  const revision =
    input.revision ?? object.revisionHistory[object.revisionHistory.length - 1];
  if (!revision) return undefined;

  const entry: CanonicalHistoricalEntry = {
    historyId: `com-hist-${objectId}-${Date.now().toString(36)}`,
    objectId,
    revision,
    archivedAt: now(),
    reason: input.reason.trim(),
  };

  mutateObjectModelStore((store) => ({
    ...store,
    historicalArchive: [...store.historicalArchive, entry],
  }));

  return entry;
}

export function getCanonicalObjectTimeline(objectId: string) {
  const object = getCanonicalObject(objectId);
  if (!object) return [];

  const archived = listCanonicalObjectHistory(objectId).map((h) => h.revision);
  return [...object.revisionHistory, ...archived].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function listSupersededCanonicalObjects(): string[] {
  return readObjectModelStore()
    .objects.filter(
      (o) => o.lifecycleState === 'superseded' || o.canonicalStatus === 'historical'
    )
    .map((o) => o.objectId);
}
