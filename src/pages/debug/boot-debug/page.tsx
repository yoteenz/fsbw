/**
 * TEMPORARY DEBUG ROUTE — remove when Experience Lab is stable.
 * Public. Path: /__boot-debug — direct StudioBootstrap.start() wiring (no hook guard).
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BootDiagnosticsPanel } from '../../../studio-os-core/runtime-diagnostics/boot-diagnostics-panel';
import {
  StudioBootstrap,
  getInitialStudioBootstrapLiveState,
  getStudioBootstrapStartBlockReason,
  STUDIO_BOOT_EVENT,
  type StudioBootLiveState,
  type StudioBootstrapStartSkipReason,
} from '../../../studio-os-core/bootstrap';

type WireLogEntry = { ts: number; message: string };

/** One auto-start per JS session; manual START BOOTSTRAP always works. */
let bootDebugRouteAutoStartDone = false;

export default function BootDebugPage() {
  const [live, setLive] = useState<StudioBootLiveState>(() => getInitialStudioBootstrapLiveState());
  const [wireLog, setWireLog] = useState<WireLogEntry[]>([]);
  const [skipReason, setSkipReason] = useState<StudioBootstrapStartSkipReason | null>(null);
  const wireLogOrigin = useRef(Date.now());
  const firstModuleLogged = useRef(false);

  const appendWireLog = useCallback((message: string) => {
    console.log(`[boot-debug] ${message}`);
    setWireLog((prev) => [...prev, { ts: Date.now(), message }]);
  }, []);

  const syncLive = useCallback(() => {
    const cached = StudioBootstrap.getLiveState();
    if (cached) setLive(cached);
  }, []);

  const callStudioBootstrapStart = useCallback(
    (source: 'mount' | 'manual') => {
      appendWireLog('start requested');

      if (typeof StudioBootstrap?.start !== 'function') {
        const reason: StudioBootstrapStartSkipReason = 'unknown';
        appendWireLog(`BLOCKED: ${reason} — StudioBootstrap.start unavailable`);
        setSkipReason(reason);
        return;
      }

      if (source === 'manual') {
        StudioBootstrap.reset();
        setSkipReason(null);
      } else {
        const blockReason = getStudioBootstrapStartBlockReason();
        if (blockReason === 'already running' || blockReason === 'already complete') {
          appendWireLog(`start skipped: ${blockReason}`);
          setSkipReason(blockReason);
          syncLive();
          return;
        }
        if (blockReason) {
          appendWireLog(`BLOCKED: ${blockReason}`);
          setSkipReason(blockReason);
          return;
        }
        setSkipReason(null);
      }

      appendWireLog('start function called');

      void StudioBootstrap.start({
        through: 'ui-render',
        force: true,
        allowReset: source === 'manual',
      })
        .then(() => {
          appendWireLog('bootstrap finished');
          syncLive();
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          appendWireLog(`bootstrap error: ${msg}`);
          setSkipReason('unknown');
          syncLive();
        });
    },
    [appendWireLog, syncLive]
  );

  useLayoutEffect(() => {
    appendWireLog('boot-debug mounted');

    if (bootDebugRouteAutoStartDone) {
      appendWireLog('mount sync only (auto-start already fired this session)');
      syncLive();
      return;
    }
    bootDebugRouteAutoStartDone = true;

    callStudioBootstrapStart('mount');
    // Mount-only — manual START BOOTSTRAP uses callStudioBootstrapStart('manual').
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onBoot = (event: Event) => {
      const detail = (event as CustomEvent<StudioBootLiveState>).detail;
      if (!detail) return;
      appendWireLog('bootstrap state changed');
      setLive(detail);

      const storage = detail.modules[0];
      if (storage && storage.status !== 'idle' && !firstModuleLogged.current) {
        firstModuleLogged.current = true;
        appendWireLog(`first module started: ${storage.label} (${storage.status})`);
      }
    };
    window.addEventListener(STUDIO_BOOT_EVENT, onBoot);
    return () => window.removeEventListener(STUDIO_BOOT_EVENT, onBoot);
  }, [appendWireLog]);

  useEffect(() => {
    if (live.complete) return;
    const timer = window.setInterval(() => syncLive(), 100);
    return () => clearInterval(timer);
  }, [live.complete, syncLive]);

  return (
    <div data-temp-debug-route="__boot-debug">
      <div
        style={{
          padding: '16px 16px 0',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          color: '#111',
          background: '#fafafa',
        }}
      >
        <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Boot debug wiring</p>
        {skipReason ? (
          <p style={{ margin: '0 0 8px', color: '#b45309', fontWeight: 600 }}>
            Start blocked/skipped: {skipReason}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => callStudioBootstrapStart('manual')}
          style={{
            padding: '10px 16px',
            marginBottom: '12px',
            border: '2px solid #111',
            background: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        >
          START BOOTSTRAP
        </button>
        <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Route event log</p>
        <ul
          style={{
            listStyle: 'none',
            padding: '8px',
            margin: '0 0 12px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            maxHeight: '160px',
            overflowY: 'auto',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '11px',
          }}
        >
          {wireLog.length === 0 ? (
            <li style={{ color: '#888' }}>(waiting for mount…)</li>
          ) : (
            wireLog.map((entry, idx) => (
              <li key={`${entry.ts}-${idx}`} style={{ padding: '2px 0', color: '#374151' }}>
                +{((entry.ts - wireLogOrigin.current) / 1000).toFixed(2)}s {entry.message}
              </li>
            ))
          )}
        </ul>
      </div>

      <BootDiagnosticsPanel live={live} title="Boot Debug — StudioBootstrap™" showBypass={false} />

      <p style={{ padding: '0 16px 16px', fontSize: '11px', color: '#666' }}>
        TEMPORARY DEBUG ROUTE — wired in{' '}
        <code style={{ fontSize: '10px' }}>src/pages/debug/boot-debug/page.tsx</code> · no AdminGuard ·{' '}
        <a href="/__studio-health">/__studio-health</a> · <a href="/__chunk-debug">/__chunk-debug</a> ·{' '}
        <a href="/__experience-lab-safe">/__experience-lab-safe</a>
      </p>
    </div>
  );
}
