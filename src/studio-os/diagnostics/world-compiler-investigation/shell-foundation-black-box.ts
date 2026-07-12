/**
 * Shell Foundation Black Box — observe-only instrumentation for compilerDiag=1.
 * Does not change shell behavior, timing, retries, or API contracts.
 */
import {
  bindGenerateShellDispatchDeskContext,
  buildGenerateShellDispatchDeskState,
  markGspuWrapperInvocation,
  resetGenerateShellDispatchDesk,
  restoreGenerateShellDispatchDeskFromSnapshot,
  type GenerateShellDispatchDeskState,
} from './generate-shell-dispatch-desk';
import { isWorldCompilerDiagnosticMode } from './diagnostic-mode';
import { getLastGenerationRequestHttpForensic } from './generation-request-forensic';
import {
  bindIndependentForensicRecorderContext,
  resetIndependentForensicRecorder,
} from './independent-forensic-recorder';
import {
  beginRecordShellStageInvocation,
  beginRssSubscriberCallback,
  bindRecordShellStageForensicContext,
  buildRecordShellStageForensicState,
  endRecordShellStageInvocation,
  endRssSubscriberCallback,
  recordRssDerivedState,
  recordRssMicroMarker,
  recordRssPersistence,
  recordRssReactStore,
  registerRssSubscriber,
  resetRecordShellStageForensic,
  restoreRecordShellStageForensicFromSnapshot,
  incrementRssSubscriberNotificationCount,
  shouldSkipRssSubscribersForTest,
  unregisterRssSubscriber,
  type RecordShellStageForensicState,
} from './record-shell-stage-forensic';

const STORAGE_KEY = 'shellFoundationBlackBox_v1';
const MAX_TIMELINE = 400;
const MAX_FUNCTION_TRACES = 200;
const MAX_AWAIT_TRACKS = 100;
const MAX_NETWORK = 50;
const MAX_ERRORS = 50;
const AWAIT_WARN_MS = 5_000;
const STALL_NO_PROGRESS_MS = 90_000;

export type ShellStageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export type ShellFoundationStageId =
  | 'initialize-shell'
  | 'resolve-existing-shell'
  | 'invalidate-prior-shell'
  | 'compile-preview-spec'
  | 'create-shell-request'
  | 'generate-shell'
  | 'register-ephemeral-shell'
  | 'persist-shell'
  | 'verify-shell'
  | 'return-shell';

export const SHELL_FOUNDATION_STAGE_DEFS: ReadonlyArray<{
  id: ShellFoundationStageId;
  label: string;
}> = [
  { id: 'initialize-shell', label: 'Initialize shell' },
  { id: 'resolve-existing-shell', label: 'Resolve existing shell' },
  { id: 'invalidate-prior-shell', label: 'Invalidate prior shell' },
  { id: 'compile-preview-spec', label: 'Compile preview spec' },
  { id: 'create-shell-request', label: 'Create shell request' },
  { id: 'generate-shell', label: 'Generate environment shell' },
  { id: 'register-ephemeral-shell', label: 'Register ephemeral shell' },
  { id: 'persist-shell', label: 'Persist shell' },
  { id: 'verify-shell', label: 'Verify shell mount' },
  { id: 'return-shell', label: 'Return shell' },
];

export type ShellStageRecord = {
  id: ShellFoundationStageId;
  label: string;
  status: ShellStageStatus;
  startedAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
  timestamp: string | null;
  detail?: string;
  errorCode?: string;
};

export type ShellFunctionTrace = {
  id: number;
  functionName: string;
  file: string;
  status: 'entered' | 'exited' | 'threw';
  timestamp: number;
  isoTime: string;
  elapsedMs: number;
  durationMs: number | null;
  detail?: Record<string, unknown>;
};

export type ShellAwaitTrack = {
  id: string;
  label: string;
  functionName: string;
  startedAt: number;
  completedAt: number | null;
  elapsedMs: number;
  expectedTimeoutMs: number | null;
  state: 'pending' | 'resolved' | 'rejected';
  rejectionMessage: string | null;
};

export type ShellNetworkRecord = {
  id: number;
  method: string;
  route: string;
  status: number | null;
  durationMs: number;
  responseSize: number;
  error: string | null;
  retry: boolean;
  timeout: boolean;
  cancelled: boolean;
  traceId: string | null;
  timestamp: number;
  isoTime: string;
};

export type ShellStateSnapshot = {
  id: number;
  timestamp: number;
  isoTime: string;
  shellId: string | null;
  stationId: string | null;
  compileRunId: string | null;
  organizationId: string | null;
  conceptId: string | null;
  surface: string | null;
  pipelinePhase: string | null;
  shellStatus: string | null;
  layerStatus: string | null;
  sceneStatus: string | null;
  transition: string;
};

