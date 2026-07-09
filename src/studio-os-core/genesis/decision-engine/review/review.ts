import { mutateDecisionEngineStore, readDecisionEngineStore } from '../persistence';
import type { ReviewStatus, ReviewThreshold } from '../constants';
import type { StudioDecision } from '../types';

/** Decision review workflow */
export function requestDecisionReview(input: {
  decisionId: string;
  threshold?: ReviewThreshold;
  reviewerObjectIds?: string[];
}): StudioDecision | undefined {
  return updateDecisionReview(input.decisionId, {
    reviewStatus: 'pending',
    reviewThreshold: input.threshold ?? 'human-review',
    reviewerObjectIds: input.reviewerObjectIds ?? [],
  });
}

export function beginDecisionReview(decisionId: string): StudioDecision | undefined {
  return updateDecisionReview(decisionId, { reviewStatus: 'in_review' });
}

export function completeDecisionReview(
  decisionId: string,
  approved: boolean
): StudioDecision | undefined {
  return updateDecisionReview(decisionId, {
    reviewStatus: approved ? 'approved' : 'rejected',
    status: approved ? 'approved' : 'rejected',
  });
}

export function returnDecisionForRevision(decisionId: string): StudioDecision | undefined {
  return updateDecisionReview(decisionId, { reviewStatus: 'returned' });
}

function updateDecisionReview(
  decisionId: string,
  patch: Partial<
    Pick<StudioDecision, 'reviewStatus' | 'reviewThreshold' | 'reviewerObjectIds' | 'status'>
  >
): StudioDecision | undefined {
  let updated: StudioDecision | undefined;

  mutateDecisionEngineStore((store) => {
    const idx = store.decisions.findIndex((d) => d.decisionId === decisionId);
    if (idx < 0) return store;

    updated = {
      ...store.decisions[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const decisions = [...store.decisions];
    decisions[idx] = updated;
    return { ...store, decisions };
  });

  return updated;
}

export function listDecisionsPendingReview(): StudioDecision[] {
  return readDecisionEngineStore().decisions.filter(
    (d) => d.reviewStatus === 'pending' || d.reviewStatus === 'in_review'
  );
}

export function listDecisionsByReviewStatus(status: ReviewStatus): StudioDecision[] {
  return readDecisionEngineStore().decisions.filter((d) => d.reviewStatus === status);
}
