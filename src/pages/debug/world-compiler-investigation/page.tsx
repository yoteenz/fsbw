/**
 * World Compiler Three-Second Reset Loop Investigation™
 * Path: /__world-compiler-investigation
 */
import { useCallback, useEffect, useState } from 'react';
import {
  buildWorldCompilerForensicReport,
  loadInvestigationEventsFromSession,
  getInvestigationEvents,
  isWorldCompilerDiagnosticMode,
  COMPILER_PATH_TIMERS,
  findTimersNearThreeSeconds,
} from '../../../studio-os/diagnostics/world-compiler-investigation';
import type { WorldCompilerForensicReport } from '../../../studio-os/diagnostics/world-compiler-investigation';

export default function WorldCompilerInvestigationPage() {
  const [report, setReport] = useState<WorldCompilerForensicReport | null>(null);

  const refresh = useCallback(() => {
    loadInvestigationEventsFromSession();
    setReport(buildWorldCompilerForensicReport());
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  const events = getInvestigationEvents();
  const diag = isWorldCompilerDiagnosticMode();

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
        World Compiler Reset Loop Investigation™
      </h1>
      <p style={{ margin: '0 0 12px', color: '#a8a29e' }}>
        Forensics only — no production fix. Diagnostic mode: {diag ? 'ON' : 'OFF'} — add{' '}
        <code>?compilerDiag=1</code> on Experience Lab.
      </p>

      <button type="button" onClick={refresh} style={{ marginBottom: 16 }}>
        Refresh forensic report
      </button>

      {report ? (
        <>
          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13 }}>Required report fields</h2>
            <pre style={{ background: '#1c1917', padding: 12, borderRadius: 6, overflow: 'auto' }}>
              {JSON.stringify(
                {
                  measuredResetIntervalsMs: report.measuredResetIntervalsMs,
                  compilerRestartsVsUiOnly: report.compilerRestartsVsUiOnly,
                  compileRunIdChanges: report.compileRunIdChanges,
                  compilerInstanceIdChanges: report.compilerInstanceIdChanges,
                  componentRemounts: report.componentRemounts,
                  shellIdChanges: report.shellIdChanges,
                  shellInvalidations: report.shellInvalidations,
                  tapCount: report.tapCount,
                  timerAtResetCadence: report.timerAtResetCadence,
                  runtimeTimersNear3s: report.runtimeTimersNear3s,
                  layer1Classification: report.layer1Classification,
                  firstReset: report.firstResetDetected,
                  compileStopped: report.compileStopped,
                },
                null,
                2
              )}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13 }}>Static compiler-path timers</h2>
            <pre style={{ background: '#1c1917', padding: 12, borderRadius: 6, fontSize: 9, overflow: 'auto' }}>
              {JSON.stringify(COMPILER_PATH_TIMERS, null, 2)}
            </pre>
            <p style={{ color: '#78716c' }}>
              ~3s candidates: {findTimersNearThreeSeconds().map((t) => t.function).join(', ') || 'none in compile path'}
            </p>
          </section>
        </>
      ) : null}

      <section>
        <h2 style={{ fontSize: 13 }}>Event log ({events.length})</h2>
        <pre
          style={{
            background: '#1c1917',
            padding: 12,
            borderRadius: 6,
            fontSize: 9,
            maxHeight: 480,
            overflow: 'auto',
          }}
        >
          {events
            .slice(-100)
            .map(
              (e) =>
                `${e.isoTime.slice(11, 23)} ${e.type} run=${e.compileRunId?.slice(0, 8) ?? '—'} ${e.stageName ?? ''} ← ${e.source}`
            )
            .join('\n') || '(empty — open Experience Lab with ?compilerDiag=1)'}
        </pre>
      </section>

      <p style={{ marginTop: 16 }}>
        <a href="/__studio-os-session-report" style={{ color: '#7dd3fc' }}>
          /__studio-os-session-report
        </a>
      </p>
    </div>
  );
}