export type ShellDependencyNode = {
  id: string;
  label: string;
  status: 'waiting' | 'resolved' | 'outstanding' | 'failed';
  waitingOn: string | null;
};

export type ShellErrorRecord = {
  id: number;
  timestamp: number;
  isoTime: string;
  message: string;
  cause: string | null;
  nestedCause: string | null;
  stack: string | null;
  category: string;
  sourceFile: string;
  functionName: string;
  traceId: string | null;
};

export type ShellHeartbeatSnapshot = {
  lastProgressEvent: string | null;
  lastProgressAt: number | null;
  lastStateTransition: string | null;
  lastStateTransitionAt: number | null;
  lastSuccessfulFunction: string | null;
  lastSuccessfulFunctionAt: number | null;
  lastCompletedAwait: string | null;
  lastCompletedAwaitAt: number | null;
  potentialStall: boolean;
};

export type ShellStallSignal = {
  id: string;
  label: string;
  detectedAt: number;
  isoTime: string;
  reason: string;
};

export type ShellTimelineEntry = {
  elapsedMs: number;
  timestamp: number;
  isoTime: string;
  label: string;
  category: 'stage' | 'function' | 'await' | 'network' | 'state' | 'error' | 'heartbeat';
  status: string;
  detail?: string;
};

export type ShellFoundationBlackBoxState = {
  recordShellStageForensic: RecordShellStageForensicState;
  dispatchDesk: GenerateShellDispatchDeskState;
  runStartedAt: number | null;
  runContext: {
    compileRunId: string | null;
    previewSessionId: string | null;
    companyId: string | null;
    conceptId: string | null;
    departmentId: string | null;
    stationId: string | null;
    projectId: string | null;
    surface: string | null;
  };
  stages: ShellStageRecord[];
  functionTraces: ShellFunctionTrace[];
  awaitTracks: ShellAwaitTrack[];
  network: ShellNetworkRecord[];
  stateSnapshots: ShellStateSnapshot[];
  dependencies: ShellDependencyNode[];
  errors: ShellErrorRecord[];
  heartbeat: ShellHeartbeatSnapshot;
  stallSignals: ShellStallSignal[];
  timeline: ShellTimelineEntry[];
  lastSuccessfulStageId: ShellFoundationStageId | null;
  lastVisibleEvent: string | null;
  pipelineComplete: boolean;
  pipelineOk: boolean | null;
};

type Listener = () => void;

let runStartedAt: number | null = null;
let runContext: ShellFoundationBlackBoxState['runContext'] = {
  compileRunId: null,
  previewSessionId: null,
  companyId: null,
  conceptId: null,
  departmentId: null,
  stationId: null,
  projectId: null,
  surface: 'experience-lab-validation',
};
let stages = new Map<ShellFoundationStageId, ShellStageRecord>();
let functionSeq = 0;
let functionTraces: ShellFunctionTrace[] = [];
const openFunctions = new Map<string, { enteredAt: number; traceId: number }>();
let awaitSeq = 0;
const openAwaits = new Map<string, ShellAwaitTrack>();
let awaitTracks: ShellAwaitTrack[] = [];
let networkSeq = 0;
let networkRecords: ShellNetworkRecord[] = [];
let stateSeq = 0;
let stateSnapshots: ShellStateSnapshot[] = [];
let dependencies: ShellDependencyNode[] = [];
let errorSeq = 0;
let errors: ShellErrorRecord[] = [];
let heartbeat: ShellHeartbeatSnapshot = {
  lastProgressEvent: null,
  lastProgressAt: null,
  lastStateTransition: null,
  lastStateTransitionAt: null,
  lastSuccessfulFunction: null,
  lastSuccessfulFunctionAt: null,
  lastCompletedAwait: null,
  lastCompletedAwaitAt: null,
  potentialStall: false,
};
let stallSignals: ShellStallSignal[] = [];
let timeline: ShellTimelineEntry[] = [];
let lastSuccessfulStageId: ShellFoundationStageId | null = null;
let lastVisibleEvent: string | null = null;
let pipelineComplete = false;
let pipelineOk: boolean | null = null;
let lastProgressAt: number | null = null;
const listeners = new Set<Listener>();

function enabled(): boolean {
  return isWorldCompilerDiagnosticMode();
}

function initStages(): void {
  stages = new Map(
    SHELL_FOUNDATION_STAGE_DEFS.map((def) => [
      def.id,
      {
        id: def.id,
        label: def.label,
        status: 'pending',
        startedAt: null,
        completedAt: null,
        durationMs: null,
        timestamp: null,
      },
    ])
  );
}

