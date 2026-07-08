import {
  CONVERSATION_ARCHIVE_RECORDS,
  KNOWLEDGE_EXTRACTION_REPORTS,
} from '../studio-world-knowledge-core/entries';
import { readMemorySystemStore } from './store';
import { appendConversationArchive } from './store';
import { appendExtractionReport } from './store';
import { upsertReviewItem } from './store';
import type { ConversationArchive, MemoryExtractionReport } from './types';
import { readFirstEnsure } from '../sync/profile-cache';
import {
  buildOrganizationMemorySystemProfile,
  getOrganizationMemorySystemProfile,
  syncMemorySystemFromSources,
} from './profile-builder';

const ISO = () => new Date().toISOString();

function seedArchiveFromRecord(record: (typeof CONVERSATION_ARCHIVE_RECORDS)[number]): ConversationArchive {
  return {
    id: record.id,
    title: record.title,
    date: record.date,
    status: 'Archived',
    transcript: `[Archived transcript — see ${record.transcriptPath}]`,
    transcriptPath: record.transcriptPath,
    summaryForIndex: record.summaryForIndex,
    preservedExactly: true,
    immutable: true,
    ingestedAt: ISO(),
    relatedExtractionReportId: record.relatedExtractionReportId,
    tags: ['conversation-archive', 'seed', 'article-k23'],
  };
}

function seedReportFromRecord(record: (typeof KNOWLEDGE_EXTRACTION_REPORTS)[number]): MemoryExtractionReport {
  return {
    ...record,
    proposedEntries: record.itemsAwaitingApproval.map((item, idx) => ({
      id: `proposed-seed-${record.id}-${idx}`,
      title: item,
      domain: 'Knowledge Engine™',
      summary: item,
      reasoning: `Seed extraction item from ${record.id}. Awaiting founder review.`,
      architectureAdded: record.systemsIntroduced,
      relatedSystems: record.systemsIntroduced,
      constitutionArticles: record.constitutionUpdates,
      adrReferences: record.potentialAdrs.map(() => 'ADR-candidate'),
      worldBibleReferences: record.worldBibleUpdates,
      tags: ['seed', 'awaiting-review', 'not-canon'],
    })),
    createdAt: ISO(),
  };
}

export function seedMemorySystemFromCanon(): void {
  const store = readMemorySystemStore();
  if (store.conversationArchives.length > 0) return;

  for (const record of CONVERSATION_ARCHIVE_RECORDS) {
    appendConversationArchive(seedArchiveFromRecord(record));
  }

  for (const record of KNOWLEDGE_EXTRACTION_REPORTS) {
    const report = seedReportFromRecord(record);
    appendExtractionReport(report);
    if (report.status === 'Awaiting Founder Review') {
      upsertReviewItem({
        id: `review-${report.id}`,
        extractionReportId: report.id,
        conversationId: report.sourceConversationId,
        title: report.title,
        status: 'Awaiting Founder Review',
        queuedAt: ISO(),
        itemsAwaitingApproval: report.itemsAwaitingApproval,
      });
    }
  }
}

export function ensureMemorySystemBootstrapped(organizationId: string) {
  seedMemorySystemFromCanon();
  return readFirstEnsure(
    organizationId,
    getOrganizationMemorySystemProfile,
    syncMemorySystemFromSources
  );
}

export function bootstrapMemorySystem(organizationId: string): void {
  seedMemorySystemFromCanon();
  buildOrganizationMemorySystemProfile(organizationId);
}
