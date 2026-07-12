/**
 * Generate Shell Public URL — Dispatch Desk forensics (compilerDiag=1 only).
 * Observe-only: does not change shell behavior, timing, retries, or API contracts.
 */
import { isWorldCompilerDiagnosticMode } from './diagnostic-mode';
import {
  buildGenerateShellPackageMicroTraceState,
  classifyGspuMicroStall,
  isKnownInstrumentationWrapperPair,
  resetGenerateShellPackageMicroTrace,
  restoreGenerateShellPackageMicroTraceFromSnapshot,
  type GenerateShellPackageMicroTraceState,
} from './generate-shell-package-micro-trace';
import {
  buildRecordShellStageForensicState,
  classifyRssStall,
} from './record-shell-stage-forensic';

export type GspuSubStageId =
  | 'GSPU-01-enter'
  | 'GSPU-02-stage-create-shell-request'
  | 'GSPU-03-resolve-package'
  | 'GSPU-04-build-payload'
  | 'GSPU-05-auth-attach'
  | 'GSPU-06-request-helper-enter'
  | 'GSPU-07-token-ensure-enter'
  | 'GSPU-08-token-get-first'
  | 'GSPU-09-token-refresh'
  | 'GSPU-10-token-get-second'
  | 'GSPU-11-token-ensure-return'
  | 'GSPU-11b-token-missing'
  | 'GSPU-12-endpoint-resolve'
  | 'GSPU-13-headers-body-prep'
  | 'GSPU-14-fetch-about-to-start'
  | 'GSPU-15-fetch-started'
  | 'GSPU-16-fetch-response'
  | 'GSPU-17-response-text'
  | 'GSPU-18-response-parse'
  | 'GSPU-19-forensic-record'
  | 'GSPU-20-api-return'
  | 'GSPU-21-network-forensic'
  | 'GSPU-22-result-validate'
  | 'GSPU-23-canvas-fallback'
  | 'GSPU-24-return';

export type GspuSubStageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export type GspuSubStageRecord = {
  subStageId: GspuSubStageId;
  label: string;
  category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';
  enteredAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
  status: GspuSubStageStatus;
  detail: string | null;
  traceId: string | null;
  compileRunId: string | null;
  stationId: string | null;
  requestKey: string | null;
  surface: string | null;
};

export type GspuInvocationRecord = {
  invocationId: string;
  parentInvocationId: string | null;
  callerFunction: string;
  callerFile: string;
  callDepth: number;
  enteredAt: number;
  completedAt: number | null;
  compileRunId: string | null;
  requestKey: string | null;
  source: 'traceShellAsync-wrapper' | 'function-body' | 'requestStudioBuilderGenerate' | 'unknown';
  stackSnippet: string | null;
  duplicateEntryClassification: GspuDuplicateClassification | null;
};

export type GspuDuplicateClassification =
  | 'A-duplicate-instrumentation-wrapper'
  | 'B-same-caller-twice'
  | 'C-two-callers'
  | 'D-recursive-nested'
  | 'E-reentrant-retry'
  | 'F-wrapper-plus-inner'
  | 'G-other';

export type GspuPromiseForensic = {
  promiseKey: string;
  created: boolean;
  reused: boolean;
  owner: string;
  createdAt: number | null;
  ageMs: number | null;
  state: 'pending' | 'fulfilled' | 'rejected' | 'none';
  sharedByInvocations: string[];
  cleanupOccurred: boolean;
  detail: string | null;
};

export type GspuAuthorizationForensic = {
  authorizationRequired: boolean;
  authorizationMode: string;
  productionAuthorizationIdPresent: boolean;
  ephemeralAuthorizationRequested: boolean;
  cachedAuthorizationReused: boolean;
  authorizationHelperEntered: boolean;
  authorizationHelperReturned: boolean;
  authorizationEndpointCalled: boolean;
  authorizationResult: string | null;
  authorizationError: string | null;
  authorizationWaitDurationMs: number | null;
  tokenEnsureEntered: boolean;
  tokenEnsureReturned: boolean;
  tokenPresent: boolean | null;
};