function elapsedSinceRun(): number {
  return runStartedAt ? Date.now() - runStartedAt : 0;
}

function persist(): void {
  if (!enabled()) return;
  recordRssMicroMarker('RSS-09a-persist-enter', 'running');
  recordRssPersistence({ persistencePhase: 'persist-enter', storageKey: STORAGE_KEY });
  const persistStarted = Date.now();
  try {
    recordRssMicroMarker('RSS-09a1-build-snapshot', 'running');
    recordRssDerivedState({ phase: 'build-snapshot' });
    recordRssReactStore({ getSnapshotStarted: true });
    const snapshotStarted = Date.now();
    const snapshot = buildShellFoundationBlackBoxStateForPersist();
    const snapshotMs = Date.now() - snapshotStarted;
    recordRssDerivedState({ buildSnapshotDurationMs: snapshotMs });
    recordRssReactStore({ getSnapshotCompleted: true, getSnapshotDurationMs: snapshotMs });
    recordRssMicroMarker('RSS-09a1-build-snapshot', 'success', { resultSummary: `${snapshotMs}ms` });

    recordRssMicroMarker('RSS-09a2-json-stringify', 'running');
    recordRssPersistence({ serializationStarted: true });
    const stringifyStarted = Date.now();
    const json = JSON.stringify(snapshot);
    const stringifyMs = Date.now() - stringifyStarted;
    recordRssPersistence({
      serializationCompleted: true,
      serializationDurationMs: stringifyMs,
      payloadByteSize: json.length,
    });
    recordRssMicroMarker('RSS-09a2-json-stringify', 'success', { resultSummary: `${json.length}b/${stringifyMs}ms` });

    recordRssMicroMarker('RSS-09a3-session-storage-write', 'running');
    recordRssPersistence({ storageWriteStarted: true });
    const writeStarted = Date.now();
    sessionStorage.setItem(STORAGE_KEY, json);
    const writeMs = Date.now() - writeStarted;
    recordRssPersistence({
      storageWriteCompleted: true,
      storageWriteDurationMs: writeMs,
      persistencePhase: 'persist-complete',
    });
    recordRssMicroMarker('RSS-09a3-session-storage-write', 'success', { resultSummary: `${writeMs}ms` });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isQuota = /quota/i.test(message);
    const isCircular = /circular|cyclic/i.test(message);
    recordRssPersistence({
      storageException: message,
      quotaError: isQuota,
      circularReferenceError: isCircular,
      persistencePhase: 'persist-failed',
    });
    recordRssMicroMarker('RSS-09a2-json-stringify', isCircular ? 'failed' : 'skipped', { errorSummary: message });
    recordRssMicroMarker('RSS-09a3-session-storage-write', isQuota ? 'failed' : 'skipped', { errorSummary: message });
  }
  recordRssMicroMarker('RSS-09a-persist-exit', 'success', { resultSummary: `${Date.now() - persistStarted}ms` });
}

/** Build state for persistence — avoids re-entering full forensic persist path. */
function buildShellFoundationBlackBoxStateForPersist(): Omit<ShellFoundationBlackBoxState, 'recordShellStageForensic'> & {
  recordShellStageForensic?: RecordShellStageForensicState;
} {
  detectStalls();
  const dispatchStarted = Date.now();
  const dispatchDesk = buildGenerateShellDispatchDeskState();
  recordRssDerivedState({ dispatchDeskBuildDurationMs: Date.now() - dispatchStarted });
  return {
    dispatchDesk,
    runStartedAt,
    runContext: { ...runContext },
    stages: SHELL_FOUNDATION_STAGE_DEFS.map((def) => stages.get(def.id)!).filter(Boolean),
    functionTraces: [...functionTraces],
    awaitTracks: [...awaitTracks],
    network: [...networkRecords],
    stateSnapshots: [...stateSnapshots],
    dependencies: [...dependencies],
    errors: [...errors],
    heartbeat: { ...heartbeat },
    stallSignals: [...stallSignals],
    timeline: [...timeline],
    lastSuccessfulStageId,
    lastVisibleEvent,
    pipelineComplete,
    pipelineOk,
  };
}

