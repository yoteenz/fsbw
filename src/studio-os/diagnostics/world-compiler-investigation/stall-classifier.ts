/**
 * Evidence-based LOAD_SHELL stall classification — no speculation.
 */
import type { CompilerInvestigationEvent } from './types';
import type { AsyncBoundaryRecord } from './stall-evidence';
import type { UiCompilerSyncSnapshot } from './stall-evidence';

export type StallClassificationId = 'RC-STALL-1' | 'RC-STALL-2' | 'RC-STALL-3' | 'RC-STALL-4' | 'INSUFFICIENT_EVIDENCE';

export type StallClassificationResult = {
  classification: StallClassificationId;
  confidence: 'proven' | 'likely' | 'insufficient';
  summary: string;
  proof: string[];
  lastSuccessfulEvent: CompilerInvestigationEvent | null;
  firstMissingOrFailedEvent: CompilerInvestigationEvent | null;
  loadShellMilestonesReached: string[];
  loadShellMilestonesMissing: string[];
  pendingAsyncAtStall: AsyncBoundaryRecord[];
  ensureStationStillPending: boolean;
  compileStationNeverEntered: boolean;
  loadShellNeverEntered: boolean;
  loadShellCompleted: boolean;
  uiCompilerDiverged: boolean;
  duplicateCompileDetected: boolean;
  authRequiredSeparateBlocker: boolean;
  repairApplied: false;
};

const ALL_MILESTONES = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'] as const;

function lastEventOfType(events: CompilerInvestigationEvent[], type: string): CompilerInvestigationEvent | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    if (events[i].type === type) return events[i];
  }
  return null;
}

function hasLifecycle(events: CompilerInvestigationEvent[], lifecycleEvent: string): boolean {
  return events.some(
    (e) =>
      e.type === 'PIPELINE_LIFECYCLE' &&
      (e.status === lifecycleEvent || e.detail?.lifecycleEvent === lifecycleEvent)
  );
}

function milestoneReached(events: CompilerInvestigationEvent[], milestone: string): boolean {
  return events.some(
    (e) =>
      e.type === 'LOAD_SHELL_MILESTONE' &&
      (e.detail?.milestone === milestone || e.stageName === `load-shell-${milestone}`)
  );
}

