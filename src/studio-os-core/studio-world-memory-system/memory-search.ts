import { expandKnowledgeSemanticQuery } from '../studio-world-knowledge-core/semantic-search';
import type { MemorySearchHit } from './types';
import { listConversationArchives } from './conversation-archive';
import { listExtractionReports } from './knowledge-extraction';
import { getApprovalQueue } from './founder-review';
import { listPublishedEntries } from './canonical-publishing';

function scoreBlob(blob: string, terms: string[]): number {
  const lower = blob.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (lower.includes(term)) score += term.length > 4 ? 10 : 6;
  }
  return score;
}

/**
 * Semantic search across all four memory layers.
 */
export function queryMemorySystem(query: string, limit = 16): MemorySearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { expandedTerms, relatedEntryIds } = expandKnowledgeSemanticQuery(trimmed);
  const terms = [...expandedTerms, ...trimmed.toLowerCase().split(/\s+/).filter((t) => t.length > 2)];
  const hits: MemorySearchHit[] = [];

  for (const archive of listConversationArchives()) {
    const blob = [archive.title, archive.summaryForIndex, archive.transcript.slice(0, 2000), ...archive.tags].join(' ');
    const score = scoreBlob(blob, terms);
    if (score > 0) {
      hits.push({
        layer: 'Conversation Archive™',
        id: archive.id,
        title: archive.title,
        summary: archive.summaryForIndex,
        score,
        matchReason: 'conversation archive',
        conversationRef: archive.id,
      });
    }
  }

  for (const report of listExtractionReports()) {
    const blob = [
      report.title,
      report.conversationSummary,
      ...report.architecturalDecisions,
      ...report.systemsIntroduced,
      ...report.designPrinciples,
      ...report.itemsAwaitingApproval,
    ].join(' ');
    const score = scoreBlob(blob, terms) + (report.status === 'Awaiting Founder Review' ? 4 : 0);
    if (score > 0) {
      hits.push({
        layer: 'Knowledge Ingestion™',
        id: report.id,
        title: report.title,
        summary: report.conversationSummary,
        score,
        matchReason: report.status === 'Awaiting Founder Review' ? 'awaiting review' : 'extraction report',
        conversationRef: report.sourceConversationId,
      });
    }
  }

  for (const item of getApprovalQueue()) {
    const blob = [item.title, ...item.itemsAwaitingApproval].join(' ');
    const score = scoreBlob(blob, terms) + 8;
    if (score > 0) {
      hits.push({
        layer: 'Architect Review™',
        id: item.id,
        title: item.title,
        summary: `${item.itemsAwaitingApproval.length} items awaiting founder approval`,
        score,
        matchReason: 'approval queue',
        conversationRef: item.conversationId,
      });
    }
  }

  for (const entry of listPublishedEntries()) {
    const blob = [
      entry.title,
      entry.summary,
      entry.reasoning,
      ...entry.architectureAdded,
      ...entry.relatedSystems,
      ...entry.tags,
    ].join(' ');
    let score = scoreBlob(blob, terms);
    if (relatedEntryIds.some((id) => entry.id.includes(id))) score += 15;
    if (score > 0) {
      hits.push({
        layer: 'Knowledge Core™',
        id: entry.id,
        title: entry.title,
        summary: entry.summary,
        score,
        matchReason: entry.status === 'Approved' ? 'founder-approved memory' : 'knowledge core',
        conversationRef: entry.sourceConversationId,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getConversationReferences(entityId: string): string[] {
  const refs = new Set<string>();

  for (const report of listExtractionReports()) {
    if (report.id === entityId || report.sourceConversationId === entityId) {
      refs.add(report.sourceConversationId);
    }
  }

  for (const entry of listPublishedEntries()) {
    if (entry.id === entityId || entry.sourceConversationId === entityId) {
      refs.add(entry.sourceConversationId);
    }
  }

  return [...refs];
}