function notify(): void {
  recordRssMicroMarker('RSS-09-notify-enter', 'running', { subscriberCount: listeners.size });
  persist();
  if (!shouldSkipRssSubscribersForTest()) {
    recordRssMicroMarker('RSS-09b-subscriber-notify', 'running', { subscriberCount: listeners.size });
    incrementRssSubscriberNotificationCount();
    let index = 0;
    for (const listener of listeners) {
      const entry = [...subscriberListenerIds.entries()].find(([, fn]) => fn === listener);
      const subscriberId = entry?.[0] ?? `rss-sub-notify-${index}`;
      index += 1;
      beginRssSubscriberCallback(subscriberId);
      try {
        listener();
        endRssSubscriberCallback(subscriberId, false);
      } catch (err) {
        endRssSubscriberCallback(subscriberId, true);
        throw err;
      }
    }
    recordRssMicroMarker('RSS-09b-subscriber-notify', 'success', { resultSummary: `${listeners.size} callbacks` });
  } else {
    recordRssMicroMarker('RSS-09b-subscriber-notify', 'skipped', { resultSummary: 'test harness skip' });
  }
  recordRssMicroMarker('RSS-09-notify-exit', 'success');
}

const subscriberListenerIds = new Map<string, Listener>();

function pushTimeline(
  label: string,
  category: ShellTimelineEntry['category'],
  status: string,
  detail?: string
): void {
  const now = Date.now();
  timeline.push({
    elapsedMs: elapsedSinceRun(),
    timestamp: now,
    isoTime: new Date(now).toISOString(),
    label,
    category,
    status,
    detail,
  });
  if (timeline.length > MAX_TIMELINE) timeline = timeline.slice(-MAX_TIMELINE);
  lastVisibleEvent = label;
  lastProgressAt = now;
  heartbeat.lastProgressEvent = label;
  heartbeat.lastProgressAt = now;
}

function detectStalls(): void {
  const now = Date.now();
  heartbeat.potentialStall = false;

  for (const awaitTrack of openAwaits.values()) {
    const elapsed = now - awaitTrack.startedAt;
    if (elapsed >= AWAIT_WARN_MS) {
      heartbeat.potentialStall = true;
      const signalId = `await-${awaitTrack.id}`;
      if (!stallSignals.some((s) => s.id === signalId)) {
        stallSignals.push({
          id: signalId,
          label: 'Potential Infinite Await',
          detectedAt: now,
          isoTime: new Date(now).toISOString(),
          reason: `${awaitTrack.functionName} pending ${elapsed}ms (threshold ${AWAIT_WARN_MS}ms)`,
        });
      }
    }
  }

  if (lastProgressAt && now - lastProgressAt >= STALL_NO_PROGRESS_MS) {
    heartbeat.potentialStall = true;
    const signalId = 'no-progress';
    if (!stallSignals.some((s) => s.id === signalId)) {
      stallSignals.push({
        id: signalId,
        label: 'Likely Stall',
        detectedAt: now,
        isoTime: new Date(now).toISOString(),
        reason: `No shell progress for ${now - lastProgressAt}ms`,
      });
    }
  }

  for (const fn of openFunctions.keys()) {
    const signalId = `open-fn-${fn}`;
    if (!stallSignals.some((s) => s.id === signalId) && runStartedAt && now - runStartedAt > AWAIT_WARN_MS) {
      stallSignals.push({
        id: signalId,
        label: 'Potential Dependency Wait',
        detectedAt: now,
        isoTime: new Date(now).toISOString(),
        reason: `Function still open: ${fn}`,
      });
    }
  }
}

export function subscribeShellFoundationBlackBox(listener: Listener): () => void {
  listeners.add(listener);
  const subscriberId = registerRssSubscriber('ShellFoundationBlackBoxPanel.subscribe');
  subscriberListenerIds.set(subscriberId, listener);
  return () => {
    listeners.delete(listener);
    unregisterRssSubscriber(subscriberId);
    subscriberListenerIds.delete(subscriberId);
  };
}

export function loadShellFoundationBlackBoxFromSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as ShellFoundationBlackBoxState;
    runStartedAt = parsed.runStartedAt;
    runContext = parsed.runContext;
    stages = new Map(parsed.stages.map((s) => [s.id, s]));
    functionTraces = parsed.functionTraces ?? [];
    awaitTracks = parsed.awaitTracks ?? [];
    networkRecords = parsed.network ?? [];
    stateSnapshots = parsed.stateSnapshots ?? [];
    dependencies = parsed.dependencies ?? [];
    errors = parsed.errors ?? [];
    heartbeat = parsed.heartbeat ?? heartbeat;
    stallSignals = parsed.stallSignals ?? [];
    timeline = parsed.timeline ?? [];
    lastSuccessfulStageId = parsed.lastSuccessfulStageId;
    lastVisibleEvent = parsed.lastVisibleEvent;
    pipelineComplete = parsed.pipelineComplete;
    pipelineOk = parsed.pipelineOk;
    if (parsed.dispatchDesk) {
      restoreGenerateShellDispatchDeskFromSnapshot(parsed.dispatchDesk);
    }
    if (parsed.recordShellStageForensic) {
      restoreRecordShellStageForensicFromSnapshot(parsed.recordShellStageForensic);
    }
    functionSeq = functionTraces.length;
    networkSeq = networkRecords.length;
    errorSeq = errors.length;
    stateSeq = stateSnapshots.length;
  } catch {
    /* corrupt */
  }
}

