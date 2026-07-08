import { getMemoryPipelineStatus } from './pipeline';
import { getPendingReviewCount } from './founder-review';

export function resolveMemorySystemOrbLine(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const status = getMemoryPipelineStatus();

  if (/memory system|conversation archive|four layer|four-layer/i.test(q)) {
    return `Memory System™ preserves ${status.archiveCount} conversations, ${status.extractionCount} extractions, and ${status.publishedCount} founder-approved entries. Archives are immutable.`;
  }

  if (/approval queue|founder review|awaiting review|pending review/i.test(q)) {
    const pending = getPendingReviewCount();
    return pending
      ? `${pending} Knowledge Extraction Reports™ await founder review. Nothing enters Knowledge Core until approved.`
      : 'No extraction reports currently await founder review.';
  }

  if (/canon|automatic/i.test(q)) {
    return 'Nothing enters Canon automatically. Extracted knowledge requires founder Approve, Modify, Reject, Merge, or Delay.';
  }

  if (/how did studio world learn|conversation reference|memory graph/i.test(q)) {
    return `Memory Graph™ connects ${status.graphNodeCount} nodes across conversation → extraction → review → Knowledge Core lineage.`;
  }

  return null;
}
