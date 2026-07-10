/**
 * Full stall evidence report for device export — evidence only, no repair.
 */
import {
  getInvestigationEvents,
  getActiveCompileRun,
  loadInvestigationEventsFromSession,
} from './investigation-log';
import { buildWorldCompilerForensicReport } from './session-report';
import { classifyLoadShellStall } from './stall-classifier';
import {
  getAsyncBoundaryHistory,
  getLoadShellMilestones,
  getOpenAsyncBoundaries,
  loadStallEvidenceFromSession,
} from './stall-evidence';
import type { UiCompilerSyncSnapshot } from './stall-evidence';

export type StallEvidenceReport = {
  generatedAt: string;
  evidenceOnly: true;
  repairApplied: false;
  reproductionHint: string;
  activeCompileRun: ReturnType<typeof getActiveCompileRun>;
  legacyForensicReport: ReturnType<typeof buildWorldCompilerForensicReport>;
  loadShellMilestones: ReturnType<typeof getLoadShellMilestones>;
  asyncBoundaries: {
    open: ReturnType<typeof getOpenAsyncBoundaries>;
    history: ReturnType<typeof getAsyncBoundaryHistory>;
  };
  uiCompilerSyncSnapshots: Array<Record<string, unknown>>;
  pipelineLifecycleEvents: Array<Record<string, unknown>>;
  stallClassification: ReturnType<typeof classifyLoadShellStall>;
  blackBoxCrossReference: {
    flightRecorderRoute: '/__studio-os-flight-recorder';
    sessionReportRoute: '/__studio-os-session-report';
    environmentDiffInstruction: string;
  };
  exportFormats: {
    json: string;
    markdown: string;
  };
};

function buildMarkdownReport(report: Omit<StallEvidenceReport, 'exportFormats'>): string {
  const c = report.stallClassification;
  const lines = [
    '# LOAD_SHELL Stall Evidence Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '**Evidence only — no production repair applied.**',
    '',
    '## Stall classification',
    '',
    `- **ID:** ${c.classification}`,
    `- **Confidence:** ${c.confidence}`,
    `- **Summary:** ${c.summary}`,
    '',
    '### Proof',
    ...c.proof.map((p) => `- ${p}`),
    '',
    '## Last successful / first abnormal',
    '',
    `- Last successful event: ${c.lastSuccessfulEvent?.type ?? 'none'} @ ${c.lastSuccessfulEvent?.isoTime ?? '—'}`,
    `- First missing/failed: ${c.firstMissingOrFailedEvent?.type ?? 'none'} @ ${c.firstMissingOrFailedEvent?.isoTime ?? '—'}`,
    '',
    '## Load-shell milestones',
    '',
    `- Reached: ${c.loadShellMilestonesReached.join(', ') || 'none'}`,
    `- Missing: ${c.loadShellMilestonesMissing.join(', ') || 'none'}`,
    '',
    '## Compiler vs UI at stall',
    '',
    `- compileStation never entered: ${c.compileStationNeverEntered}`,
    `- load-shell never entered: ${c.loadShellNeverEntered}`,
    `- load-shell completed: ${c.loadShellCompleted}`,
    `- UI/compiler diverged: ${c.uiCompilerDiverged}`,
    `- ensure-station still pending: ${c.ensureStationStillPending}`,
    `- duplicate compile detected: ${c.duplicateCompileDetected}`,
    `- AUTH_REQUIRED (separate ensure-station blocker): ${c.authRequiredSeparateBlocker}`,
    '',
    '## Pending async at stall',
    '',
    ...(c.pendingAsyncAtStall.length
      ? c.pendingAsyncAtStall.map(
          (p) =>
            `- ${p.operationName} pending ${p.completedAt ? p.completedAt - p.startedAt : Date.now() - p.startedAt}ms (${p.outcome})`
        )
      : ['- none recorded']),
    '',
    '## Browser comparison (manual)',
    '',
    'Capture env fingerprint in each mode via /__studio-os-flight-recorder:',
    '- Safari normal tab',
    '- Safari private tab',
    '- Chrome normal tab',
    '- Chrome incognito',
    '',
    'Compare bootstrap, service worker, Cache Storage, localStorage, sessionStorage, IndexedDB at /__studio-os-session-report.',
    '',
    '## Reproduction',
    '',
    report.reproductionHint,
    '',
    '---',
    '_Studio OS World Compiler stall evidence — observe-only sprint_',
  ];
  return lines.join('\n');
}

export function buildStallEvidenceReport(compileRunId?: string | null): StallEvidenceReport {
  loadInvestigationEventsFromSession();
  loadStallEvidenceFromSession();
  const events = [...getInvestigationEvents()];
  const activeRun = getActiveCompileRun();
  const runId = compileRunId ?? activeRun?.compileRunId ?? null;

  const syncSnapshots = events
    .filter((e) => e.type === 'UI_COMPILER_SYNC')
    .map((e) => e.detail ?? {});

  const lastSync = syncSnapshots.length
    ? (syncSnapshots[syncSnapshots.length - 1] as unknown as UiCompilerSyncSnapshot)
    : null;

  const lifecycleEvents = events
    .filter((e) => e.type === 'PIPELINE_LIFECYCLE' || e.type === 'LOAD_SHELL_MILESTONE')
    .map((e) => ({
      isoTime: e.isoTime,
      type: e.type,
      lifecycleEvent: e.detail?.lifecycleEvent ?? e.status,
      milestone: e.detail?.milestone,
      milestoneState: e.detail?.milestoneState,
      compileRunId: e.compileRunId,
      detail: e.detail,
    }));

  const stallClassification = classifyLoadShellStall({
    events,
    pendingAsyncAtStall: getOpenAsyncBoundaries(),
    lastSyncSnapshot: lastSync,
    compileRunId: runId,
  });

  const legacyForensicReport = buildWorldCompilerForensicReport();

  const core: Omit<StallEvidenceReport, 'exportFormats'> = {
    generatedAt: new Date().toISOString(),
    evidenceOnly: true,
    repairApplied: false,
    reproductionHint:
      'Open Experience Lab validation render. Wait for Step stalled (~90s). Open /__world-compiler-investigation in same tab (or window.__WC_STALL_EVIDENCE__.buildStallEvidenceReport()). Copy JSON export. Optional: add ?compilerDiag=1 only if founder accepts diagnostic-mode behavior deltas.',
    activeCompileRun: activeRun,
    legacyForensicReport,
    loadShellMilestones: getLoadShellMilestones(events),
    asyncBoundaries: {
      open: getOpenAsyncBoundaries(),
      history: getAsyncBoundaryHistory(),
    },
    uiCompilerSyncSnapshots: syncSnapshots,
    pipelineLifecycleEvents: lifecycleEvents,
    stallClassification,
    blackBoxCrossReference: {
      flightRecorderRoute: '/__studio-os-flight-recorder',
      sessionReportRoute: '/__studio-os-session-report',
      environmentDiffInstruction:
        'Label captures safari-normal, safari-private, chrome-normal, chrome-incognito on flight recorder; diff on session report.',
    },
  };

  const json = JSON.stringify(core, null, 2);
  const markdown = buildMarkdownReport(core);

  return {
    ...core,
    exportFormats: { json, markdown },
  };
}

export function exportStallEvidenceJson(compileRunId?: string | null): string {
  return buildStallEvidenceReport(compileRunId).exportFormats.json;
}

export function exportStallEvidenceMarkdown(compileRunId?: string | null): string {
  return buildStallEvidenceReport(compileRunId).exportFormats.markdown;
}
