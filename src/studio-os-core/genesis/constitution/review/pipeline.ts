import { mutateConstitutionStore, readConstitutionStore } from '../persistence';
import type { ConstitutionAmendmentStage, ConstitutionReviewSession } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createSessionId(): string {
  return `con-rev-${Date.now().toString(36)}`;
}

export function listConstitutionReviewSessions(): ConstitutionReviewSession[] {
  return readConstitutionStore().reviews;
}

export function listPendingConstitutionReviews(): ConstitutionReviewSession[] {
  return readConstitutionStore().reviews.filter(
    (r) => r.status === 'pending' || r.status === 'in-progress'
  );
}

export function beginConstitutionReview(input: {
  articleId?: string;
  amendmentId?: string;
  stage: ConstitutionAmendmentStage;
  reviewer?: string;
}): ConstitutionReviewSession {
  const session: ConstitutionReviewSession = {
    sessionId: createSessionId(),
    articleId: input.articleId,
    amendmentId: input.amendmentId,
    stage: input.stage,
    status: input.reviewer ? 'in-progress' : 'pending',
    reviewer: input.reviewer,
    notes: [],
    createdAt: now(),
    updatedAt: now(),
  };

  mutateConstitutionStore((store) => ({
    ...store,
    reviews: [...store.reviews, session],
  }));

  return session;
}

export function completeConstitutionReview(
  sessionId: string,
  decision: 'passed' | 'failed' | 'returned',
  reviewer: string,
  note?: string
): ConstitutionReviewSession | undefined {
  let updated: ConstitutionReviewSession | undefined;

  mutateConstitutionStore((store) => {
    const idx = store.reviews.findIndex((r) => r.sessionId === sessionId);
    if (idx < 0) return store;

    updated = {
      ...store.reviews[idx],
      status: decision,
      reviewer,
      notes: note ? [...store.reviews[idx].notes, note] : store.reviews[idx].notes,
      updatedAt: now(),
    };

    const reviews = [...store.reviews];
    reviews[idx] = updated;
    return { ...store, reviews };
  });

  return updated;
}

export function promoteConstitutionArticleToCanonical(
  articleId: string,
  approver: string,
  notes: string
): boolean {
  let found = false;

  mutateConstitutionStore((store) => {
    const idx = store.articles.findIndex((a) => a.articleId === articleId);
    if (idx < 0) return store;

    found = true;
    const articles = [...store.articles];
    articles[idx] = {
      ...articles[idx],
      status: 'canonical',
      canonicalStatus: 'canonical',
      updatedAt: now(),
      approvalHistory: [
        ...articles[idx].approvalHistory,
        {
          approvalId: `con-canonical-${articleId}-${Date.now().toString(36)}`,
          decision: 'approve',
          stage: 'initial-canonical',
          approver,
          notes,
          createdAt: now(),
        },
      ],
    };

    return { ...store, articles };
  });

  return found;
}
