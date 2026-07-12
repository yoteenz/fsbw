/**
 * Source-order reconciliation — Independent Forensic Recorder is primary authority.
 */
import type { GspuMicroMarkerId, GspuMicroMarkerRecord } from './generate-shell-package-micro-trace';
import type { RssMicroMarkerId, RssMicroMarkerRecord } from './record-shell-stage-forensic';
import type { IndependentForensicEvent } from './independent-forensic-recorder';

export type SourceOrderStep = {
  stepId: string;
  label: string;
  ifrMarker: string | null;
  rssMarker: RssMicroMarkerId | null;
  gspuMarker: GspuMicroMarkerId | null;
};

export const DISPUTED_SOURCE_ORDER: readonly SourceOrderStep[] = [
  { stepId: 'S01', label: 'Before recordShellStage(create-shell-request)', ifrMarker: 'IFR-01', rssMarker: null, gspuMarker: 'GSPU-02a-before-record-shell-stage' },
  { stepId: 'S02', label: 'recordShellStage(create-shell-request, running) returns', ifrMarker: 'IFR-02', rssMarker: 'RSS-10-return', gspuMarker: 'GSPU-02b-after-record-shell-stage' },
  { stepId: 'S03', label: 'Before GSPU-02 success marker', ifrMarker: 'IFR-03', rssMarker: null, gspuMarker: 'GSPU-02c-before-gspu02-success' },
  { stepId: 'S04', label: 'After GSPU-02 success marker', ifrMarker: 'IFR-04', rssMarker: null, gspuMarker: 'GSPU-02d-after-gspu02-success' },
  { stepId: 'S05', label: 'Before GSPU-03 running marker', ifrMarker: 'IFR-05', rssMarker: null, gspuMarker: 'GSPU-02e-before-gspu03-running' },
  { stepId: 'S06', label: 'After GSPU-03 running marker', ifrMarker: 'IFR-06', rssMarker: null, gspuMarker: 'GSPU-02f-after-gspu03-running' },
  { stepId: 'S07', label: 'Before recipe.departmentId read', ifrMarker: 'IFR-07', rssMarker: null, gspuMarker: 'GSPU-03a-read-department-id' },
  { stepId: 'S08', label: 'After recipe.departmentId read', ifrMarker: 'IFR-08', rssMarker: null, gspuMarker: null },
  { stepId: 'S09', label: 'Before registry initialization', ifrMarker: 'IFR-09', rssMarker: null, gspuMarker: 'GSPU-03b-before-registry-init' },
  { stepId: 'S10', label: 'After registry initialization', ifrMarker: 'IFR-10', rssMarker: null, gspuMarker: 'GSPU-03c-after-registry-init' },
  { stepId: 'S11', label: 'Before package lookup', ifrMarker: 'IFR-11', rssMarker: null, gspuMarker: 'GSPU-03e-before-package-lookup' },
  { stepId: 'S12', label: 'After package lookup', ifrMarker: 'IFR-12', rssMarker: null, gspuMarker: 'GSPU-03f-after-package-lookup' },
  { stepId: 'S13', label: 'Before authorization attach', ifrMarker: 'IFR-13', rssMarker: null, gspuMarker: null },
  { stepId: 'S14', label: 'After authorization attach', ifrMarker: 'IFR-14', rssMarker: null, gspuMarker: null },
  { stepId: 'S15', label: 'Before requestStudioBuilderGenerate', ifrMarker: 'IFR-15', rssMarker: null, gspuMarker: null },
  { stepId: 'S16', label: 'After requestStudioBuilderGenerate', ifrMarker: 'IFR-16', rssMarker: null, gspuMarker: null },
] as const;

export type ReconciliationRow = {
  sourceStep: string;
  sourceLabel: string;
  independentRecorder: 'observed' | 'missing' | 'partial';
  rss: 'observed' | 'missing' | 'stale' | 'n/a';
  gspu: 'observed' | 'missing' | 'stale' | 'n/a';
  authority: 'ifr' | 'rss' | 'gspu' | 'none';
  note: string | null;
};

function markerObserved(
  events: IndependentForensicEvent[],
  marker: string | null
): 'observed' | 'missing' | 'partial' {
  if (!marker) return 'missing';
  const hits = events.filter((e) => e.sourceMarker === marker);
  if (hits.length === 0) return 'missing';
  const hasAfter = hits.some((e) => e.eventType === 'after-statement' || e.eventType === 'function-exit');
  const hasBefore = hits.some((e) => e.eventType === 'before-statement' || e.eventType === 'function-enter');
  if (hasBefore && hasAfter) return 'observed';
  if (hasAfter || hits.some((e) => e.eventType === 'explicit-checkpoint')) return 'observed';
  if (hasBefore) return 'partial';
  return 'partial';
}

function rssObserved(markers: RssMicroMarkerRecord[], id: RssMicroMarkerId | null): ReconciliationRow['rss'] {
  if (!id) return 'n/a';
  const m = markers.find((x) => x.markerId === id);
  if (!m) return 'missing';
  if (m.status === 'success' || m.status === 'running') return 'observed';
  if (m.status === 'pending') return 'stale';
  return 'observed';
}

