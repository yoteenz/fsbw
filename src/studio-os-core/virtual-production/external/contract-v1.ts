/**
 * Studio World External Integration Contract v1 — types + validation.
 * Generic boundary for external commercial systems (e.g. future SITE 00 consumer).
 */

export const EXTERNAL_CONTRACT_VERSION = 'v1';

export type ExternalCampaignStatus =
  | 'initialized'
  | 'direction_in_progress'
  | 'production_started'
  | 'review_ready'
  | 'revision_in_progress'
  | 'deliverable_ready'
  | 'complete'
  | 'blocked';

export type ExternalReviewAction = 'approve' | 'request_revision' | 'select_direction';

export type ProvisionCampaignRequestV1 = {
  externalSystem: string;
  externalProjectId?: string;
  externalClientId?: string;
  externalEngagementId: string;
  brandId?: string;
  brandSetupRequired?: boolean;
  engagementType?: string;
  serviceType?: string;
  campaignObjective?: string;
  deliverables?: unknown[];
  platforms?: string[];
  aspectRatios?: string[];
  quantity?: number;
  deadline?: string;
  approvedScope?: string;
  clientVisibleProjectId?: string;
};

export type ProvisionCampaignResponseV1 = {
  contractVersion: typeof EXTERNAL_CONTRACT_VERSION;
  studioWorldCampaignId: string;
  externalEngagementId: string;
  status: string;
  currentPhase: string;
  brandSetupRequired: boolean;
  createdAt: string;
  idempotentReplay: boolean;
};

export type ClientSafeCampaignStatusV1 = {
  contractVersion: typeof EXTERNAL_CONTRACT_VERSION;
  campaignId: string;
  status: ExternalCampaignStatus;
  currentPhase: string;
  progress: {
    shotsTotal: number;
    shotsApproved: number;
    shotsRepair: number;
    shotsNotReviewed: number;
  };
  latestMilestone?: string;
  clientInputRequired: boolean;
  reviewReady: boolean;
  deliverablesReady: boolean;
  updatedAt: string;
};

export type ClientSafeReviewV1 = {
  reviewId: string;
  campaignId: string;
  type: string;
  title: string;
  clientSafeDescription: string;
  previewAssets: Array<{ url: string; type: string }>;
  allowedActions: ExternalReviewAction[];
  status: string;
  createdAt: string;
};

export type ClientSafeDeliverableV1 = {
  deliverableId: string;
  campaignId: string;
  title: string;
  type: string;
  format: string;
  aspectRatio?: string;
  version?: string;
  preview?: string;
  deliveryAsset?: string;
  status: string;
};

export type ClientSafeActivityV1 = {
  activityType: string;
  message: string;
  createdAt: string;
};

export type ExternalApiErrorV1 = {
  contractVersion: typeof EXTERNAL_CONTRACT_VERSION;
  error: string;
  code: string;
};

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateProvisionRequest(body: unknown): ProvisionCampaignRequestV1 | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const externalSystem = str(o.externalSystem);
  const externalEngagementId = str(o.externalEngagementId);
  if (!externalSystem || !externalEngagementId) return null;
  return {
    externalSystem,
    externalEngagementId,
    externalProjectId: str(o.externalProjectId) || undefined,
    externalClientId: str(o.externalClientId) || undefined,
    brandId: str(o.brandId) || undefined,
    brandSetupRequired: o.brandSetupRequired === true,
    engagementType: str(o.engagementType) || undefined,
    serviceType: str(o.serviceType) || undefined,
    campaignObjective: str(o.campaignObjective) || undefined,
    deliverables: Array.isArray(o.deliverables) ? o.deliverables : undefined,
    platforms: Array.isArray(o.platforms) ? o.platforms.map(String) : undefined,
    aspectRatios: Array.isArray(o.aspectRatios) ? o.aspectRatios.map(String) : undefined,
    quantity: typeof o.quantity === 'number' ? o.quantity : undefined,
    deadline: str(o.deadline) || undefined,
    approvedScope: str(o.approvedScope) || undefined,
    clientVisibleProjectId: str(o.clientVisibleProjectId) || undefined,
  };
}

export function validateReviewSubmission(body: unknown): { reviewId: string; action: ExternalReviewAction; notes?: string } | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const reviewId = str(o.reviewId);
  const action = str(o.action) as ExternalReviewAction;
  if (!reviewId || !['approve', 'request_revision', 'select_direction'].includes(action)) return null;
  return { reviewId, action, notes: str(o.notes) || undefined };
}

export function mapLifecycleToExternalStatus(
  lifecycle: string,
  approval: string,
  reviewPending: boolean,
  deliverablesReady: boolean
): ExternalCampaignStatus {
  if (deliverablesReady) return 'deliverable_ready';
  if (reviewPending) return 'review_ready';
  if (lifecycle === 'delivered' || lifecycle === 'approved') return 'complete';
  if (lifecycle === 'production' || lifecycle === 'qc' || lifecycle === 'repair') return 'production_started';
  if (lifecycle === 'direction' || lifecycle === 'storyboard' || lifecycle === 'preproduction') return 'direction_in_progress';
  if (approval === 'repair_required') return 'revision_in_progress';
  return 'initialized';
}
