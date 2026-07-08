import { listPendingSubmissions, listKnowledgeSubmissions } from '../review/pipeline';
import type { KnowledgeSubmission } from '../types';

export type ResearchQueueItem = KnowledgeSubmission & {
  queuePriority: 'high' | 'normal' | 'low';
};

export function getResearchQueue(): ResearchQueueItem[] {
  return listKnowledgeSubmissions()
    .filter((s) => s.targetDivisionId === 'research-bureau')
    .map((s) => ({
      ...s,
      queuePriority: s.source === 'research-engine' ? 'high' : 'normal',
    }));
}

export function getResearchQueueStats() {
  const queue = getResearchQueue();
  return {
    total: queue.length,
    pending: queue.filter((s) => s.status === 'pending').length,
    inReview: queue.filter((s) => s.status === 'in-review').length,
    promoted: queue.filter((s) => s.status === 'promoted').length,
  };
}

export function listProfessionResearchProposals(): KnowledgeSubmission[] {
  return listPendingSubmissions().filter((s) => s.source === 'profession-brain');
}
