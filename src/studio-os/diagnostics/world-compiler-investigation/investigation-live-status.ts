/**
 * Live investigation status — read-only; drives investigation page UI only.
 */
import {
  getActiveCompileRun,
  getInvestigationEvents,
  loadInvestigationEventsFromSession,
  clearInvestigationLog,
} from './investigation-log';
import {
  getLoadShellMilestones,
  isStallEvidenceRecordingEnabled,
  loadStallEvidenceFromSession,
  clearStallEvidenceSession,
} from './stall-evidence';
import { deriveMilestoneSummary, buildMilestoneTimeline } from './investigation-export-utils';
import { isInvestigationInstrumentationReady } from './investigation-ready';
import {
  filterRealCompilerEvents,
  getRecorderSelfTest,
  isRealCompilerLifecycleEvent,
  isRecorderConnected,
  loadInvestigationRecorderBootState,
} from './investigation-recorder-boot';
import type { CompilerInvestigationEvent } from './types';
import type { UiCompilerSyncSnapshot } from './stall-evidence';

const INVESTIGATION_SESSION_KEY = 'worldCompilerInvestigationSessionId_v1';
const RUN_HISTORY_KEY = 'worldCompilerInvestigationRunHistory_v1';
const SELECTED_RUN_KEY = 'worldCompilerInvestigationSelectedRun_v1';
const RECORDING_ACTIVE_MS = 120_000;

export type InvestigationRunSummary = {
  compileRunId: string;
  previewSessionId: string | null;
  stationId: string | null;
  eventCount: number;
  firstEventAt: string | null;
  lastEventAt: string | null;
  lastEventType: string | null;
  milestonesReached: string[];
  stallReached: boolean;
};

export type InvestigationLiveStatus = {
  investigationReady: boolean;
  recordingActive: boolean;
  recorderConnected: boolean;
  compilerEventSourceConnected: boolean;
  recorderSubscriptionStatus: string;
  selfTestStatus: 'PASS' | 'FAIL' | 'PENDING';
  selfTestEventId: number | null;
  selfTestTimestamp: string | null;
  selfTestMessage: string | null;
  browserMode: 'normal' | 'private' | 'incognito' | 'unknown';
  investigationSessionId: string;
  previewSessionId: string | null;
  compileRunId: string | null;
  eventsCaptured: number;
  lastRecordedEvent: string | null;
  lastEventTimestamp: string | null;
  currentCompilerStage: string | null;
  currentUiStep: string | null;
  lastSuccessfulMilestone: string | null;
  firstPendingMilestone: string | null;
  stallThresholdStatus: string;
  runHistory: InvestigationRunSummary[];
  exportAllowed: boolean;
  exportBlockReason: string | null;
  selectedCompileRunId: string | null;
};

export type MeaningfulRunCheck = {
  ok: boolean;
  reason: string | null;
};

let cachedBrowserMode: InvestigationLiveStatus['browserMode'] = 'unknown';
let browserModeCheckedAt = 0;

function getInvestigationSessionId(): string {
  if (typeof sessionStorage === 'undefined') return 'server';
  try {
    let id = sessionStorage.getItem(INVESTIGATION_SESSION_KEY);
    if (!id) {
      id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(INVESTIGATION_SESSION_KEY, id);
    }
    return id;
  } catch {
    return `inv-${Date.now()}`;
  }
}

export async function refreshBrowserMode(): Promise<InvestigationLiveStatus['browserMode']> {
  if (typeof window === 'undefined') return 'unknown';
  if (Date.now() - browserModeCheckedAt < 30_000 && cachedBrowserMode !== 'unknown') {
    return cachedBrowserMode;
  }
  try {
    const probe = '__wc_investigation_mode_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
  } catch {
    cachedBrowserMode = 'private';
    browserModeCheckedAt = Date.now();
    return cachedBrowserMode;
  }
  try {
    if (navigator.storage?.estimate) {
      const { quota } = await navigator.storage.estimate();
      if (quota != null && quota > 0 && quota < 120_000_000) {
        cachedBrowserMode = 'incognito';
        browserModeCheckedAt = Date.now();
        return cachedBrowserMode;
      }
    }
  } catch {
    /* ignore */
  }
  cachedBrowserMode = 'normal';
  browserModeCheckedAt = Date.now();
  return cachedBrowserMode;
}