function gspuObserved(markers: GspuMicroMarkerRecord[], id: GspuMicroMarkerId | null): ReconciliationRow['gspu'] {
  if (!id) return 'n/a';
  const m = markers.find((x) => x.markerId === id);
  if (!m) return 'missing';
  if (m.status === 'success' || m.status === 'running') return 'observed';
  if (m.status === 'pending') return 'stale';
  return 'observed';
}

export function buildForensicReconciliationTable(input: {
  ifrEvents: IndependentForensicEvent[];
  rssMarkers: RssMicroMarkerRecord[];
  gspuMarkers: GspuMicroMarkerRecord[];
}): ReconciliationRow[] {
  return DISPUTED_SOURCE_ORDER.map((step) => {
    const ifr = markerObserved(input.ifrEvents, step.ifrMarker);
    const rss = rssObserved(input.rssMarkers, step.rssMarker);
    const gspu = gspuObserved(input.gspuMarkers, step.gspuMarker);

    let authority: ReconciliationRow['authority'] = 'none';
    if (ifr === 'observed') authority = 'ifr';
    else if (rss === 'observed') authority = 'rss';
    else if (gspu === 'observed') authority = 'gspu';

    let note: string | null = null;
    if (ifr === 'observed' && (rss === 'stale' || rss === 'missing' || gspu === 'stale' || gspu === 'missing')) {
      note = 'IFR primary — store disagreement';
    } else if (ifr === 'missing' && (rss === 'observed' || gspu === 'observed')) {
      note = 'Store claims step — IFR gap is proven boundary';
    }

    return {
      sourceStep: step.stepId,
      sourceLabel: step.label,
      independentRecorder: ifr,
      rss,
      gspu,
      authority,
      note,
    };
  });
}

export type DiagnosticSelfInterferenceRisk = {
  id: string;
  risk: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
};

export const DIAGNOSTIC_SELF_INTERFERENCE_RISKS: readonly DiagnosticSelfInterferenceRisk[] = [
  {
    id: 'SI-01',
    risk: 'RSS notify() persists full Black Box snapshot and notifies React subscribers on every recordShellStage statement',
    severity: 'high',
    mitigation: 'IFR records outside notify/persist chain; RSS remains secondary evidence',
  },
  {
    id: 'SI-02',
    risk: 'detectStalls() runs inside recordShellStage and may write stallSignals before return completes',
    severity: 'medium',
    mitigation: 'IFR function-exit proves return before derived stall classification',
  },
  {
    id: 'SI-03',
    risk: 'GSPU micro-markers can skip running state (e.g. GSPU-02b jumped to success) leaving prior marker stuck running',
    severity: 'high',
    mitigation: 'GSPU-02b now sets running before success; IFR checkpoints are authoritative',
  },
  {
    id: 'SI-04',
    risk: 'Overlapping stores (RSS, GSPU, Dispatch Desk) use separate clocks and mutation paths',
    severity: 'medium',
    mitigation: 'Reconciliation table compares all three against source order',
  },
  {
    id: 'SI-05',
    risk: 'Subscriber callbacks during recordShellStage can recurse or throw, blocking RSS-10-return marker',
    severity: 'high',
    mitigation: 'IFR-02 after-call proves recordShellStage returned regardless of RSS marker state',
  },
  {
    id: 'SI-06',
    risk: 'Stale sessionStorage snapshot export can disagree with in-memory store at stall time',
    severity: 'medium',
    mitigation: 'IFR throttled persist is separate key; mobile export reads IFR ledger directly',
  },
  {
    id: 'SI-07',
    risk: 'GSPU-03b registry-init marker defined but never emitted in initialize.ts',
    severity: 'medium',
    mitigation: 'IFR-09/10 emitted at registry init; GSPU-03b added in initialize.ts',
  },
  {
    id: 'SI-08',
    risk: 'Diagnostic wrappers (traceShellAsync + function-body) create duplicate Dispatch Desk entries',
    severity: 'low',
    mitigation: 'Classifier treats wrapper+body as instrumentation pair; IFR records actual source order only',
  },
];

export function findFirstMissingIfrEventAfterRecordedBefore(
  events: IndependentForensicEvent[]
): { beforeMarker: string; missingAfter: string } | null {
  for (const step of DISPUTED_SOURCE_ORDER) {
    if (!step.ifrMarker) continue;
    const beforeType = step.ifrMarker;
    const idx = events.findIndex((e) => e.sourceMarker === beforeType);
    if (idx < 0) continue;
    const nextStep = DISPUTED_SOURCE_ORDER[DISPUTED_SOURCE_ORDER.indexOf(step) + 1];
    if (!nextStep?.ifrMarker) continue;
    const hasNext = events.some((e) => e.sourceMarker === nextStep.ifrMarker);
    if (!hasNext) {
      return { beforeMarker: beforeType, missingAfter: nextStep.ifrMarker };
    }
  }
  return null;
}

export function findLastProvenIfrEvent(events: IndependentForensicEvent[]): IndependentForensicEvent | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i]!;
    if (e.eventType === 'function-exit' || e.eventType === 'after-statement' || e.eventType === 'explicit-checkpoint') {
      return e;
    }
  }
  return null;
}
