import type { MemoryGraph, MemoryGraphEdge, MemoryGraphNode } from './types';
import { listConversationArchives } from './conversation-archive';
import { listExtractionReports } from './knowledge-extraction';
import { listAllReviewItems, getApprovalQueue } from './founder-review';
import { listPublishedEntries } from './canonical-publishing';
import { readMemorySystemStore } from './store';

const ISO = () => new Date().toISOString();

function edgeId(type: string, from: string, to: string): string {
  return `${type}:${from}->${to}`;
}

/**
 * Memory Graph™ — lineage visualization data.
 * Conversation → Extraction → Founder Approval → Knowledge Core → Historical Impact
 */
export function buildMemoryGraph(): MemoryGraph {
  const nodes: MemoryGraphNode[] = [];
  const edges: MemoryGraphEdge[] = [];

  for (const archive of listConversationArchives()) {
    nodes.push({
      id: archive.id,
      kind: 'conversation-archive',
      layer: 'Conversation Archive™',
      label: archive.title,
      summary: archive.summaryForIndex,
      status: archive.status,
      date: archive.date,
    });

    if (archive.relatedExtractionReportId) {
      edges.push({
        id: edgeId('generated-from', archive.relatedExtractionReportId, archive.id),
        from: archive.relatedExtractionReportId,
        to: archive.id,
        type: 'generated-from',
        label: 'extracted-from-conversation',
      });
    }
  }

  for (const report of listExtractionReports()) {
    nodes.push({
      id: report.id,
      kind: 'knowledge-extraction',
      layer: 'Knowledge Ingestion™',
      label: report.title,
      summary: report.conversationSummary,
      status: report.status,
      date: report.createdAt.slice(0, 10),
    });

    edges.push({
      id: edgeId('conversation-source', report.id, report.sourceConversationId),
      from: report.id,
      to: report.sourceConversationId,
      type: 'conversation-source',
      label: 'source-conversation',
    });

    const reviewId = `review-${report.id}`;
    const reviewItem = listAllReviewItems().find((r) => r.extractionReportId === report.id);
    const inQueue = getApprovalQueue().some((r) => r.extractionReportId === report.id);

    if (reviewItem || inQueue || report.status === 'Awaiting Founder Review') {
      nodes.push({
        id: reviewId,
        kind: 'founder-approval',
        layer: 'Architect Review™',
        label: `Founder Review™ — ${report.title}`,
        summary: `${report.itemsAwaitingApproval.length} items awaiting approval`,
        status: report.status,
        date: report.reviewedAt?.slice(0, 10) ?? report.createdAt.slice(0, 10),
      });

      edges.push({
        id: edgeId('references', reviewId, report.id),
        from: reviewId,
        to: report.id,
        type: 'references',
        label: 'review-of-extraction',
      });
    }
  }

  for (const entry of listPublishedEntries()) {
    nodes.push({
      id: entry.id,
      kind: 'knowledge-core-entry',
      layer: 'Knowledge Core™',
      label: entry.title,
      summary: entry.summary,
      status: entry.status,
      date: entry.publishedAt.slice(0, 10),
    });

    edges.push(
      {
        id: edgeId('approved-into', entry.sourceExtractionReportId, entry.id),
        from: entry.sourceExtractionReportId,
        to: entry.id,
        type: 'approved-into',
        label: 'founder-approved',
      },
      {
        id: edgeId('conversation-source', entry.id, entry.sourceConversationId),
        from: entry.id,
        to: entry.sourceConversationId,
        type: 'conversation-source',
        label: 'originating-conversation',
      }
    );
  }

  for (const record of readMemorySystemStore().versionLineage) {
    if (record.supersededBy) {
      edges.push({
        id: edgeId('supersedes', record.entityId, record.supersededBy),
        from: record.entityId,
        to: record.supersededBy,
        type: 'supersedes',
        label: 'version-lineage',
      });
    }
  }

  const rejected = listExtractionReports().filter((r) => r.status === 'Rejected');
  for (const report of rejected) {
    nodes.push({
      id: `historical-${report.id}`,
      kind: 'historical-impact',
      layer: 'Knowledge Core™',
      label: `Historical — ${report.title}`,
      summary: 'Rejected extraction preserved for lineage',
      status: 'Historical',
      date: report.reviewedAt?.slice(0, 10) ?? report.createdAt.slice(0, 10),
    });
    edges.push({
      id: edgeId('historical-impact', `historical-${report.id}`, report.sourceConversationId),
      from: `historical-${report.id}`,
      to: report.sourceConversationId,
      type: 'historical-impact',
      label: 'preserved-rejection',
    });
  }

  return { nodes, edges, syncedAt: ISO() };
}

export function getMemoryGraphNode(id: string): MemoryGraphNode | null {
  return buildMemoryGraph().nodes.find((n) => n.id === id) ?? null;
}

export function traverseMemoryGraph(startId: string, maxDepth = 4): MemoryGraphNode[] {
  const graph = buildMemoryGraph();
  const visited = new Set<string>();
  const result: MemoryGraphNode[] = [];
  const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id) || current.depth > maxDepth) continue;
    visited.add(current.id);

    const node = graph.nodes.find((n) => n.id === current.id);
    if (node && current.id !== startId) result.push(node);

    const outEdges = graph.edges.filter((e) => e.from === current.id || e.to === current.id);
    for (const edge of outEdges) {
      const nextId = edge.from === current.id ? edge.to : edge.from;
      if (!visited.has(nextId)) queue.push({ id: nextId, depth: current.depth + 1 });
    }
  }

  return result;
}