export function getCachedBrowserMode(): InvestigationLiveStatus['browserMode'] {
  return cachedBrowserMode;
}

function latestCompileRunId(events: readonly CompilerInvestigationEvent[]): string | null {
  const real = filterRealCompilerEvents(events);
  for (let i = real.length - 1; i >= 0; i -= 1) {
    if (real[i]?.compileRunId) return real[i].compileRunId;
  }
  return getActiveCompileRun()?.compileRunId ?? null;
}

function latestPreviewSessionId(events: readonly CompilerInvestigationEvent[]): string | null {
  const real = filterRealCompilerEvents(events);
  for (let i = real.length - 1; i >= 0; i -= 1) {
    const fromDetail = real[i]?.detail?.previewSessionId;
    if (typeof fromDetail === 'string' && fromDetail.length > 0) return fromDetail;
  }
  return getActiveCompileRun()?.previewSessionId ?? null;
}

function pickLatestSync(events: readonly CompilerInvestigationEvent[]): UiCompilerSyncSnapshot | null {
  const syncs = events.filter((e) => e.type === 'UI_COMPILER_SYNC');
  if (!syncs.length) return null;
  return syncs[syncs.length - 1]?.detail as unknown as UiCompilerSyncSnapshot;
}

function deriveStallStatus(events: readonly CompilerInvestigationEvent[], lastSync: UiCompilerSyncSnapshot | null): string {
  const stallEvent = [...events]
    .reverse()
    .find(
      (e) =>
        e.type === 'PIPELINE_LIFECYCLE' &&
        (e.detail?.lifecycleEvent === 'STALL_THRESHOLD_REACHED' || e.status === 'STALL_THRESHOLD_REACHED')
    );
  if (stallEvent) {
    const ms = stallEvent.detail?.stepStallMs;
    return ms != null ? `STALLED (≥90s) — stepStallMs=${ms}` : 'STALLED (≥90s threshold reached)';
  }
  if (lastSync?.isStalled) {
    return `STALLED — stepStallMs=${lastSync.stepStallMs ?? 'unknown'}`;
  }
  if (lastSync?.stepStallMs != null && lastSync.stepStallMs > 0) {
    return `Counting — stepStallMs=${lastSync.stepStallMs} (threshold 90000)`;
  }
  return 'Not stalled';
}

export function buildRunHistory(events: readonly CompilerInvestigationEvent[]): InvestigationRunSummary[] {
  const byRun = new Map<string, CompilerInvestigationEvent[]>();
  for (const ev of events) {
    if (!ev.compileRunId) continue;
    const list = byRun.get(ev.compileRunId) ?? [];
    list.push(ev);
    byRun.set(ev.compileRunId, list);
  }

  const summaries: InvestigationRunSummary[] = [];
  for (const [compileRunId, runEvents] of byRun.entries()) {
    runEvents.sort((a, b) => a.timestamp - b.timestamp);
    const first = runEvents[0];
    const last = runEvents[runEvents.length - 1];
    const milestones = getLoadShellMilestones(runEvents)
      .map((e) => String(e.detail?.milestone ?? ''))
      .filter(Boolean);
    const stallReached = runEvents.some(
      (e) =>
        e.type === 'PIPELINE_LIFECYCLE' &&
        (e.detail?.lifecycleEvent === 'STALL_THRESHOLD_REACHED' || e.status === 'STALL_THRESHOLD_REACHED')
    );
    const previewFromDetail = runEvents.find((e) => e.detail?.previewSessionId)?.detail?.previewSessionId;
    summaries.push({
      compileRunId,
      previewSessionId:
        (last?.detail?.previewSessionId as string | undefined) ??
        (typeof previewFromDetail === 'string' ? previewFromDetail : null) ??
        null,
      stationId: last?.stationId ?? first?.stationId ?? null,
      eventCount: runEvents.length,
      firstEventAt: first?.isoTime ?? null,
      lastEventAt: last?.isoTime ?? null,
      lastEventType: last?.type ?? null,
      milestonesReached: [...new Set(milestones)],
      stallReached,
    });
  }

  summaries.sort((a, b) => {
    const ta = a.lastEventAt ? Date.parse(a.lastEventAt) : 0;
    const tb = b.lastEventAt ? Date.parse(b.lastEventAt) : 0;
    return tb - ta;
  });

  try {
    sessionStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(summaries.slice(0, 20)));
  } catch {
    /* quota */
  }

  return summaries;
}

