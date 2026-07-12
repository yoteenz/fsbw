/**
 * Independent Forensic Recorder — append-only execution ledger (compilerDiag=1 only).
 *
 * Observation must not participate in the observed system:
 * - no subscribers, no Black Box, no RSS/GSPU stores, no React, no stall classifiers
 * - one-way: runtime → append immutable event → export later
 */
import { isWorldCompilerDiagnosticMode } from './diagnostic-mode';

export type IfrEventType =
  | 'function-enter'
  | 'function-exit'
  | 'before-statement'
  | 'after-statement'
  | 'await-start'
  | 'await-resolve'
  | 'await-reject'
  | 'fetch-start'
  | 'fetch-resolve'
  | 'fetch-reject'
  | 'exception'
  | 'explicit-checkpoint';

export type IfrEventStatus = 'observed' | 'skipped';

export type IndependentForensicEvent = {
  sequenceNumber: number;
  monotonicTimestamp: number;
  wallClockTimestamp: string;
  compileRunId: string | null;
  surface: string | null;
  invocationId: string | null;
  parentInvocationId: string | null;
  eventType: IfrEventType;
  sourceFile: string;
  sourceFunction: string;
  sourceMarker: string;
  status: IfrEventStatus;
  safeDetail: string | null;
  errorName: string | null;
  errorMessage: string | null;
};

export type IndependentForensicRecorderState = {
  events: IndependentForensicEvent[];
  latestSequenceNumber: number;
  latestEvent: IndependentForensicEvent | null;
  lastCompletedSourceMarker: string | null;
  activeCompileRunId: string | null;
  eventCount: number;
  droppedEventCount: number;
  maxEventCapacity: number;
  persistenceStatus: 'idle' | 'pending' | 'written' | 'failed';
  panelMounted: boolean;
  surface: string | null;
};

const STORAGE_KEY = 'independent-forensic-recorder-v1';
const MAX_EVENTS = 2048;
const PERSIST_THROTTLE_MS = 500;

const SECRET_PATTERNS = [
  /bearer\s+/i,
  /authorization/i,
  /token/i,
  /password/i,
  /secret/i,
  /api[_-]?key/i,
  /productionAuthorizationId/i,
];

let events: IndependentForensicEvent[] = [];
let sequenceCounter = 0;
let droppedEventCount = 0;
let persistenceStatus: IndependentForensicRecorderState['persistenceStatus'] = 'idle';
let panelMounted = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let invocationSeq = 0;

let runContext: {
  compileRunId: string | null;
  surface: string | null;
  invocationId: string | null;
  parentInvocationId: string | null;
} = {
  compileRunId: null,
  surface: null,
  invocationId: null,
  parentInvocationId: null,
};

function enabled(): boolean {
  return isWorldCompilerDiagnosticMode();
}

function monotonicNow(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function sanitizeDetail(detail: string | null | undefined): string | null {
  if (!detail) return null;
  let safe = detail.slice(0, 240);
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(safe)) {
      safe = safe.replace(/[^\s]+/g, '[redacted]');
    }
  }
  return safe;
}

function summarizeResultType(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (value instanceof Promise) return 'Promise';
  if (typeof value === 'object') {
    const name = (value as { constructor?: { name?: string } }).constructor?.name;
    return name && name !== 'Object' ? name : 'object';
  }
  return typeof value;
}

function appendEvent(input: Omit<IndependentForensicEvent, 'sequenceNumber' | 'monotonicTimestamp' | 'wallClockTimestamp'>): void {
  if (!enabled()) return;
  sequenceCounter += 1;
  const event: IndependentForensicEvent = {
    sequenceNumber: sequenceCounter,
    monotonicTimestamp: monotonicNow(),
    wallClockTimestamp: new Date().toISOString(),
    ...input,
    safeDetail: sanitizeDetail(input.safeDetail),
    errorMessage: input.errorMessage ? sanitizeDetail(input.errorMessage) : null,
  };
  if (events.length >= MAX_EVENTS) {
    events.shift();
    droppedEventCount += 1;
  }
  events.push(event);
  scheduleThrottledPersist();
}

