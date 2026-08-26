import type {
  ComposerDraftSnapshotRecord,
  FsbwComposerPageRegistry,
  PageAuthorshipRecord,
  PageReviewSetRecord,
} from '../types';

export type ComposerCreatedPageReviewCard = {
  authorship: PageAuthorshipRecord;
  snapshots: ComposerDraftSnapshotRecord[];
  reviewSet?: PageReviewSetRecord;
  familyUsed?: string;
};

/** Review queue for SITE 00 Design — COMPOSER-CREATED PAGES */
export function buildComposerCreatedPagesReviewQueue(
  registry: FsbwComposerPageRegistry,
): ComposerCreatedPageReviewCard[] {
  return registry.authorship.map((authorship) => {
    const snapshots = registry.snapshots.filter((s) => s.authorshipId === authorship.authorshipId);
    const reviewSet = registry.reviewSets.find((rs) => rs.authorshipIds.includes(authorship.authorshipId));
    const receipt = registry.receipts.find(
      (r) => `${r.projectId}:auth:${r.experiencePageId}` === authorship.authorshipId,
    );
    return {
      authorship,
      snapshots,
      reviewSet,
      familyUsed: receipt?.familyUsed,
    };
  });
}

export function filterComposerReviewQueueByProject(
  queue: ComposerCreatedPageReviewCard[],
  projectId: string,
): ComposerCreatedPageReviewCard[] {
  return queue.filter((c) => c.authorship.projectId === projectId);
}

export function countReadyForApproval(queue: ComposerCreatedPageReviewCard[]): number {
  return queue.filter(
    (c) =>
      c.authorship.reviewStatus === 'UNREVIEWED' &&
      c.authorship.completionMode === 'FAMILY_DERIVED_SIMPLE' &&
      !c.authorship.creativeDirectionRequired,
  ).length;
}

export function countNeedsCreativeDirection(queue: ComposerCreatedPageReviewCard[]): number {
  return queue.filter((c) => c.authorship.creativeDirectionRequired).length;
}

export function countNeedsFunctionalReview(queue: ComposerCreatedPageReviewCard[]): number {
  return queue.filter((c) => c.authorship.functionalReviewRequired).length;
}
