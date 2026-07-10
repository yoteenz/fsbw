/**
 * Complete investigation export — observe-only; read-only browser introspection.
 */
import {
  getActiveCompileRun,
  getInvestigationEvents,
  loadInvestigationEventsFromSession,
} from './investigation-log';
import { classifyLoadShellStall } from './stall-classifier';
import {
  getAsyncBoundaryHistory,
  getOpenAsyncBoundaries,
  loadStallEvidenceFromSession,
} from './stall-evidence';
import type { UiCompilerSyncSnapshot } from './stall-evidence';
import { buildWorldCompilerForensicReport } from './session-report';
import { buildWorldCompilerOwnershipReport } from './ownership-report';
import { buildMilestoneTimeline, deriveMilestoneSummary } from './investigation-export-utils';
import { refreshBrowserMode, getCachedBrowserMode } from './investigation-live-status';
import { isInvestigationInstrumentationReady } from './investigation-ready';
import type { CompilerInvestigationEvent } from './types';

const STUDIO_OS_LS_PREFIXES = ['studio', 'genesis', 'worldCompiler', 'sceneStack', 'validation', 'baw', 'adminStudio'];

export type InvestigationExportSummary = {
  lastSuccessfulMilestone: string | null;
  firstMissingOrFailedMilestone: string | null;
  currentCompilerState: string | null;
  currentUiState: string | null;
  browserEnvironment: string;
  evidenceConfidence: 'proven' | 'likely' | 'insufficient';
};

export type CompleteInvestigationExport = {
  summary: InvestigationExportSummary;
  timestamp: string;
  browser: string;
  browserMode: 'normal' | 'private' | 'incognito' | 'unknown';
  userAgent: string;
  previewSessionId: string | null;
  compileRunId: string | null;
  projectId: string | null;
  stationId: string | null;
  currentCompilerStage: string | null;
  currentUiStep: string | null;
  pipelineOwnership: Record<string, unknown>;
  milestoneTimeline: Array<Record<string, unknown>>;
  compilerReports: Array<Record<string, unknown>>;
  uiReports: Array<Record<string, unknown>>;
  promiseStates: Array<Record<string, unknown>>;
  asyncBoundaries: {
    open: ReturnType<typeof getOpenAsyncBoundaries>;
    history: ReturnType<typeof getAsyncBoundaryHistory>;
  };
  serviceWorkerState: Record<string, unknown>;
  cacheStorageSummary: Record<string, unknown>;
  indexedDbSummary: Record<string, unknown>;
  localStorageSummary: Record<string, unknown>;
  sessionStorageSummary: Record<string, unknown>;
  investigationLogs: CompilerInvestigationEvent[];
  rootCauseClassification: ReturnType<typeof classifyLoadShellStall> | null;
  classificationEvidence: string[];
  legacyForensicReport: ReturnType<typeof buildWorldCompilerForensicReport>;
  evidenceOnly: true;
  repairApplied: false;
  instrumentationReady: boolean;
};

function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome') && !ua.includes('edg/')) return 'chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('firefox')) return 'firefox';
  return 'other';
}

function readStorageSummary(storage: Storage, label: string, filterStudio = false): Record<string, unknown> {
  const keys: string[] = [];
  const sizes: Record<string, number> = {};
  try {
    for (let i = 0; i < storage.length; i += 1) {
      const k = storage.key(i);
      if (!k) continue;
      if (filterStudio && !STUDIO_OS_LS_PREFIXES.some((p) => k.toLowerCase().includes(p.toLowerCase()))) {
        continue;
      }
      keys.push(k);
      try {
        sizes[k] = storage.getItem(k)?.length ?? 0;
      } catch {
        sizes[k] = -1;
      }
    }
  } catch {
    return { label, accessible: false, keys: [], sizes: {} };
  }
  keys.sort();
  return {
    label,
    accessible: true,
    keyCount: keys.length,
    keys,
    sizes,
    studioOsRelevantKeys: filterStudio ? keys : keys.filter((k) =>
      STUDIO_OS_LS_PREFIXES.some((p) => k.toLowerCase().includes(p.toLowerCase()))
    ),
  };
}