export function clearShellFoundationBlackBox(): void {
  runStartedAt = null;
  initStages();
  functionTraces = [];
  openFunctions.clear();
  openAwaits.clear();
  awaitTracks = [];
  networkRecords = [];
  stateSnapshots = [];
  dependencies = [];
  errors = [];
  stallSignals = [];
  timeline = [];
  lastSuccessfulStageId = null;
  lastVisibleEvent = null;
  pipelineComplete = false;
  pipelineOk = null;
  lastProgressAt = null;
  resetGenerateShellDispatchDesk();
  resetRecordShellStageForensic();
  resetIndependentForensicRecorder();
  subscriberListenerIds.clear();
  heartbeat = {
    lastProgressEvent: null,
    lastProgressAt: null,
    lastStateTransition: null,
    lastStateTransitionAt: null,
    lastSuccessfulFunction: null,
    lastSuccessfulFunctionAt: null,
    lastCompletedAwait: null,
    lastCompletedAwaitAt: null,
    potentialStall: false,
  };
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  listeners.clear();
  subscriberListenerIds.clear();
  notify();
}

export function beginShellFoundationRun(ctx: {
  compileRunId: string;
  previewSessionId: string;
  companyId: string;
  conceptId: string;
  departmentId: string;
  stationId: string;
  projectId: string;
  surface?: string;
}): void {
  if (!enabled()) return;
  runStartedAt = Date.now();
  runContext = {
    compileRunId: ctx.compileRunId,
    previewSessionId: ctx.previewSessionId,
    companyId: ctx.companyId,
    conceptId: ctx.conceptId,
    departmentId: ctx.departmentId,
    stationId: ctx.stationId,
    projectId: ctx.projectId,
    surface: ctx.surface ?? 'experience-lab-validation',
  };
  initStages();
  functionTraces = [];
  openFunctions.clear();
  openAwaits.clear();
  awaitTracks = [];
  networkRecords = [];
  stateSnapshots = [];
  dependencies = [];
  errors = [];
  stallSignals = [];
  timeline = [];
  lastSuccessfulStageId = null;
  lastVisibleEvent = null;
  pipelineComplete = false;
  pipelineOk = null;
  lastProgressAt = runStartedAt;
  bindGenerateShellDispatchDeskContext({
    compileRunId: ctx.compileRunId,
    stationId: ctx.stationId,
    requestKey: `shell-${ctx.previewSessionId}`,
    surface: ctx.surface ?? 'experience-lab-validation',
  });
  bindRecordShellStageForensicContext({ compileRunId: ctx.compileRunId });
  bindIndependentForensicRecorderContext({
    compileRunId: ctx.compileRunId,
    surface: ctx.surface ?? 'experience-lab-validation',
  });
  pushTimeline('Shell foundation run started', 'state', 'running', ctx.compileRunId);
  recordShellStateSnapshot('run-started', {
    pipelinePhase: 'shell-pipeline',
    shellStatus: 'initializing',
  });
  notify();
}

