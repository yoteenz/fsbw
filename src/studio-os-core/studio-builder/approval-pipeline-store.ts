import { readStudioOsJson, readStudioOsStorageValue, removeStudioOsStorageValue, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import { requireDepartmentPackage } from '../department-package';
import {
  CREATIVE_APPROVAL_PIPELINE_STAGES,
  getNextPipelineStage,
  type PipelineStageId,
} from './pipeline-definition';
import type {
  CreativeApprovalPipeline,
  PipelineBranch,
  PipelineHistoryEntry,
  PipelineStageRecord,
  PipelineStageStatus,
  RegenerationImpact,
} from './types';

const STORAGE_KEY = 'studioOsCreativeApprovalPipeline_v1';
const LEGACY_KEY = 'studioOsGenerationQueue_v1';

type PipelineStore = { pipelines: CreativeApprovalPipeline[] };

const EMPTY_STORE: PipelineStore = { pipelines: [] };

function readStore(): PipelineStore {
  const raw = readStudioOsStorageValue(STORAGE_KEY);
  if (!raw) return { ...EMPTY_STORE };

  try {
    const parsed: unknown = JSON.parse(raw);
    // Legacy writes persisted a raw JSON array — readStudioOsJson cannot load arrays.
    if (Array.isArray(parsed)) {
      return { pipelines: parsed as CreativeApprovalPipeline[] };
    }
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as PipelineStore).pipelines)) {
      return { ...EMPTY_STORE, ...(parsed as PipelineStore) };
    }
  } catch {
    removeStudioOsStorageValue(STORAGE_KEY);
  }

  return { ...EMPTY_STORE };
}

function writeStore(store: PipelineStore): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

function readAll(): CreativeApprovalPipeline[] {
  return readStore().pipelines;
}

