/**
 * recordShellStage job-board forensics — compilerDiag=1 only.
 * Observe-only: does not change store behavior, subscribers, or persistence contracts.
 */
import { isWorldCompilerDiagnosticMode } from './diagnostic-mode';

export type RssMicroMarkerId =
  | 'RSS-01-enter'
  | 'RSS-01b-enabled-guard'
  | 'RSS-02-locate-stage-def'
  | 'RSS-03-get-existing-stage'
  | 'RSS-04-mutate-stage'
  | 'RSS-05-stages-set'
  | 'RSS-06-push-timeline'
  | 'RSS-07-heartbeat-update'
  | 'RSS-08-detect-stalls'
  | 'RSS-09-notify-enter'
  | 'RSS-09a-persist-enter'
  | 'RSS-09a1-build-snapshot'
  | 'RSS-09a2-json-stringify'
  | 'RSS-09a3-session-storage-write'
  | 'RSS-09a-persist-exit'
  | 'RSS-09b-subscriber-notify'
  | 'RSS-09-notify-exit'
  | 'RSS-10-return';

export type RssMicroMarkerStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export type RssMicroMarkerRecord = {
  markerId: RssMicroMarkerId;
  label: string;
  enteredAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
  status: RssMicroMarkerStatus;
  compileRunId: string | null;
  invocationId: string | null;
  parentInvocationId: string | null;
  stageId: string | null;
  stageStatus: string | null;
  callDepth: number;
  reentrancyDepth: number;
  subscriberCount: number;
  persistenceEnabled: boolean;
  resultSummary: string | null;
  errorSummary: string | null;
};

export type RssReentrancyClassification =
  | 'A-no-reentrancy'
  | 'B-expected-nested-instrumentation'
  | 'C-direct-recursion'
  | 'D-subscriber-induced-recursion'
  | 'E-persistence-induced-recursion'
  | 'F-derived-state-feedback-loop'
  | 'G-other';

export type RssSubscriberForensic = {
  subscriberId: string;
  sourceLabel: string;
  subscribedAt: number;
  callbackEntered: boolean;
  callbackExited: boolean;
  durationMs: number | null;
  threw: boolean;
  callsStoreMutation: boolean;
  callsRecordShellStage: boolean;
  writesSessionStorage: boolean;
  triggersExportComputation: boolean;
  triggersStallClassification: boolean;
  reactRenderOnly: boolean;
};

export type RssPersistenceForensic = {
  storageKey: string | null;
  payloadByteSize: number | null;
  serializationDurationMs: number | null;
  storageWriteDurationMs: number | null;
  serializationStarted: boolean;
  serializationCompleted: boolean;
  storageWriteStarted: boolean;
  storageWriteCompleted: boolean;
  quotaError: boolean;
  circularReferenceError: boolean;
  storageException: string | null;
  persistencePhase: string | null;
};

export type RssDerivedStateForensic = {
  phase: string | null;
  buildSnapshotDurationMs: number | null;
  detectStallsDurationMs: number | null;
  dispatchDeskBuildDurationMs: number | null;
  stallClassificationDurationMs: number | null;
  feedbackLoopDetected: boolean;
};

export type RssReactStoreForensic = {
  getSnapshotStarted: boolean;
  getSnapshotCompleted: boolean;
  getSnapshotDurationMs: number | null;
  subscriberNotificationCount: number;
  panelMounted: boolean;
  renderLoopCount: number;
};

export type RssStallClassification =
  | 'A-stage-lookup'
  | 'B-stage-mutation'
  | 'C-timeline-append'
  | 'D-serialization'
  | 'E-session-storage-write'
  | 'F-subscriber-notification'
  | 'G-subscriber-callback'
  | 'H-reentrant-recursion'
  | 'I-derived-state-feedback-loop'
  | 'J-react-external-store-snapshot'
  | 'K-other';