export function classifyLoadShellStall(input: {
  events: readonly CompilerInvestigationEvent[];
  pendingAsyncAtStall?: readonly AsyncBoundaryRecord[];
  lastSyncSnapshot?: UiCompilerSyncSnapshot | null;
  compileRunId?: string | null;
}): StallClassificationResult {
  const runId = input.compileRunId;
  const events = input.events.filter(
    (e) => !runId || e.compileRunId === runId || e.compileRunId === null
  );

  const stageEnters = events.filter((e) => e.type === 'COMPILE_STAGE_ENTER' && e.stageName === 'load-shell');
  const stageCompletes = events.filter((e) => e.type === 'COMPILE_STAGE_COMPLETE' && e.stageName === 'load-shell');
  const lockShellEnter = events.some((e) => e.type === 'COMPILE_STAGE_ENTER' && e.stageName === 'lock-shell');

  const milestonesReached = ALL_MILESTONES.filter((m) => milestoneReached(events, m));
  const milestonesMissing = ALL_MILESTONES.filter((m) => !milestoneReached(events, m));

  const compileStationEntered = hasLifecycle(events, 'COMPILE_STATION_ENTERED');
  const compileWorldEntered = hasLifecycle(events, 'COMPILE_WORLD_STATION_ENTERED');
  const gateThrow = hasLifecycle(events, 'COMPILE_WORLD_STATION_GATE_THROW');
  const unhandledRejection = hasLifecycle(events, 'RUN_FULL_PIPELINE_UNHANDLED_REJECTION');
  const ensureEntered = hasLifecycle(events, 'ENSURE_STATION_ENTERED');
  const ensureCompleted = hasLifecycle(events, 'ENSURE_STATION_COMPLETED');
  const ensureStillPending = hasLifecycle(events, 'ENSURE_STATION_STILL_PENDING');
  const duplicateCompile = hasLifecycle(events, 'DUPLICATE_COMPILE_INVOCATION');
  const reportPublished = hasLifecycle(events, 'COMPILE_REPORT_PUBLISHED');

  const genFailed = events.filter(
    (e) =>
      e.type === 'COMPILE_FAILED' ||
      (e.type === 'PIPELINE_LIFECYCLE' && e.detail?.lifecycleEvent === 'ENSURE_STATION_FAILED')
  );
  const authRequired = genFailed.some(
    (e) =>
      String(e.detail?.error ?? e.detail?.code ?? '').includes('AUTH_REQUIRED') ||
      String(e.detail?.rejectionMessage ?? '').includes('AUTH_REQUIRED')
  );

  const syncDiverged =
    input.lastSyncSnapshot?.synchronized === false ||
    events.some((e) => e.type === 'UI_COMPILER_SYNC' && e.detail?.synchronized === false);

  const pendingAsync = input.pendingAsyncAtStall ?? [];

  let lastSuccessful: CompilerInvestigationEvent | null = null;
  let firstAbnormal: CompilerInvestigationEvent | null = null;
  const abnormalTypes = new Set([
    'COMPILE_FAILED',
    'COMPILE_WORLD_STATION_GATE_THROW',
    'RUN_FULL_PIPELINE_UNHANDLED_REJECTION',
    'ASYNC_BOUNDARY_STALL',
    'STALL_THRESHOLD_REACHED',
  ]);
  for (const ev of events) {
    const isAbnormal =
      abnormalTypes.has(ev.type) ||
      (ev.type === 'PIPELINE_LIFECYCLE' &&
        ['COMPILE_WORLD_STATION_GATE_THROW', 'RUN_FULL_PIPELINE_UNHANDLED_REJECTION', 'STALL_THRESHOLD_REACHED'].includes(
          String(ev.detail?.lifecycleEvent ?? ev.status)
        ));
    if (isAbnormal && !firstAbnormal) firstAbnormal = ev;
    if (!isAbnormal) lastSuccessful = ev;
  }

  const loadShellNeverEntered = stageEnters.length === 0 && !milestoneReached(events, 'M1');
  const loadShellCompleted = stageCompletes.length > 0 || milestoneReached(events, 'M6');
  const compileStationNeverEntered = !compileStationEntered && !compileWorldEntered;

  const base: StallClassificationResult = {
    classification: 'INSUFFICIENT_EVIDENCE',
    confidence: 'insufficient',
    summary: 'Insufficient on-device evidence — reproduce stall with Experience Lab open, then export from /__world-compiler-investigation',
    proof: [],
    lastSuccessfulEvent: lastSuccessful,
    firstMissingOrFailedEvent: firstAbnormal,
    loadShellMilestonesReached: milestonesReached,
    loadShellMilestonesMissing: milestonesMissing,
    pendingAsyncAtStall: [...pendingAsync],
    ensureStationStillPending: ensureEntered && !ensureCompleted && (ensureStillPending || pendingAsync.some((p) => p.operationName.includes('ensureStation'))),
    compileStationNeverEntered,
    loadShellNeverEntered,
    loadShellCompleted,
    uiCompilerDiverged: syncDiverged,
    duplicateCompileDetected: duplicateCompile,
    authRequiredSeparateBlocker: authRequired,
    repairApplied: false,
  };

  if (events.length < 3) {
    return base;
  }

  // RC-STALL-3: ensure-station pending while UI shows load-shell
  if (
    base.ensureStationStillPending ||
    (ensureEntered && !ensureCompleted && pendingAsync.some((p) => p.operationName.includes('ensureStation')))
  ) {
    const syncSnap = input.lastSyncSnapshot;
    if (syncSnap?.uiCurrentStepId === 'load-shell' || syncSnap?.divergenceReason?.includes('ensure-station')) {
      return {
        ...base,
        classification: 'RC-STALL-3',
        confidence: 'proven',
        summary: 'UI displays load-shell while ensureStation or an earlier async boundary remains pending',
        proof: [
          `ENSURE_STATION_ENTERED=${ensureEntered}`,
          `ENSURE_STATION_COMPLETED=${ensureCompleted}`,
          `pendingAsync=${pendingAsync.map((p) => p.operationName).join(', ') || 'none'}`,
          syncSnap?.divergenceReason ?? 'ensure-station active during load-shell UI step',
        ],
      };
    }
  }

  // RC-STALL-2: load-shell ran/completed but UI did not advance
  if (
    (loadShellCompleted || stageCompletes.length > 0 || lockShellEnter) &&
    syncDiverged &&
    !reportPublished
  ) {
    return {
      ...base,
      classification: 'RC-STALL-2',
      confidence: stageCompletes.length > 0 ? 'proven' : 'likely',
      summary: 'Compiler load-shell (and possibly lock-shell) completed but compileReport/UI step did not synchronize',
      proof: [
        `COMPILE_STAGE_COMPLETE load-shell count=${stageCompletes.length}`,
        `lock-shell entered=${lockShellEnter}`,
        `COMPILE_REPORT_PUBLISHED=${reportPublished}`,
        `UI diverged=${syncDiverged}`,
        `milestones=${milestonesReached.join(',')}`,
      ],
    };
  }

  if (loadShellCompleted && syncDiverged) {
    return {
      ...base,
      classification: 'RC-STALL-2',
      confidence: 'proven',
      summary: 'load-shell milestones complete but UI/compiler report diverged',
      proof: [
        `milestones reached=${milestonesReached.join(',')}`,
        `sync divergence=${input.lastSyncSnapshot?.divergenceReason ?? 'yes'}`,
      ],
    };
  }

  // RC-STALL-4: duplicate compile ownership
  if (duplicateCompile && stageEnters.length > 1) {
    return {
      ...base,
      classification: 'RC-STALL-4',
      confidence: 'likely',
      summary: 'Duplicate compileWorldStation invocations detected for the same compileRunId/station',
      proof: [
        `load-shell enter count=${stageEnters.length}`,
        'DUPLICATE_COMPILE_INVOCATION events present',
      ],
    };
  }

  // RC-STALL-1: never reached load-shell
  if (
    loadShellNeverEntered &&
    (compileStationNeverEntered || gateThrow || unhandledRejection || !compileWorldEntered)
  ) {
    return {
      ...base,
      classification: 'RC-STALL-1',
      confidence: gateThrow || unhandledRejection ? 'proven' : compileStationNeverEntered ? 'likely' : 'proven',
      summary: 'Compiler never entered load-shell — compileStation/compileWorldStation not reached or threw before first stage',
      proof: [
        `COMPILE_STATION_ENTERED=${compileStationEntered}`,
        `COMPILE_WORLD_STATION_ENTERED=${compileWorldEntered}`,
        `COMPILE_WORLD_STATION_GATE_THROW=${gateThrow}`,
        `RUN_FULL_PIPELINE_UNHANDLED_REJECTION=${unhandledRejection}`,
        `COMPILE_STAGE_ENTER load-shell count=${stageEnters.length}`,
      ],
    };
  }

  if (loadShellNeverEntered && events.some((e) => e.detail?.lifecycleEvent === 'STALL_THRESHOLD_REACHED')) {
    return {
      ...base,
      classification: 'RC-STALL-1',
      confidence: 'likely',
      summary: 'Stall threshold reached with no load-shell stage entry in investigation log',
      proof: ['STALL_THRESHOLD_REACHED present', 'COMPILE_STAGE_ENTER load-shell absent'],
    };
  }

  // AUTH_REQUIRED is separate — note but don't classify as load-shell stall
  if (authRequired && loadShellNeverEntered && ensureEntered && !ensureCompleted) {
    return {
      ...base,
      classification: 'RC-STALL-3',
      confidence: 'likely',
      summary: 'AUTH_REQUIRED or Layer 1 failure blocked ensure-station — separate from load-shell body; UI may show wrong step',
      proof: ['AUTH_REQUIRED or generation failure in ensure-station path', 'load-shell never entered'],
      authRequiredSeparateBlocker: true,
    };
  }

  return {
    ...base,
    classification: 'INSUFFICIENT_EVIDENCE',
    confidence: 'insufficient',
    summary: 'Evidence captured but classification ambiguous — export full report for manual review',
    proof: [
      `load-shell enters=${stageEnters.length}`,
      `load-shell completes=${stageCompletes.length}`,
      `milestones=${milestonesReached.join(',') || 'none'}`,
      `compileStation entered=${compileStationEntered}`,
    ],
    lastSuccessfulEvent: lastSuccessful ?? lastEventOfType(events, 'COMPILE_STAGE_COMPLETE'),
  };
}