function writeAll(pipelines: CreativeApprovalPipeline[]): void {
  writeStore({ pipelines });
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function branchLabel(index: number): string {
  return `Version ${String.fromCharCode(65 + index)}`;
}

function createStageRecords(departmentId: string): PipelineStageRecord[] {
  const pkg = requireDepartmentPackage(departmentId);
  const now = new Date().toISOString();

  return CREATIVE_APPROVAL_PIPELINE_STAGES.map((def) => {
    const group = pkg.productionGroups.groups[def.productionGroupId];
    const branchId = uid('branch');
    return {
      stageId: def.id,
      productionGroupId: def.productionGroupId,
      displayName: def.displayName,
      order: def.order,
      status: 'locked' as PipelineStageStatus,
      heroAssetId: group?.heroAssetId ?? 'env-shell-cds',
      activeBranchId: branchId,
      branches: [{ id: branchId, label: 'Version A', createdAt: now }],
      pendingReview: false,
      updatedAt: now,
    };
  });
}

function appendHistory(
  pipeline: CreativeApprovalPipeline,
  entry: Omit<PipelineHistoryEntry, 'id' | 'at'>
): void {
  pipeline.history.unshift({
    id: uid('hist'),
    at: new Date().toISOString(),
    ...entry,
  });
  pipeline.history = pipeline.history.slice(0, 40);
}

export function getCreativeApprovalPipeline(
  departmentId: string,
  projectId: string
): CreativeApprovalPipeline {
  const existing = readAll().find((p) => p.departmentId === departmentId && p.projectId === projectId);
  if (existing) {
    const migrated = existing.stages.some((s) => (s.status as string) === 'review');
    if (migrated) {
      existing.stages = existing.stages.map((s) =>
        (s.status as string) === 'review'
          ? { ...s, status: 'founder-review' as PipelineStageStatus, reviewMode: true }
          : s
      );
      savePipeline(existing);
    }
    return existing;
  }

  const pkg = requireDepartmentPackage(departmentId);
  const now = new Date().toISOString();
  const pipeline: CreativeApprovalPipeline = {
    departmentId,
    packageId: pkg.packageId,
    projectId,
    stages: createStageRecords(departmentId),
    history: [],
    createdAt: now,
    updatedAt: now,
  };
  writeAll([pipeline, ...readAll()]);
  return pipeline;
}

function savePipeline(pipeline: CreativeApprovalPipeline): CreativeApprovalPipeline {
  pipeline.updatedAt = new Date().toISOString();
  const all = readAll();
  const next = all.some((p) => p.departmentId === pipeline.departmentId && p.projectId === pipeline.projectId)
    ? all.map((p) =>
        p.departmentId === pipeline.departmentId && p.projectId === pipeline.projectId ? pipeline : p
      )
    : [pipeline, ...all];
  writeAll(next);
  return pipeline;
}

export function listPipelineStages(departmentId: string, projectId: string): PipelineStageRecord[] {
  return getCreativeApprovalPipeline(departmentId, projectId).stages;
}

export function getPipelineStageRecord(
  departmentId: string,
  projectId: string,
  stageId: PipelineStageId
): PipelineStageRecord | null {
  return listPipelineStages(departmentId, projectId).find((s) => s.stageId === stageId) ?? null;
}

export function updatePipelineStage(
  departmentId: string,
  projectId: string,
  stageId: PipelineStageId,
  patch: Partial<PipelineStageRecord>,
  history?: Omit<PipelineHistoryEntry, 'id' | 'at'>
): PipelineStageRecord | null {
  const pipeline = getCreativeApprovalPipeline(departmentId, projectId);
  const idx = pipeline.stages.findIndex((s) => s.stageId === stageId);
  if (idx < 0) return null;

  const stage = {
    ...pipeline.stages[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  pipeline.stages[idx] = stage;
  if (history) appendHistory(pipeline, history);
  savePipeline(pipeline);
  return stage;
}

export function getActiveBranch(stage: PipelineStageRecord): PipelineBranch {
  return stage.branches.find((b) => b.id === stage.activeBranchId) ?? stage.branches[0];
}

export function cachePreparedPrompt(
  departmentId: string,
  projectId: string,
  stageId: PipelineStageId,
  preparedPrompt: string
): void {
  updatePipelineStage(departmentId, projectId, stageId, {
    preparedPrompt,
    preparedAt: new Date().toISOString(),
  });
}

export function unlockNextStage(
  departmentId: string,
  projectId: string,
  approvedStageId: PipelineStageId
): PipelineStageRecord | null {
  const next = getNextPipelineStage(approvedStageId);
  if (!next) return null;
  return updatePipelineStage(
    departmentId,
    projectId,
    next.id,
    { status: 'ready' },
    { stageId: next.id, action: 'unlock', detail: `Unlocked after ${approvedStageId} approval` }
  );
}

export function unlockProductionPipelineAfterConceptApproval(
  departmentId: string,
  projectId: string
): PipelineStageRecord | null {
  const first = CREATIVE_APPROVAL_PIPELINE_STAGES[0];
  if (!first) return null;
  return updatePipelineStage(
    departmentId,
    projectId,
    first.id,
    { status: 'ready' },
    { stageId: first.id, action: 'unlock', detail: 'Concept Approval™ — production pipeline unlocked' }
  );
}

export function invalidateDownstreamStages(
  departmentId: string,
  projectId: string,
  fromStageId: PipelineStageId
): PipelineStageId[] {
  const pipeline = getCreativeApprovalPipeline(departmentId, projectId);
  const fromOrder = pipeline.stages.find((s) => s.stageId === fromStageId)?.order ?? 0;
  const invalidated: PipelineStageId[] = [];

  pipeline.stages = pipeline.stages.map((stage) => {
    if (stage.order <= fromOrder) return stage;
    invalidated.push(stage.stageId);
    return {
      ...stage,
      status: 'locked' as PipelineStageStatus,
      approvedAt: undefined,
      pendingReview: false,
      updatedAt: new Date().toISOString(),
    };
  });

  if (invalidated.length > 0) {
    appendHistory(pipeline, {
      stageId: fromStageId,
      action: 'invalidate',
      detail: `Invalidated downstream: ${invalidated.join(', ')}`,
    });
    savePipeline(pipeline);
  }

  return invalidated;
}

export function getRegenerationImpact(
  departmentId: string,
  projectId: string,
  stageId: PipelineStageId
): RegenerationImpact | null {
  const pipeline = getCreativeApprovalPipeline(departmentId, projectId);
  const def = CREATIVE_APPROVAL_PIPELINE_STAGES.find((s) => s.id === stageId);
  const stage = pipeline.stages.find((s) => s.stageId === stageId);
  if (!def || !stage) return null;

  const affectedStages = pipeline.stages
    .filter((s) => s.order > stage.order && s.status === 'approved')
    .map((s) => ({ stageId: s.stageId, displayName: s.displayName }));

  if (affectedStages.length === 0) return null;

  return {
    stageId,
    displayName: stage.displayName,
    downstreamImpact: def.downstreamImpact,
    affectedStages,
  };
}

export function addPipelineBranch(
  departmentId: string,
  projectId: string,
  stageId: PipelineStageId
): PipelineBranch | null {
  const stage = getPipelineStageRecord(departmentId, projectId, stageId);
  if (!stage) return null;

  const branch: PipelineBranch = {
    id: uid('branch'),
    label: branchLabel(stage.branches.length),
    createdAt: new Date().toISOString(),
  };

  updatePipelineStage(
    departmentId,
    projectId,
    stageId,
    {
      branches: [...stage.branches, branch],
      activeBranchId: branch.id,
      status: stage.status === 'approved' ? 'ready' : stage.status,
    },
    { stageId, action: 'branch', detail: `Created ${branch.label}` }
  );

  return branch;
}

export function selectPipelineBranch(
  departmentId: string,
  projectId: string,
  stageId: PipelineStageId,
  branchId: string
): PipelineStageRecord | null {
  const stage = getPipelineStageRecord(departmentId, projectId, stageId);
  if (!stage?.branches.some((b) => b.id === branchId)) return null;
  return updatePipelineStage(departmentId, projectId, stageId, { activeBranchId: branchId });
}

export function listPendingReviewNotifications(
  departmentId: string,
  projectId: string
): PipelineStageRecord[] {
  return listPipelineStages(departmentId, projectId).filter((s) => s.pendingReview);
}

export function dismissPipelineNotification(
  departmentId: string,
  projectId: string,
  stageId: PipelineStageId
): void {
  updatePipelineStage(departmentId, projectId, stageId, { pendingReview: false });
}

export function getPipelineProgress(departmentId: string, projectId: string): {
  completed: number;
  total: number;
  percent: number;
  currentStage: PipelineStageRecord | null;
} {
  const stages = listPipelineStages(departmentId, projectId);
  const total = stages.length;
  const completed = stages.filter((s) => s.status === 'approved').length;
  const currentStage =
    stages.find(
      (s) =>
        s.status === 'founder-review' ||
        s.status === 'braintrust-review' ||
        s.status === 'generating' ||
        s.status === 'ready'
    ) ??
    stages.find((s) => s.status !== 'approved' && s.status !== 'locked') ??
    null;
  const percent = Math.round((completed / total) * 100);
  return { completed, total, percent, currentStage };
}

/** Migrate legacy generation queue storage key (one-time noop if empty). */
export function migrateLegacyGenerationQueue(): void {
  readStudioOsJson(LEGACY_KEY, () => null);
}
