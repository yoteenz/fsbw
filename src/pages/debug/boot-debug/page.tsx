/**
 * TEMPORARY DEBUG ROUTE — remove when Experience Lab is stable.
 * Path: /__boot-debug — traced wiring to studio-kernel primeBootStart().
 */
import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { BootDiagnosticsPanel } from '../../../studio-os-core/runtime-diagnostics/boot-diagnostics-panel';
import {
  StudioBootstrap,
  getInitialStudioBootstrapLiveState,
  getStudioBootstrapLastLiveState,
  getStudioBootstrapKernelWireDebug,
  debugCallPrimeBootStart,
  STUDIO_BOOT_EVENT,
  type StudioBootLiveState,
} from '../../../studio-os-core/bootstrap';
import { STUDIO_KERNEL_INSTANCE_ID as KERNEL_INSTANCE_DIRECT } from '../../../studio-os-core/kernel';

type WireLogEntry = { ts: number; message: string };

type WireMeta = {
  listenerAttached: boolean;
  lastEventAt: number | null;
  kernelInstanceBootstrap: string;
  kernelInstanceDirect: string;
  kernelInstancesMatch: boolean;
  eventNameListened: string;
  eventNameDispatched: string;
  eventNamesMatch: boolean;
  lastSnapshotStarted: boolean | null;
};