export function recordShellStage(
  id: ShellFoundationStageId,
  status: ShellStageStatus,
  detail?: { detail?: string; errorCode?: string }
): void {
  const rssInvocationId = beginRecordShellStageInvocation(id, status);
  recordRssMicroMarker('RSS-01b-enabled-guard', 'running', { invocationId: rssInvocationId, stageId: id, stageStatus: status });
  if (!enabled()) {
    recordRssMicroMarker('RSS-01b-enabled-guard', 'skipped', { resultSummary: 'diagnostics off' });
    endRecordShellStageInvocation(rssInvocationId);
    return;
  }
  recordRssMicroMarker('RSS-01b-enabled-guard', 'success');

  recordRssMicroMarker('RSS-01-enter', 'success', { invocationId: rssInvocationId });
  recordRssMicroMarker('RSS-02-locate-stage-def', 'running', { invocationId: rssInvocationId });
  const def = SHELL_FOUNDATION_STAGE_DEFS.find((s) => s.id === id);
  recordRssMicroMarker('RSS-02-locate-stage-def', 'success', { resultSummary: def?.label ?? id });

  const now = Date.now();
  recordRssMicroMarker('RSS-03-get-existing-stage', 'running', { invocationId: rssInvocationId });
  const existing = stages.get(id) ?? {
    id,
    label: def?.label ?? id,
    status: 'pending' as ShellStageStatus,
    startedAt: null,
    completedAt: null,
    durationMs: null,
    timestamp: null,
  };
  recordRssMicroMarker('RSS-03-get-existing-stage', 'success');

  recordRssMicroMarker('RSS-04-mutate-stage', 'running', { invocationId: rssInvocationId });
  if (status === 'running') {
    existing.status = 'running';
    existing.startedAt = now;
    existing.timestamp = new Date(now).toISOString();
  } else {
    existing.status = status;
    existing.completedAt = now;
    existing.timestamp = new Date(now).toISOString();
    if (existing.startedAt) existing.durationMs = now - existing.startedAt;
    if (status === 'success') lastSuccessfulStageId = id;
    if (detail?.detail) existing.detail = detail.detail;
    if (detail?.errorCode) existing.errorCode = detail.errorCode;
  }
  recordRssMicroMarker('RSS-04-mutate-stage', 'success', { resultSummary: status });

  recordRssMicroMarker('RSS-05-stages-set', 'running', { invocationId: rssInvocationId });
  stages.set(id, existing);
  recordRssMicroMarker('RSS-05-stages-set', 'success');

  recordRssMicroMarker('RSS-06-push-timeline', 'running', { invocationId: rssInvocationId });
  pushTimeline(def?.label ?? id, 'stage', status, detail?.detail ?? detail?.errorCode);
  recordRssMicroMarker('RSS-06-push-timeline', 'success');

  recordRssMicroMarker('RSS-07-heartbeat-update', 'running', { invocationId: rssInvocationId });
  heartbeat.lastStateTransition = `${def?.label ?? id} → ${status}`;
  heartbeat.lastStateTransitionAt = now;
  recordRssMicroMarker('RSS-07-heartbeat-update', 'success');

  recordRssMicroMarker('RSS-08-detect-stalls', 'running', { invocationId: rssInvocationId });
  const detectStarted = Date.now();
  detectStalls();
  recordRssDerivedState({ detectStallsDurationMs: Date.now() - detectStarted, phase: 'detect-stalls' });
  recordRssMicroMarker('RSS-08-detect-stalls', 'success');

  notify();
  endRecordShellStageInvocation(rssInvocationId);
}

export function recordShellFunctionEnter(
  functionName: string,
  file: string,
  detail?: Record<string, unknown>
): void {
  if (!enabled()) return;
  const now = Date.now();
  functionSeq += 1;
  const key = `${functionName}@${file}`;
  openFunctions.set(key, { enteredAt: now, traceId: functionSeq });
  functionTraces.push({
    id: functionSeq,
    functionName,
    file,
    status: 'entered',
    timestamp: now,
    isoTime: new Date(now).toISOString(),
    elapsedMs: elapsedSinceRun(),
    durationMs: null,
    detail,
  });
  if (functionTraces.length > MAX_FUNCTION_TRACES) functionTraces = functionTraces.slice(-MAX_FUNCTION_TRACES);
  pushTimeline(`Entered ${functionName}()`, 'function', 'entered');
  notify();
}

export function recordShellFunctionExit(
  functionName: string,
  file: string,
  detail?: Record<string, unknown>
): void {
  if (!enabled()) return;
  const now = Date.now();
  const key = `${functionName}@${file}`;
  const open = openFunctions.get(key);
  functionSeq += 1;
  functionTraces.push({
    id: functionSeq,
    functionName,
    file,
    status: 'exited',
    timestamp: now,
    isoTime: new Date(now).toISOString(),
    elapsedMs: elapsedSinceRun(),
    durationMs: open ? now - open.enteredAt : null,
    detail,
  });
  openFunctions.delete(key);
  heartbeat.lastSuccessfulFunction = functionName;
  heartbeat.lastSuccessfulFunctionAt = now;
  pushTimeline(`Exited ${functionName}()`, 'function', 'exited');
  notify();
}

export function recordShellFunctionThrow(
  functionName: string,
  file: string,
  err: unknown
): void {
  if (!enabled()) return;
  const message = err instanceof Error ? err.message : String(err);
  recordShellError({
    message,
    stack: err instanceof Error ? err.stack ?? null : null,
    category: 'exception',
    sourceFile: file,
    functionName,
  });
  const now = Date.now();
  functionSeq += 1;
  functionTraces.push({
    id: functionSeq,
    functionName,
    file,
    status: 'threw',
    timestamp: now,
    isoTime: new Date(now).toISOString(),
    elapsedMs: elapsedSinceRun(),
    durationMs: null,
  });
  openFunctions.delete(`${functionName}@${file}`);
  pushTimeline(`Threw ${functionName}()`, 'error', 'threw', message);
  notify();
}