export type RecordShellStageForensicState = {
  markers: RssMicroMarkerRecord[];
  currentMicroMarkerId: RssMicroMarkerId | null;
  lastSuccessfulMicroMarkerId: RssMicroMarkerId | null;
  activeInvocationCount: number;
  reentrancyDepth: number;
  reentrancyClassification: RssReentrancyClassification | null;
  recursionCount: number;
  recordShellStageReturned: boolean | null;
  currentSubscriberId: string | null;
  slowestSubscriberId: string | null;
  slowestSubscriberDurationMs: number | null;
  subscribers: RssSubscriberForensic[];
  persistence: RssPersistenceForensic;
  derivedState: RssDerivedStateForensic;
  reactStore: RssReactStoreForensic;
  rssStallClassification: RssStallClassification | null;
  rssStallClassificationDetail: string | null;
  lastStateTransition: string | null;
  lastStateTransitionAt: number | null;
};

const MARKER_DEFS: ReadonlyArray<{ id: RssMicroMarkerId; label: string }> = [
  { id: 'RSS-01-enter', label: 'Enter recordShellStage' },
  { id: 'RSS-01b-enabled-guard', label: 'Diagnostic enabled guard' },
  { id: 'RSS-02-locate-stage-def', label: 'Locate stage definition' },
  { id: 'RSS-03-get-existing-stage', label: 'Get existing stage record' },
  { id: 'RSS-04-mutate-stage', label: 'Mutate stage fields' },
  { id: 'RSS-05-stages-set', label: 'stages.set(id, existing)' },
  { id: 'RSS-06-push-timeline', label: 'pushTimeline' },
  { id: 'RSS-07-heartbeat-update', label: 'heartbeat.lastStateTransition update' },
  { id: 'RSS-08-detect-stalls', label: 'detectStalls' },
  { id: 'RSS-09-notify-enter', label: 'notify() enter' },
  { id: 'RSS-09a-persist-enter', label: 'persist() enter' },
  { id: 'RSS-09a1-build-snapshot', label: 'buildShellFoundationBlackBoxState' },
  { id: 'RSS-09a2-json-stringify', label: 'JSON.stringify snapshot' },
  { id: 'RSS-09a3-session-storage-write', label: 'sessionStorage.setItem' },
  { id: 'RSS-09a-persist-exit', label: 'persist() exit' },
  { id: 'RSS-09b-subscriber-notify', label: 'Subscriber callback iteration' },
  { id: 'RSS-09-notify-exit', label: 'notify() exit' },
  { id: 'RSS-10-return', label: 'recordShellStage return' },
];

let invocationSeq = 0;
let activeInvocations: string[] = [];
let recursionCount = 0;
let recordShellStageReturned: boolean | null = null;
let runContext: { compileRunId: string | null; invocationId: string | null } = {
  compileRunId: null,
  invocationId: null,
};
let markers = new Map<RssMicroMarkerId, RssMicroMarkerRecord>();
let currentMicroMarkerId: RssMicroMarkerId | null = null;
let lastSuccessfulMicroMarkerId: RssMicroMarkerId | null = null;
let lastStateTransition: string | null = null;
let lastStateTransitionAt: number | null = null;
let subscribers = new Map<string, RssSubscriberForensic>();
let subscriberSeq = 0;
let currentSubscriberId: string | null = null;
let slowestSubscriberId: string | null = null;
let slowestSubscriberDurationMs: number | null = null;
let persistence: RssPersistenceForensic = defaultPersistence();
let derivedState: RssDerivedStateForensic = defaultDerived();
let reactStore: RssReactStoreForensic = defaultReactStore();
let reentrancyClassification: RssReentrancyClassification | null = null;
let currentStageContext: { stageId: string | null; stageStatus: string | null } = {
  stageId: null,
  stageStatus: null,
};

/** Test-only: skip subscriber iteration for controlled comparison. */
let forensicSkipSubscribers = false;

function enabled(): boolean {
  return isWorldCompilerDiagnosticMode();
}

