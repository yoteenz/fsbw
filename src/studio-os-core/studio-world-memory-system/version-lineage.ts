import type { MemoryVersionRecord } from './types';
import { readMemorySystemStore } from './store';
import { listPublishedEntries } from './canonical-publishing';
import { listExtractionReports } from './knowledge-extraction';

/** Version lineage — civilization remembers how memory evolved. */
export function getVersionLineage(entityId: string): MemoryVersionRecord[] {
  const store = readMemorySystemStore();
  return store.versionLineage.filter((r) => r.entityId === entityId || r.supersededBy === entityId);
}

export function listAllVersionRecords(): MemoryVersionRecord[] {
  return readMemorySystemStore().versionLineage;
}

export function buildPublishedEntryLineage(entryId: string): MemoryVersionRecord[] {
  const entry = listPublishedEntries().find((e) => e.id === entryId);
  if (!entry) return [];

  const records: MemoryVersionRecord[] = [
    {
      entityId: entry.id,
      entityKind: 'knowledge-core-entry',
      version: entry.version,
      createdAt: entry.publishedAt,
      summary: entry.summary,
      status: entry.status,
    },
  ];

  const extraction = listExtractionReports().find((r) => r.id === entry.sourceExtractionReportId);
  if (extraction) {
    records.unshift({
      entityId: extraction.id,
      entityKind: 'knowledge-extraction',
      version: 'v1',
      createdAt: extraction.createdAt,
      summary: extraction.conversationSummary,
      status: extraction.status,
      supersededBy: entry.id,
    });
  }

  return records;
}

export function listHistoricalExtractions(): ReturnType<typeof listExtractionReports> {
  return listExtractionReports().filter(
    (r) => r.status === 'Rejected' || r.status === 'Merged'
  );
}
