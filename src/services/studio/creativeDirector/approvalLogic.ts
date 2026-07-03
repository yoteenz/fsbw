import type { CreativeDirectorSession } from './types';

export type EditorReviewAction = 'approve' | 'reject' | 'revision' | 'regenerate' | 'duplicate' | 'archive';

export function applyEditorReviewAction(
  session: CreativeDirectorSession,
  action: EditorReviewAction
): CreativeDirectorSession {
  switch (action) {
    case 'approve':
      return {
        ...session,
        approvalStatus: 'approved',
        publishingStatus: 'APPROVED — READY TO SCHEDULE',
        timelineStep: 'scheduling',
      };
    case 'reject':
      return {
        ...session,
        approvalStatus: 'rejected',
        publishingStatus: 'REJECTED — RETURN TO DRAFT',
        timelineStep: 'review',
      };
    case 'revision':
      return {
        ...session,
        approvalStatus: 'needs-review',
        publishingStatus: 'NEEDS REVISION',
        timelineStep: 'review',
      };
    case 'regenerate':
      return {
        ...session,
        approvalStatus: 'draft',
        publishingStatus: 'DRAFT — SECTION REGEN REQUESTED',
        timelineStep: 'generation',
      };
    case 'duplicate':
      return {
        ...session,
        approvalStatus: 'draft',
        publishingStatus: 'DRAFT — DUPLICATED PACK',
        timelineStep: 'planning',
      };
    case 'archive':
      return {
        ...session,
        publishingStatus: 'ARCHIVED',
        timelineStep: 'analytics',
      };
    default:
      return session;
  }
}

/** Never auto-publish — approval required before scheduling. */
export function canProceedToPublishing(session: CreativeDirectorSession): boolean {
  return session.approvalStatus === 'approved' || session.approvalStatus === 'scheduled';
}

export function blockAutoPublish(): { allowed: false; reason: string } {
  return {
    allowed: false,
    reason: 'AUTOMATIC PUBLISHING DISABLED — CREATIVE DIRECTOR APPROVAL REQUIRED.',
  };
}
