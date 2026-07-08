import type { ConversationIngestInput, FounderReviewInput } from './types';
import { ingestConversation, listConversationArchives } from './conversation-archive';
import { extractKnowledgeFromConversation, listExtractionReports } from './knowledge-extraction';
import { enqueueForFounderReview, getPendingReviewCount, processFounderReview } from './founder-review';
import { listPublishedEntries, publishApprovedKnowledge } from './canonical-publishing';
import { buildMemoryGraph } from './memory-graph';

export type MemoryPipelineResult = {
  archive: ReturnType<typeof ingestConversation>;
  extraction: ReturnType<typeof extractKnowledgeFromConversation>;
  reviewItem: ReturnType<typeof enqueueForFounderReview>;
};

/**
 * Four-layer Memory System™ pipeline orchestrator.
 *
 * Conversation Archive™ → Knowledge Extraction™ → Founder Review™ → Knowledge Core™
 *
 * Nothing enters Canon automatically. Everything requires founder approval.
 */
export function runMemoryPipeline(input: ConversationIngestInput): MemoryPipelineResult {
  const archive = ingestConversation(input);
  const extraction = extractKnowledgeFromConversation(archive);
  const reviewItem = enqueueForFounderReview(extraction);
  return { archive, extraction, reviewItem };
}

export function ingestConversationWithExtraction(input: ConversationIngestInput): MemoryPipelineResult {
  return runMemoryPipeline({ ...input, autoExtract: true });
}

export function completeFounderReview(input: FounderReviewInput) {
  const { reviewItem, report, shouldPublish } = processFounderReview(input);
  const published = shouldPublish
    ? publishApprovedKnowledge(report, input.action)
    : [];

  return {
    reviewItem,
    report,
    published,
    memoryGraph: buildMemoryGraph(),
  };
}

export function getMemoryPipelineStatus() {
  const graph = buildMemoryGraph();

  return {
    layers: [
      'Conversation Archive™',
      'Knowledge Extraction™',
      'Founder Review™',
      'Knowledge Core™',
    ] as const,
    archiveCount: listConversationArchives().length,
    extractionCount: listExtractionReports().length,
    pendingReviewCount: getPendingReviewCount(),
    publishedCount: listPublishedEntries().length,
    graphNodeCount: graph.nodes.length,
    graphEdgeCount: graph.edges.length,
    nothingAutoCanon: true,
    archiveImmutable: true,
  };
}
