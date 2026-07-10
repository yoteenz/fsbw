/**
 * Experience Engine Main-Thread Freeze Bisect™
 * Path: /__experience-engine-bisect?stage=N
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BISECT_STAGES,
  runBisectStages,
  type StageRunResult,
} from '../../../platform-stabilization/experience-engine-freeze-bisect/bisect-stages';
import {
  getLatestFreezeCheckpoint,
  getFreezeTraceRing,
  loadBisectSessionReport,
  clearFreezeTrace,
  getBisectRenderCounts,
} from '../../../platform-stabilization/experience-engine-freeze-bisect/freeze-trace-ledger';
import { getMainThreadDiagnosticsSnapshot } from '../../../platform-stabilization/main-thread-diagnostics';
import { BisectStageTree } from './bisect-stage-tree';
import {
  initCssHeartbeatProbe,
  sampleFreezeSignals,
  type FreezeSignalSnapshot,
} from './freeze-signals';

const CSS_HEARTBEAT_STYLE = `
@keyframes ee-css-heartbeat-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.92); }
}
[data-ee-css-heartbeat]::after {
  content: '';
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22d3ee;
  animation: ee-css-heartbeat-pulse 0.5s ease-in-out infinite;
}
`;

function parseStage(raw: string | null): number {
  const n = raw == null ? 0 : Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(12, Math.max(0, n));
}

export default function ExperienceEngineBisectPage() {
  const [params, setParams] = useSearchParams();
  const stage = parseStage(params.get('stage'));
  const [stageResults, setStageResults] = useState<StageRunResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [signals, setSignals] = useState<FreezeSignalSnapshot | null>(null);
  const [frozenDetected, setFrozenDetected] = useState(false);
  const prevSignalRef = useRef<{ raf: number; timeout: number; css: number } | null>(null);
  const cssRef = useRef<HTMLDivElement>(null);
  const runToken = useRef(0);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = CSS_HEARTBEAT_STYLE;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    return initCssHeartbeatProbe(cssRef.current);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const { snapshot, prev } = sampleFreezeSignals(prevSignalRef.current);
      prevSignalRef.current = prev;
      setSignals(snapshot);
      if (
        prevSignalRef.current &&
        !snapshot.rafAlive &&
        !snapshot.timeoutAlive &&
        snapshot.cssAlive
      ) {
        setFrozenDetected(true);
      }
    }, 400);
    return () => clearInterval(id);
  }, []);

  const runStages = useCallback(async () => {
    const token = ++runToken.current;
    setRunning(true);
    setStageResults(null);
    setFrozenDetected(false);
    clearFreezeTrace();
    prevSignalRef.current = null;

    try {
      const results = await runBisectStages(stage);
      if (token === runToken.current) setStageResults(results);
    } finally {
      if (token === runToken.current) setRunning(false);
    }
  }, [stage]);

  useEffect(() => {
    void runStages();
  }, [runStages]);

  const mtd = useMemo(() => getMainThreadDiagnosticsSnapshot(), [signals?.capturedAt]);
  const lastCp = getLatestFreezeCheckpoint();
  const report = loadBisectSessionReport();
  const renderCounts = getBisectRenderCounts();

  const setStage = (n: number) => {
    setParams({ stage: String(n) });
  };

  return (
    <div
      data-temp-debug-route="__experience-engine-bisect"
      style={{
        minHeight: '100vh',
        padding: 20,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        background: '#0b1020',
        color: '#e2e8f0',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: frozenDetected ? '#f87171' : '#4ade80' }}>
        Experience Engine Freeze Bisect™
      </h1>
      <p style={{ margin: '0 0 12px', color: '#94a3b8' }}>
        Staged isolation — one subsystem per stage. No production fixes applied here.
      </p>

      <section style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div
          ref={cssRef}
          data-ee-css-heartbeat
          title="CSS animation heartbeat (independent of JS)"
          style={{ padding: 8, background: '#111827', borderRadius: 6 }}
        >
          CSS pulse
        </div>
        <div>
          <div>
            RAF: {signals?.rafCount ?? '…'} · Timeout: {signals?.timeoutCount ?? '…'} · CSS iter:{' '}
            {signals?.cssPulseCount ?? '…'}
          </div>
          <div style={{ color: frozenDetected ? '#f87171' : '#94a3b8', marginTop: 4 }}>
            {signals?.interpretation ?? 'Sampling…'}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Stage selector (?stage=0–12)</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {BISECT_STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStage(s.id)}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 4,
                border: '1px solid #334155',
                background: s.id === stage ? '#1e3a5f' : '#111827',
                color: s.id === stage ? '#7dd3fc' : '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              {s.id}
            </button>
          ))}
        </div>
        <p style={{ margin: '8px 0 0', color: '#64748b' }}>
          Active: <strong>{stage}</strong> — {BISECT_STAGES[stage]?.label}:{' '}
          {BISECT_STAGES[stage]?.description}
        </p>
        <button
          type="button"
          onClick={() => void runStages()}
          disabled={running}
          style={{ marginTop: 8, padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}
        >
          {running ? 'Running stages…' : 'Re-run stages 0→N'}
        </button>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Stage matrix</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
              <th style={{ padding: 4 }}>Stage</th>
              <th style={{ padding: 4 }}>Label</th>
              <th style={{ padding: 4 }}>Status</th>
              <th style={{ padding: 4 }}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {BISECT_STAGES.map((s) => {
              const row = stageResults?.find((r) => r.stage === s.id);
              const pending = stageResults == null && s.id <= stage;
              const skipped = s.id > stage;
              const status = skipped
                ? '—'
                : pending
                  ? running
                    ? '…'
                    : 'pending'
                  : row?.ok
                    ? 'OK'
                    : row
                      ? 'FAIL'
                      : '—';
              const color =
                status === 'OK' ? '#4ade80' : status === 'FAIL' ? '#f87171' : '#94a3b8';
              return (
                <tr key={s.id} style={{ borderTop: '1px solid #1e293b' }}>
                  <td style={{ padding: 4 }}>{s.id}</td>
                  <td style={{ padding: 4 }}>{s.label}</td>
                  <td style={{ padding: 4, color }}>{status}</td>
                  <td style={{ padding: 4, color: '#64748b' }}>
                    {row?.detail ?? row?.error ?? (skipped ? 'not run' : '')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Diagnostics snapshot</h2>
        <pre
          style={{
            background: '#111827',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto',
            maxHeight: 200,
            fontSize: 10,
          }}
        >
          {JSON.stringify(
            {
              stage,
              frozenDetected,
              mtd: {
                heartbeat: mtd.heartbeat,
                rafCount: mtd.rafCount,
                timeoutProbe: mtd.timeoutProbe,
                frozen: mtd.frozen,
                checkpoint: mtd.currentCheckpoint,
              },
              renderCounts,
              lastCheckpoint: lastCp,
              reportSummary: report
                ? {
                    completedStage: report.completedStage,
                    genesisBytes: report.genesisBytes,
                    privateMode: report.privateMode,
                    cssAnimationRunning: report.cssAnimationRunning,
                  }
                : null,
              visibility: document.visibilityState,
              genesisBytes: (() => {
                try {
                  return localStorage.getItem('genesis_v1')?.length ?? 0;
                } catch {
                  return -1;
                }
              })(),
            },
            null,
            2
          )}
        </pre>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>React stage tree (mount)</h2>
        <div
          style={{
            border: '1px solid #334155',
            borderRadius: 6,
            padding: 12,
            background: '#0f172a',
          }}
        >
          <BisectStageTree maxStage={stage} />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Trace ring (last {getFreezeTraceRing().length})</h2>
        <pre
          style={{
            background: '#111827',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto',
            maxHeight: 240,
            fontSize: 10,
          }}
        >
          {getFreezeTraceRing()
            .slice(-24)
            .map(
              (c) =>
                `${new Date(c.timestamp).toISOString().slice(11, 23)} s${c.stage} ${c.component}.${c.function} ${c.phase}${c.detail ? ` — ${c.detail}` : ''}`
            )
            .join('\n') || '(empty)'}
        </pre>
      </section>

      <p style={{ marginTop: 16, fontSize: 11 }}>
        <a href="/__experience-engine-freeze-report" style={{ color: '#7dd3fc' }}>
          /__experience-engine-freeze-report
        </a>{' '}
        ·{' '}
        <a href="/__thread-heartbeat" style={{ color: '#7dd3fc' }}>
          /__thread-heartbeat
        </a>{' '}
        ·{' '}
        <a href="/admin/studio/experience-engine" style={{ color: '#7dd3fc' }}>
          production EE
        </a>
      </p>
    </div>
  );
}