async function readCacheStorageSummary(): Promise<Record<string, unknown>> {
  try {
    if (typeof caches === 'undefined') return { available: false, cacheNames: [] };
    const names = await caches.keys();
    return { available: true, cacheCount: names.length, cacheNames: names };
  } catch (err) {
    return { available: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function readIndexedDbSummary(): Promise<Record<string, unknown>> {
  try {
    if (typeof indexedDB.databases === 'function') {
      const dbs = await indexedDB.databases();
      return {
        available: true,
        databaseCount: dbs.length,
        databases: dbs.map((d) => ({ name: d.name, version: d.version })),
      };
    }
    return { available: true, databaseCount: null, databases: [], note: 'indexedDB.databases() unavailable' };
  } catch (err) {
    return { available: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function readServiceWorkerState(): Promise<Record<string, unknown>> {
  try {
    if (!navigator.serviceWorker) {
      return { supported: false };
    }
    const controller = navigator.serviceWorker.controller;
    const regs = await navigator.serviceWorker.getRegistrations();
    return {
      supported: true,
      controllerScriptUrl: controller?.scriptURL ?? null,
      controllerState: controller?.state ?? null,
      registrationCount: regs.length,
      registrations: regs.map((r) => ({
        scope: r.scope,
        activeScriptUrl: r.active?.scriptURL ?? null,
        waitingScriptUrl: r.waiting?.scriptURL ?? null,
        installingScriptUrl: r.installing?.scriptURL ?? null,
      })),
    };
  } catch (err) {
    return { supported: true, error: err instanceof Error ? err.message : String(err) };
  }
}

function extractCompilerReports(events: CompilerInvestigationEvent[]): Array<Record<string, unknown>> {
  return events
    .filter(
      (e) =>
        e.type === 'PIPELINE_LIFECYCLE' &&
        (e.detail?.lifecycleEvent === 'COMPILE_REPORT_PUBLISHED' || e.status === 'COMPILE_REPORT_PUBLISHED')
    )
    .map((e) => ({
      timestamp: e.isoTime,
      compileRunId: e.compileRunId,
      compileOwner: e.detail?.compileOwner ?? null,
      success: e.detail?.success ?? null,
      failedStage: e.detail?.failedStage ?? null,
      detail: e.detail,
    }));
}

function extractUiReports(events: CompilerInvestigationEvent[]): Array<Record<string, unknown>> {
  return events
    .filter((e) => e.type === 'UI_COMPILER_SYNC')
    .map((e) => ({
      timestamp: e.isoTime,
      compileRunId: e.compileRunId,
      ...(e.detail as Record<string, unknown>),
    }));
}

function extractPromiseStates(
  open: ReturnType<typeof getOpenAsyncBoundaries>,
  history: ReturnType<typeof getAsyncBoundaryHistory>
): Array<Record<string, unknown>> {
  const pending = open.map((b) => ({
    boundaryId: b.id,
    operationName: b.operationName,
    state: 'pending',
    startedAt: b.startedAt,
    pendingMs: Date.now() - b.startedAt,
    compileRunId: b.compileRunId,
    previewSessionId: b.previewSessionId,
  }));
  const settled = history.slice(-30).map((b) => ({
    boundaryId: b.id,
    operationName: b.operationName,
    state: b.outcome,
    startedAt: b.startedAt,
    completedAt: b.completedAt,
    durationMs: b.completedAt ? b.completedAt - b.startedAt : null,
    resolvedCategory: b.resolvedCategory,
    rejectionMessage: b.rejectionMessage,
    compileRunId: b.compileRunId,
  }));
  return [...pending, ...settled];
}

function extractPipelineOwnership(events: CompilerInvestigationEvent[], activeRun: ReturnType<typeof getActiveCompileRun>) {
  const ownershipEvents = events.filter((e) => e.type === 'PIPELINE_OWNERSHIP' || e.type === 'PIPELINE_LIFECYCLE');
  const lastOwnership = [...ownershipEvents].reverse().find((e) => e.type === 'PIPELINE_OWNERSHIP');
  return {
    activeCompileRun: activeRun,
    ownershipBaseline: buildWorldCompilerOwnershipReport(),
    lastOwnershipEvent: lastOwnership?.detail ?? null,
    compileInvocationHints: events
      .filter((e) => e.detail?.lifecycleEvent === 'DUPLICATE_COMPILE_INVOCATION')
      .slice(-5)
      .map((e) => e.detail),
  };
}

function pickSessionFields(
  events: CompilerInvestigationEvent[],
  activeRun: ReturnType<typeof getActiveCompileRun>,
  lastSync: UiCompilerSyncSnapshot | null
) {
  const lastLifecycle = [...events]
    .reverse()
    .find((e) => e.type === 'PIPELINE_LIFECYCLE' || e.type === 'LOAD_SHELL_MILESTONE');
  const detail = lastLifecycle?.detail ?? {};
  return {
    previewSessionId:
      lastSync?.previewSessionId ??
      (detail.previewSessionId as string | undefined) ??
      activeRun?.previewSessionId ??
      null,
    compileRunId:
      lastSync?.compileRunId ?? activeRun?.compileRunId ?? lastLifecycle?.compileRunId ?? null,
    projectId: (detail.projectId as string | undefined) ?? null,
    stationId:
      (detail.stationId as string | undefined) ?? activeRun?.stationId ?? null,
    currentCompilerStage:
      lastSync?.sessionCurrentStage ?? (detail.currentCompilerStage as string | undefined) ?? activeRun?.lastSuccessfulStage ?? null,
    currentUiStep: lastSync?.uiCurrentStepId ?? (detail.currentUiStep as string | undefined) ?? null,
  };
}

/** True when stall-evidence instrumentation is active in this browser context. */
export { isInvestigationInstrumentationReady } from './investigation-ready';

function scopeEventsToRun(
  events: CompilerInvestigationEvent[],
  compileRunId: string | null
): CompilerInvestigationEvent[] {
  if (!compileRunId) return events;
  const scoped = events.filter((e) => e.compileRunId === compileRunId);
  return scoped.length > 0 ? scoped : events;
}

export async function buildCompleteInvestigationExport(
  compileRunId?: string | null
): Promise<CompleteInvestigationExport> {
  loadInvestigationEventsFromSession();
  loadStallEvidenceFromSession();
  const allEvents = [...getInvestigationEvents()];
  const activeRun = getActiveCompileRun();
  const runId = compileRunId ?? activeRun?.compileRunId ?? null;
  const events = scopeEventsToRun(allEvents, runId);

  const uiReports = extractUiReports(events);
  const lastSync = uiReports.length
    ? (uiReports[uiReports.length - 1] as unknown as UiCompilerSyncSnapshot)
    : null;

  const syncSnapshots = events.filter((e) => e.type === 'UI_COMPILER_SYNC');
  const lastSyncSnapshot = syncSnapshots.length
    ? (syncSnapshots[syncSnapshots.length - 1].detail as unknown as UiCompilerSyncSnapshot)
    : null;

  const classification = classifyLoadShellStall({
    events,
    pendingAsyncAtStall: getOpenAsyncBoundaries(),
    lastSyncSnapshot: lastSyncSnapshot ?? lastSync,
    compileRunId: runId,
  });

  const milestoneTimeline = buildMilestoneTimeline(events);
  const milestoneSummary = deriveMilestoneSummary(milestoneTimeline);
  const sessionFields = pickSessionFields(events, activeRun, lastSyncSnapshot ?? lastSync);

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const browser = detectBrowser(userAgent);
  const browserMode =
    typeof window !== 'undefined' ? await refreshBrowserMode() : getCachedBrowserMode();

  const openAsync = getOpenAsyncBoundaries();
  const historyAsync = getAsyncBoundaryHistory();

  const exportDoc: CompleteInvestigationExport = {
    summary: {
      lastSuccessfulMilestone: milestoneSummary.lastSuccessful,
      firstMissingOrFailedMilestone: milestoneSummary.firstMissingOrFailed,
      currentCompilerState: sessionFields.currentCompilerStage,
      currentUiState: sessionFields.currentUiStep,
      browserEnvironment: `${browser} · ${browserMode}`,
      evidenceConfidence: classification.confidence,
    },
    timestamp: new Date().toISOString(),
    browser,
    browserMode,
    userAgent,
    previewSessionId: sessionFields.previewSessionId,
    compileRunId: sessionFields.compileRunId,
    projectId: sessionFields.projectId,
    stationId: sessionFields.stationId,
    currentCompilerStage: sessionFields.currentCompilerStage,
    currentUiStep: sessionFields.currentUiStep,
    pipelineOwnership: extractPipelineOwnership(events, activeRun),
    milestoneTimeline,
    compilerReports: extractCompilerReports(events),
    uiReports,
    promiseStates: extractPromiseStates(openAsync, historyAsync),
    asyncBoundaries: { open: openAsync, history: historyAsync },
    serviceWorkerState: typeof window !== 'undefined' ? await readServiceWorkerState() : { supported: false },
    cacheStorageSummary: typeof window !== 'undefined' ? await readCacheStorageSummary() : { available: false },
    indexedDbSummary: typeof window !== 'undefined' ? await readIndexedDbSummary() : { available: false },
    localStorageSummary:
      typeof window !== 'undefined' ? readStorageSummary(localStorage, 'localStorage') : { accessible: false },
    sessionStorageSummary:
      typeof window !== 'undefined' ? readStorageSummary(sessionStorage, 'sessionStorage') : { accessible: false },
    investigationLogs: events,
    rootCauseClassification: classification,
    classificationEvidence: classification.proof,
    legacyForensicReport: buildWorldCompilerForensicReport(),
    evidenceOnly: true,
    repairApplied: false,
    instrumentationReady: isInvestigationInstrumentationReady(),
  };

  return exportDoc;
}

export async function exportCompleteInvestigationJson(compileRunId?: string | null): Promise<string> {
  const doc = await buildCompleteInvestigationExport(compileRunId);
  return JSON.stringify(doc, null, 2);
}

export function downloadInvestigationExport(json: string, compileRunId?: string | null): void {
  const suffix = compileRunId?.slice(0, 12) ?? Date.now();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `world-compiler-investigation-${suffix}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function markInvestigationInstrumentationReady(): void {
  if (typeof window === 'undefined') return;
  const win = window as unknown as {
    __WC_INVESTIGATION_READY__?: boolean;
    __WC_EXPORT_INVESTIGATION__?: () => Promise<CompleteInvestigationExport>;
    __WC_EXPORT_INVESTIGATION_JSON__?: () => Promise<string>;
  };
  win.__WC_INVESTIGATION_READY__ = true;
  win.__WC_EXPORT_INVESTIGATION__ = () => buildCompleteInvestigationExport();
  win.__WC_EXPORT_INVESTIGATION_JSON__ = () => exportCompleteInvestigationJson();
}
