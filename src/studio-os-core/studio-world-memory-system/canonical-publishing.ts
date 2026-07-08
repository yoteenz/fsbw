import { DEFAULT_PUBLISHED_STATUS } from './constants';
import type {
  MemoryExtractionReport,
  ProposedKnowledgeEntry,
  PublishedKnowledgeEntry,
} from './types';
import { appendPublishedEntry, appendVersionRecord, readMemorySystemStore } from './store';
import { buildEntryRelationships } from '../studio-world-knowledge-core/relationship-graph';
import { normalizeKnowledgeEntry } from '../studio-world-knowledge-core/schema';
import type { ArchitectReviewAction } from '../studio-world-knowledge-core/types';

const ISO = () => new Date().toISOString();

function proposedToPublished(
  proposed: ProposedKnowledgeEntry,
  report: MemoryExtractionReport,
  reviewAction: ArchitectReviewAction
): PublishedKnowledgeEntry {
  const now = ISO();
  const entry = {
    ...normalizeKnowledgeEntry({
      id: `published-${proposed.id}`,
      title: proposed.title,
      domain: proposed.domain,
      status: DEFAULT_PUBLISHED_STATUS,
      version: 'v1',
      summary: proposed.summary,
      reasoning: proposed.reasoning,
      finalPrompt: `Approved from conversation ${report.sourceConversationId}`,
      architectureAdded: proposed.architectureAdded,
      relatedSystems: proposed.relatedSystems,
      constitutionArticles: proposed.constitutionArticles,
      adrReferences: proposed.adrReferences,
      worldBibleReferences: proposed.worldBibleReferences,
      implementationStatus: 'Specified' as const,
      tags: [...proposed.tags, 'founder-approved', 'memory-system-published'],
      createdAt: now,
      updatedAt: now,
    }),
    sourceConversationId: report.sourceConversationId,
    sourceExtractionReportId: report.id,
    publishedAt: now,
    approvedBy: 'founder' as const,
    reviewAction,
  } satisfies PublishedKnowledgeEntry;

  entry.relationships = [
    ...buildEntryRelationships(entry),
    {
      type: 'evidence-for',
      targetId: report.sourceConversationId,
      targetLabel: report.sourceConversationId,
      label: 'conversation-source',
    },
    {
      type: 'references',
      targetId: report.id,
      targetLabel: report.id,
      label: 'extraction-report',
    },
  ];

  return entry as PublishedKnowledgeEntry;
}

/**
 * Layer 4 — Knowledge Core™ publishing
 * Curated, founder-approved entries only. Never auto-Canon.
 */
export function publishApprovedKnowledge(
  report: MemoryExtractionReport,
  reviewAction: ArchitectReviewAction
): PublishedKnowledgeEntry[] {
  if (report.status === 'Rejected') return [];
  if (report.proposedEntries.length === 0) return [];

  const published: PublishedKnowledgeEntry[] = [];

  for (const proposed of report.proposedEntries) {
    const entry = proposedToPublished(proposed, report, reviewAction);
    appendPublishedEntry(entry);
    appendVersionRecord({
      entityId: entry.id,
      entityKind: 'knowledge-core-entry',
      version: entry.version,
      createdAt: entry.publishedAt,
      summary: entry.summary,
      status: entry.status,
    });
    published.push(entry);
  }

  return published;
}

export function listPublishedEntries(): PublishedKnowledgeEntry[] {
  return readMemorySystemStore().publishedEntries;
}

export function getPublishedEntry(id: string): PublishedKnowledgeEntry | null {
  return listPublishedEntries().find((e) => e.id === id) ?? null;
}

export function getPublishedEntriesForConversation(conversationId: string): PublishedKnowledgeEntry[] {
  return listPublishedEntries().filter((e) => e.sourceConversationId === conversationId);
}

/** Canon promotion is a separate explicit gate — never automatic. */
export function canAutoPromoteToCanon(): false {
  return false;
}
