/**
 * TEMPORARY DEBUG ROUTE — remove when Experience Lab is stable.
 * Public. Path: /__boot-debug — StudioBootstrap only, no guards.
 */
import { useEffect, useState } from 'react';

type BootRow = {
  id: string;
  name: string;
  status: string;
  dependencies: string[];
  errors: string[];
  warnings: string[];
  fallback?: string;
};

export default function BootDebugPage() {
  const [rows, setRows] = useState<BootRow[]>([]);
  const [bootError, setBootError] = useState<string | null>(null);
  const [fallbacksUsed, setFallbacksUsed] = useState<string[]>([]);
  const [ready, setReady] = useState<boolean | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setRunning(true);
      setBootError(null);
      try {
        const { runStudioBootstrap } = await import(
          '../../../studio-os-core/bootstrap/studio-bootstrap'
        );
        const report = await runStudioBootstrap({ through: 'ui-render', force: true });
        if (cancelled) return;
        setRows(
          report.modules.map((m) => ({
            id: m.id,
            name: m.name,
            status: m.status,
            dependencies: m.dependencies,
            errors: m.errors,
            warnings: m.warnings,
            fallback: m.fallback,
          }))
        );
        setFallbacksUsed(report.fallbacksUsed);
        setReady(report.ready);
        if (report.errors.length) setBootError(report.errors.join(' · '));
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setBootError(msg);
        try {
          const { getStudioBootstrapReport } = await import(
            '../../../studio-os-core/bootstrap/studio-bootstrap'
          );
          const cached = getStudioBootstrapReport();
          if (cached) {
            setRows(
              cached.modules.map((m) => ({
                id: m.id,
                name: m.name,
                status: m.status,
                dependencies: m.dependencies,
                errors: m.errors,
                warnings: m.warnings,
                fallback: m.fallback,
              }))
            );
          } else {
            setRows([
              {
                id: 'bootstrap',
                name: 'StudioBootstrap',
                status: 'failed',
                dependencies: [],
                errors: [msg],
                warnings: [],
              },
            ]);
          }
        } catch {
          setRows([
            {
              id: 'bootstrap',
              name: 'StudioBootstrap',
              status: 'failed',
              dependencies: [],
              errors: [msg],
              warnings: [],
            },
          ]);
        }
        setReady(false);
      } finally {
        if (!cancelled) setRunning(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusColor: Record<string, string> = {
    ready: '#166534',
    fallback: '#b45309',
    failed: '#eb1c24',
    loading: '#2563eb',
    idle: '#6b7280',
  };

  return (
    <div
      data-temp-debug-route="__boot-debug"
      style={{
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        background: '#fafafa',
        color: '#111',
      }}
    >
      <h1 style={{ fontSize: '16px', margin: '0 0 8px' }}>Boot Debug — StudioBootstrap™</h1>
      <p style={{ margin: '0 0 12px', color: '#666', fontSize: '11px' }}>
        TEMPORARY DEBUG ROUTE — no AdminGuard, no workspace guard, no auth required
      </p>
      {running ? <p>Running boot sequence…</p> : null}
      {ready !== null ? (
        <p style={{ color: ready ? '#166534' : '#eb1c24' }}>
          Boot ready: {ready ? 'yes' : 'no'}
        </p>
      ) : null}
      {bootError ? (
        <pre style={{ color: '#eb1c24', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{bootError}</pre>
      ) : null}
      {fallbacksUsed.length > 0 ? (
        <p style={{ fontSize: '12px' }}>Fallbacks: {fallbacksUsed.join(' · ')}</p>
      ) : null}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
        {rows.map((row) => (
          <li
            key={row.id}
            style={{
              padding: '10px 0',
              borderBottom: '1px solid #e5e5e5',
              fontSize: '12px',
            }}
          >
            <span style={{ color: statusColor[row.status] ?? '#333', fontWeight: 700 }}>
              {row.status.toUpperCase()}
            </span>{' '}
            <strong>{row.name}</strong> <span style={{ color: '#888' }}>({row.id})</span>
            {row.dependencies.length > 0 ? (
              <div style={{ color: '#666', marginTop: '4px' }}>
                deps: {row.dependencies.join(', ')}
              </div>
            ) : null}
            {row.errors.map((e) => (
              <div key={e} style={{ color: '#eb1c24', marginTop: '4px' }}>
                {e}
              </div>
            ))}
            {row.warnings.map((w) => (
              <div key={w} style={{ color: '#b45309', marginTop: '4px' }}>
                {w}
              </div>
            ))}
            {row.fallback ? (
              <div style={{ color: '#b45309', marginTop: '4px' }}>fallback: {row.fallback}</div>
            ) : null}
          </li>
        ))}
      </ul>

      <p style={{ marginTop: '20px', fontSize: '11px' }}>
        <a href="/__studio-health">/__studio-health</a> · <a href="/__chunk-debug">/__chunk-debug</a> ·{' '}
        <a href="/__experience-lab-safe">/__experience-lab-safe</a>
      </p>
    </div>
  );
}
