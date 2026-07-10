/**
 * Studio OS Session Forensic Report — evidence only, no recommendations.
 * Path: /__studio-os-session-report
 */
import { useCallback, useEffect, useState } from 'react';
import {
  buildSessionForensicReport,
  loadLastSessionReport,
  loadEnvironmentSnapshots,
  compareEnvironmentSnapshots,
} from '../../../studio-os/diagnostics';
import { findSnapshotPairs } from '../../../studio-os/diagnostics/environment-diff/compare';
import type { SessionForensicReport } from '../../../studio-os/diagnostics/types';

export default function StudioOsSessionReportPage() {
  const [report, setReport] = useState<SessionForensicReport | null>(() => loadLastSessionReport());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await buildSessionForensicReport();
      setReport(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!report) void refresh();
  }, [report, refresh]);

  const snapshots = loadEnvironmentSnapshots();
  const pairs = findSnapshotPairs(snapshots);
  const envDiff = pairs[0] ? compareEnvironmentSnapshots(pairs[0].baseline, pairs[0].compare) : null;

  return (
    <div
      data-temp-debug-route="__studio-os-session-report"
      style={{
        minHeight: '100vh',
        padding: 24,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        background: '#0f0a1a',
        color: '#ddd6fe',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 8px' }}>Studio OS Session Forensic Report</h1>
      <p style={{ margin: '0 0 16px', color: '#c4b5fd' }}>
        Evidence only — no repair recommendations until a single pre-failure event is proven ALWAYS.
      </p>

      <button type="button" onClick={() => void refresh()} disabled={loading} style={{ marginBottom: 16 }}>
        {loading ? 'Building report…' : 'Rebuild forensic report'}
      </button>

      {!report ? (
        <p style={{ color: '#fbbf24' }}>No report yet. Navigate the app, then rebuild.</p>
      ) : (
        <>
          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Failure evidence</h2>
            <pre style={{ background: '#1e1b4b', padding: 12, borderRadius: 6, overflow: 'auto' }}>
              {JSON.stringify(
                {
                  sessionId: report.sessionId,
                  generatedAt: report.generatedAt,
                  bootCompleted: report.bootCompleted,
                  heartbeatDurationMs: report.heartbeatDurationMs,
                  finalSuccessfulEvent: report.finalSuccessfulEvent
                    ? {
                        type: report.finalSuccessfulEvent.type,
                        isoTime: report.finalSuccessfulEvent.isoTime,
                        source: report.finalSuccessfulEvent.source,
                      }
                    : null,
                  firstAbnormalEvent: report.firstAbnormalEvent
                    ? {
                        type: report.firstAbnormalEvent.type,
                        isoTime: report.firstAbnormalEvent.isoTime,
                        source: report.firstAbnormalEvent.source,
                        caller: report.firstAbnormalEvent.caller,
                      }
                    : null,
                  firstIrreversibleFailure: report.firstIrreversibleFailure?.type ?? null,
                  failureClassification: report.failureClassification,
                  gap: report.timeline.gapDescription,
                },
                null,
                2
              )}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Counters</h2>
            <pre style={{ background: '#1e1b4b', padding: 12, borderRadius: 6 }}>
              {JSON.stringify(
                {
                  registryUpdates: report.registryUpdateCount,
                  sceneStackUpdates: report.sceneStackUpdateCount,
                  reactRemounts: report.reactRemountCount,
                  errors: report.errorCount,
                  longTasks: report.warningCount,
                  timers: report.timerInventory.length,
                  subscriptionLoops: report.subscriptionLoops.length,
                },
                null,
                2
              )}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>~3s timer candidates</h2>
            <pre style={{ background: '#1e1b4b', padding: 12, borderRadius: 6, fontSize: 10 }}>
              {JSON.stringify(
                report.timerInventory.filter(
                  (t) => t.intervalMs != null && t.intervalMs >= 2500 && t.intervalMs <= 3500
                ),
                null,
                2
              ) || '[]'}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Subscription loops</h2>
            <pre style={{ background: '#1e1b4b', padding: 12, borderRadius: 6, fontSize: 10 }}>
              {JSON.stringify(report.subscriptionLoops, null, 2) || '[]'}
            </pre>
          </section>

          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Ownership conflicts</h2>
            <pre style={{ background: '#1e1b4b', padding: 12, borderRadius: 6, fontSize: 10 }}>
              {JSON.stringify(report.ownershipConflicts, null, 2)}
            </pre>
          </section>

          {(report.environmentDiff ?? envDiff) && (
            <section style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Environment diff (differing values only)</h2>
              <pre
                style={{
                  background: '#1e1b4b',
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 9,
                  maxHeight: 360,
                  overflow: 'auto',
                }}
              >
                {JSON.stringify((report.environmentDiff ?? envDiff)?.differingKeys ?? [], null, 2)}
              </pre>
            </section>
          )}
        </>
      )}

      <p style={{ marginTop: 16, fontSize: 11 }}>
        <a href="/__studio-os-flight-recorder" style={{ color: '#7dd3fc' }}>
          /__studio-os-flight-recorder
        </a>
      </p>
    </div>
  );
}