function scheduleThrottledPersist(): void {
  if (!enabled()) return;
  persistenceStatus = 'pending';
  if (persistTimer != null) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    flushPersistAsync();
  }, PERSIST_THROTTLE_MS);
}

function flushPersistAsync(): void {
  if (!enabled()) return;
  const snapshot = buildIndependentForensicRecorderState();
  setTimeout(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        persistenceStatus = 'written';
      }
    } catch {
      persistenceStatus = 'failed';
    }
  }, 0);
}

export function bindIndependentForensicRecorderContext(ctx: {
  compileRunId: string;
  surface?: string;
  invocationId?: string | null;
  parentInvocationId?: string | null;
}): void {
  if (!enabled()) return;
  runContext = {
    compileRunId: ctx.compileRunId,
    surface: ctx.surface ?? 'experience-lab-validation',
    invocationId: ctx.invocationId ?? runContext.invocationId,
    parentInvocationId: ctx.parentInvocationId ?? null,
  };
}

export function setIndependentForensicRecorderInvocationId(invocationId: string | null): void {
  if (!enabled()) return;
  runContext.invocationId = invocationId;
}

export function resetIndependentForensicRecorder(): void {
  events = [];
  sequenceCounter = 0;
  droppedEventCount = 0;
  persistenceStatus = 'idle';
  invocationSeq = 0;
  runContext = {
    compileRunId: null,
    surface: null,
    invocationId: null,
    parentInvocationId: null,
  };
  if (persistTimer != null) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function loadIndependentForensicRecorderFromSession(): void {
  if (!enabled()) return;
  try {
    if (typeof sessionStorage === 'undefined') return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as IndependentForensicRecorderState;
    if (!Array.isArray(parsed.events)) return;
    events = parsed.events;
    sequenceCounter = parsed.latestSequenceNumber ?? parsed.events.length;
    droppedEventCount = parsed.droppedEventCount ?? 0;
    persistenceStatus = parsed.persistenceStatus ?? 'written';
    runContext.compileRunId = parsed.activeCompileRunId;
    runContext.surface = parsed.surface;
  } catch {
    persistenceStatus = 'failed';
  }
}

export function markIndependentForensicRecorderPanelMounted(mounted: boolean): void {
  panelMounted = mounted;
}

export function recordIfrCheckpoint(
  markerId: string,
  eventType: 'before-statement' | 'after-statement' | 'explicit-checkpoint' = 'explicit-checkpoint',
  sourceFile: string,
  sourceFunction: string,
  detail?: string
): void {
  appendEvent({
    compileRunId: runContext.compileRunId,
    surface: runContext.surface,
    invocationId: runContext.invocationId,
    parentInvocationId: runContext.parentInvocationId,
    eventType,
    sourceFile,
    sourceFunction,
    sourceMarker: markerId,
    status: 'observed',
    safeDetail: detail ?? null,
    errorName: null,
    errorMessage: null,
  });
}

export function recordIfrBeforeFunctionCall(
  functionName: string,
  sourceFile: string,
  detail?: string
): string {
  invocationSeq += 1;
  const callInvocationId = `ifr-fn-${invocationSeq}`;
  appendEvent({
    compileRunId: runContext.compileRunId,
    surface: runContext.surface,
    invocationId: callInvocationId,
    parentInvocationId: runContext.invocationId,
    eventType: 'function-enter',
    sourceFile,
    sourceFunction: functionName,
    sourceMarker: `before-call:${functionName}`,
    status: 'observed',
    safeDetail: detail ?? null,
    errorName: null,
    errorMessage: null,
  });
  return callInvocationId;
}

export function recordIfrAfterFunctionCall(
  functionName: string,
  sourceFile: string,
  resultSummary?: string,
  callInvocationId?: string
): void {
  appendEvent({
    compileRunId: runContext.compileRunId,
    surface: runContext.surface,
    invocationId: callInvocationId ?? runContext.invocationId,
    parentInvocationId: runContext.invocationId,
    eventType: 'function-exit',
    sourceFile,
    sourceFunction: functionName,
    sourceMarker: `after-call:${functionName}`,
    status: 'observed',
    safeDetail: resultSummary ?? null,
    errorName: null,
    errorMessage: null,
  });
}

export function recordIfrException(functionName: string, sourceFile: string, err: unknown): void {
  appendEvent({
    compileRunId: runContext.compileRunId,
    surface: runContext.surface,
    invocationId: runContext.invocationId,
    parentInvocationId: runContext.parentInvocationId,
    eventType: 'exception',
    sourceFile,
    sourceFunction: functionName,
    sourceMarker: `exception:${functionName}`,
    status: 'observed',
    safeDetail: null,
    errorName: err instanceof Error ? err.name : 'Error',
    errorMessage: err instanceof Error ? err.message : String(err),
  });
}

export function recordIfrFunctionCall<T>(fn: () => T, functionName: string, sourceFile: string, detail?: string): T {
  const callId = recordIfrBeforeFunctionCall(functionName, sourceFile, detail);
  try {
    const result = fn();
    recordIfrAfterFunctionCall(functionName, sourceFile, summarizeResultType(result), callId);
    return result;
  } catch (err) {
    recordIfrException(functionName, sourceFile, err);
    throw err;
  }
}

export async function recordIfrAsyncFunctionCall<T>(
  fn: () => Promise<T>,
  functionName: string,
  sourceFile: string,
  detail?: string
): Promise<T> {
  const callId = recordIfrBeforeFunctionCall(functionName, sourceFile, detail);
  appendEvent({
    compileRunId: runContext.compileRunId,
    surface: runContext.surface,
    invocationId: callId,
    parentInvocationId: runContext.invocationId,
    eventType: 'await-start',
    sourceFile,
    sourceFunction: functionName,
    sourceMarker: `await-start:${functionName}`,
    status: 'observed',
    safeDetail: detail ?? null,
    errorName: null,
    errorMessage: null,
  });
  try {
    const result = await fn();
    appendEvent({
      compileRunId: runContext.compileRunId,
      surface: runContext.surface,
      invocationId: callId,
      parentInvocationId: runContext.invocationId,
      eventType: 'await-resolve',
      sourceFile,
      sourceFunction: functionName,
      sourceMarker: `await-resolve:${functionName}`,
      status: 'observed',
      safeDetail: summarizeResultType(result),
      errorName: null,
      errorMessage: null,
    });
    recordIfrAfterFunctionCall(functionName, sourceFile, summarizeResultType(result), callId);
    return result;
  } catch (err) {
    appendEvent({
      compileRunId: runContext.compileRunId,
      surface: runContext.surface,
      invocationId: callId,
      parentInvocationId: runContext.invocationId,
      eventType: 'await-reject',
      sourceFile,
      sourceFunction: functionName,
      sourceMarker: `await-reject:${functionName}`,
      status: 'observed',
      safeDetail: null,
      errorName: err instanceof Error ? err.name : 'Error',
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    recordIfrException(functionName, sourceFile, err);
    throw err;
  }
}

export function buildIndependentForensicRecorderState(): IndependentForensicRecorderState {
  const latest = events.length > 0 ? events[events.length - 1]! : null;
  const completed = [...events]
    .reverse()
    .find((e) => e.eventType === 'after-statement' || e.eventType === 'function-exit' || e.eventType === 'explicit-checkpoint');
  return {
    events: [...events],
    latestSequenceNumber: sequenceCounter,
    latestEvent: latest,
    lastCompletedSourceMarker: completed?.sourceMarker ?? null,
    activeCompileRunId: runContext.compileRunId,
    eventCount: events.length,
    droppedEventCount,
    maxEventCapacity: MAX_EVENTS,
    persistenceStatus,
    panelMounted,
    surface: runContext.surface,
  };
}

export function exportIndependentForensicRecorderJson(): string {
  return JSON.stringify(buildIndependentForensicRecorderState(), null, 2);
}

export async function copyIndependentForensicRecorderJson(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(exportIndependentForensicRecorderJson());
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Test hook — force ring-buffer drop without running full pipeline. */
export function __ifrTestFillBuffer(count: number): void {
  for (let i = 0; i < count; i += 1) {
    recordIfrCheckpoint(`test-fill-${i}`, 'explicit-checkpoint', 'test.ts', 'test', `fill-${i}`);
  }
}
