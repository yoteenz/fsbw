import { useEffect, useState } from 'react';
import {
  probeExperienceLabImports,
  type SafeImportProbeResult,
} from '../../../../../components/admin/studio/experience-lab/safe-import-probe';
import { useRequireStudioWorldAdmin } from '../../../../../hooks/useRequireStudioWorldAdmin';

/** Incremental import probe — Studio World admin infrastructure only. */
export default function ExperienceLabSafePage() {
  useRequireStudioWorldAdmin();
  const [results, setResults] = useState<SafeImportProbeResult[] | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    probeExperienceLabImports()
      .then((rows) => {
        if (!cancelled) setResults(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setRouteError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', fontSize: '13px' }} data-xelab-safe>
      <h1 style={{ fontSize: '16px', margin: '0 0 12px' }}>Experience Lab Safe Import Probe</h1>
      <p style={{ color: '#555', marginBottom: '16px' }}>
        Route loaded. Probing modules one at a time…
      </p>
      {routeError ? (
        <pre style={{ color: '#eb1c24', whiteSpace: 'pre-wrap' }}>{routeError}</pre>
      ) : null}
      {!results ? (
        <p>Running probes…</p>
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
    </div>
  );
}
