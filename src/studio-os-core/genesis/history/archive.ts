import { readGenesisStore } from '../persistence/store';
import { listHistoricalRevisions } from '../versioning/revisions';
import type { GenesisHistoricalRevision, GenesisObjectRevision } from '../types';

/** Historical archive of Genesis revisions — append-only. */
export function listGenesisHistory(objectId?: string): GenesisHistoricalRevision[] {
  return listHistoricalRevisions(objectId);
}

export function getObjectRevisionTimeline(objectId: string): GenesisObjectRevision[] {
  const object = readGenesisStore().objects.find((o) => o.objectId === objectId);
  if (!object) return [];

  const archived = listHistoricalRevisions(objectId).map((h) => h.revision);
  return [...object.revisionHistory, ...archived].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function getSupersededObjects(): string[] {
  return readGenesisStore()
    .objects.filter((o) => o.status === 'superseded' || o.canonicalStatus === 'historical')
    .map((o) => o.objectId);
}