export function beginShellAwait(
  label: string,
  functionName: string,
  expectedTimeoutMs: number | null = null
): string {
  if (!enabled()) return '';
  awaitSeq += 1;
  const id = `await-${awaitSeq}`;
  const now = Date.now();
  const track: ShellAwaitTrack = {
    id,
    label,
    functionName,
    startedAt: now,
    completedAt: null,
    elapsedMs: 0,
    expectedTimeoutMs,
    state: 'pending',
    rejectionMessage: null,
  };
  openAwaits.set(id, track);
  awaitTracks.push(track);
  if (awaitTracks.length > MAX_AWAIT_TRACKS) awaitTracks = awaitTracks.slice(-MAX_AWAIT_TRACKS);
  pushTimeline(`Await ${label}`, 'await', 'pending', functionName);
  notify();
  return id;
}

export function endShellAwait(
  awaitId: string,
  outcome: 'resolved' | 'rejected',
  rejectionMessage?: string
): void {
  if (!enabled() || !awaitId) return;
  const track = openAwaits.get(awaitId);
  if (!track) return;
  const now = Date.now();
  track.completedAt = now;
  track.elapsedMs = now - track.startedAt;
  track.state = outcome;
  track.rejectionMessage = rejectionMessage ?? null;
  openAwaits.delete(awaitId);
  if (outcome === 'resolved') {
    heartbeat.lastCompletedAwait = track.label;
    heartbeat.lastCompletedAwaitAt = now;
  }
  pushTimeline(`Await ${track.label}`, 'await', outcome, rejectionMessage);
  detectStalls();
  notify();
}

export function recordShellNetwork(input: {
  method: string;
  route: string;
  status: number | null;
  durationMs: number;
  responseSize: number;
  error: string | null;
  retry?: boolean;
  timeout?: boolean;
  cancelled?: boolean;
  traceId?: string | null;
}): void {
  if (!enabled()) return;
  networkSeq += 1;
  const now = Date.now();
  networkRecords.push({
    id: networkSeq,
    method: input.method,
    route: input.route,
    status: input.status,
    durationMs: input.durationMs,
    responseSize: input.responseSize,
    error: input.error,
    retry: input.retry ?? false,
    timeout: input.timeout ?? false,
    cancelled: input.cancelled ?? false,
    traceId: input.traceId ?? null,
    timestamp: now,
    isoTime: new Date(now).toISOString(),
  });
  if (networkRecords.length > MAX_NETWORK) networkRecords = networkRecords.slice(-MAX_NETWORK);
  pushTimeline(`${input.method} ${input.route}`, 'network', String(input.status ?? '—'), input.error ?? undefined);
  notify();
}

export function recordShellStateSnapshot(
  transition: string,
  fields: Partial<{
    shellId: string | null;
    pipelinePhase: string | null;
    shellStatus: string | null;
    layerStatus: string | null;
    sceneStatus: string | null;
  }>
): void {
  if (!enabled()) return;
  stateSeq += 1;
  const now = Date.now();
  stateSnapshots.push({
    id: stateSeq,
    timestamp: now,
    isoTime: new Date(now).toISOString(),
    shellId: fields.shellId ?? null,
    stationId: runContext.stationId,
    compileRunId: runContext.compileRunId,
    organizationId: runContext.companyId,
    conceptId: runContext.conceptId,
    surface: runContext.surface,
    pipelinePhase: fields.pipelinePhase ?? null,
    shellStatus: fields.shellStatus ?? null,
    layerStatus: fields.layerStatus ?? null,
    sceneStatus: fields.sceneStatus ?? null,
    transition,
  });
  if (stateSnapshots.length > 100) stateSnapshots = stateSnapshots.slice(-100);
  heartbeat.lastStateTransition = transition;
  heartbeat.lastStateTransitionAt = now;
  pushTimeline(transition, 'state', 'snapshot');
  notify();
}

export function setShellDependencies(nodes: ShellDependencyNode[]): void {
  if (!enabled()) return;
  dependencies = nodes;
  notify();
}