export type GspuFetchForensic = {
  requestHelperEntered: boolean;
  endpoint: string | null;
  method: string | null;
  headersPrepared: boolean;
  bodySerialized: boolean;
  fetchAboutToStart: boolean;
  fetchStarted: boolean;
  fetchResolved: boolean;
  fetchRejected: boolean;
  responseStatus: number | null;
  contentType: string | null;
  responseBodyParseStarted: boolean;
  responseBodyParseCompleted: boolean;
  responseBodyParseFailed: boolean;
  lastPreFetchStep: GspuSubStageId | null;
};

export type GspuStallClassification =
  | 'A-input-validation-wait'
  | 'B-context-preparation-wait'
  | 'C-authorization-wait'
  | 'D-in-flight-promise-deadlock'
  | 'E-request-deduplication-lock'
  | 'F-request-helper-never-returns'
  | 'G-fetch-never-invoked'
  | 'H-fetch-pending'
  | 'I-response-parsing-pending'
  | 'J-duplicate-invocation-collision'
  | 'K-lost-event-deferred-resolution'
  | 'L-other';

export type GenerateShellDispatchDeskState = {
  packageMicroTrace: GenerateShellPackageMicroTraceState;
  invocations: GspuInvocationRecord[];
  subStages: GspuSubStageRecord[];
  currentSubStageId: GspuSubStageId | null;
  lastSuccessfulSubStageId: GspuSubStageId | null;
  currentAwaitLabel: string | null;
  promiseForensic: GspuPromiseForensic | null;
  authorization: GspuAuthorizationForensic;
  fetch: GspuFetchForensic;
  stallClassification: GspuStallClassification | null;
  stallClassificationDetail: string | null;
  elapsedMs: number | null;
  lastStateTransition: string | null;
  lastStateTransitionAt: number | null;
  duplicateCallDetected: boolean;
  duplicateCallExplanation: string | null;
};

const SUB_STAGE_DEFS: ReadonlyArray<{
  id: GspuSubStageId;
  label: string;
  category: GspuSubStageRecord['category'];
}> = [
  { id: 'GSPU-01-enter', label: 'Enter generateShellPublicUrl', category: 'A' },
  { id: 'GSPU-02-stage-create-shell-request', label: 'Stage create-shell-request running', category: 'B' },
  { id: 'GSPU-03-resolve-package', label: 'Resolve department package', category: 'B' },
  { id: 'GSPU-04-build-payload', label: 'Build generation payload', category: 'E' },
  { id: 'GSPU-05-auth-attach', label: 'Attach validation ephemeral auth', category: 'C' },
  { id: 'GSPU-06-request-helper-enter', label: 'Enter requestStudioBuilderGenerate', category: 'F' },
  { id: 'GSPU-07-token-ensure-enter', label: 'Enter ensureApiAccessToken', category: 'C' },
  { id: 'GSPU-08-token-get-first', label: 'Await getAccessToken (first)', category: 'C' },
  { id: 'GSPU-09-token-refresh', label: 'Await refreshSupabaseSessionOnce', category: 'C' },
  { id: 'GSPU-10-token-get-second', label: 'Await getAccessToken (second)', category: 'C' },
  { id: 'GSPU-11-token-ensure-return', label: 'ensureApiAccessToken returned', category: 'C' },
  { id: 'GSPU-11b-token-missing', label: 'Token missing — early return', category: 'C' },
  { id: 'GSPU-12-endpoint-resolve', label: 'Resolve endpoint', category: 'F' },
  { id: 'GSPU-13-headers-body-prep', label: 'Prepare headers and body', category: 'F' },
  { id: 'GSPU-14-fetch-about-to-start', label: 'Fetch about to start', category: 'G' },
  { id: 'GSPU-15-fetch-started', label: 'Fetch started', category: 'G' },
  { id: 'GSPU-16-fetch-response', label: 'Fetch response received', category: 'H' },
  { id: 'GSPU-17-response-text', label: 'Await response text', category: 'H' },
  { id: 'GSPU-18-response-parse', label: 'Parse response JSON', category: 'I' },
  { id: 'GSPU-19-forensic-record', label: 'Record HTTP forensic', category: 'I' },
  { id: 'GSPU-20-api-return', label: 'requestStudioBuilderGenerate returned', category: 'F' },
  { id: 'GSPU-21-network-forensic', label: 'Record shell network forensic', category: 'I' },
  { id: 'GSPU-22-result-validate', label: 'Validate API result', category: 'J' },
  { id: 'GSPU-23-canvas-fallback', label: 'Canvas fallback render', category: 'K' },
  { id: 'GSPU-24-return', label: 'Return from generateShellPublicUrl', category: 'K' },
];

