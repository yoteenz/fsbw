/**
 * LOAD_SHELL stall evidence — observe-only instrumentation.
 * Does not change compile ownership, progress state, retries, or repair behavior.
 */
import { logCompilerEvent } from './investigation-log';
import type { CompilerInvestigationEvent } from './types';

const STALL_EVIDENCE_KEY = 'worldCompilerStallEvidence_v1';
const MAX_ASYNC_BOUNDARIES = 200;

export type LoadShellMilestoneId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7';

export type LoadShellMilestoneState = 'success' | 'failure' | 'skipped' | 'pending';

export type AsyncBoundaryOutcome =
  | 'resolved'
  | 'rejected'
  | 'cancelled'
  | 'pending'
  | 'still-pending-at-stall';

export type PipelineLifecycleEvent =
  | 'RUN_FULL_PIPELINE_ENTERED'
  | 'RUN_FULL_PIPELINE_EXIT_SUCCESS'
  | 'RUN_FULL_PIPELINE_EXIT_FAILED'
  | 'RUN_FULL_PIPELINE_EXIT_EARLY'
  | 'RUN_FULL_PIPELINE_UNHANDLED_REJECTION'
  | 'PIPELINE_RUNNING_SET_TRUE'
  | 'PIPELINE_RUNNING_CLEARED'
  | 'ENSURE_STATION_ENTERED'
  | 'ENSURE_STATION_COMPLETED'
  | 'ENSURE_STATION_FAILED'
  | 'ENSURE_STATION_STILL_PENDING'
  | 'COMPILE_STATION_ENTERED'
  | 'COMPILE_STATION_COMPLETED'
  | 'COMPILE_STATION_REJECTED'
  | 'COMPILE_WORLD_STATION_ENTERED'
  | 'COMPILE_WORLD_STATION_COMPLETED'
  | 'COMPILE_WORLD_STATION_GATE_THROW'
  | 'COMPILE_WORLD_STATION_THROW'
  | 'COMPILE_REPORT_PUBLISHED'
  | 'ON_STAGE_COMPLETE_PUBLISHED'
  | 'DUPLICATE_COMPILE_INVOCATION'
  | 'UI_COMPILER_SYNC_SNAPSHOT'
  | 'STALL_THRESHOLD_REACHED';

export type StallEvidenceContext = {
  previewSessionId?: string | null;
  compileRunId?: string | null;
  stationId?: string | null;
  projectId?: string | null;
  conceptId?: string | null;
  companyId?: string | null;
  compareGroupId?: string | null;
  shellId?: string | null;
  registryNamespace?: string | null;
  compileOwner?: string | null;
  pipelineRunning?: boolean;
  currentCompilerStage?: string | null;
  currentUiStep?: string | null;
};

export type AsyncBoundaryRecord = {
  id: string;
  operationName: string;
  startedAt: number;
  completedAt: number | null;
  outcome: AsyncBoundaryOutcome;
  previewSessionId: string | null;
  compileRunId: string | null;
  resolvedCategory: string | null;
  rejectionMessage: string | null;
  detail?: Record<string, unknown>;
};

let asyncBoundarySeq = 0;
const openAsyncBoundaries = new Map<string, AsyncBoundaryRecord>();
const asyncBoundaryHistory: AsyncBoundaryRecord[] = [];
const compileInvocationCounts = new Map<string, number>();
const stallLoggedRunIds = new Set<string>();

function persistStallEvidenceMeta(): void {
  try {
    sessionStorage.setItem(
      STALL_EVIDENCE_KEY,
      JSON.stringify({
        asyncBoundaryHistory: asyncBoundaryHistory.slice(-MAX_ASYNC_BOUNDARIES),
        compileInvocationCounts: Object.fromEntries(compileInvocationCounts),
        updatedAt: Date.now(),
      })
    );
  } catch {
    /* quota */
  }
}

