/**
 * Recovered freeze trace — survives tab reopen after main-thread stall.
 * Path: /__experience-engine-freeze-report
 */
import { useMemo } from 'react';
import {
  loadBisectSessionReport,
  getFreezeTraceRing,
  getLatestFreezeCheckpoint,
  type BisectSessionReport,
  type FreezeCheckpoint,
} from '../../../platform-stabilization/experience-engine-freeze-bisect/freeze-trace-ledger';
import { BISECT_STAGES } from '../../../platform-stabilization/experience-engine-freeze-bisect/bisect-stages';

function formatCheckpoint(c: FreezeCheckpoint | null): string {
  if (!c) return '(none)';
  return `${new Date(c.timestamp).toISOString()} stage=${c.stage} ${c.component}.${c.function} ${c.phase}${c.detail ? ` — ${c.detail}` : ''} (render=${c.renderCount} effect=${c.effectCount})`;
}

export default function ExperienceEngineFreezeReportPage() {
  const report = useMemo(() => loadBisectSessionReport(), []);
  const ring = useMemo(() => getFreezeTraceRing(), []);
  const latest = useMemo(() => getLatestFreezeCheckpoint(), []);

  const firstFailStage = report && report.completedStage < report.targetStage ? report.completedStage + 1 : null;

  return (
    <div
      data-temp-debug-route="__experience-engine-freeze-report"
      style={{
        minHeight: '100vh',
        padding: 24,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        background: '#1a0f0f',
        color: '#fecaca',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 8px' }}>Experience Engine Freeze Report</h1>
      <p style={{ margin: '0 0 16px', color: '#fca5a5' }}>
        Recovered from sessionStorage after bisect run or freeze. Reopen this route after a stall.
      </p>

      {!report ? (
        <p style={{ color: '#fbbf24' }}>
          No saved report. Run{' '}
          <a href="/__experience-engine-bisect?stage=12" style={{ color: '#7dd3fc' }}>
            /__experience-engine-bisect
          </a>{' '}
          first.
        </p>
      ) : (
        <ReportSections report={report} firstFailStage={firstFailStage} />
      )}

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#fed7d7' }}>Latest checkpoint</h2>
        <pre style={{ background: '#2d1515', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>
          {formatCheckpoint(latest)}
        </pre>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#fed7d7' }}>Trace ring ({ring.length})</h2>
        <pre
          style={{
            background: '#2d1515',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto',
            maxHeight: 360,
            fontSize: 10,
          }}
        >
          {ring
            .map(
              (c) =>
                `${new Date(c.timestamp).toISOString().slice(11, 23)} s${c.stage} ${c.component}.${c.function} ${c.phase}${c.detail ? ` — ${c.detail}` : ''}`
            )
            .join('\n') || '(empty)'}
        </pre>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#fed7d7' }}>Stage reference</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#fca5a5' }}>
          {BISECT_STAGES.map((s) => (
            <li key={s.id}>
              {s.id}: {s.label} — {s.description}
            </li>
          ))}
        </ul>
      </section>

      <p style={{ marginTop: 20, fontSize: 11 }}>
        <a href="/__experience-engine-bisect" style={{ color: '#7dd3fc' }}>
          /__experience-engine-bisect
        </a>
      </p>
    </div>
  );
}

function ReportSections({
  report,
  firstFailStage,
}: {
  report: BisectSessionReport;
  firstFailStage: number | null;
}) {
  const mtd = report.mtdSnapshot as Record<string, unknown> | null;

  return (
    <>
      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#fed7d7' }}>Session summary</h2>
        <pre style={{ background: '#2d1515', padding: 12, borderRadius: 6, overflow: 'auto' }}>
          {JSON.stringify(
            {
              savedAt: report.savedAt,
              route: report.route,
              targetStage: report.targetStage,
              completedStage: report.completedStage,
              firstFailStage,
              firstFailLabel: firstFailStage != null ? BISECT_STAGES[firstFailStage]?.label : null,
              privateModeHeuristic: report.privateMode,
              visibilityState: report.visibilityState,
              authPresent: report.authPresent,
              genesisBytes: report.genesisBytes,
              cssAnimationRunning: report.cssAnimationRunning,
              renderCounts: report.renderCounts,
              userAgent: report.userAgent,
            },
            null,
            2
          )}
        </pre>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#fed7d7' }}>MTD at save time</h2>
        <pre style={{ background: '#2d1515', padding: 12, borderRadius: 6, overflow: 'auto' }}>
          {JSON.stringify(mtd, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#fed7d7' }}>Last checkpoint before save</h2>
        <pre style={{ background: '#2d1515', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>
          {formatCheckpoint(report.lastCheckpoint)}
        </pre>
      </section>

      <section>
        <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#fed7d7' }}>Freeze signal interpretation guide</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#fca5a5', lineHeight: 1.6 }}>
          <li>RAF + timeout stop, CSS continues → JS main thread blocked</li>
          <li>All three stop → compositor/tab fully stalled</li>
          <li>RAF stops, timeout continues → rendering loop failure</li>
          <li>Heartbeats continue but UI stuck → state/route lifecycle, not freeze</li>
        </ul>
      </section>
    </>
  );
}