let invocationSeq = 0;
let runContext: {
  compileRunId: string | null;
  stationId: string | null;
  surface: string | null;
  requestKey: string | null;
} = {
  compileRunId: null,
  stationId: null,
  surface: 'experience-lab-validation',
  requestKey: null,
};
let runStartedAt: number | null = null;
let invocations: GspuInvocationRecord[] = [];
let subStages = new Map<GspuSubStageId, GspuSubStageRecord>();
let activeInvocationId: string | null = null;
let wrapperInvocationId: string | null = null;
let currentSubStageId: GspuSubStageId | null = null;
let lastSuccessfulSubStageId: GspuSubStageId | null = null;
let currentAwaitLabel: string | null = null;
let promiseForensic: GspuPromiseForensic | null = null;
let authorization: GspuAuthorizationForensic = defaultAuth();
let fetchForensic: GspuFetchForensic = defaultFetch();
let lastStateTransition: string | null = null;
let lastStateTransitionAt: number | null = null;

/** Module-level in-flight tracking for requestStudioBuilderGenerate (observe-only). */
const inFlightRequests = new Map<string, { promise: Promise<unknown>; createdAt: number; owner: string }>();

function enabled(): boolean {
  return isWorldCompilerDiagnosticMode();
}

function defaultAuth(): GspuAuthorizationForensic {
  return {
    authorizationRequired: true,
    authorizationMode: 'server-issued-ephemeral',
    productionAuthorizationIdPresent: false,
    ephemeralAuthorizationRequested: true,
    cachedAuthorizationReused: false,
    authorizationHelperEntered: false,
    authorizationHelperReturned: false,
    authorizationEndpointCalled: false,
    authorizationResult: null,
    authorizationError: null,
    authorizationWaitDurationMs: null,
    tokenEnsureEntered: false,
    tokenEnsureReturned: false,
    tokenPresent: null,
  };
}

function defaultFetch(): GspuFetchForensic {
  return {
    requestHelperEntered: false,
    endpoint: null,
    method: null,
    headersPrepared: false,
    bodySerialized: false,
    fetchAboutToStart: false,
    fetchStarted: false,
    fetchResolved: false,
    fetchRejected: false,
    responseStatus: null,
    contentType: null,
    responseBodyParseStarted: false,
    responseBodyParseCompleted: false,
    responseBodyParseFailed: false,
    lastPreFetchStep: null,
  };
}

function initSubStages(): void {
  subStages = new Map(
    SUB_STAGE_DEFS.map((def) => [
      def.id,
      {
        subStageId: def.id,
        label: def.label,
        category: def.category,
        enteredAt: null,
        completedAt: null,
        durationMs: null,
        status: 'pending',
        detail: null,
        traceId: null,
        compileRunId: runContext.compileRunId,
        stationId: runContext.stationId,
        requestKey: runContext.requestKey,
        surface: runContext.surface,
      },
    ])
  );
}

function safeStackSnippet(): string | null {
  try {
    const stack = new Error().stack;
    if (!stack) return null;
    const lines = stack.split('\n').slice(2, 6);
    return lines.join(' | ').slice(0, 400);
  } catch {
    return null;
  }
}