function baseDetail(ctx: StallEvidenceContext, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    previewSessionId: ctx.previewSessionId ?? null,
    compileRunId: ctx.compileRunId ?? null,
    stationId: ctx.stationId ?? null,
    projectId: ctx.projectId ?? null,
    conceptId: ctx.conceptId ?? null,
    companyId: ctx.companyId ?? null,
    compareGroupId: ctx.compareGroupId ?? null,
    shellId: ctx.shellId ?? null,
    registryNamespace: ctx.registryNamespace ?? null,
    compileOwner: ctx.compileOwner ?? null,
    pipelineRunning: ctx.pipelineRunning ?? null,
    currentCompilerStage: ctx.currentCompilerStage ?? null,
    currentUiStep: ctx.currentUiStep ?? null,
    elapsedMs: ctx.compileRunId ? null : undefined,
    ...extra,
  };
}

/** Observe-only — always records in browser; does not gate production behavior. */
export function isStallEvidenceRecordingEnabled(): boolean {
  return typeof window !== 'undefined';
}

export function logPipelineLifecycle(
  event: PipelineLifecycleEvent,
  source: string,
  ctx: StallEvidenceContext,
  extra?: Record<string, unknown>
): CompilerInvestigationEvent | null {
  if (!isStallEvidenceRecordingEnabled()) return null;
  return logCompilerEvent('PIPELINE_LIFECYCLE', source, {
    status: event,
    detail: baseDetail(ctx, { lifecycleEvent: event, ...extra }),
  });
}

export function logPipelineOwnership(
  source: string,
  ctx: StallEvidenceContext,
  extra?: Record<string, unknown>
): CompilerInvestigationEvent | null {
  if (!isStallEvidenceRecordingEnabled()) return null;
  return logCompilerEvent('PIPELINE_OWNERSHIP', source, {
    detail: baseDetail(ctx, extra),
  });
}

export function logLoadShellMilestone(
  milestone: LoadShellMilestoneId,
  source: string,
  ctx: StallEvidenceContext,
  state: LoadShellMilestoneState,
  extra?: Record<string, unknown>
): CompilerInvestigationEvent | null {
  if (!isStallEvidenceRecordingEnabled()) return null;
  const startedAt = typeof extra?.milestoneStartedAt === 'number' ? extra.milestoneStartedAt : Date.now();
  const elapsedMs = Date.now() - startedAt;
  return logCompilerEvent('LOAD_SHELL_MILESTONE', source, {
    stageName: `load-shell-${milestone}`,
    status: state,
    detail: baseDetail(ctx, {
      milestone,
      milestoneState: state,
      elapsedMs,
      timestamp: Date.now(),
      ...extra,
    }),
  });
}

export function recordDuplicateCompileInvocation(
  caller: string,
  ctx: StallEvidenceContext,
  extra?: Record<string, unknown>
): void {
  if (!isStallEvidenceRecordingEnabled()) return;
  const key = `${ctx.compileRunId ?? 'none'}:${ctx.stationId ?? 'none'}:${caller}`;
  const count = (compileInvocationCounts.get(key) ?? 0) + 1;
  compileInvocationCounts.set(key, count);
  if (count > 1) {
    logPipelineLifecycle('DUPLICATE_COMPILE_INVOCATION', caller, ctx, {
      invocationCount: count,
      caller,
      ...extra,
    });
  }
  persistStallEvidenceMeta();
}

export function beginAsyncBoundary(
  operationName: string,
  ctx: StallEvidenceContext,
  extra?: Record<string, unknown>
): string {
  if (!isStallEvidenceRecordingEnabled()) return '';
  asyncBoundarySeq += 1;
  const id = `async-${asyncBoundarySeq}-${Date.now()}`;
  const record: AsyncBoundaryRecord = {
    id,
    operationName,
    startedAt: Date.now(),
    completedAt: null,
    outcome: 'pending',
    previewSessionId: ctx.previewSessionId ?? null,
    compileRunId: ctx.compileRunId ?? null,
    resolvedCategory: null,
    rejectionMessage: null,
    detail: extra,
  };
  openAsyncBoundaries.set(id, record);
  logCompilerEvent('ASYNC_BOUNDARY_START', operationName, {
    detail: baseDetail(ctx, { boundaryId: id, operationName, ...extra }),
  });
  return id;
}