function defaultPersistence(): RssPersistenceForensic {
  return {
    storageKey: null,
    payloadByteSize: null,
    serializationDurationMs: null,
    storageWriteDurationMs: null,
    serializationStarted: false,
    serializationCompleted: false,
    storageWriteStarted: false,
    storageWriteCompleted: false,
    quotaError: false,
    circularReferenceError: false,
    storageException: null,
    persistencePhase: null,
  };
}

function defaultDerived(): RssDerivedStateForensic {
  return {
    phase: null,
    buildSnapshotDurationMs: null,
    detectStallsDurationMs: null,
    dispatchDeskBuildDurationMs: null,
    stallClassificationDurationMs: null,
    feedbackLoopDetected: false,
  };
}

function defaultReactStore(): RssReactStoreForensic {
  return {
    getSnapshotStarted: false,
    getSnapshotCompleted: false,
    getSnapshotDurationMs: null,
    subscriberNotificationCount: 0,
    panelMounted: false,
    renderLoopCount: 0,
  };
}

function initMarkers(): void {
  markers = new Map(
    MARKER_DEFS.map((def) => [
      def.id,
      {
        markerId: def.id,
        label: def.label,
        enteredAt: null,
        completedAt: null,
        durationMs: null,
        status: 'pending',
        compileRunId: runContext.compileRunId,
        invocationId: null,
        parentInvocationId: null,
        stageId: null,
        stageStatus: null,
        callDepth: 0,
        reentrancyDepth: 0,
        subscriberCount: subscribers.size,
        persistenceEnabled: enabled(),
        resultSummary: null,
        errorSummary: null,
      },
    ])
  );
}

function transition(label: string): void {
  lastStateTransition = label;
  lastStateTransitionAt = Date.now();
}

export function resetRecordShellStageForensic(): void {
  invocationSeq = 0;
  activeInvocations = [];
  recursionCount = 0;
  recordShellStageReturned = null;
  currentMicroMarkerId = null;
  lastSuccessfulMicroMarkerId = null;
  lastStateTransition = null;
  lastStateTransitionAt = null;
  subscribers.clear();
  subscriberSeq = 0;
  currentSubscriberId = null;
  slowestSubscriberId = null;
  slowestSubscriberDurationMs = null;
  persistence = defaultPersistence();
  derivedState = defaultDerived();
  reactStore = defaultReactStore();
  reentrancyClassification = null;
  forensicSkipSubscribers = false;
  initMarkers();
}

export function bindRecordShellStageForensicContext(ctx: {
  compileRunId: string;
  invocationId?: string | null;
}): void {
  if (!enabled()) return;
  runContext = { compileRunId: ctx.compileRunId, invocationId: ctx.invocationId ?? null };
  resetRecordShellStageForensic();
}

export function setRecordShellStageForensicTestOptions(opts: { skipSubscribers?: boolean }): void {
  forensicSkipSubscribers = opts.skipSubscribers ?? false;
}

export function registerRssSubscriber(sourceLabel: string): string {
  if (!enabled()) return '';
  subscriberSeq += 1;
  const id = `rss-sub-${subscriberSeq}`;
  subscribers.set(id, {
    subscriberId: id,
    sourceLabel,
    subscribedAt: Date.now(),
    callbackEntered: false,
    callbackExited: false,
    durationMs: null,
    threw: false,
    callsStoreMutation: false,
    callsRecordShellStage: false,
    writesSessionStorage: false,
    triggersExportComputation: true,
    triggersStallClassification: false,
    reactRenderOnly: sourceLabel.includes('ShellFoundationBlackBoxPanel'),
  });
  if (sourceLabel.includes('ShellFoundationBlackBoxPanel')) {
    reactStore.panelMounted = true;
  }
  return id;
}

export function unregisterRssSubscriber(subscriberId: string): void {
  subscribers.delete(subscriberId);
}

