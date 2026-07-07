import type { NdxbookPage } from './types';
import {
  type ProductionDepartmentId,
  type ProductionDepartmentStatus,
  PRODUCTION_DEPARTMENTS,
  productionDepartmentIndex,
} from '../content-pipeline/departments';
import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';

const STORAGE_KEY = 'studioOsNdxbook_deptProgress_v1';

type DeptProgressStore = {
  /** Highest department the user has ceremonially completed via Continue. */
  acknowledgedThrough: ProductionDepartmentId | null;
  /** Pilot: upstream departments treated as complete before first visit. */
  pilotUpstreamComplete: boolean;
};

const DEFAULT: DeptProgressStore = {
  acknowledgedThrough: 'assembly',
  pilotUpstreamComplete: true,
};

function readProgress(): DeptProgressStore {
  return readStudioOsJson(STORAGE_KEY, () => DEFAULT);
}

function writeProgress(patch: Partial<DeptProgressStore>): DeptProgressStore {
  const next = { ...readProgress(), ...patch };
  writeStudioOsJson(STORAGE_KEY, next);
  return next;
}

/** Mark department complete and advance acknowledgment through it. */
export function acknowledgeProductionDepartment(deptId: ProductionDepartmentId): void {
  writeProgress({ acknowledgedThrough: deptId });
}

/** Furthest department unlocked by asset state (independent of URL). */
export function resolveMaxUnlockedDepartment(page: NdxbookPage | null): ProductionDepartmentId {
  if (!page) return 'production';

  if (page.status === 'published') return 'learning';
  if (page.status === 'scheduled') return 'intelligence';
  if (page.pipeline?.approvedAt) return 'publishing';
  if (page.status === 'review') return 'review';
  if (page.status === 'draft') return 'review';

  return 'production';
}

function maxIndexFromAcknowledgment(page: NdxbookPage | null): number {
  const progress = readProgress();
  const fromPage = productionDepartmentIndex(resolveMaxUnlockedDepartment(page));
  const fromAck = progress.acknowledgedThrough
    ? productionDepartmentIndex(progress.acknowledgedThrough)
    : progress.pilotUpstreamComplete
      ? productionDepartmentIndex('assembly')
      : -1;
  return Math.max(fromPage, fromAck);
}

export function resolveRecommendedDepartment(page: NdxbookPage | null): ProductionDepartmentId {
  const maxIdx = maxIndexFromAcknowledgment(page);
  const maxDept = PRODUCTION_DEPARTMENTS[Math.min(maxIdx, PRODUCTION_DEPARTMENTS.length - 1)]!;
  return maxDept.id;
}

export function resolveDepartmentStatuses(
  page: NdxbookPage | null,
  currentId: ProductionDepartmentId
): Record<ProductionDepartmentId, ProductionDepartmentStatus> {
  const maxIdx = maxIndexFromAcknowledgment(page);
  const result = {} as Record<ProductionDepartmentId, ProductionDepartmentStatus>;

  for (const dept of PRODUCTION_DEPARTMENTS) {
    const idx = productionDepartmentIndex(dept.id);
    if (dept.id === currentId) {
      result[dept.id] = 'current';
    } else if (idx < maxIdx) {
      result[dept.id] = 'complete';
    } else if (idx === maxIdx) {
      result[dept.id] = 'available';
    } else {
      result[dept.id] = 'locked';
    }
  }

  return result;
}

export function isDepartmentAccessible(page: NdxbookPage | null, deptId: ProductionDepartmentId): boolean {
  const maxIdx = maxIndexFromAcknowledgment(page);
  return productionDepartmentIndex(deptId) <= maxIdx;
}

export function canContinueFromDepartment(
  page: NdxbookPage | null,
  deptId: ProductionDepartmentId
): { ok: boolean; reason?: string } {
  switch (deptId) {
    case 'discover':
    case 'development':
    case 'assembly':
      return { ok: true };
    case 'production':
      return page
        ? { ok: true }
        : { ok: false, reason: 'Create the Master Content Asset before continuing to Review.' };
    case 'review':
      if (!page) return { ok: false, reason: 'Create the master asset in Production first.' };
      if (!page.pipeline?.studioReview?.overallPass)
        return { ok: false, reason: 'Run Studio Intelligence and achieve PASS before continuing.' };
      if (!page.pipeline?.approvedAt)
        return { ok: false, reason: 'Approve production before continuing to Expansion.' };
      return { ok: true };
    case 'expansion':
      return page?.pipeline?.approvedAt
        ? { ok: true }
        : { ok: false, reason: 'Complete Review and approve production first.' };
    case 'approval':
      return page?.pipeline?.approvedAt
        ? { ok: true }
        : { ok: false, reason: 'Quality approval required before Authorization.' };
    case 'publishing':
      return page?.pipeline?.approvedAt
        ? { ok: true }
        : { ok: false, reason: 'Publishing Authorization required.' };
    case 'intelligence':
      return page?.status === 'scheduled' || page?.status === 'published'
        ? { ok: true }
        : { ok: false, reason: 'Publish or schedule before measuring performance.' };
    case 'learning':
      return page?.status === 'published'
        ? { ok: true }
        : { ok: false, reason: 'Publish Project 001 outputs before archiving learnings.' };
    default:
      return { ok: false, reason: 'Unknown department.' };
  }
}
