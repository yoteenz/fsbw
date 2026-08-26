import type { CurationReviewQueueItem, ProjectExperienceCurationBundle } from '../types';

export function buildCurationReviewQueueForProject(
  bundle?: ProjectExperienceCurationBundle,
): CurationReviewQueueItem[] {
  return bundle?.reviewQueue ?? [];
}

export function filterReviewByConfidence(
  queue: CurationReviewQueueItem[],
  categories: CurationReviewQueueItem['category'][],
): CurationReviewQueueItem[] {
  return queue.filter((q) => categories.includes(q.category));
}
