import { buildMemoryGraph } from './memory-graph';
import { listConversationArchives } from './conversation-archive';
import { listExtractionReports } from './knowledge-extraction';
import { listPublishedEntries } from './canonical-publishing';
import { getApprovalQueue } from './founder-review';

/** World Graph synchronization payload for Memory System pipeline nodes. */
export function getMemorySystemWorldGraphSyncPayload() {
  const graph = buildMemoryGraph();

  return {
    engineId: 'studio-world-memory-system',
    nodeTypes: ['conversation-archive', 'knowledge-extraction', 'founder-approval'] as const,
    archiveCount: listConversationArchives().length,
    extractionCount: listExtractionReports().length,
    reviewQueueCount: getApprovalQueue().length,
    publishedCount: listPublishedEntries().length,
    nodes: graph.nodes,
    edges: graph.edges,
    syncedAt: graph.syncedAt,
    rules: {
      archiveImmutable: true,
      nothingAutoCanon: true,
      founderApprovalRequired: true,
    },
  };
}