export function beginRecordShellStageInvocation(stageId: string, stageStatus: string): string {
  if (!enabled()) return '';
  invocationSeq += 1;
  const invocationId = `rss-inv-${invocationSeq}`;
  const parentInvocationId = activeInvocations[activeInvocations.length - 1] ?? null;
  const reentrancyDepth = activeInvocations.length;
  activeInvocations.push(invocationId);
  currentStageContext = { stageId, stageStatus };
  recordShellStageReturned = false;

  if (reentrancyDepth > 0) {
    recursionCount += 1;
    if (currentSubscriberId) {
      reentrancyClassification = 'D-subscriber-induced-recursion';
      markRssSubscriberMutation(currentSubscriberId, 'recordShellStage');
    } else if (reentrancyDepth === 1) {
      reentrancyClassification = 'B-expected-nested-instrumentation';
    } else {
      reentrancyClassification = 'C-direct-recursion';
    }
  } else {
    reentrancyClassification = 'A-no-reentrancy';
  }

  recordRssMicroMarker('RSS-01-enter', 'running', {
    invocationId,
    parentInvocationId,
    reentrancyDepth,
    stageId,
    stageStatus,
  });
  return invocationId;
}

export function endRecordShellStageInvocation(invocationId: string): void {
  if (!enabled() || !invocationId) return;
  recordRssMicroMarker('RSS-10-return', 'success', { invocationId, resultSummary: 'returned' });
  recordShellStageReturned = true;
  const idx = activeInvocations.lastIndexOf(invocationId);
  if (idx >= 0) activeInvocations.splice(idx, 1);
}

export function recordRssMicroMarker(
  id: RssMicroMarkerId,
  status: RssMicroMarkerStatus,
  detail?: {
    invocationId?: string;
    parentInvocationId?: string | null;
    reentrancyDepth?: number;
    stageId?: string;
    stageStatus?: string;
    resultSummary?: string;
    errorSummary?: string;
    subscriberCount?: number;
  }
): void {
  if (!enabled()) return;
  const def = MARKER_DEFS.find((m) => m.id === id);
  const now = Date.now();
  const existing = markers.get(id) ?? {
    markerId: id,
    label: def?.label ?? id,
    enteredAt: null,
    completedAt: null,
    durationMs: null,
    status: 'pending' as RssMicroMarkerStatus,
    compileRunId: runContext.compileRunId,
    invocationId: detail?.invocationId ?? runContext.invocationId,
    parentInvocationId: detail?.parentInvocationId ?? null,
    stageId: detail?.stageId ?? currentStageContext.stageId,
    stageStatus: detail?.stageStatus ?? currentStageContext.stageStatus,
    callDepth: detail?.reentrancyDepth ?? activeInvocations.length,
    reentrancyDepth: detail?.reentrancyDepth ?? activeInvocations.length,
    subscriberCount: detail?.subscriberCount ?? subscribers.size,
    persistenceEnabled: enabled(),
    resultSummary: null,
    errorSummary: null,
  };

  if (status === 'running') {
    existing.status = 'running';
    existing.enteredAt = now;
    currentMicroMarkerId = id;
  } else {
    existing.status = status;
    existing.completedAt = now;
    if (existing.enteredAt) existing.durationMs = now - existing.enteredAt;
    if (status === 'success') lastSuccessfulMicroMarkerId = id;
    if (currentMicroMarkerId === id) currentMicroMarkerId = null;
  }

  if (detail?.resultSummary) existing.resultSummary = detail.resultSummary;
  if (detail?.errorSummary) existing.errorSummary = detail.errorSummary;
  if (detail?.invocationId) existing.invocationId = detail.invocationId;
  if (detail?.subscriberCount != null) existing.subscriberCount = detail.subscriberCount;
  markers.set(id, existing);
  transition(`${id} → ${status}`);
}

export function recordRssPersistence(partial: Partial<RssPersistenceForensic>): void {
  if (!enabled()) return;
  persistence = { ...persistence, ...partial };
}

