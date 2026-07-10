/**
 * World Compiler LOAD_SHELL stall evidence — /__world-compiler-investigation
 * Observe-only; no production repair.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  buildStallEvidenceReport,
  buildWorldCompilerForensicReport,
  exportStallEvidenceJson,
  exportStallEvidenceMarkdown,
  getInvestigationEvents,
  isWorldCompilerDiagnosticMode,
  findTimersNearThreeSeconds,
  loadInvestigationEventsFromSession,
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

  const refresh = useCallback(() => {
    loadInvestigationEventsFromSession();
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

  const handleCopyJson = async () => {
    const ok = await copyText(exportStallEvidenceJson());
    setCopyStatus(ok ? 'JSON copied to clipboard' : 'Copy failed — use Download JSON');
    window.setTimeout(() => setCopyStatus(null), 3000);
  };

  const handleCopyMarkdown = async () => {
    const ok = await copyText(exportStallEvidenceMarkdown());
    setCopyStatus(ok ? 'Markdown copied to clipboard' : 'Copy failed — use Download Markdown');
    window.setTimeout(() => setCopyStatus(null), 3000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportStallEvidenceJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `load-shell-stall-evidence-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([exportStallEvidenceMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `load-shell-stall-evidence-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#fb923c' }}>
        LOAD_SHELL Stall Evidence — World Compiler Investigation
      </h1>
      <p style={{ margin: '0 0 8px', color: '#a8a29e' }}>
        Evidence-only sprint — <strong>no production repair applied</strong>. Diagnostic mode (optional):{' '}
        {diag ? 'ON' : 'OFF'} — <code>?compilerDiag=1</code> changes retry/freeze behavior; prefer default
        Experience Lab for stall reproduction unless founder accepts diag deltas.
      </p>
      <p style={{ margin: '0 0 12px', color: '#78716c' }}>
        Console: <code>window.__WC_INVESTIGATION__</code> (events) ·{' '}
        <code>window.__WC_STALL_EVIDENCE__.buildStallEvidenceReport()</code>
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={refresh}>
          Refresh report
        </button>
        <button type="button" onClick={handleCopyJson}>
          Copy JSON export
        </button>
        <button type="button" onClick={handleCopyMarkdown}>
          Copy Markdown export
        </button>
        <button type="button" onClick={handleDownloadJson}>
          Download JSON
        </button>
        <button type="button" onClick={handleDownloadMarkdown}>
          Download Markdown
        </button>
      </div>
      {copyStatus ? <p style={{ color: '#4ade80', marginBottom: 12 }}>{copyStatus}</p> : null}

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
          <p style={{ margin: '12px 0 0', fontSize: 10, color: '#78716c' }}>
            repairApplied: {String(classification.repairApplied)} · AUTH_REQUIRED separate blocker:{' '}
            {String(classification.authRequiredSeparateBlocker)}
          </p>
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
                : '(none — reproduce stall in Experience Lab, then refresh)'}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13 }}>Async boundaries</h2>
            <pre style={{ background: '#1c1917', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 9 }}>
              {JSON.stringify(stallReport.asyncBoundaries, null, 2)}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13 }}>UI vs compiler sync snapshots</h2>
            <pre style={{ background: '#1c1917', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 9 }}>
              {JSON.stringify(stallReport.uiCompilerSyncSnapshots.slice(-5), null, 2)}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13 }}>Pipeline lifecycle</h2>
            <pre
              style={{
                background: '#1c1917',
                padding: 12,
                borderRadius: 6,
                maxHeight: 240,
                overflow: 'auto',
                fontSize: 9,
              }}
            >
              {stallReport.pipelineLifecycleEvents
                .slice(-40)
                .map(
                  (e) =>
                    `${String(e.isoTime).slice(11, 23)} ${String(e.lifecycleEvent ?? e.type)} ${String(e.milestone ?? '')}`
                )
                .join('\n') || '(empty)'}
            </pre>
          </section>
        </>
      ) : null}

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13 }}>Legacy reset-loop fields</h2>
        <pre style={{ background: '#1c1917', padding: 12, borderRadius: 6, overflow: 'auto' }}>
          {JSON.stringify(
            {
              measuredResetIntervalsMs: legacyReport.measuredResetIntervalsMs,
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
        <p style={{ color: '#a8a29e' }}>
          Capture env fingerprints in each browser mode, then compare on session report:
        </p>
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
            .slice(-120)
            .map(
              (e) =>
                `${e.isoTime.slice(11, 23)} ${e.type} run=${e.compileRunId?.slice(0, 8) ?? '—'} ${e.stageName ?? ''} ${e.status ?? ''} ← ${e.source}`
            )
            .join('\n') || '(empty — open Experience Lab and reproduce stall)'}
        </pre>
      </section>

      <p style={{ marginTop: 16, color: '#78716c', fontSize: 10 }}>
        ~3s timer candidates: {findTimersNearThreeSeconds().map((t) => t.function).join(', ') || 'none'}
      </p>
    </div>
  );
}
