import type { CampaignDeliverable, DeliverableWorkflowStatus } from './types';

/** State Engine™ workflow — Draft → Review → Approved → Scheduled → Published → Learning */
export const DELIVERABLE_WORKFLOW_CHAIN: DeliverableWorkflowStatus[] = [
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'learning',
];

export type DeliverableStats = {
  total: number;
  complete: number;
  inReview: number;
  draft: number;
  scheduled: number;
  approved: number;
  published: number;
  learning: number;
};

const LEGACY_STATUS_MAP: Record<string, DeliverableWorkflowStatus> = {
  planned: 'draft',
  'in-production': 'draft',
  review: 'review',
  ready: 'approved',
  published: 'published',
};

export function normalizeDeliverableWorkflowStatus(
  del: Partial<CampaignDeliverable> & { status?: string }
): DeliverableWorkflowStatus {
  if (del.workflowStatus && DELIVERABLE_WORKFLOW_CHAIN.includes(del.workflowStatus)) {
    return del.workflowStatus;
  }
  if (del.status && LEGACY_STATUS_MAP[del.status]) {
    return LEGACY_STATUS_MAP[del.status];
  }
  return 'draft';
}

export function deriveApprovalStatus(
  workflowStatus: DeliverableWorkflowStatus,
  explicit?: CampaignDeliverable['approvalStatus']
): CampaignDeliverable['approvalStatus'] {
  if (explicit) return explicit;
  if (workflowStatus === 'review') return 'pending';
  if (workflowStatus === 'draft') return 'none';
  return 'approved';
}

export function derivePublishingStatus(
  workflowStatus: DeliverableWorkflowStatus
): CampaignDeliverable['publishingStatus'] {
  if (workflowStatus === 'scheduled') return 'scheduled';
  if (workflowStatus === 'published' || workflowStatus === 'learning') return 'published';
  return 'unpublished';
}

export function migrateCampaignDeliverable(
  del: Partial<CampaignDeliverable> & { status?: string }
): CampaignDeliverable {
  const workflowStatus = normalizeDeliverableWorkflowStatus(del);
  const now = del.updatedAt ?? del.dueAt ?? new Date().toISOString();

  return {
    id: del.id ?? `del-${Math.random().toString(36).slice(2, 9)}`,
    campaignId: del.campaignId ?? '',
    type: del.type ?? 'graphic',
    format: del.format,
    title: del.title ?? 'Untitled deliverable',
    workflowStatus,
    approvalStatus: del.approvalStatus ?? deriveApprovalStatus(workflowStatus),
    publishingStatus: del.publishingStatus ?? derivePublishingStatus(workflowStatus),
    owner: del.owner ?? 'Unassigned',
    platform: del.platform ?? 'internal',
    newsroomPageId: del.newsroomPageId,
    dueAt: del.dueAt ?? now,
    updatedAt: now,
    scheduledAt: del.scheduledAt,
    publishedAt: del.publishedAt,
    bodyPreview: del.bodyPreview,
    caption: del.caption,
    thumbnailPreview: del.thumbnailPreview,
    researchSources: del.researchSources ?? [],
    aiSuggestions: del.aiSuggestions ?? [],
    factCheckStatus: del.factCheckStatus ?? 'pending',
    approvalTimeline: del.approvalTimeline ?? [],
    comments: del.comments ?? [],
    versionHistory: del.versionHistory ?? [{ version: 1, at: now, summary: 'Initial draft' }],
    knowledgeAssetId: del.knowledgeAssetId,
    learningMetrics: del.learningMetrics,
  };
}

export function computeDeliverableStats(deliverables: CampaignDeliverable[]): DeliverableStats {
  const stats: DeliverableStats = {
    total: deliverables.length,
    complete: 0,
    inReview: 0,
    draft: 0,
    scheduled: 0,
    approved: 0,
    published: 0,
    learning: 0,
  };

  for (const del of deliverables) {
    switch (del.workflowStatus) {
      case 'draft':
        stats.draft += 1;
        break;
      case 'review':
        stats.inReview += 1;
        break;
      case 'approved':
        stats.approved += 1;
        stats.complete += 1;
        break;
      case 'scheduled':
        stats.scheduled += 1;
        stats.complete += 1;
        break;
      case 'published':
        stats.published += 1;
        stats.complete += 1;
        break;
      case 'learning':
        stats.learning += 1;
        stats.complete += 1;
        break;
      default:
        break;
    }
  }

  return stats;
}

export function workflowStatusLabel(status: DeliverableWorkflowStatus): string {
  const labels: Record<DeliverableWorkflowStatus, string> = {
    draft: 'DRAFT',
    review: 'IN REVIEW',
    approved: 'APPROVED',
    scheduled: 'SCHEDULED',
    published: 'PUBLISHED',
    learning: 'LEARNING',
  };
  return labels[status];
}

export function nextWorkflowStatus(
  current: DeliverableWorkflowStatus,
  action: 'submit-review' | 'approve' | 'request-revision' | 'reject' | 'schedule' | 'publish' | 'learn'
): DeliverableWorkflowStatus {
  switch (action) {
    case 'submit-review':
      return 'review';
    case 'approve':
      return 'approved';
    case 'request-revision':
      return 'draft';
    case 'reject':
      return 'draft';
    case 'schedule':
      return 'scheduled';
    case 'publish':
      return 'published';
    case 'learn':
      return 'learning';
    default:
      return current;
  }
}

export function canPublishDeliverable(
  del: CampaignDeliverable,
  autoPublishEnabled: boolean
): boolean {
  if (autoPublishEnabled) return del.workflowStatus !== 'published' && del.workflowStatus !== 'learning';
  return del.workflowStatus === 'approved' || del.workflowStatus === 'scheduled';
}
