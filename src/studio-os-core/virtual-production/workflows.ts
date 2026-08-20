/**
 * Virtual Production OS — state transitions and workflow logic.
 */

import type {
  CampaignLifecycleStatus,
  ProductionApprovalState,
  QcCategory,
  QcStatus,
  VirtualProductionMode,
} from './types';

const CAMPAIGN_LIFECYCLE_ORDER: CampaignLifecycleStatus[] = [
  'idea',
  'brief',
  'direction',
  'storyboard',
  'preproduction',
  'production',
  'qc',
  'repair',
  'assembly',
  'client_review',
  'approved',
  'delivered',
  'archived',
];

const APPROVAL_TRANSITIONS: Record<ProductionApprovalState, ProductionApprovalState[]> = {
  draft: ['generating', 'ready_for_review', 'archived'],
  generating: ['ready_for_review', 'repair_required', 'rejected', 'draft'],
  ready_for_review: ['approved', 'rejected', 'repair_required'],
  approved: ['superseded', 'archived'],
  rejected: ['draft', 'repair_required', 'archived'],
  repair_required: ['generating', 'draft'],
  superseded: ['archived'],
  archived: [],
};

export function canTransitionApproval(
  from: ProductionApprovalState,
  to: ProductionApprovalState
): boolean {
  return APPROVAL_TRANSITIONS[from]?.includes(to) ?? false;
}

export function advanceCampaignLifecycle(
  current: CampaignLifecycleStatus,
  target: CampaignLifecycleStatus
): boolean {
  const curIdx = CAMPAIGN_LIFECYCLE_ORDER.indexOf(current);
  const tgtIdx = CAMPAIGN_LIFECYCLE_ORDER.indexOf(target);
  if (curIdx < 0 || tgtIdx < 0) return false;
  return tgtIdx >= curIdx;
}

export function defaultProductionModeForCampaign(
  objective?: string
): VirtualProductionMode {
  if (!objective) return 'precision';
  const lower = objective.toLowerCase();
  if (lower.includes('social') || lower.includes('reel') || lower.includes('volume')) {
    return 'director';
  }
  if (lower.includes('hero') || lower.includes('product')) return 'precision';
  return 'hybrid';
}

export function canChangeProductionMode(
  currentMode: VirtualProductionMode,
  lifecycleStatus: CampaignLifecycleStatus
): boolean {
  if (lifecycleStatus === 'delivered' || lifecycleStatus === 'archived') return false;
  if (lifecycleStatus === 'production' && currentMode === 'director') return false;
  return true;
}

export const QC_CATEGORIES: QcCategory[] = [
  'identity',
  'product',
  'environment',
  'wardrobe',
  'prop',
  'anatomy',
  'motion',
  'camera',
  'lighting',
  'continuity',
  'text_logo',
  'audio',
  'brand',
  'overall',
];

export function computeOverallQcStatus(
  categoryResults: Partial<Record<QcCategory, { status: QcStatus }>>
): QcStatus {
  const statuses = QC_CATEGORIES.map((c) => categoryResults[c]?.status).filter(Boolean) as QcStatus[];
  if (statuses.length === 0) return 'not_reviewed';
  if (statuses.some((s) => s === 'fail')) return 'fail';
  if (statuses.some((s) => s === 'warning')) return 'warning';
  if (statuses.every((s) => s === 'pass')) return 'pass';
  return 'not_reviewed';
}

export function sortShotsByOrder<T extends { sortOrder: number; shotKey: string }>(shots: T[]): T[] {
  return [...shots].sort((a, b) => a.sortOrder - b.sortOrder || a.shotKey.localeCompare(b.shotKey));
}

export function nextShotSortOrder(shots: Array<{ sortOrder: number }>): number {
  if (shots.length === 0) return 1;
  return Math.max(...shots.map((s) => s.sortOrder)) + 1;
}
