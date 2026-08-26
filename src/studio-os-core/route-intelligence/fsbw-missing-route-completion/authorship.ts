import { FSBW_MISSING_ROUTE_COMPLETION_SPRINT } from '../constants';
import type {
  MissingPageCompletionMode,
  PageAuthorshipRecord,
  PageReviewStatus,
  ReviewDimension,
} from '../types';

const DEFAULT_REVIEW: Record<ReviewDimension, PageReviewStatus> = {
  VISUAL: 'UNREVIEWED',
  CONTENT: 'UNREVIEWED',
  FUNCTION: 'UNREVIEWED',
};

export function createPageAuthorshipRecord(input: {
  projectId: string;
  experiencePageId: string;
  route: string;
  displayName: string;
  completionMode: MissingPageCompletionMode;
  sourceCommit: string;
  creativeDirectionRequired: boolean;
  functionalReviewRequired: boolean;
}): PageAuthorshipRecord {
  return {
    authorshipId: `${input.projectId}:auth:${input.experiencePageId}`,
    projectId: input.projectId,
    experiencePageId: input.experiencePageId,
    route: input.route,
    displayName: input.displayName,
    authorType: 'COMPOSER',
    createdBySprint: FSBW_MISSING_ROUTE_COMPLETION_SPRINT,
    reviewStatus: 'UNREVIEWED',
    publishStatus: 'PREVIEW_ONLY',
    completionMode: input.completionMode,
    createdAt: new Date().toISOString(),
    sourceCommit: input.sourceCommit,
    reviewDimensions: { ...DEFAULT_REVIEW },
    creativeDirectionRequired: input.creativeDirectionRequired,
    functionalReviewRequired: input.functionalReviewRequired,
  };
}

export function canBulkApproveReviewSet(
  authorshipRecords: PageAuthorshipRecord[],
): boolean {
  return authorshipRecords.every(
    (a) =>
      a.completionMode === 'FAMILY_DERIVED_SIMPLE' &&
      !a.creativeDirectionRequired &&
      !a.functionalReviewRequired,
  );
}

export function approveAuthorshipForRelease(
  authorship: PageAuthorshipRecord,
): PageAuthorshipRecord {
  return {
    ...authorship,
    reviewStatus: 'APPROVED_FOR_RELEASE',
    reviewDimensions: {
      VISUAL: 'APPROVED_FOR_RELEASE',
      CONTENT: 'APPROVED_FOR_RELEASE',
      FUNCTION: 'APPROVED_FOR_RELEASE',
    },
    publishStatus: 'PREVIEW_ONLY',
  };
}
