/**
 * TEMPORARY DEBUG ROUTE — remove when Experience Lab is stable.
 * Public. Path: /__chunk-debug
 */
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { forceReloadForStaleChunks } from '../../../utils/chunkLoadRecovery';

declare const __GLOBE_EMBED_BUILD__: string | undefined;

type FailedLoad = { url: string; reason: string };

export default function ChunkDebugPage() {
  const [scripts, setScripts] = useState<string[]>([]);
  const [failures, setFailures] = useState<FailedLoad[]>([]);
  const [reactMounted] = useState(true);

  useEffect(() => {
    const scriptSrcs = [...document.querySelectorAll('script[src]')].map(
      (el) => (el as HTMLScriptElement).src
    );
    setScripts(scriptSrcs);

    const failed: FailedLoad[] = [];
    try {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      for (const entry of entries) {
        if (entry.transferSize === 0 && entry.decodedBodySize === 0 && entry.duration > 0) {
          failed.push({ url: entry.name, reason: 'zero transfer (possible 404/blocked)' });
        }
      }
    } catch {
      /* ignore */
    }
    setFailures(failed);

    const onError = (event: ErrorEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const url =
          (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || event.filename || 'unknown';
        setFailures((prev) => [...prev, { url, reason: event.message || 'resource error' }]);
      }
    };
    window.addEventListener('error', onError, true);
    return () => window.removeEventListener('error', onError, true);
  }, []);

  const deploymentHash =
    typeof __GLOBE_EMBED_BUILD__ !== 'undefined' ? String(__GLOBE_EMBED_BUILD__) : 'unavailable';

  const reloadNoCache = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('_v', String(Date.now()));
    window.location.replace(url.toString());
  };

  const clearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    reloadNoCache();
  };

  const btn: CSSProperties = {
    padding: '8px 12px',
    margin: '4px',
    border: '1px solid #333',
    background: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  };

  return (
    <div
      data-temp-debug-route="__chunk-debug"
      style={{
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        background: '#fafafa',
        color: '#111',
      }}
    >
      <h1 style={{ fontSize: '16px', margin: '0 0 12px' }}>Chunk Debug</h1>
      <p style={{ margin: '4px 0' }}>Main app mounted: yes (this page rendered)</p>
      <p style={{ margin: '4px 0' }}>React mounted: {reactMounted ? 'yes' : 'no'}</p>
      <p style={{ margin: '4px 0' }}>Deployment hash: {deploymentHash}</p>
      <p style={{ margin: '4px 0', fontSize: '11px', color: '#666' }}>
        TEMPORARY DEBUG ROUTE — no workspace imports
      </p>

      <div style={{ marginTop: '16px' }}>
        <button type="button" style={btn} onClick={reloadNoCache}>
          Reload without cache
        </button>
        <button type="button" style={btn} onClick={clearStorage}>
          Clear local/session storage
        </button>
        <button type="button" style={btn} onClick={() => forceReloadForStaleChunks()}>
          Force chunk reload
        </button>
        <a href="/__studio-health" style={{ ...btn, display: 'inline-block', textDecoration: 'none', color: '#111' }}>
          Go to /__studio-health
        </a>
      </div>

      <h2 style={{ fontSize: '14px', marginTop: '20px' }}>Loaded script tags ({scripts.length})</h2>
      <ul style={{ fontSize: '11px', wordBreak: 'break-all', paddingLeft: '18px' }}>
        {scripts.map((src) => (
          <li key={src}>{src}</li>
        ))}
      </ul>

      <h2 style={{ fontSize: '14px', marginTop: '20px' }}>Failed / suspicious loads ({failures.length})</h2>
      {failures.length === 0 ? (
        <p style={{ color: '#666' }}>None detected yet (watch Network tab for 404 assets).</p>
      ) : (
        <ul style={{ fontSize: '11px', color: '#eb1c24', paddingLeft: '18px' }}>
          {failures.map((f, i) => (
            <li key={`${f.url}-${i}`}>
              {f.url} — {f.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
