import {
  MEMORY_SYSTEM_STORAGE_KEY,
  MEMORY_SYSTEM_VERSION,
  STUDIO_OS_MEMORY_SYSTEM_UPDATED,
} from './constants';
import type {
  ConversationArchive,
  FounderReviewItem,
  MemoryExtractionReport,
  MemorySystemStore,
  MemoryVersionRecord,
  PublishedKnowledgeEntry,
} from './types';

function emptyStore(): MemorySystemStore {
  return {
    version: MEMORY_SYSTEM_VERSION,
    conversationArchives: [],
    extractionReports: [],
    reviewQueue: [],
    publishedEntries: [],
    versionLineage: [],
  };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_MEMORY_SYSTEM_UPDATED));
  }
}

export function readMemorySystemStore(): MemorySystemStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(MEMORY_SYSTEM_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as MemorySystemStore;
    return { ...emptyStore(), ...parsed, version: MEMORY_SYSTEM_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeMemorySystemStore(store: MemorySystemStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(MEMORY_SYSTEM_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function appendConversationArchive(archive: ConversationArchive): ConversationArchive {
  const store = readMemorySystemStore();
  if (store.conversationArchives.some((a) => a.id === archive.id)) {
    return store.conversationArchives.find((a) => a.id === archive.id)!;
  }
  writeMemorySystemStore({
    ...store,
    conversationArchives: [...store.conversationArchives, archive],
  });
  return archive;
}

export function appendExtractionReport(report: MemoryExtractionReport): MemoryExtractionReport {
  const store = readMemorySystemStore();
  const next = store.extractionReports.filter((r) => r.id !== report.id);
  writeMemorySystemStore({ ...store, extractionReports: [...next, report] });
  return report;
}

export function upsertReviewItem(item: FounderReviewItem): FounderReviewItem {
  const store = readMemorySystemStore();
  const next = store.reviewQueue.filter((r) => r.id !== item.id);
  writeMemorySystemStore({ ...store, reviewQueue: [...next, item] });
  return item;
}

export function removeReviewItem(reviewItemId: string): void {
  const store = readMemorySystemStore();
  writeMemorySystemStore({
    ...store,
    reviewQueue: store.reviewQueue.filter((r) => r.id !== reviewItemId),
  });
}

export function appendPublishedEntry(entry: PublishedKnowledgeEntry): PublishedKnowledgeEntry {
  const store = readMemorySystemStore();
  const next = store.publishedEntries.filter((e) => e.id !== entry.id);
  writeMemorySystemStore({ ...store, publishedEntries: [...next, entry] });
  return entry;
}

export function appendVersionRecord(record: MemoryVersionRecord): void {
  const store = readMemorySystemStore();
  writeMemorySystemStore({
    ...store,
    versionLineage: [...store.versionLineage, record],
  });
}

export function linkArchiveToExtraction(archiveId: string, extractionReportId: string): void {
  const store = readMemorySystemStore();
  writeMemorySystemStore({
    ...store,
    conversationArchives: store.conversationArchives.map((a) =>
      a.id === archiveId ? { ...a, relatedExtractionReportId: extractionReportId } : a
    ),
  });
}