export function recordRssDerivedState(partial: Partial<RssDerivedStateForensic>): void {
  if (!enabled()) return;
  derivedState = { ...derivedState, ...partial };
  if (partial.feedbackLoopDetected) {
    reentrancyClassification = 'F-derived-state-feedback-loop';
  }
}

export function recordRssReactStore(partial: Partial<RssReactStoreForensic>): void {
  if (!enabled()) return;
  reactStore = { ...reactStore, ...partial };
}

export function beginRssSubscriberCallback(subscriberId: string): void {
  if (!enabled()) return;
  currentSubscriberId = subscriberId;
  const sub = subscribers.get(subscriberId);
  if (sub) {
    sub.callbackEntered = true;
    sub.callbackExited = false;
    (sub as RssSubscriberForensic & { _startedAt?: number })._startedAt = Date.now();
  }
}

export function endRssSubscriberCallback(subscriberId: string, threw = false): void {
  if (!enabled()) return;
  const sub = subscribers.get(subscriberId);
  const started = (sub as RssSubscriberForensic & { _startedAt?: number })?._startedAt;
  const duration = started ? Date.now() - started : null;
  if (sub) {
    sub.callbackExited = !threw;
    sub.threw = threw;
    sub.durationMs = duration;
  }
  if (duration != null && (slowestSubscriberDurationMs == null || duration > slowestSubscriberDurationMs)) {
    slowestSubscriberDurationMs = duration;
    slowestSubscriberId = subscriberId;
  }
  if (currentSubscriberId === subscriberId) currentSubscriberId = null;
}

export function markRssSubscriberMutation(subscriberId: string, kind: 'recordShellStage' | 'sessionStorage'): void {
  const sub = subscribers.get(subscriberId);
  if (!sub) return;
  if (kind === 'recordShellStage') {
    sub.callsRecordShellStage = true;
    reentrancyClassification = 'D-subscriber-induced-recursion';
  }
  if (kind === 'sessionStorage') sub.writesSessionStorage = true;
}

export function classifyRssStall(): { classification: RssStallClassification; detail: string } {
  const running = [...markers.values()].filter((m) => m.status === 'running');
  const lastRunning = running[running.length - 1];
  const id = lastRunning?.markerId ?? currentMicroMarkerId;

  if (!id) return { classification: 'K-other', detail: 'No running RSS marker' };

  if (id === 'RSS-02-locate-stage-def' || id === 'RSS-03-get-existing-stage') {
    return { classification: 'A-stage-lookup', detail: id };
  }
  if (id === 'RSS-04-mutate-stage' || id === 'RSS-05-stages-set') {
    return { classification: 'B-stage-mutation', detail: id };
  }
  if (id === 'RSS-06-push-timeline') {
    return { classification: 'C-timeline-append', detail: id };
  }
  if (id === 'RSS-09a2-json-stringify') {
    return { classification: 'D-serialization', detail: persistence.storageException ?? 'JSON.stringify pending' };
  }
  if (id === 'RSS-09a3-session-storage-write') {
    return { classification: 'E-session-storage-write', detail: persistence.storageException ?? 'sessionStorage write pending' };
  }
  if (id === 'RSS-09b-subscriber-notify' || id === 'RSS-09-notify-enter') {
    return { classification: 'F-subscriber-notification', detail: `subscribers=${subscribers.size}` };
  }
  if (currentSubscriberId) {
    return { classification: 'G-subscriber-callback', detail: `subscriber=${currentSubscriberId}` };
  }
  if (reentrancyClassification === 'C-direct-recursion' || reentrancyClassification === 'D-subscriber-induced-recursion') {
    return { classification: 'H-reentrant-recursion', detail: reentrancyClassification };
  }
  if (
    reentrancyClassification === 'F-derived-state-feedback-loop' ||
    id === 'RSS-09a1-build-snapshot'
  ) {
    if (id === 'RSS-09a1-build-snapshot' && reactStore.getSnapshotStarted && !reactStore.getSnapshotCompleted) {
      return { classification: 'J-react-external-store-snapshot', detail: 'getSnapshot pending' };
    }
    return { classification: 'I-derived-state-feedback-loop', detail: derivedState.phase ?? id };
  }
  if (id.startsWith('RSS-09')) {
    return { classification: 'F-subscriber-notification', detail: id };
  }

  return { classification: 'K-other', detail: `Unhandled RSS marker ${id}` };
}