export function endAsyncBoundary(
  boundaryId: string,
  outcome: Exclude<AsyncBoundaryOutcome, 'pending' | 'still-pending-at-stall'>,
  options?: {
    resolvedCategory?: string;
    rejectionMessage?: string;
    detail?: Record<string, unknown>;
  }
): void {
  if (!isStallEvidenceRecordingEnabled() || !boundaryId) return;
  const record = openAsyncBoundaries.get(boundaryId);
  if (!record) return;
  record.completedAt = Date.now();
  record.outcome = outcome;
  record.resolvedCategory = options?.resolvedCategory ?? null;
  record.rejectionMessage = options?.rejectionMessage ?? null;
  openAsyncBoundaries.delete(boundaryId);
  asyncBoundaryHistory.push(record);
  if (asyncBoundaryHistory.length > MAX_ASYNC_BOUNDARIES) {
    asyncBoundaryHistory.splice(0, asyncBoundaryHistory.length - MAX_ASYNC_BOUNDARIES);
  }
  logCompilerEvent('ASYNC_BOUNDARY_END', record.operationName, {
    status: outcome,
    detail: {
      boundaryId,
      operationName: record.operationName,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      durationMs: record.completedAt - record.startedAt,
      resolvedCategory: record.resolvedCategory,
      rejectionMessage: record.rejectionMessage,
      compileRunId: record.compileRunId,
      previewSessionId: record.previewSessionId,
      ...options?.detail,
    },
  });
  persistStallEvidenceMeta();
}

export function markPendingAsyncBoundariesAtStall(compileRunId: string | null): AsyncBoundaryRecord[] {
  if (!isStallEvidenceRecordingEnabled()) return [];
  const pending: AsyncBoundaryRecord[] = [];
  for (const record of openAsyncBoundaries.values()) {
    if (compileRunId && record.compileRunId && record.compileRunId !== compileRunId) continue;
    record.outcome = 'still-pending-at-stall';
    pending.push({ ...record });
    logCompilerEvent('ASYNC_BOUNDARY_STALL', record.operationName, {
      status: 'still-pending-at-stall',
      detail: {
        boundaryId: record.id,
        operationName: record.operationName,
        startedAt: record.startedAt,
        pendingMs: Date.now() - record.startedAt,
        compileRunId: record.compileRunId,
        previewSessionId: record.previewSessionId,
      },
    });
  }
  return pending;
}

export type UiCompilerSyncSnapshot = {
  timestamp: number;
  previewSessionId: string | null;
  compileRunId: string | null;
  sessionCurrentStage: string | null;
  compileReportStages: string[] | null;
  compileReportSuccess: boolean | null;
  compileReportFailedStage: string | null;
  uiCurrentStepId: string | null;
  lastCompletedStage: string | null;
  shellPipelinePhase: string | null;
  pipelineRunning: boolean;
  stepStallMs: number;
  isStalled: boolean;
  lastUiUpdateAt: number | null;
  synchronized: boolean;
  divergenceReason: string | null;
};

