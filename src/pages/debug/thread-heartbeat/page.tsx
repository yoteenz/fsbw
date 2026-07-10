/**
 * Public main-thread heartbeat route — /__thread-heartbeat
 * Reads plain-DOM diagnostics (window.__MTD) — works even if React is degraded.
 */
import { useEffect, useState } from 'react';
import {
  getMainThreadDiagnosticsSnapshot,
  type MainThreadDiagnosticsSnapshot,
} from '../../../platform-stabilization/main-thread-diagnostics';

function readSnapshot(): MainThreadDiagnosticsSnapshot {
  const win = window as unknown as { __MTD?: () => MainThreadDiagnosticsSnapshot };
  if (typeof win.__MTD === 'function') return win.__MTD();
  return getMainThreadDiagnosticsSnapshot();
}

export default function ThreadHeartbeatDebugPage() {
  const [snap, setSnap] = useState<MainThreadDiagnosticsSnapshot>(() => readSnapshot());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = readSnapshot();
      setSnap(next);
      if (next.heartbeat >= 8 && !next.frozen) setReady(true);
    }, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-temp-debug-route="__thread-heartbeat"
      style={{
        minHeight: '100vh',
        padding: 24,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 13,
        background: '#0b1020',
        color: '#e2e8f0',
      }}
    >
      <h1 style={{ fontSize: 18, margin: '0 0 8px', color: ready ? '#4ade80' : '#fbbf24' }}>
        {ready ? 'READY — heartbeat alive' : 'Main thread heartbeat'}
      </h1>
      <p style={{ margin: '0 0 16px', color: '#94a3b8' }}>
        Plain-DOM counters from <code>initMainThreadDiagnostics()</code>. If hb/raf/to stop while the
        loading GIF freezes, the main thread is blocked.
      </p>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, margin: '0 0 8px' }}>Counters</h2>
        <pre style={{ background: '#111827', padding: 12, borderRadius: 6, overflow: 'auto' }}>
          {JSON.stringify(
            {
              heartbeat: snap.heartbeat,
              rafCount: snap.rafCount,
              timeoutProbe: snap.timeoutProbe,
              frozen: snap.frozen,
              longTaskCount: snap.longTaskCount,
              lastLongTaskMs: snap.lastLongTaskMs,
              checkpoint: snap.currentCheckpoint,
              bootstrapPhase: snap.bootstrapPhase,
              activeModule: snap.activeModule,
              kernelInstanceId: snap.kernelInstanceId,
              breakers: snap.breakers,
            },
            null,
            2
          )}
        </pre>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, margin: '0 0 8px' }}>Startup bisection flags</h2>
        <pre style={{ background: '#111827', padding: 12, borderRadius: 6, overflow: 'auto' }}>
          {JSON.stringify(snap.startupEnabled, null, 2)}
        </pre>
        <p style={{ color: '#94a3b8', marginTop: 8 }}>
          Use <code>?startupMax=D</code> or <code>?startupDisable=J</code> on any route. Hide overlay:{' '}
          <code>?heartbeat=0</code>
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 14, margin: '0 0 8px' }}>Trace (last {snap.trace.length})</h2>
        <pre
          style={{
            background: '#111827',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto',
            maxHeight: 420,
            fontSize: 11,
          }}
        >
          {snap.trace
            .slice(-40)
            .map(
              (e) =>
                `${new Date(e.ts).toISOString().slice(11, 23)} ${e.kind.padEnd(10)} d=${e.depth} ${e.name}${e.detail ? ` — ${e.detail}` : ''}${e.durationMs != null ? ` (${e.durationMs.toFixed(1)}ms)` : ''}`
            )
            .join('\n') || '(empty)'}
        </pre>
      </section>

      <p style={{ marginTop: 16, fontSize: 12 }}>
        <a href="/__boot-debug" style={{ color: '#7dd3fc' }}>
          /__boot-debug
        </a>{' '}
        ·{' '}
        <a href="/__studio-health" style={{ color: '#7dd3fc' }}>
          /__studio-health
        </a>{' '}
        ·{' '}
        <a href="/" style={{ color: '#7dd3fc' }}>
          /
        </a>
      </p>
    </div>
  );
}