function transition(label: string): void {
  lastStateTransition = label;
  lastStateTransitionAt = Date.now();
}

export function resetGenerateShellDispatchDesk(): void {
  invocationSeq = 0;
  invocations = [];
  activeInvocationId = null;
  wrapperInvocationId = null;
  currentSubStageId = null;
  lastSuccessfulSubStageId = null;
  currentAwaitLabel = null;
  promiseForensic = null;
  authorization = defaultAuth();
  fetchForensic = defaultFetch();
  lastStateTransition = null;
  lastStateTransitionAt = null;
  inFlightRequests.clear();
  initSubStages();
  resetGenerateShellPackageMicroTrace();
}

/** Restore in-memory dispatch desk from persisted black box snapshot. */
export function restoreGenerateShellDispatchDeskFromSnapshot(snapshot: GenerateShellDispatchDeskState): void {
  if (!snapshot) return;
  invocations = [...(snapshot.invocations ?? [])];
  invocationSeq = invocations.length;
  subStages = new Map(
    (snapshot.subStages ?? []).map((s) => [s.subStageId, { ...s }])
  );
  for (const def of SUB_STAGE_DEFS) {
    if (!subStages.has(def.id)) {
      subStages.set(def.id, {
        subStageId: def.id,
        label: def.label,
        category: def.category,
        enteredAt: null,
        completedAt: null,
        durationMs: null,
        status: 'pending',
        detail: null,
        traceId: null,
        compileRunId: runContext.compileRunId,
        stationId: runContext.stationId,
        requestKey: runContext.requestKey,
        surface: runContext.surface,
      });
    }
  }
  currentSubStageId = snapshot.currentSubStageId;
  lastSuccessfulSubStageId = snapshot.lastSuccessfulSubStageId;
  currentAwaitLabel = snapshot.currentAwaitLabel;
  promiseForensic = snapshot.promiseForensic ? { ...snapshot.promiseForensic } : null;
  authorization = snapshot.authorization ? { ...defaultAuth(), ...snapshot.authorization } : defaultAuth();
  fetchForensic = snapshot.fetch ? { ...defaultFetch(), ...snapshot.fetch } : defaultFetch();
  lastStateTransition = snapshot.lastStateTransition;
  lastStateTransitionAt = snapshot.lastStateTransitionAt;
  if (snapshot.packageMicroTrace) {
    restoreGenerateShellPackageMicroTraceFromSnapshot(snapshot.packageMicroTrace);
  }
  activeInvocationId =
    invocations.find((i) => !i.completedAt && i.source === 'function-body')?.invocationId ??
    invocations.find((i) => !i.completedAt)?.invocationId ??
    null;
  wrapperInvocationId =
    invocations.find((i) => !i.completedAt && i.source === 'traceShellAsync-wrapper')?.invocationId ?? null;
}

export function bindGenerateShellDispatchDeskContext(ctx: {
  compileRunId: string;
  stationId: string;
  requestKey?: string;
  surface?: string;
}): void {
  if (!enabled()) return;
  runStartedAt = Date.now();
  runContext = {
    compileRunId: ctx.compileRunId,
    stationId: ctx.stationId,
    surface: ctx.surface ?? 'experience-lab-validation',
    requestKey: ctx.requestKey ?? `shell-${ctx.compileRunId}`,
  };
  resetGenerateShellDispatchDesk();
  transition('Dispatch desk bound to compile run');
}