export function restoreRecordShellStageForensicFromSnapshot(snapshot: RecordShellStageForensicState): void {
  if (!snapshot) return;
  markers = new Map((snapshot.markers ?? []).map((m) => [m.markerId, { ...m }]));
  for (const def of MARKER_DEFS) {
    if (!markers.has(def.id)) {
      markers.set(def.id, {
        markerId: def.id,
        label: def.label,
        enteredAt: null,
        completedAt: null,
        durationMs: null,
        status: 'pending',
        compileRunId: runContext.compileRunId,
        invocationId: null,
        parentInvocationId: null,
        stageId: null,
        stageStatus: null,
        callDepth: 0,
        reentrancyDepth: 0,
        subscriberCount: 0,
        persistenceEnabled: enabled(),
        resultSummary: null,
        errorSummary: null,
      });
    }
  }
  currentMicroMarkerId = snapshot.currentMicroMarkerId;
  lastSuccessfulMicroMarkerId = snapshot.lastSuccessfulMicroMarkerId;
  activeInvocations = [];
  recursionCount = snapshot.recursionCount;
  recordShellStageReturned = snapshot.recordShellStageReturned;
  reentrancyClassification = snapshot.reentrancyClassification;
  subscribers = new Map((snapshot.subscribers ?? []).map((s) => [s.subscriberId, { ...s }]));
  persistence = { ...defaultPersistence(), ...snapshot.persistence };
  derivedState = { ...defaultDerived(), ...snapshot.derivedState };
  reactStore = { ...defaultReactStore(), ...snapshot.reactStore };
  slowestSubscriberId = snapshot.slowestSubscriberId;
  slowestSubscriberDurationMs = snapshot.slowestSubscriberDurationMs;
  lastStateTransition = snapshot.lastStateTransition;
  lastStateTransitionAt = snapshot.lastStateTransitionAt;
}

export function buildRecordShellStageForensicState(): RecordShellStageForensicState {
  const hasRunning = [...markers.values()].some((m) => m.status === 'running');
  const stall = classifyRssStall();

  return {
    markers: MARKER_DEFS.map((d) => markers.get(d.id)!).filter(Boolean),
    currentMicroMarkerId: hasRunning ? currentMicroMarkerId : null,
    lastSuccessfulMicroMarkerId,
    activeInvocationCount: activeInvocations.length,
    reentrancyDepth: activeInvocations.length,
    reentrancyClassification,
    recursionCount,
    recordShellStageReturned,
    currentSubscriberId,
    slowestSubscriberId,
    slowestSubscriberDurationMs,
    subscribers: [...subscribers.values()],
    persistence: { ...persistence },
    derivedState: { ...derivedState },
    reactStore: { ...reactStore },
    rssStallClassification: hasRunning || !recordShellStageReturned ? stall.classification : null,
    rssStallClassificationDetail: hasRunning || !recordShellStageReturned ? stall.detail : null,
    lastStateTransition,
    lastStateTransitionAt,
  };
}

export function shouldSkipRssSubscribersForTest(): boolean {
  return forensicSkipSubscribers;
}

export function incrementRssSubscriberNotificationCount(): void {
  if (!enabled()) return;
  reactStore = { ...reactStore, subscriberNotificationCount: reactStore.subscriberNotificationCount + 1 };
}

export function incrementRssRenderLoopCount(): void {
  if (!enabled()) return;
  reactStore = { ...reactStore, renderLoopCount: reactStore.renderLoopCount + 1 };
}

/** Test-only */
export function __testRssActiveInvocationCount(): number {
  return activeInvocations.length;
}
