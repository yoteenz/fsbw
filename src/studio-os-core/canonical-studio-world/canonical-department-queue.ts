import type { CanonicalMainDepartmentId } from './canonical-department-registry';
import { getCanonicalDepartmentRecord } from './canonical-department-registry';
import {
  CANONICAL_QUEUE_CAPACITY,
  CANONICAL_QUEUE_PROGRAM,
  CANONICAL_RENDER_ORGANIZATION_ID,
} from './canonical-department-construction-plan';
import { planCanonicalBatchGeneration } from './canonical-department-generation';

export type CanonicalRenderKind = 'landscape' | 'portrait';

export type CanonicalQueueJobStatus =
  | 'queued'
  | 'generating'
  | 'ready'
  | 'approved'
  | 'failed'
  | 'stale';

export type CanonicalQueueEntry = {
  jobId: string;
  departmentId: CanonicalMainDepartmentId;
  departmentName: string;
  renderKind: CanonicalRenderKind;
  status: CanonicalQueueJobStatus;
  batchId: string | null;
  previewArtifactUrl: string | null;
  failureReason: string | null;
  blueprintRevision: number;
  landscapeJobId: string | null;
  modelRoute: string | null;
  providerModel: string | null;
  queuedAt: string;
  updatedAt: string;
};

export type CanonicalQueueSnapshot = {
  program: typeof CANONICAL_QUEUE_PROGRAM;
  organizationId: typeof CANONICAL_RENDER_ORGANIZATION_ID;
  capacity: number;
  activeCount: number;
  queuedCount: number;
  generatingCount: number;
  readyCount: number;
  failedCount: number;
  entries: CanonicalQueueEntry[];
};

export function isCanonicalQueueActiveStatus(status: CanonicalQueueJobStatus): boolean {
  return status === 'queued' || status === 'generating';
}

export function buildCanonicalBatchQueuePlan(input: {
  departmentIds: CanonicalMainDepartmentId[];
  confirmed: boolean;
}): ReturnType<typeof planCanonicalBatchGeneration> | { ok: false; code: string; message: string } {
  if (!input.confirmed) {
    return { ok: false, code: 'BATCH_NOT_CONFIRMED', message: 'Explicit confirmation required before queueing.' };
  }
  if (input.departmentIds.length === 0) {
    return { ok: false, code: 'EMPTY_BATCH', message: 'Select at least one canonical department.' };
  }
  for (const id of input.departmentIds) {
    if (!getCanonicalDepartmentRecord(id)) {
      return { ok: false, code: 'DEPARTMENT_UNKNOWN', message: `Unknown canonical department: ${id}` };
    }
  }
  const plan = planCanonicalBatchGeneration({ departmentIds: input.departmentIds, confirmed: true });
  if (plan.departmentCount > CANONICAL_QUEUE_CAPACITY * 3) {
    return {
      ok: false,
      code: 'BATCH_TOO_LARGE',
      message: `Batch exceeds safe queue size. Queue capacity is ${CANONICAL_QUEUE_CAPACITY} concurrent jobs.`,
    };
  }
  return plan;
}

export function summarizeCanonicalQueue(entries: CanonicalQueueEntry[]): Omit<CanonicalQueueSnapshot, 'entries' | 'program' | 'organizationId' | 'capacity'> {
  const activeCount = entries.filter((e) => isCanonicalQueueActiveStatus(e.status)).length;
  return {
    activeCount,
    queuedCount: entries.filter((e) => e.status === 'queued').length,
    generatingCount: entries.filter((e) => e.status === 'generating').length,
    readyCount: entries.filter((e) => e.status === 'ready' || e.status === 'approved').length,
    failedCount: entries.filter((e) => e.status === 'failed').length,
  };
}