/** Called from traceShellAsync wrapper before execute() for generateShellPublicUrl. */
export function markGspuWrapperInvocation(input: {
  callerFunction: string;
  callerFile: string;
  stageId?: string;
}): string {
  if (!enabled()) return '';
  invocationSeq += 1;
  const invocationId = `gspu-wrap-${invocationSeq}`;
  wrapperInvocationId = invocationId;
  invocations.push({
    invocationId,
    parentInvocationId: null,
    callerFunction: input.callerFunction,
    callerFile: input.callerFile,
    callDepth: 0,
    enteredAt: Date.now(),
    completedAt: null,
    compileRunId: runContext.compileRunId,
    requestKey: runContext.requestKey,
    source: 'traceShellAsync-wrapper',
    stackSnippet: safeStackSnippet(),
    duplicateEntryClassification: 'F-wrapper-plus-inner',
  });
  transition(`Wrapper invocation ${invocationId} (${input.stageId ?? 'generate-shell'})`);
  return invocationId;
}

export function beginGspuInvocation(input: {
  callerFunction: string;
  callerFile: string;
  source?: GspuInvocationRecord['source'];
}): string {
  if (!enabled()) return '';
  invocationSeq += 1;
  const invocationId = `gspu-${invocationSeq}`;
  const parentId = wrapperInvocationId && input.source === 'function-body' ? wrapperInvocationId : activeInvocationId;
  const callDepth = parentId ? 1 : 0;

  let duplicateEntryClassification: GspuDuplicateClassification | null = null;
  if (wrapperInvocationId && input.source === 'function-body') {
    duplicateEntryClassification = 'F-wrapper-plus-inner';
  } else if (invocations.some((i) => i.callerFunction === input.callerFunction && !i.completedAt)) {
    duplicateEntryClassification = 'B-same-caller-twice';
  }

  const record: GspuInvocationRecord = {
    invocationId,
    parentInvocationId: parentId,
    callerFunction: input.callerFunction,
    callerFile: input.callerFile,
    callDepth,
    enteredAt: Date.now(),
    completedAt: null,
    compileRunId: runContext.compileRunId,
    requestKey: runContext.requestKey,
    source: input.source ?? 'function-body',
    stackSnippet: safeStackSnippet(),
    duplicateEntryClassification,
  };
  invocations.push(record);
  activeInvocationId = invocationId;
  transition(`Invocation ${invocationId} from ${input.callerFunction}`);
  return invocationId;
}

export function endGspuInvocation(invocationId: string): void {
  if (!enabled() || !invocationId) return;
  const inv = invocations.find((i) => i.invocationId === invocationId);
  if (inv) inv.completedAt = Date.now();
  if (activeInvocationId === invocationId) activeInvocationId = inv?.parentInvocationId ?? null;
  if (wrapperInvocationId === invocationId) wrapperInvocationId = null;
}

export function recordGspuSubStage(
  id: GspuSubStageId,
  status: GspuSubStageStatus,
  detail?: string
): void {
  if (!enabled()) return;
  const def = SUB_STAGE_DEFS.find((s) => s.id === id);
  const now = Date.now();
  const existing = subStages.get(id) ?? {
    subStageId: id,
    label: def?.label ?? id,
    category: def?.category ?? 'K',
    enteredAt: null,
    completedAt: null,
    durationMs: null,
    status: 'pending' as GspuSubStageStatus,
    detail: null,
    traceId: null,
    compileRunId: runContext.compileRunId,
    stationId: runContext.stationId,
    requestKey: runContext.requestKey,
    surface: runContext.surface,
  };

  if (status === 'running') {
    existing.status = 'running';
    existing.enteredAt = now;
    currentSubStageId = id;
    currentAwaitLabel = def?.label ?? id;
  } else {
    existing.status = status;
    existing.completedAt = now;
    if (existing.enteredAt) existing.durationMs = now - existing.enteredAt;
    if (status === 'success') lastSuccessfulSubStageId = id;
    currentAwaitLabel = null;
    if (currentSubStageId === id) currentSubStageId = null;
  }
  if (detail) existing.detail = detail;
  existing.compileRunId = runContext.compileRunId;
  existing.stationId = runContext.stationId;
  existing.requestKey = runContext.requestKey;
  subStages.set(id, existing);
  transition(`${id} → ${status}${detail ? `: ${detail}` : ''}`);
}

