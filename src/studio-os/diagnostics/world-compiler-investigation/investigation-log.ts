import type {
  ActiveCompileRun,
  CompileStoppedSnapshot,
  CompilerInvestigationEvent,
  CompilerInvestigationEventType,
} from './types';
import { isWorldCompilerDiagnosticMode, shouldFreezeOnFirstFailure } from './diagnostic-mode';
import {
  getLayer1ForensicSnapshot,
  layer1ForensicToCompileStopped,
  loadLayer1ForensicFromSession,
} from './layer1-forensic';

const LOG_KEY = 'worldCompilerInvestigationLog_v1';
const STOPPED_KEY = 'worldCompilerInvestigationStopped_v1';
const MAX_EVENTS = 500;

let sequence = 0;
let renderId = 0;
let events: CompilerInvestigationEvent[] = [];
let activeRun: ActiveCompileRun | null = null;
let frozenSnapshot: CompileStoppedSnapshot | null = null;
let lastProgressStepIndex = -1;
let lastLayerLabel: string | null = null;
let tapCount = 0;

function captureStack(): string {
  try {
    return (new Error().stack ?? '').split('\n').slice(2, 10).join('\n').slice(0, 800);
  } catch {
    return '';
  }
}

function captureCaller(): string {
  try {
    return (new Error().stack ?? '').split('\n')[2]?.trim().slice(0, 240) ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function persistLog(): void {
  try {
    sessionStorage.setItem(LOG_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    /* quota */
  }
}

function baseFields(
  type: CompilerInvestigationEventType,
  source: string,
  caller: string,
  extra?: Partial<CompilerInvestigationEvent>
): CompilerInvestigationEvent {
  sequence += 1;
  const ev: CompilerInvestigationEvent = {
    id: sequence,
    timestamp: Date.now(),
    isoTime: new Date().toISOString(),
    type,
    compileRunId: activeRun?.compileRunId ?? null,
    compilerInstanceId: activeRun?.compilerInstanceId ?? null,
    renderId: activeRun?.renderId ?? null,
    shellId: activeRun?.shellId ?? null,
    stationId: activeRun?.stationId ?? null,
    companyId: activeRun?.companyId ?? null,
    sceneId: null,
    layerNumber: null,
    stageName: null,
    status: activeRun?.status ?? null,
    elapsedMs: activeRun ? Date.now() - activeRun.startedAt : null,
    caller,
    source,
    ...extra,
  };
  events.push(ev);
  if (events.length > MAX_EVENTS) events = events.slice(-MAX_EVENTS);
  persistLog();

  try {
    const win = window as unknown as { __WC_INVESTIGATION__?: CompilerInvestigationEvent[] };
    win.__WC_INVESTIGATION__ = events;
  } catch {
    /* ignore */
  }

  return ev;
}

export function logCompilerEvent(
  type: CompilerInvestigationEventType,
  source: string,
  options?: {
    caller?: string;
    detail?: Record<string, unknown>;
    stageName?: string;
    layerNumber?: number;
    status?: string;
    shellId?: string;
    stackTrace?: string;
  }
): CompilerInvestigationEvent {
  return baseFields(type, source, options?.caller ?? captureCaller(), {
    detail: options?.detail,
    stageName: options?.stageName ?? undefined,
    layerNumber: options?.layerNumber ?? undefined,
    status: options?.status ?? undefined,
    shellId: options?.shellId ?? undefined,
    stackTrace: options?.stackTrace,
  });
}

export function createCompilerInstanceId(): string {
  return `wci-${crypto.randomUUID()}`;
}

export function beginCompileRun(input: {
  compileRunId: string;
  compilerInstanceId: string;
  companyId: string;
  conceptId: string;
  stationId: string;
  previewSessionId: string;
  shellId: string | null;
  trigger: 'manual' | 'auto';
  caller: string;
}): ActiveCompileRun | null {
  if (activeRun?.status === 'running' && isWorldCompilerDiagnosticMode()) {
    logCompilerEvent('TAP_BLOCKED_OVERLAP', input.caller, {
      detail: {
        activeCompileRunId: activeRun.compileRunId,
        attemptedCompileRunId: input.compileRunId,
      },
    });
    return null;
  }

  if (activeRun?.status === 'frozen' && shouldFreezeOnFirstFailure()) {
    logCompilerEvent('RESET_PREVENTED', input.caller, {
      detail: { reason: 'compile frozen on first failure', activeRunId: activeRun.compileRunId },
      stackTrace: captureStack(),
    });
    return null;
  }

  renderId += 1;
  activeRun = {
    compileRunId: input.compileRunId,
    compilerInstanceId: input.compilerInstanceId,
    renderId,
    startedAt: Date.now(),
    companyId: input.companyId,
    conceptId: input.conceptId,
    stationId: input.stationId,
    shellId: input.shellId,
    previewSessionId: input.previewSessionId,
    trigger: input.trigger,
    status: 'running',
    lastSuccessfulStage: null,
    lastSuccessfulLayer: null,
    failedStage: null,
    failedLayer: null,
    error: null,
    resetAttemptedBy: null,
    resetPrevented: false,
  };

  lastProgressStepIndex = -1;
  lastLayerLabel = null;

  logCompilerEvent('COMPILE_RUN_STARTED', input.caller, {
    caller: input.caller,
    detail: {
      compileRunId: input.compileRunId,
      compilerInstanceId: input.compilerInstanceId,
      renderId,
      trigger: input.trigger,
      previewSessionId: input.previewSessionId,
    },
  });

  if (input.trigger === 'auto' && isWorldCompilerDiagnosticMode()) {
    logCompilerEvent('COMPILE_RUN_ID_VIOLATION', input.caller, {
      detail: { reason: 'auto trigger in diagnostic mode', compileRunId: input.compileRunId },
      stackTrace: captureStack(),
    });
  }

  return activeRun;
}

export function endCompileRun(
  outcome: 'success' | 'failed',
  detail?: { failedStage?: string; error?: string }
): void {
  if (!activeRun) return;
  if (outcome === 'failed' && shouldFreezeOnFirstFailure()) {
    activeRun.status = 'frozen';
    activeRun.failedStage = detail?.failedStage ?? null;
    activeRun.error = detail?.error ?? null;
    frozenSnapshot = {
      compileRunId: activeRun.compileRunId,
      failedStage: detail?.failedStage ?? null,
      failedLayer: activeRun.failedLayer,
      error: detail?.error ?? null,
      shellId: activeRun.shellId,
      lastSuccessfulEvent: activeRun.lastSuccessfulStage,
      resetAttemptedBy: activeRun.resetAttemptedBy,
      resetPrevented: true,
      frozenAt: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem(STOPPED_KEY, JSON.stringify(frozenSnapshot));
    } catch {
      /* ignore */
    }
    logCompilerEvent('COMPILE_STOPPED', 'compile-run-registry', {
      detail: { ...frozenSnapshot },
    });
  } else {
    activeRun.status = outcome;
  }
  logCompilerEvent('COMPILE_RUN_ENDED', 'compile-run-registry', {
    detail: { outcome, ...detail },
  });
}

export function recordCompileRunIdViolation(newRunId: string, caller: string): void {
  logCompilerEvent('COMPILE_RUN_ID_VIOLATION', caller, {
    detail: {
      previousRunId: activeRun?.compileRunId ?? null,
      newRunId,
    },
    stackTrace: captureStack(),
  });
}

export function updateActiveShellId(shellId: string | null, caller: string): void {
  if (!activeRun) return;
  const before = activeRun.shellId;
  if (before && shellId && before !== shellId) {
    logCompilerEvent('SHELL_UPDATED', caller, {
      shellId,
      detail: { shellIdBefore: before, shellIdAfter: shellId },
      stackTrace: captureStack(),
    });
  }
  activeRun.shellId = shellId;
}

export function recordStageSuccess(stageName: string, layerNumber?: number): void {
  if (!activeRun) return;
  activeRun.lastSuccessfulStage = stageName;
  if (layerNumber != null) activeRun.lastSuccessfulLayer = layerNumber;
}

export function detectProgressReset(input: {
  stepIndex: number;
  currentStepId: string;
  layerLabel: string | null;
  shellId: string | null;
  compilerStatus: string;
  caller: string;
}): void {
  const wentBack =
    (lastProgressStepIndex >= 0 && input.stepIndex < lastProgressStepIndex) ||
    (lastLayerLabel != null &&
      input.layerLabel != null &&
      input.layerLabel.toLowerCase().includes('shell') &&
      lastLayerLabel.toLowerCase().includes('landmark'));

  if (!wentBack && lastProgressStepIndex < 0) {
    lastProgressStepIndex = input.stepIndex;
    lastLayerLabel = input.layerLabel;
    return;
  }

  if (wentBack) {
    const payload = {
      compileRunId: activeRun?.compileRunId ?? null,
      previousStage: lastLayerLabel ?? String(lastProgressStepIndex),
      previousLayer: lastProgressStepIndex,
      currentStage: input.currentStepId,
      currentLayer: input.stepIndex,
      shellIdBefore: activeRun?.shellId ?? null,
      shellIdAfter: input.shellId,
      compilerStatusBefore: activeRun?.status ?? null,
      compilerStatusAfter: input.compilerStatus,
      resetReason: `Progress regressed step ${lastProgressStepIndex}→${input.stepIndex} layer "${lastLayerLabel}"→"${input.layerLabel}"`,
      caller: input.caller,
      stackTrace: captureStack(),
    };

    if (activeRun) {
      activeRun.resetAttemptedBy = input.caller;
      if (shouldFreezeOnFirstFailure()) {
        activeRun.resetPrevented = true;
        logCompilerEvent('RESET_PREVENTED', input.caller, { detail: payload, stackTrace: payload.stackTrace });
      }
    }

    logCompilerEvent('RESET_DETECTED', input.caller, {
      detail: payload,
      stageName: input.currentStepId,
      layerNumber: input.stepIndex,
      stackTrace: payload.stackTrace,
    });
    void import('../runtime-emit').then(({ emitStudioOsRuntimeEvent }) => {
      emitStudioOsRuntimeEvent('COMPILER_RESET', input.caller, { detail: payload });
    });
  }

  lastProgressStepIndex = input.stepIndex;
  lastLayerLabel = input.layerLabel;
}

export function recordTap(caller: string, detail?: Record<string, unknown>): number {
  tapCount += 1;
  logCompilerEvent('TAP_DETECTED', caller, { detail: { tapCount, ...detail } });
  return tapCount;
}

export function logStateWrite(
  stateField: string,
  oldValue: unknown,
  newValue: unknown,
  caller: string
): void {
  logCompilerEvent('STATE_WRITE', caller, {
    detail: { stateField, oldValue, newValue },
  });
}

export function logEffectLifecycle(
  phase: 'EFFECT_STARTED' | 'EFFECT_CLEANUP' | 'EFFECT_RESTARTED',
  effectName: string,
  deps?: unknown[]
): void {
  logCompilerEvent(phase, effectName, {
    detail: { deps: deps?.map(String) },
    stackTrace: captureStack(),
  });
}

export function getActiveCompileRun(): ActiveCompileRun | null {
  return activeRun;
}

export function getInvestigationEvents(): readonly CompilerInvestigationEvent[] {
  return events;
}

export function loadInvestigationEventsFromSession(): CompilerInvestigationEvent[] {
  try {
    const raw = sessionStorage.getItem(LOG_KEY);
    if (raw) events = JSON.parse(raw) as CompilerInvestigationEvent[];
  } catch {
    /* ignore */
  }
  return events;
}

export function getCompileStoppedSnapshot(): CompileStoppedSnapshot | null {
  const layer1 = getLayer1ForensicSnapshot() ?? loadLayer1ForensicFromSession();
  if (layer1) return layer1ForensicToCompileStopped(layer1);

  if (frozenSnapshot) return frozenSnapshot;
  try {
    const raw = sessionStorage.getItem(STOPPED_KEY);
    return raw ? (JSON.parse(raw) as CompileStoppedSnapshot) : null;
  } catch {
    return null;
  }
}

export function incrementComponentRender(component: string, reactKey?: string): void {
  logCompilerEvent('COMPILER_COMPONENT_RENDER', component, {
    detail: { reactKey, renderCount: sequence },
  });
}

export function logComponentMount(component: string, detail?: Record<string, unknown>): void {
  logCompilerEvent('COMPILER_COMPONENT_MOUNT', component, { detail, stackTrace: captureStack() });
}

export function logComponentUnmount(component: string, detail?: Record<string, unknown>): void {
  logCompilerEvent('COMPILER_COMPONENT_UNMOUNT', component, { detail, stackTrace: captureStack() });
}

/** Clear investigation log — UI-only; does not alter compiler runtime behavior. */
export function clearInvestigationLog(options?: { compileRunId?: string | null; all?: boolean }): {
  removed: number;
  remaining: number;
} {
  loadInvestigationEventsFromSession();
  const before = events.length;

  if (options?.all) {
    events = [];
    activeRun = null;
    frozenSnapshot = null;
    sequence = 0;
    lastProgressStepIndex = -1;
    lastLayerLabel = null;
    tapCount = 0;
    try {
      sessionStorage.removeItem(LOG_KEY);
      sessionStorage.removeItem(STOPPED_KEY);
    } catch {
      /* ignore */
    }
  } else if (options?.compileRunId) {
    const runId = options.compileRunId;
    events = events.filter((e) => e.compileRunId !== runId);
    if (activeRun?.compileRunId === runId) {
      activeRun = null;
    }
    if (frozenSnapshot?.compileRunId === runId) {
      frozenSnapshot = null;
      try {
        sessionStorage.removeItem(STOPPED_KEY);
      } catch {
        /* ignore */
      }
    }
    persistLog();
  } else {
    return { removed: 0, remaining: events.length };
  }

  try {
    const win = window as unknown as { __WC_INVESTIGATION__?: CompilerInvestigationEvent[] };
    win.__WC_INVESTIGATION__ = events;
  } catch {
    /* ignore */
  }

  return { removed: before - events.length, remaining: events.length };
}