export function captureUiCompilerSyncSnapshot(
  source: string,
  input: Omit<UiCompilerSyncSnapshot, 'timestamp' | 'synchronized' | 'divergenceReason'> & {
    evidencePoint: string;
  }
): UiCompilerSyncSnapshot {
  const compileStages = input.compileReportStages ?? [];
  let synchronized = true;
  let divergenceReason: string | null = null;

  if (input.isStalled && input.uiCurrentStepId === 'load-shell') {
    const loadShellInReport = compileStages.includes('load-shell');
    const loadShellInSession = input.sessionCurrentStage === 'load-shell' || input.lastCompletedStage === 'load-shell';
    if (!loadShellInReport && !loadShellInSession && input.shellPipelinePhase === 'world-compile') {
      synchronized = false;
      divergenceReason = 'UI shows load-shell but compileReport and session.currentStage lack load-shell';
    } else if (loadShellInReport || loadShellInSession) {
      synchronized = false;
      divergenceReason = 'load-shell completed in compiler but UI still pinned on load-shell';
    }
  }

  if (input.pipelineRunning && input.shellPipelinePhase === 'ensure-station' && input.uiCurrentStepId === 'load-shell') {
    synchronized = false;
    divergenceReason = 'UI shows load-shell while ensure-station still active';
  }

  const snapshot: UiCompilerSyncSnapshot = {
    timestamp: Date.now(),
    synchronized,
    divergenceReason,
    previewSessionId: input.previewSessionId,
    compileRunId: input.compileRunId,
    sessionCurrentStage: input.sessionCurrentStage,
    compileReportStages: input.compileReportStages,
    compileReportSuccess: input.compileReportSuccess,
    compileReportFailedStage: input.compileReportFailedStage,
    uiCurrentStepId: input.uiCurrentStepId,
    lastCompletedStage: input.lastCompletedStage,
    shellPipelinePhase: input.shellPipelinePhase,
    pipelineRunning: input.pipelineRunning,
    stepStallMs: input.stepStallMs,
    isStalled: input.isStalled,
    lastUiUpdateAt: input.lastUiUpdateAt,
  };

  if (isStallEvidenceRecordingEnabled()) {
    logCompilerEvent('UI_COMPILER_SYNC', source, {
      detail: {
        evidencePoint: input.evidencePoint,
        ...snapshot,
      },
    });
  }

  return snapshot;
}

export function logStallThresholdReached(
  source: string,
  ctx: StallEvidenceContext,
  extra: {
    stepStallMs: number;
    uiCurrentStepId: string;
    syncSnapshot: UiCompilerSyncSnapshot;
  }
): void {
  if (!isStallEvidenceRecordingEnabled()) return;
  const runId = ctx.compileRunId ?? 'unknown';
  if (stallLoggedRunIds.has(runId)) return;
  stallLoggedRunIds.add(runId);
  markPendingAsyncBoundariesAtStall(ctx.compileRunId ?? null);
  logPipelineLifecycle('STALL_THRESHOLD_REACHED', source, ctx, {
    stepStallMs: extra.stepStallMs,
    uiCurrentStepId: extra.uiCurrentStepId,
    syncSnapshot: extra.syncSnapshot,
  });
}

export function getOpenAsyncBoundaries(): readonly AsyncBoundaryRecord[] {
  return [...openAsyncBoundaries.values()];
}

export function getAsyncBoundaryHistory(): readonly AsyncBoundaryRecord[] {
  return asyncBoundaryHistory;
}

export function loadStallEvidenceFromSession(): void {
  try {
    const raw = sessionStorage.getItem(STALL_EVIDENCE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      asyncBoundaryHistory?: AsyncBoundaryRecord[];
      compileInvocationCounts?: Record<string, number>;
    };
    if (parsed.asyncBoundaryHistory?.length) {
      asyncBoundaryHistory.splice(0, asyncBoundaryHistory.length, ...parsed.asyncBoundaryHistory);
    }
    if (parsed.compileInvocationCounts) {
      for (const [k, v] of Object.entries(parsed.compileInvocationCounts)) {
        compileInvocationCounts.set(k, v);
      }
    }
  } catch {
    /* ignore */
  }
}

export function getLoadShellMilestones(events: readonly CompilerInvestigationEvent[]): CompilerInvestigationEvent[] {
  return events.filter((e) => e.type === 'LOAD_SHELL_MILESTONE');
}

export function installStallEvidenceGlobal(): void {
  if (typeof window === 'undefined') return;
  loadStallEvidenceFromSession();
  const win = window as unknown as {
    __WC_INVESTIGATION__?: CompilerInvestigationEvent[];
    __WC_STALL_EVIDENCE__?: {
      getOpenAsyncBoundaries: typeof getOpenAsyncBoundaries;
      getAsyncBoundaryHistory: typeof getAsyncBoundaryHistory;
      buildStallEvidenceReport: () => unknown;
    };
  };
  try {
    import('./stall-evidence-report').then(({ buildStallEvidenceReport }) => {
      win.__WC_STALL_EVIDENCE__ = {
        getOpenAsyncBoundaries,
        getAsyncBoundaryHistory,
        buildStallEvidenceReport,
      };
    });
  } catch {
    /* ignore */
  }
}