export function recordGspuAwait(label: string): void {
  if (!enabled()) return;
  currentAwaitLabel = label;
  transition(`Await: ${label}`);
}

export function recordGspuPromiseState(input: {
  promiseKey: string;
  created: boolean;
  reused: boolean;
  owner: string;
  state?: GspuPromiseForensic['state'];
  sharedByInvocations?: string[];
  cleanupOccurred?: boolean;
  detail?: string;
}): void {
  if (!enabled()) return;
  const existing = inFlightRequests.get(input.promiseKey);
  const createdAt = existing?.createdAt ?? Date.now();
  promiseForensic = {
    promiseKey: input.promiseKey,
    created: input.created,
    reused: input.reused,
    owner: input.owner,
    createdAt: input.created ? Date.now() : createdAt,
    ageMs: Date.now() - createdAt,
    state: input.state ?? (input.reused ? 'pending' : 'pending'),
    sharedByInvocations: input.sharedByInvocations ?? (activeInvocationId ? [activeInvocationId] : []),
    cleanupOccurred: input.cleanupOccurred ?? false,
    detail: input.detail ?? null,
  };
  transition(`Promise ${input.promiseKey}: ${input.reused ? 'reused' : 'created'}`);
}

export function recordGspuAuthorization(partial: Partial<GspuAuthorizationForensic>): void {
  if (!enabled()) return;
  authorization = { ...authorization, ...partial };
  transition(`Authorization update: ${JSON.stringify(partial).slice(0, 120)}`);
}

export function recordGspuFetch(partial: Partial<GspuFetchForensic>): void {
  if (!enabled()) return;
  fetchForensic = { ...fetchForensic, ...partial };
  if (partial.fetchAboutToStart && !partial.fetchStarted) {
    fetchForensic.lastPreFetchStep = currentSubStageId;
  }
  transition(`Fetch update: ${Object.keys(partial).join(', ')}`);
}

export function trackGspuInFlightRequest(
  promiseKey: string,
  promise: Promise<unknown>,
  owner: string
): { reused: boolean; promise: Promise<unknown> } {
  if (!enabled()) return { reused: false, promise };
  const existing = inFlightRequests.get(promiseKey);
  if (existing) {
    recordGspuPromiseState({
      promiseKey,
      created: false,
      reused: true,
      owner: existing.owner,
      state: 'pending',
      sharedByInvocations: invocations.filter((i) => !i.completedAt).map((i) => i.invocationId),
      detail: `Reused in-flight promise age ${Date.now() - existing.createdAt}ms`,
    });
    return { reused: true, promise: existing.promise };
  }
  inFlightRequests.set(promiseKey, { promise, createdAt: Date.now(), owner });
  recordGspuPromiseState({
    promiseKey,
    created: true,
    reused: false,
    owner,
    state: 'pending',
    detail: 'New promise registered',
  });
  const wrapped = promise.finally(() => {
    inFlightRequests.delete(promiseKey);
    recordGspuPromiseState({
      promiseKey,
      created: false,
      reused: false,
      owner,
      state: 'fulfilled',
      cleanupOccurred: true,
      detail: 'In-flight entry cleared',
    });
  });
  inFlightRequests.set(promiseKey, { promise: wrapped, createdAt: Date.now(), owner });
  return { reused: false, promise: wrapped };
}