export default function BootDebugPage() {
  const [live, setLive] = useState<StudioBootLiveState>(() => getInitialStudioBootstrapLiveState());
  const [wireLog, setWireLog] = useState<WireLogEntry[]>([]);
  const [wireMeta, setWireMeta] = useState<WireMeta>(() => ({
    listenerAttached: false,
    lastEventAt: null,
    kernelInstanceBootstrap: '(pending)',
    kernelInstanceDirect: KERNEL_INSTANCE_DIRECT,
    kernelInstancesMatch: false,
    eventNameListened: STUDIO_BOOT_EVENT,
    eventNameDispatched: '(pending)',
    eventNamesMatch: false,
    lastSnapshotStarted: null,
  }));
  const wireLogOrigin = useRef(Date.now());
  const wireLogRef = useRef<(msg: string) => void>(() => undefined);

  const appendWireLog = useCallback((message: string) => {
    console.log(`[boot-debug] ${message}`);
    setWireLog((prev) => [...prev, { ts: Date.now(), message }]);
  }, []);

  wireLogRef.current = appendWireLog;

  const refreshWireMeta = useCallback(() => {
    const kernel = getStudioBootstrapKernelWireDebug();
    const snap = getStudioBootstrapLastLiveState();
    setWireMeta((prev) => ({
      ...prev,
      kernelInstanceBootstrap: kernel.kernelInstanceId,
      kernelInstanceDirect: KERNEL_INSTANCE_DIRECT,
      kernelInstancesMatch: kernel.kernelInstanceId === KERNEL_INSTANCE_DIRECT,
      eventNameListened: STUDIO_BOOT_EVENT,
      eventNameDispatched: kernel.dispatchedEventName,
      eventNamesMatch: STUDIO_BOOT_EVENT === kernel.dispatchedEventName,
      lastSnapshotStarted: snap?.started ?? null,
    }));
    if (snap) setLive(snap);
  }, []);

  const hydrateFromSnapshot = useCallback(() => {
    const snap = getStudioBootstrapLastLiveState();
    appendWireLog(`hydrate snapshot started=${snap?.started ?? 'null'}`);
    if (snap) setLive(snap);
    return snap;
  }, [appendWireLog]);

  const callPrimeBootStartDirect = useCallback(() => {
    appendWireLog('calling primeBootStart');
    StudioBootstrap.reset();
    const result = debugCallPrimeBootStart();
    appendWireLog(`primeBootStart returned runId=${result.runId}`);
    appendWireLog(
      `primeBootStart snapshot started=${result.liveSnapshot?.started ?? 'null'} kernel=${result.kernelInstanceId}`
    );
    setWireMeta((prev) => ({
      ...prev,
      kernelInstanceBootstrap: result.kernelInstanceId,
      kernelInstanceDirect: KERNEL_INSTANCE_DIRECT,
      kernelInstancesMatch: result.kernelInstanceId === KERNEL_INSTANCE_DIRECT,
      eventNameDispatched: result.dispatchedEventName,
      eventNamesMatch: STUDIO_BOOT_EVENT === result.dispatchedEventName,
      lastSnapshotStarted: result.liveSnapshot?.started ?? null,
    }));
    if (result.liveSnapshot) setLive(result.liveSnapshot);
    else hydrateFromSnapshot();
  }, [appendWireLog, hydrateFromSnapshot]);

  const callStudioBootstrapStart = useCallback(() => {
    appendWireLog('calling StudioBootstrap.start');
    void StudioBootstrap.start({ through: 'ui-render', force: true, allowReset: true })
      .then(() => {
        appendWireLog('StudioBootstrap.start settled');
        hydrateFromSnapshot();
      })
      .catch((err: unknown) => {
        appendWireLog(`StudioBootstrap.start error: ${err instanceof Error ? err.message : String(err)}`);
        hydrateFromSnapshot();
      });
  }, [appendWireLog, hydrateFromSnapshot]);

  useLayoutEffect(() => {
    const log = (msg: string) => wireLogRef.current(msg);
    log('page mounted');

    const onBoot = (event: Event) => {
      const detail = (event as CustomEvent<StudioBootLiveState>).detail;
      const at = Date.now();
      log(`boot event received started=${detail?.started ?? '?'} complete=${detail?.complete ?? '?'}`);
      setWireMeta((prev) => ({
        ...prev,
        lastEventAt: at,
        lastSnapshotStarted: detail?.started ?? null,
      }));
      if (detail) setLive(detail);
    };

    window.addEventListener(STUDIO_BOOT_EVENT, onBoot);
    setWireMeta((prev) => ({ ...prev, listenerAttached: true }));
    log(`listener attached for "${STUDIO_BOOT_EVENT}"`);

    const snap = getStudioBootstrapLastLiveState();
    log(`post-listener hydrate started=${snap?.started ?? 'null'}`);
    if (snap) setLive(snap);

    const kernel = getStudioBootstrapKernelWireDebug();
    setWireMeta((prev) => ({
      ...prev,
      listenerAttached: true,
      kernelInstanceBootstrap: kernel.kernelInstanceId,
      kernelInstanceDirect: KERNEL_INSTANCE_DIRECT,
      kernelInstancesMatch: kernel.kernelInstanceId === KERNEL_INSTANCE_DIRECT,
      eventNameDispatched: kernel.dispatchedEventName,
      eventNamesMatch: STUDIO_BOOT_EVENT === kernel.dispatchedEventName,
      lastSnapshotStarted: snap?.started ?? null,
    }));

    log('calling StudioBootstrap.start (mount)');
    void StudioBootstrap.start({ through: 'ui-render', force: true, allowReset: true })
      .then(() => {
        log('StudioBootstrap.start settled (mount)');
        const after = getStudioBootstrapLastLiveState();
        log(`post-start snapshot started=${after?.started ?? 'null'}`);
        if (after) setLive(after);
      })
      .catch((err: unknown) => {
        log(`StudioBootstrap.start error (mount): ${err instanceof Error ? err.message : String(err)}`);
        hydrateFromSnapshot();
      });

    return () => {
      window.removeEventListener(STUDIO_BOOT_EVENT, onBoot);
      setWireMeta((prev) => ({ ...prev, listenerAttached: false }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brokenLink =
    !wireMeta.kernelInstancesMatch
      ? 'duplicate kernel singleton (instance ids differ)'
      : !wireMeta.eventNamesMatch
        ? 'event name mismatch'
        : wireMeta.listenerAttached === false
          ? 'listener not attached'
          : wireMeta.lastEventAt === null && live.started === false
            ? 'listener timing or start never reached primeBootStart'
            : null;

  return (
    <div data-temp-debug-route="__boot-debug">
      <div
        style={{
          padding: '16px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          color: '#111',
          background: '#fafafa',
        }}
      >
        <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Boot wiring trace → primeBootStart()</p>

        {brokenLink ? (
          <p style={{ margin: '0 0 8px', color: '#eb1c24', fontWeight: 700 }}>Broken link: {brokenLink}</p>
        ) : null}

        <div style={{ marginBottom: '12px' }}>
          <button type="button" onClick={callPrimeBootStartDirect} style={btnPrimary}>
            CALL primeBootStart()
          </button>
          <button type="button" onClick={callStudioBootstrapStart} style={btnSecondary}>
            START BOOTSTRAP
          </button>
          <button type="button" onClick={refreshWireMeta} style={btnSecondary}>
            REFRESH SNAPSHOT
          </button>
        </div>

        <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Wire diagnostics</p>
        <table style={{ fontSize: '11px', marginBottom: '12px', borderCollapse: 'collapse' }}>
          <tbody>
            <WireRow label="kernel instance (bootstrap path)" value={wireMeta.kernelInstanceBootstrap} />
            <WireRow label="kernel instance (direct import)" value={wireMeta.kernelInstanceDirect} />
            <WireRow label="instances match" value={wireMeta.kernelInstancesMatch ? 'yes' : 'NO'} warn={!wireMeta.kernelInstancesMatch} />
            <WireRow label="event listened" value={wireMeta.eventNameListened} />
            <WireRow label="event dispatched" value={wireMeta.eventNameDispatched} />
            <WireRow label="event names match" value={wireMeta.eventNamesMatch ? 'yes' : 'NO'} warn={!wireMeta.eventNamesMatch} />
            <WireRow label="listener attached" value={wireMeta.listenerAttached ? 'yes' : 'no'} warn={!wireMeta.listenerAttached} />
            <WireRow
              label="last event timestamp"
              value={wireMeta.lastEventAt ? new Date(wireMeta.lastEventAt).toISOString() : '(none)'}
            />
            <WireRow label="last snapshot started" value={wireMeta.lastSnapshotStarted == null ? '(null)' : wireMeta.lastSnapshotStarted ? 'yes' : 'no'} />
            <WireRow label="panel live.started" value={live.started ? 'yes' : 'no'} warn={!live.started} />
          </tbody>
        </table>

        <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Route event log</p>
        <ul style={logListStyle}>
          {wireLog.map((entry, idx) => (
            <li key={`${entry.ts}-${idx}`} style={{ padding: '2px 0', color: '#374151' }}>
              +{((entry.ts - wireLogOrigin.current) / 1000).toFixed(2)}s {entry.message}
            </li>
          ))}
        </ul>
      </div>

      <BootDiagnosticsPanel live={live} title="Boot Debug — StudioBootstrap™" showBypass={false} />

      <p style={{ padding: '0 16px 16px', fontSize: '11px', color: '#666' }}>
        Wired in <code>src/pages/debug/boot-debug/page.tsx</code> · listener attaches in useLayoutEffect before start
      </p>
    </div>
  );
}

function WireRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <tr>
      <td style={{ padding: '2px 8px 2px 0', color: '#666' }}>{label}</td>
      <td style={{ padding: '2px 0', fontFamily: 'ui-monospace, monospace', color: warn ? '#eb1c24' : '#111', fontWeight: warn ? 700 : 400 }}>
        {value}
      </td>
    </tr>
  );
}

const btnPrimary: CSSProperties = {
  padding: '10px 16px',
  margin: '4px 8px 4px 0',
  border: '2px solid #111',
  background: '#fef08a',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 800,
};

const btnSecondary: CSSProperties = {
  padding: '8px 12px',
  margin: '4px 8px 4px 0',
  border: '1px solid #333',
  background: '#fff',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
};

const logListStyle: CSSProperties = {
  listStyle: 'none',
  padding: '8px',
  margin: 0,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  maxHeight: '200px',
  overflowY: 'auto',
  fontFamily: 'ui-monospace, monospace',
  fontSize: '11px',
};