export function loadPersistedRunHistory(): InvestigationRunSummary[] {
  try {
    const raw = sessionStorage.getItem(RUN_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InvestigationRunSummary[];
  } catch {
    return [];
  }
}

export function getSelectedCompileRunId(): string | null {
  try {
    return sessionStorage.getItem(SELECTED_RUN_KEY);
  } catch {
    return null;
  }
}

export function setSelectedCompileRunId(compileRunId: string | null): void {
  try {
    if (compileRunId) {
      sessionStorage.setItem(SELECTED_RUN_KEY, compileRunId);
    } else {
      sessionStorage.removeItem(SELECTED_RUN_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function clearCurrentInvestigationRun(compileRunId: string | null): void {
  if (!compileRunId) return;
  clearInvestigationLog({ compileRunId });
  clearStallEvidenceSession({ compileRunId });
  if (getSelectedCompileRunId() === compileRunId) {
    setSelectedCompileRunId(null);
  }
  buildRunHistory(getInvestigationEvents());
}

export function hasMeaningfulRunData(
  events: readonly CompilerInvestigationEvent[],
  compileRunId?: string | null
): MeaningfulRunCheck {
  const realEvents = filterRealCompilerEvents(events);
  const runId = compileRunId ?? latestCompileRunId(realEvents);
  if (!runId) {
    return { ok: false, reason: 'No compileRunId captured yet' };
  }

  const scoped = realEvents.filter((e) => e.compileRunId === runId);
  if (scoped.length === 0) {
    return { ok: false, reason: 'No real compiler lifecycle events for this compile run' };
  }

  const previewSessionId = scoped
    .map((e) => e.detail?.previewSessionId)
    .find((v): v is string => typeof v === 'string' && v.length > 0);
  if (!previewSessionId) {
    return { ok: false, reason: 'No previewSessionId captured for this compile run' };
  }

  const lifecycleEvents = scoped.filter(isRealCompilerLifecycleEvent);
  if (lifecycleEvents.length === 0) {
    return { ok: false, reason: 'No real compiler lifecycle events recorded' };
  }

  const timeline = buildMilestoneTimeline(scoped);
  const hasMilestoneActivity = timeline.some((row) => row.status !== 'missing');
  const hasPipeline = scoped.some(
    (e) =>
      e.type === 'PIPELINE_LIFECYCLE' ||
      e.type === 'LOAD_SHELL_MILESTONE' ||
      e.type === 'COMPILE_STAGE_ENTER' ||
      e.type === 'UI_COMPILER_SYNC'
  );

  if (!hasPipeline) {
    return { ok: false, reason: 'No pipeline or stage events recorded' };
  }

  const lastSync = pickLatestSync(scoped);
  const hasCompilerState = scoped.some(
    (e) =>
      e.type === 'COMPILE_STAGE_ENTER' ||
      e.type === 'LOAD_SHELL_MILESTONE' ||
      (e.type === 'PIPELINE_LIFECYCLE' && e.detail?.currentCompilerStage)
  );
  const hasUiState = lastSync != null || scoped.some((e) => e.type === 'UI_COMPILER_SYNC');

  if (!hasCompilerState) {
    return { ok: false, reason: 'Missing compiler state evidence' };
  }
  if (!hasUiState && !hasMilestoneActivity) {
    return { ok: false, reason: 'Missing UI sync / milestone evidence' };
  }

  return { ok: true, reason: null };
}

export function buildInvestigationLiveStatus(selectedCompileRunId?: string | null): InvestigationLiveStatus {
  loadInvestigationEventsFromSession();
  loadStallEvidenceFromSession();

  const events = [...getInvestigationEvents()];
  const realEvents = filterRealCompilerEvents(events);
  const activeRun = getActiveCompileRun();
  const compileRunId =
    selectedCompileRunId ?? getSelectedCompileRunId() ?? latestCompileRunId(events);
  const scopedEvents = compileRunId ? realEvents.filter((e) => e.compileRunId === compileRunId) : realEvents;
  const pool = scopedEvents.length > 0 ? scopedEvents : realEvents;

  const lastEvent = pool.length ? pool[pool.length - 1] : realEvents.length ? realEvents[realEvents.length - 1] : null;
  const lastSync = pickLatestSync(pool.length ? pool : realEvents);
  const timeline = buildMilestoneTimeline(pool.length ? pool : realEvents);
  const milestoneSummary = deriveMilestoneSummary(timeline);

  const bootState = loadInvestigationRecorderBootState();
  const selfTest = getRecorderSelfTest();
  const recorderConnected = isRecorderConnected();

  const recordingActive =
    recorderConnected &&
    isStallEvidenceRecordingEnabled() &&
    lastEvent != null &&
    (Date.now() - lastEvent.timestamp < RECORDING_ACTIVE_MS || activeRun?.status === 'running');

  const runHistory = buildRunHistory(realEvents);
  const meaningful = hasMeaningfulRunData(events, compileRunId);

  const firstPending = timeline.find(
    (row) => row.status === 'missing' || row.status === 'pending' || row.status === 'failure'
  );

  return {
    investigationReady: isInvestigationInstrumentationReady(),
    recordingActive,
    recorderConnected,
    compilerEventSourceConnected: bootState?.compilerEventSourceConnected ?? recorderConnected,
    recorderSubscriptionStatus: recorderConnected
      ? 'Subscribed via global-boot → logCompilerEvent'
      : 'Not subscribed — reload app after deploy',
    selfTestStatus: selfTest.status,
    selfTestEventId: selfTest.eventId,
    selfTestTimestamp: selfTest.timestamp,
    selfTestMessage: selfTest.message,
    browserMode: cachedBrowserMode,
    investigationSessionId: getInvestigationSessionId(),
    previewSessionId:
      latestPreviewSessionId(events) ??
      lastSync?.previewSessionId ??
      (lastEvent?.detail?.previewSessionId as string | undefined) ??
      activeRun?.previewSessionId ??
      null,
    compileRunId,
    eventsCaptured: pool.length,
    lastRecordedEvent: lastEvent ? `${lastEvent.type}${lastEvent.stageName ? ` · ${lastEvent.stageName}` : ''}` : null,
    lastEventTimestamp: lastEvent?.isoTime ?? null,
    currentCompilerStage:
      lastSync?.sessionCurrentStage ?? activeRun?.lastSuccessfulStage ?? lastEvent?.stageName ?? null,
    currentUiStep: lastSync?.uiCurrentStepId ?? null,
    lastSuccessfulMilestone: milestoneSummary.lastSuccessful,
    firstPendingMilestone: firstPending
      ? `${firstPending.milestone} (${firstPending.status})`
      : milestoneSummary.firstMissingOrFailed,
    stallThresholdStatus: deriveStallStatus(events, lastSync),
    runHistory: runHistory.length ? runHistory : loadPersistedRunHistory(),
    exportAllowed: meaningful.ok,
    exportBlockReason: meaningful.reason,
    selectedCompileRunId: compileRunId,
  };
}
