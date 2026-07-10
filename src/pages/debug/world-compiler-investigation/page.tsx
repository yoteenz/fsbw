/**
 * World Compiler LOAD_SHELL stall evidence — /__world-compiler-investigation
 * Observe-only; no production repair.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  buildStallEvidenceReport,
  buildWorldCompilerForensicReport,
  downloadInvestigationExport,
  exportCompleteInvestigationJson,
  getInvestigationEvents,
  isInvestigationInstrumentationReady,
  isWorldCompilerDiagnosticMode,
  loadInvestigationEventsFromSession,
  markInvestigationInstrumentationReady,
} from '../../../studio-os/diagnostics/world-compiler-investigation';
import type { StallEvidenceReport } from '../../../studio-os/diagnostics/world-compiler-investigation';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function WorldCompilerInvestigationPage() {
  const [stallReport, setStallReport] = useState<StallEvidenceReport | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [instrumentationReady, setInstrumentationReady] = useState(false);

  const refresh = useCallback(() => {
    loadInvestigationEventsFromSession();
    markInvestigationInstrumentationReady();
    setInstrumentationReady(isInvestigationInstrumentationReady());
    setStallReport(buildStallEvidenceReport());
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  const events = getInvestigationEvents();
  const legacyReport = stallReport?.legacyForensicReport ?? buildWorldCompilerForensicReport();
  const diag = isWorldCompilerDiagnosticMode();
  const classification = stallReport?.stallClassification;

  const handleExportInvestigation = async () => {
    setExporting(true);
    setCopyStatus(null);
    try {
      const json = await exportCompleteInvestigationJson();
      downloadInvestigationExport(json, stallReport?.activeCompileRun?.compileRunId ?? undefined);
      setCopyStatus('Investigation exported — JSON downloaded');
    } catch {
      setCopyStatus('Export failed — try Copy Report');
    } finally {
      setExporting(false);
      window.setTimeout(() => setCopyStatus(null), 4000);
    }
  };

  const handleCopyReport = async () => {
    setCopyStatus(null);
    try {
      const json = await exportCompleteInvestigationJson();
      const ok = await copyText(json);
      setCopyStatus(ok ? 'Complete investigation report copied to clipboard' : 'Copy failed — use Export Investigation');
    } catch {
      setCopyStatus('Copy failed — refresh and retry');
    }
    window.setTimeout(() => setCopyStatus(null), 4000);
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
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 600,
            background: instrumentationReady ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 146, 60, 0.15)',
            color: instrumentationReady ? '#4ade80' : '#fb923c',
            border: `1px solid ${instrumentationReady ? '#4ade80' : '#fb923c'}`,
          }}
        >
          {instrumentationReady ? '● Investigation Ready' : '○ Instrumentation loading…'}
        </span>
      </div>

      <p style={{ margin: '0 0 8px', color: '#a8a29e' }}>
        Evidence-only — <strong>no production repair</strong>. Reproduce stall in Experience Lab, then export from this
        page (same browser session). Diagnostic mode optional: {diag ? 'ON' : 'OFF'} (
        <code>?compilerDiag=1</code>).
      </p>
      <p style={{ margin: '0 0 12px', color: '#78716c' }}>
        Console: <code>window.__WC_EXPORT_INVESTIGATION_JSON__()</code>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => void handleExportInvestigation()}
          disabled={exporting}
          style={{
            padding: '8px 14px',
            background: '#fb923c',
            color: '#0c0a09',
            border: 'none',
            borderRadius: 4,
            fontWeight: 700,
            cursor: exporting ? 'wait' : 'pointer',
          }}
        >
          {exporting ? 'Exporting…' : 'Export Investigation'}
        </button>
        <button type="button" onClick={() => void handleCopyReport()}>
          Copy Report
        </button>
        <button type="button" onClick={refresh}>
          Refresh
        </button>
      </div>

      {copyStatus ? <p style={{ color: '#4ade80', marginBottom: 12 }}>{copyStatus}</p> : null}

      {!instrumentationReady ? (
        <p style={{ color: '#fb923c', marginBottom: 16 }}>
          Open Experience Lab in this browser first so instrumentation hooks load, then return here before reproducing
          the stall.
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