export function classifyGspuStall(): {
  classification: GspuStallClassification;
  detail: string;
} {
  const microRunning = buildGenerateShellPackageMicroTraceState();
  if (microRunning.currentMicroMarkerId) {
    const rss = buildRecordShellStageForensicState();
    if (rss.currentMicroMarkerId || rss.recordShellStageReturned === false) {
      const rssStall = classifyRssStall();
      const rssMap: Record<string, GspuStallClassification> = {
        'A-stage-lookup': 'B-context-preparation-wait',
        'B-stage-mutation': 'B-context-preparation-wait',
        'C-timeline-append': 'B-context-preparation-wait',
        'D-serialization': 'K-lost-event-deferred-resolution',
        'E-session-storage-write': 'K-lost-event-deferred-resolution',
        'F-subscriber-notification': 'K-lost-event-deferred-resolution',
        'G-subscriber-callback': 'K-lost-event-deferred-resolution',
        'H-reentrant-recursion': 'D-in-flight-promise-deadlock',
        'I-derived-state-feedback-loop': 'K-lost-event-deferred-resolution',
        'J-react-external-store-snapshot': 'K-lost-event-deferred-resolution',
        'K-other': 'L-other',
      };
      return {
        classification: rssMap[rssStall.classification] ?? 'L-other',
        detail: `[rss:${rss.currentMicroMarkerId ?? rssStall.detail}] ${rssStall.detail}`,
      };
    }
    const micro = classifyGspuMicroStall();
    const microMap: Record<string, GspuStallClassification> = {
      'A-pre-package-context-read': 'B-context-preparation-wait',
      'B-package-key-computation': 'B-context-preparation-wait',
      'C-registry-access': 'B-context-preparation-wait',
      'D-registry-readiness-wait': 'K-lost-event-deferred-resolution',
      'E-package-lookup': 'B-context-preparation-wait',
      'F-lazy-package-load': 'B-context-preparation-wait',
      'G-package-validation': 'B-context-preparation-wait',
      'H-lost-readiness-event': 'K-lost-event-deferred-resolution',
      'I-circular-dependency-lock': 'D-in-flight-promise-deadlock',
      'J-other': 'L-other',
    };
    return {
      classification: microMap[micro.classification] ?? 'L-other',
      detail: `[micro:${microRunning.currentMicroMarkerId}] ${micro.detail}`,
    };
  }

  const wrappers = invocations.filter((i) => i.source === 'traceShellAsync-wrapper' && !i.completedAt);
  const bodies = invocations.filter((i) => i.source === 'function-body' && !i.completedAt);
  const parentLinked = bodies.some(
    (b) => b.parentInvocationId && wrappers.some((w) => w.invocationId === b.parentInvocationId)
  );
  if (
    !isKnownInstrumentationWrapperPair({
      wrapperActive: wrappers.length > 0,
      bodyActive: bodies.length > 0,
      parentLinked,
    })
  ) {
    const dup = invocations.filter((i) => i.source === 'function-body' || i.source === 'traceShellAsync-wrapper');
    if (dup.length >= 2 && dup.some((i) => !i.completedAt) && dup.some((i) => i.parentInvocationId) && !parentLinked) {
      return {
        classification: 'J-duplicate-invocation-collision',
        detail: 'Multiple unlinked invocations active',
      };
    }
  }

  const running = [...subStages.values()].filter((s) => s.status === 'running');
  const lastRunning = running[running.length - 1];

  if (promiseForensic?.reused && promiseForensic.state === 'pending') {
    return {
      classification: 'D-in-flight-promise-deadlock',
      detail: `Reused promise ${promiseForensic.promiseKey} pending ${promiseForensic.ageMs ?? 0}ms`,
    };
  }

  const stage = lastRunning?.subStageId ?? currentSubStageId;
  if (!stage) {
    return { classification: 'L-other', detail: 'No running sub-stage recorded' };
  }

  if (stage.startsWith('GSPU-01') || stage === 'GSPU-02-stage-create-shell-request') {
    return { classification: 'B-context-preparation-wait', detail: `Stuck at ${stage} — see package micro-trace` };
  }
  if (stage.startsWith('GSPU-03')) {
    return { classification: 'B-context-preparation-wait', detail: `Stuck at ${stage}` };
  }
  if (
    stage === 'GSPU-05-auth-attach' ||
    stage === 'GSPU-07-token-ensure-enter' ||
    stage === 'GSPU-08-token-get-first' ||
    stage === 'GSPU-09-token-refresh' ||
    stage === 'GSPU-10-token-get-second'
  ) {
    return { classification: 'C-authorization-wait', detail: `Stuck at ${stage} (${lastRunning?.label ?? ''})` };
  }
  if (stage === 'GSPU-06-request-helper-enter' || stage === 'GSPU-12-endpoint-resolve' || stage === 'GSPU-13-headers-body-prep') {
    return { classification: 'F-request-helper-never-returns', detail: `Stuck before fetch at ${stage}` };
  }
  if (stage === 'GSPU-14-fetch-about-to-start' && !fetchForensic.fetchStarted) {
    return { classification: 'G-fetch-never-invoked', detail: 'Reached pre-fetch boundary but fetch never started' };
  }
  if (stage === 'GSPU-15-fetch-started' || stage === 'GSPU-16-fetch-response') {
    return { classification: 'H-fetch-pending', detail: `Fetch in flight at ${stage}` };
  }
  if (stage === 'GSPU-17-response-text' || stage === 'GSPU-18-response-parse') {
    return { classification: 'I-response-parsing-pending', detail: `Response handling at ${stage}` };
  }

  return { classification: 'L-other', detail: `Unhandled running stage ${stage}` };
}

