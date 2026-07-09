/**
 * TEMPORARY DEBUG ROUTE — remove when Experience Lab is stable.
 * Public. Path: /__experience-lab-safe — no admin/workspace guards or production shell.
 */
import { useEffect, useState } from 'react';
import {
  probeExperienceLabSafeChain,
  type ExperienceLabSafeProbeResult,
} from './probe-chain';

export default function ExperienceLabSafeDebugPage() {
  const [results, setResults] = useState<ExperienceLabSafeProbeResult[] | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    probeExperienceLabSafeChain()
      .then((rows) => {
        if (!cancelled) setResults(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRouteError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      data-temp-debug-route="__experience-lab-safe"
      style={{
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        background: '#fafafa',
        color: '#111',
      }}
    >
      <h1 style={{ fontSize: '16px', margin: '0 0 8px' }}>Experience Lab Safe Mode (Debug)</h1>
      <p style={{ margin: '0 0 16px', color: '#666', fontSize: '11px' }}>
        TEMPORARY DEBUG ROUTE — probes runtime chain only; no Executive Headquarters shell
      </p>

      {routeError ? (
        <pre style={{ color: '#eb1c24', whiteSpace: 'pre-wrap' }}>{routeError}</pre>
      ) : null}

      {!results ? (
        <p>Probing imports one at a time…</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {results.map((row) => (
            <li
              key={row.label}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #eee',
                color: row.ok ? '#166534' : '#eb1c24',
              }}
            >
              {row.ok ? 'OK' : 'FAIL'} · {row.label} · {row.ms}ms
              {row.error ? ` — ${row.error}` : ''}
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: '20px', fontSize: '11px' }}>
        <a href="/__studio-health">/__studio-health</a> · <a href="/__chunk-debug">/__chunk-debug</a> ·{' '}
        <a href="/__boot-debug">/__boot-debug</a>
      </p>
    </div>
  );
}
