import type {
  MissingPageCompletionMode,
  PageAuthorshipRecord,
  PageReviewSetRecord,
  ReviewDimension,
} from '../types';
import { canBulkApproveReviewSet } from './authorship';

function reviewSetLabel(projectId: string, mode: MissingPageCompletionMode, familyUsed?: string): string {
  const projectLabel =
    projectId === 'frontal-slayer'
      ? 'FRONTAL SLAYER'
      : projectId === 'all-in-one-enterprise'
        ? 'ALL IN ONE ENTERPRISES'
        : projectId === 'studio-world'
          ? 'STUDIO WORLD'
          : projectId.toUpperCase();

  if (mode === 'FAMILY_DERIVED_SIMPLE' && familyUsed) {
    return `${projectLabel} · ${familyUsed} FAMILY`;
  }
  if (mode === 'FAMILY_DERIVED_SIMPLE') {
    return `${projectLabel} SIMPLE UTILITIES`;
  }
  return `${projectLabel} · ${mode.replace(/_/g, ' ')}`;
}

export function buildPageReviewSets(
  authorshipRecords: PageAuthorshipRecord[],
  receipts: Array<{ authorshipId: string; familyUsed?: string; completionMode: MissingPageCompletionMode; projectId: string }>,
): PageReviewSetRecord[] {
  const groups = new Map<string, PageReviewSetRecord>();

  for (const auth of authorshipRecords) {
    const receipt = receipts.find((r) => r.authorshipId === auth.authorshipId);
    const key = `${auth.projectId}:${auth.completionMode}:${receipt?.familyUsed ?? 'generic'}`;
    const existing = groups.get(key);
    if (existing) {
      existing.authorshipIds.push(auth.authorshipId);
      continue;
    }
    const reviewDimensions: ReviewDimension[] = ['VISUAL', 'CONTENT'];
    if (auth.functionalReviewRequired) reviewDimensions.push('FUNCTION');

    groups.set(key, {
      reviewSetId: `${auth.projectId}:review-set:${key}`,
      projectId: auth.projectId,
      displayName: reviewSetLabel(auth.projectId, auth.completionMode, receipt?.familyUsed),
      completionMode: auth.completionMode,
      authorshipIds: [auth.authorshipId],
      bulkApprovalAllowed: false,
      reviewDimensions,
    });
  }

  for (const set of groups.values()) {
    const members = authorshipRecords.filter((a) => set.authorshipIds.includes(a.authorshipId));
    set.bulkApprovalAllowed = canBulkApproveReviewSet(members);
  }

  return [...groups.values()];
}

export function isComplexReviewSetBlockedFromBulkApproval(set: PageReviewSetRecord): boolean {
  return !set.bulkApprovalAllowed;
}