export function recordShellError(input: {
  message: string;
  cause?: string | null;
  nestedCause?: string | null;
  stack?: string | null;
  category: string;
  sourceFile: string;
  functionName: string;
  traceId?: string | null;
}): void {
  if (!enabled()) return;
  errorSeq += 1;
  const now = Date.now();
  const forensic = getLastGenerationRequestHttpForensic();
  errors.push({
    id: errorSeq,
    timestamp: now,
    isoTime: new Date(now).toISOString(),
    message: input.message,
    cause: input.cause ?? null,
    nestedCause: input.nestedCause ?? null,
    stack: input.stack?.slice(0, 2000) ?? null,
    category: input.category,
    sourceFile: input.sourceFile,
    functionName: input.functionName,
    traceId: input.traceId ?? forensic?.parsedCode ?? null,
  });
  if (errors.length > MAX_ERRORS) errors = errors.slice(-MAX_ERRORS);
  pushTimeline(input.message, 'error', input.category, input.functionName);
  notify();
}

export function completeShellFoundationRun(ok: boolean, detail?: string): void {
  if (!enabled()) return;
  pipelineComplete = true;
  pipelineOk = ok;
  recordShellStage('return-shell', ok ? 'success' : 'failed', { detail });
  pushTimeline(ok ? 'Shell pipeline complete' : 'Shell pipeline failed', 'stage', ok ? 'success' : 'failed', detail);
  recordShellStateSnapshot('run-complete', {
    pipelinePhase: ok ? 'shell-ready' : 'shell-failed',
    shellStatus: ok ? 'ready' : 'failed',
  });
  detectStalls();
  notify();
}

export function buildShellFoundationBlackBoxState(): ShellFoundationBlackBoxState {
  const detectStarted = Date.now();
  detectStalls();
  recordRssDerivedState({ detectStallsDurationMs: Date.now() - detectStarted });
  const dispatchStarted = Date.now();
  const dispatchDesk = buildGenerateShellDispatchDeskState();
  recordRssDerivedState({ dispatchDeskBuildDurationMs: Date.now() - dispatchStarted });
  return {
    recordShellStageForensic: buildRecordShellStageForensicState(),
    dispatchDesk,
    runStartedAt,
    runContext: { ...runContext },
    stages: SHELL_FOUNDATION_STAGE_DEFS.map((def) => stages.get(def.id)!).filter(Boolean),
    functionTraces: [...functionTraces],
    awaitTracks: [...awaitTracks],
    network: [...networkRecords],
    stateSnapshots: [...stateSnapshots],
    dependencies: [...dependencies],
    errors: [...errors],
    heartbeat: { ...heartbeat },
    stallSignals: [...stallSignals],
    timeline: [...timeline],
    lastSuccessfulStageId,
    lastVisibleEvent,
    pipelineComplete,
    pipelineOk,
  };
}

export function exportShellFoundationBlackBoxJson(): string {
  return JSON.stringify(buildShellFoundationBlackBoxState(), null, 2);
}

export async function copyShellFoundationBlackBox(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(exportShellFoundationBlackBoxJson());
    return true;
  } catch {
    return false;
  }
}

/** Wrap async work with await + function tracing — no behavior change when diagnostics off. */
export async function traceShellAsync<T>(
  stageId: ShellFoundationStageId,
  functionName: string,
  file: string,
  execute: () => Promise<T>,
  options?: { expectedTimeoutMs?: number; awaitLabel?: string }
): Promise<T> {
  if (!enabled()) return execute();

  if (functionName === 'generateShellPublicUrl') {
    markGspuWrapperInvocation({ callerFunction: functionName, callerFile: file, stageId });
  }

  recordShellFunctionEnter(functionName, file, { stageId, source: 'traceShellAsync-wrapper' });
  recordShellStage(stageId, 'running');
  const awaitId = beginShellAwait(options?.awaitLabel ?? stageId, functionName, options?.expectedTimeoutMs ?? null);
  try {
    const result = await execute();
    endShellAwait(awaitId, 'resolved');
    recordShellStage(stageId, 'success');
    recordShellFunctionExit(functionName, file);
    return result;
  } catch (err) {
    endShellAwait(awaitId, 'rejected', err instanceof Error ? err.message : String(err));
    recordShellStage(stageId, 'failed', {
      detail: err instanceof Error ? err.message : String(err),
    });
    recordShellFunctionThrow(functionName, file, err);
    throw err;
  }
}

export function recordShellGenerationNetworkFromForensic(): void {
  if (!enabled()) return;
  const forensic = getLastGenerationRequestHttpForensic();
  if (!forensic) return;
  recordShellNetwork({
    method: 'POST',
    route: forensic.endpoint,
    status: forensic.httpStatus,
    durationMs: forensic.elapsedMs,
    responseSize: forensic.responseBodyLength,
    error: forensic.synthesizedUserMessage,
    timeout: false,
    cancelled: false,
    traceId: forensic.parsedCode ?? null,
  });
}

loadShellFoundationBlackBoxFromSession();
