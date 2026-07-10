/**
 * World Compiler LOAD_SHELL stall evidence — /__world-compiler-investigation
 * Observe-only; no production repair.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  buildInvestigationLiveStatus,
  buildStallEvidenceReport,
  buildWorldCompilerForensicReport,
  clearCurrentInvestigationRun,
  downloadInvestigationExport,
  exportCompleteInvestigationJson,
  getInvestigationEvents,
  initWorldCompilerInvestigationRecorder,
  isWorldCompilerDiagnosticMode,
  loadInvestigationEventsFromSession,
  refreshBrowserMode,
  setSelectedCompileRunId,
} from '../../../studio-os/diagnostics/world-compiler-investigation';
import type {
  InvestigationLiveStatus,
  StallEvidenceReport,
} from '../../../studio-os/diagnostics/world-compiler-investigation';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function yesNo(value: boolean): string {
  return value ? 'YES' : 'NO';
}

function StatusRow({ label, value, highlight }: { label: string; value: string; highlight?: 'ok' | 'warn' | 'muted' }) {
  const color =
    highlight === 'ok' ? '#4ade80' : highlight === 'warn' ? '#fb923c' : highlight === 'muted' ? '#78716c' : '#fafaf9';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 8, padding: '4px 0', borderBottom: '1px solid #292524' }}>
      <span style={{ color: '#a8a29e' }}>{label}</span>
      <span style={{ color, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

export default function WorldCompilerInvestigationPage() {
  const [liveStatus, setLiveStatus] = useState<InvestigationLiveStatus | null>(null);
  const [stallReport, setStallReport] = useState<StallEvidenceReport | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    initWorldCompilerInvestigationRecorder();
    loadInvestigationEventsFromSession();
    setLiveStatus(buildInvestigationLiveStatus(selectedRunId));
    setStallReport(buildStallEvidenceReport());
  }, [selectedRunId]);

  useEffect(() => {
    void refreshBrowserMode();
    refresh();
    const id = window.setInterval(refresh, 500);
    return () => clearInterval(id);
  }, [refresh]);

  const events = getInvestigationEvents();
  const legacyReport = stallReport?.legacyForensicReport ?? buildWorldCompilerForensicReport();
  const diag = isWorldCompilerDiagnosticMode();
  const classification = stallReport?.stallClassification;
  const exportAllowed = liveStatus?.exportAllowed ?? false;
  const activeRunId = liveStatus?.selectedCompileRunId ?? liveStatus?.compileRunId ?? null;

  const handleSelectRun = (compileRunId: string) => {
    setSelectedCompileRunId(compileRunId);
    setSelectedRunId(compileRunId);
  };

  const handleExportInvestigation = async () => {
    if (!exportAllowed) return;
    setExporting(true);
    setCopyStatus(null);
    try {
      const json = await exportCompleteInvestigationJson(activeRunId);
      downloadInvestigationExport(json, activeRunId ?? undefined);
      setCopyStatus('Investigation exported — JSON downloaded');
    } catch {
      setCopyStatus('Export failed — try Copy Report');
    } finally {
      setExporting(false);
      window.setTimeout(() => setCopyStatus(null), 4000);
    }
  };

  const handleCopyReport = async () => {
    if (!exportAllowed) return;
    setCopyStatus(null);
    try {
      const json = await exportCompleteInvestigationJson(activeRunId);
      const ok = await copyText(json);
      setCopyStatus(ok ? 'Complete investigation report copied to clipboard' : 'Copy failed — use Export Investigation');
    } catch {
      setCopyStatus('Copy failed — refresh and retry');
    }
    window.setTimeout(() => setCopyStatus(null), 4000);
  };

  const handleClearCurrentRun = () => {
    if (!activeRunId) {
      setCopyStatus('No compile run selected to clear');
      window.setTimeout(() => setCopyStatus(null), 3000);
      return;
    }
    clearCurrentInvestigationRun(activeRunId);
    setSelectedRunId(null);
    setSelectedCompileRunId(null);
    refresh();
    setCopyStatus(`Cleared run ${activeRunId.slice(0, 12)}…`);
    window.setTimeout(() => setCopyStatus(null), 4000);
  };

  const btnDisabledStyle = {
    opacity: 0.45,
    cursor: 'not-allowed' as const,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 20,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        background: '#0c0a09',
        color: '#fafaf9',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 16, margin: 0, color: '#fb923c' }}>
          LOAD_SHELL Stall Evidence — World Compiler Investigation
        </h1>
      </div>

      <p style={{ margin: '0 0 8px', color: '#a8a29e' }}>
        Evidence-only — <strong>no production repair</strong>. Reproduce stall in Experience Lab, then return here to
        verify recording and export (same browser session). Diagnostic mode optional: {diag ? 'ON' : 'OFF'} (
        <code>?compilerDiag=1</code>).
      </p>
      <p style={{ margin: '0 0 12px', color: '#78716c' }}>
        Console: <code>window.__WC_EXPORT_INVESTIGATION_JSON__()</code>
      </p>

      {liveStatus ? (
        <section
          style={{
            marginBottom: 16,
            padding: 14,
            background: '#1c1917',
            borderRadius: 6,
            border: '1px solid #44403c',
          }}
        >
          <h2 style={{ fontSize: 13, margin: '0 0 10px', color: '#fb923c' }}>Live recording status</h2>
          <StatusRow
            label="Investigation Ready"
            value={yesNo(liveStatus.investigationReady)}
            highlight={liveStatus.investigationReady ? 'ok' : 'warn'}
          />
          <StatusRow
            label="Recorder Connected"
            value={yesNo(liveStatus.recorderConnected)}
            highlight={liveStatus.recorderConnected ? 'ok' : 'warn'}
          />
          <StatusRow
            label="Compiler event source"
            value={liveStatus.compilerEventSourceConnected ? 'CONNECTED' : 'DISCONNECTED'}
            highlight={liveStatus.compilerEventSourceConnected ? 'ok' : 'warn'}
          />
          <StatusRow label="Recorder subscription" value={liveStatus.recorderSubscriptionStatus} />
          <StatusRow
            label="Self-test status"
            value={liveStatus.selfTestStatus}
            highlight={liveStatus.selfTestStatus === 'PASS' ? 'ok' : liveStatus.selfTestStatus === 'FAIL' ? 'warn' : 'muted'}
          />
          <StatusRow label="Self-test event ID" value={liveStatus.selfTestEventId != null ? String(liveStatus.selfTestEventId) : '—'} />
          <StatusRow label="Self-test timestamp" value={liveStatus.selfTestTimestamp ?? '—'} />
          {liveStatus.selfTestMessage ? (
            <StatusRow label="Self-test detail" value={liveStatus.selfTestMessage} highlight="muted" />
          ) : null}
          <StatusRow
            label="Recording Active"
            value={yesNo(liveStatus.recordingActive)}
            highlight={liveStatus.recordingActive ? 'ok' : 'muted'}
          />
          <StatusRow label="Current browser mode" value={liveStatus.browserMode} />
          <StatusRow label="Current session ID" value={liveStatus.investigationSessionId} />
          <StatusRow label="Current previewSessionId" value={liveStatus.previewSessionId ?? '—'} />
          <StatusRow label="Current compileRunId" value={liveStatus.compileRunId ?? '—'} />
          <StatusRow label="Events captured" value={String(liveStatus.eventsCaptured)} highlight={liveStatus.eventsCaptured > 0 ? 'ok' : 'muted'} />
          <StatusRow label="Last recorded event" value={liveStatus.lastRecordedEvent ?? '—'} />
          <StatusRow label="Last event timestamp" value={liveStatus.lastEventTimestamp ?? '—'} />
          <StatusRow label="Current compiler stage" value={liveStatus.currentCompilerStage ?? '—'} />
          <StatusRow label="Current UI step" value={liveStatus.currentUiStep ?? '—'} />
          <StatusRow label="Last successful milestone" value={liveStatus.lastSuccessfulMilestone ?? '—'} />
          <StatusRow label="First pending milestone" value={liveStatus.firstPendingMilestone ?? '—'} />
          <StatusRow
            label="Stall threshold status"
            value={liveStatus.stallThresholdStatus}
            highlight={liveStatus.stallThresholdStatus.startsWith('STALLED') ? 'warn' : undefined}
          />
          {!exportAllowed && liveStatus.exportBlockReason ? (
            <p style={{ margin: '10px 0 0', color: '#fb923c', fontSize: 10 }}>
              Export blocked: {liveStatus.exportBlockReason}
            </p>
          ) : null}
        </section>
      ) : null}

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Run history (sessionStorage)</h2>
        {liveStatus?.runHistory.length ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {liveStatus.runHistory.map((run) => {
              const selected = run.compileRunId === activeRunId;
              return (
                <li key={run.compileRunId} style={{ marginBottom: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleSelectRun(run.compileRunId)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: selected ? 'rgba(251, 146, 60, 0.15)' : '#1c1917',
                      border: `1px solid ${selected ? '#fb923c' : '#44403c'}`,
                      borderRadius: 4,
                      color: '#fafaf9',
                      cursor: 'pointer',
                    }}
                  >
                    <strong>{run.compileRunId.slice(0, 16)}…</strong>
                    {' · '}
                    {run.eventCount} events
                    {run.stallReached ? ' · STALL' : ''}
                    {run.previewSessionId ? ` · preview=${run.previewSessionId.slice(0, 10)}…` : ''}
                    <br />
                    <span style={{ color: '#78716c', fontSize: 10 }}>
                      {run.firstEventAt?.slice(11, 23) ?? '?'} → {run.lastEventAt?.slice(11, 23) ?? '?'}
                      {run.milestonesReached.length ? ` · ${run.milestonesReached.join(', ')}` : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p style={{ color: '#78716c', margin: 0 }}>
            No runs recorded yet — open Experience Lab in this browser, reproduce the stall, then return here.
          </p>
        )}
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => void handleExportInvestigation()}
          disabled={exporting || !exportAllowed}
          style={{
            padding: '8px 14px',
            background: exportAllowed ? '#fb923c' : '#57534e',
            color: '#0c0a09',
            border: 'none',
            borderRadius: 4,
            fontWeight: 700,
            cursor: exporting || !exportAllowed ? 'not-allowed' : 'pointer',
            ...(exporting || !exportAllowed ? btnDisabledStyle : {}),
          }}
          title={!exportAllowed ? liveStatus?.exportBlockReason ?? 'No meaningful run data' : undefined}
        >
          {exporting ? 'Exporting…' : 'Export Investigation'}
        </button>
        <button
          type="button"
          onClick={() => void handleCopyReport()}
          disabled={!exportAllowed}
          style={!exportAllowed ? btnDisabledStyle : undefined}
          title={!exportAllowed ? liveStatus?.exportBlockReason ?? 'No meaningful run data' : undefined}
        >
          Copy Report
        </button>
        <button type="button" onClick={handleClearCurrentRun} disabled={!activeRunId}>
          Clear Current Run
        </button>
        <button type="button" onClick={refresh}>
          Refresh
        </button>
      </div>

      {copyStatus ? <p style={{ color: '#4ade80', marginBottom: 12 }}>{copyStatus}</p> : null}

      {!liveStatus?.recorderConnected ? (
        <p style={{ color: '#fb923c', marginBottom: 16 }}>
          Recorder not connected — hard-refresh this tab so global-boot registers the investigation recorder, then
          confirm Self-test: PASS before reproducing in Experience Lab.
        </p>
      ) : !liveStatus.investigationReady ? (
        <p style={{ color: '#fb923c', marginBottom: 16 }}>
          Investigation instrumentation boot incomplete — reload and confirm Self-test PASS.
        </p>
      ) : null}

      {classification ? (
        <section style={{ marginBottom: 16, padding: 12, background: '#1c1917', borderRadius: 6 }}>
          <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Stall classification (evidence-based)</h2>
          <p style={{ margin: '0 0 4px' }}>
            <strong>{classification.classification}</strong> · confidence: {classification.confidence}
          </p>
          <p style={{ margin: '0 0 8px', color: '#d6d3d1' }}>{classification.summary}</p>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#a8a29e' }}>
            {classification.proof.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {stallReport ? (
        <>
          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13 }}>Load-shell milestones (M1–M7)</h2>
            <pre style={{ background: '#1c1917', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 9 }}>
              {stallReport.loadShellMilestones.length
                ? stallReport.loadShellMilestones
                    .map(
                      (e) =>
                        `${e.isoTime.slice(11, 23)} ${e.detail?.milestone ?? '?'} ${e.detail?.milestoneState ?? e.status} run=${e.compileRunId?.slice(0, 12) ?? '—'}`
                    )
                    .join('\n')
                : '(none yet — reproduce stall, then Export Investigation)'}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13 }}>Quick preview</h2>
            <pre style={{ background: '#1c1917', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 9 }}>
              {JSON.stringify(
                {
                  eventCount: events.length,
                  activeRun: stallReport.activeCompileRun?.compileRunId ?? null,
                  milestonesReached: classification?.loadShellMilestonesReached ?? [],
                  milestonesMissing: classification?.loadShellMilestonesMissing ?? [],
                  pendingAsync: stallReport.asyncBoundaries.open.length,
                },
                null,
                2
              )}
            </pre>
          </section>
        </>
      ) : null}

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13 }}>Legacy reset-loop fields</h2>
        <pre style={{ background: '#1c1917', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 9 }}>
          {JSON.stringify(
            {
              layer1Classification: legacyReport.layer1Classification,
              compileStopped: legacyReport.compileStopped,
              activeRun: legacyReport.activeRun,
            },
            null,
            2
          )}
        </pre>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13 }}>Black Box cross-reference</h2>
        <ul style={{ color: '#7dd3fc' }}>
          <li>
            <a href="/__studio-os-flight-recorder">/__studio-os-flight-recorder</a>
          </li>
          <li>
            <a href="/__studio-os-session-report">/__studio-os-session-report</a>
          </li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 13 }}>Event log ({events.length})</h2>
        <pre
          style={{
            background: '#1c1917',
            padding: 12,
            borderRadius: 6,
            fontSize: 9,
            maxHeight: 360,
            overflow: 'auto',
          }}
        >
          {events
            .slice(-80)
            .map(
              (e) =>
                `${e.isoTime.slice(11, 23)} ${e.type} run=${e.compileRunId?.slice(0, 8) ?? '—'} ${e.stageName ?? ''} ${e.status ?? ''}`
            )
            .join('\n') || '(empty — open Experience Lab and reproduce stall)'}
        </pre>
      </section>
    </div>
  );
}