function buildDuplicateExplanation(): { detected: boolean; explanation: string | null; isInstrumentationOnly: boolean } {
  const wrappers = invocations.filter((i) => i.source === 'traceShellAsync-wrapper');
  const bodies = invocations.filter((i) => i.source === 'function-body');
  if (wrappers.length === 0 && bodies.length <= 1) {
    return { detected: false, explanation: null, isInstrumentationOnly: false };
  }
  const wrap = wrappers[wrappers.length - 1];
  const body = bodies[bodies.length - 1];
  if (wrap && body) {
    return {
      detected: true,
      isInstrumentationOnly: true,
      explanation: `Category F (instrumentation only): traceShellAsync wrapper (${wrap.invocationId}) + inner function-body (${body.invocationId}) — one logical call, not a stall cause`,
    };
  }
  if (bodies.length >= 2) {
    return {
      detected: true,
      isInstrumentationOnly: false,
      explanation: `Category B/C: ${bodies.length} function-body invocations — ${bodies.map((b) => b.invocationId).join(', ')}`,
    };
  }
  return {
    detected: true,
    isInstrumentationOnly: false,
    explanation: 'Duplicate entry detected — see invocation records',
  };
}

export function buildGenerateShellDispatchDeskState(): GenerateShellDispatchDeskState {
  const dup = buildDuplicateExplanation();
  const stall = classifyGspuStall();
  const hasRunning = [...subStages.values()].some((s) => s.status === 'running');

  return {
    packageMicroTrace: buildGenerateShellPackageMicroTraceState(),
    invocations: [...invocations],
    subStages: SUB_STAGE_DEFS.map((d) => subStages.get(d.id)!).filter(Boolean),
    currentSubStageId: hasRunning ? currentSubStageId : null,
    lastSuccessfulSubStageId,
    currentAwaitLabel,
    promiseForensic: promiseForensic ? { ...promiseForensic } : null,
    authorization: { ...authorization },
    fetch: { ...fetchForensic },
    stallClassification: hasRunning || heartbeatStalled() ? stall.classification : null,
    stallClassificationDetail: hasRunning || heartbeatStalled() ? stall.detail : null,
    elapsedMs: runStartedAt ? Date.now() - runStartedAt : null,
    lastStateTransition,
    lastStateTransitionAt,
    duplicateCallDetected: dup.detected,
    duplicateCallExplanation: dup.explanation,
  };
}

function heartbeatStalled(): boolean {
  const micro = buildGenerateShellPackageMicroTraceState();
  return (
    currentSubStageId !== null ||
    micro.currentMicroMarkerId !== null ||
    (promiseForensic?.state === 'pending' && (promiseForensic.ageMs ?? 0) > 0)
  );
}

/** Test-only: expose in-flight map size. */
export function __testGspuInFlightSize(): number {
  return inFlightRequests.size;
}
