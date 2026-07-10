/**
 * Studio OS Live Runtime Console — Mission Control for global flight recorder stream.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { onFlightEvent, getFlightEvents, getFlightSessionIdFromRecorder } from '../flight-recorder/recorder';
import { buildMarkdownFlightReport } from '../markdown-report';
import {
  buildLiveRuntimeSnapshot,
  classifySubsystem,
  findFirstFailureIndex,
  findLatestErrorIndex,
  isAbnormalEventType,
  rootCauseCandidate,
} from '../live-runtime-snapshot';
import type { FlightEventType, FlightRecorderEvent } from '../types';

const SUBSYSTEMS = [
  'all',
  'boot',
  'heartbeat',
  'experience-lab',
  'compiler',
  'station',
  'storage',
  'timer',
  'subscription',
  'navigation',
  'session',
  'lifecycle',
  'error',
  'runtime',
] as const;

type SubsystemFilter = (typeof SUBSYSTEMS)[number];

const btn: CSSProperties = {
  fontSize: 10,
  padding: '5px 8px',
  cursor: 'pointer',
  border: '1px solid #334155',
  borderRadius: 4,
  background: '#1e293b',
  color: '#e2e8f0',
};

function eventColor(type: FlightEventType): string {
  if (isAbnormalEventType(type)) return '#f87171';
  if (type.includes('HEARTBEAT')) return '#4ade80';
  if (type.includes('BOOT') || type.includes('RECORDER')) return '#7dd3fc';
  if (type.includes('COMPILER') || type.includes('WORLD') || type.includes('LANDMARK') || type.includes('SHELL')) {
    return '#a78bfa';
  }
  if (type.includes('EXPERIENCE_LAB')) return '#fbbf24';
  return '#cbd5e1';
}

export function LiveRuntimeConsole() {
  const [events, setEvents] = useState<FlightRecorderEvent[]>(() => [...getFlightEvents()]);
  const [streamPaused, setStreamPaused] = useState(false);
  const [subsystem, setSubsystem] = useState<SubsystemFilter>('all');
  const [search, setSearch] = useState('');
  const [snapshot, setSnapshot] = useState(buildLiveRuntimeSnapshot);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const autoScrollRef = useRef(true);

  useEffect(() => {
    return onFlightEvent((ev) => {
      if (!streamPaused) {
        setEvents((prev) => [...prev, ev]);
        autoScrollRef.current = true;
      } else {
        setEvents((prev) => [...prev, ev]);
      }
    });
  }, [streamPaused]);

  useEffect(() => {
    const id = window.setInterval(() => setSnapshot(buildLiveRuntimeSnapshot()), 400);
    return () => clearInterval(id);
  }, [events.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (subsystem !== 'all' && classifySubsystem(e.type, e.source) !== subsystem) return false;
      if (!q) return true;
      return (
        e.type.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        JSON.stringify(e.detail ?? {}).toLowerCase().includes(q)
      );
    });
  }, [events, subsystem, search]);

  const rootCause = useMemo(() => rootCauseCandidate(events), [events]);

  useEffect(() => {
    if (!autoScrollRef.current || streamPaused || !consoleRef.current) return;
    consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [filtered.length, streamPaused]);

  const scrollToIndex = useCallback((idx: number) => {
    const ev = events[idx];
    if (!ev) return;
    const filteredIdx = filtered.findIndex((e) => e.id === ev.id);
    if (filteredIdx < 0) {
      setSubsystem('all');
      setSearch('');
      setHighlightIdx(idx);
      return;
    }
    setHighlightIdx(idx);
    const el = rowRefs.current.get(ev.id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [events, filtered]);

  const handleExportVisible = useCallback(() => {
    const text = filtered
      .map((e) => `${e.isoTime.slice(11, 19)} ${e.type} ← ${e.source}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studio-os-live-runtime-${getFlightSessionIdFromRecorder()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const handleCopyReport = useCallback(async () => {
    const md = await buildMarkdownFlightReport(events);
    await navigator.clipboard.writeText(md);
  }, [events]);

  return (
    <div
      data-live-runtime-console
      style={{
        minHeight: '100vh',
        padding: 12,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        background: '#030712',
        color: '#e2e8f0',
      }}
    >
      <header style={{ marginBottom: 10 }}>
        <h1 style={{ fontSize: 15, margin: '0 0 4px', color: '#38bdf8' }}>Studio OS Live Runtime Console™</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 10 }}>
          Mission Control — global flight recorder live stream (no refresh required)
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 6,
          marginBottom: 10,
          padding: 10,
          background: '#0f172a',
          borderRadius: 6,
          border: '1px solid #1e293b',
        }}
      >
        <Stat label="Heartbeat" value={`${snapshot.heartbeat} (raf ${snapshot.rafCount})`} alert={snapshot.heartbeatFrozen} />
        <Stat label="Checkpoint" value={snapshot.checkpoint} />
        <Stat label="Route" value={snapshot.route} />
        <Stat label="Compiler stage" value={snapshot.compilerStage ?? '—'} />
        <Stat label="Compile session" value={snapshot.compileRunId ?? '—'} />
        <Stat label="Active shell" value={snapshot.shellId ?? '—'} />
        <Stat label="Active station" value={snapshot.stationId ?? '—'} />
        <Stat label="Render" value={snapshot.renderStatus} />
        <Stat label="Runtime" value={snapshot.runtimeStatus} />
        <Stat label="Subscriptions" value={String(snapshot.activeSubscriptions)} />
        <Stat label="Timers" value={String(snapshot.activeTimers)} />
        <Stat label="Components" value={String(snapshot.mountedComponents)} />
        <Stat label="Session" value={snapshot.sessionId.slice(0, 18)} />
      </section>

      {rootCause && (
        <div
          style={{
            marginBottom: 10,
            padding: 8,
            background: '#450a0a',
            border: '1px solid #991b1b',
            borderRadius: 6,
            color: '#fecaca',
          }}
        >
          ROOT CAUSE CANDIDATE: {rootCause}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        <button type="button" style={btn} onClick={() => setStreamPaused(true)}>
          ⏸ Pause stream
        </button>
        <button type="button" style={btn} onClick={() => { setStreamPaused(false); autoScrollRef.current = true; }}>
          ▶ Resume stream
        </button>
        <select
          value={subsystem}
          onChange={(e) => setSubsystem(e.target.value as SubsystemFilter)}
          style={{ ...btn, background: '#0f172a' }}
        >
          {SUBSYSTEMS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...btn, minWidth: 140, background: '#0f172a' }}
        />
        <button type="button" style={btn} onClick={() => { const i = findFirstFailureIndex(events); if (i >= 0) scrollToIndex(i); }}>
          Jump to first failure
        </button>
        <button type="button" style={btn} onClick={() => { const i = findLatestErrorIndex(events); if (i >= 0) scrollToIndex(i); }}>
          Jump to latest error
        </button>
        <button type="button" style={btn} onClick={handleExportVisible}>
          Export visible timeline
        </button>
        <button type="button" style={btn} onClick={() => void handleCopyReport()}>
          📋 Copy Report
        </button>
        <button type="button" style={btn} onClick={() => setEvents([...getFlightEvents()])}>
          ↻ Sync buffer
        </button>
        <span style={{ color: streamPaused ? '#fbbf24' : '#4ade80', alignSelf: 'center' }}>
          {streamPaused ? '○ Stream paused' : '● Live streaming'}
        </span>
      </div>

      <div
        ref={consoleRef}
        onScroll={() => {
          if (!consoleRef.current) return;
          const { scrollTop, scrollHeight, clientHeight } = consoleRef.current;
          autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 48;
        }}
        style={{
          background: '#020617',
          border: '1px solid #1e293b',
          borderRadius: 6,
          height: 'min(62vh, 520px)',
          overflow: 'auto',
          padding: 8,
        }}
      >
        {filtered.length === 0 ? (
          <p style={{ color: '#64748b', margin: 0 }}>
            Waiting for runtime events… Navigate Studio OS (Experience Lab, etc.) — events append here in real time.
          </p>
        ) : (
          filtered.map((e) => {
            const abnormal = isAbnormalEventType(e.type);
            const highlighted = highlightIdx === events.findIndex((x) => x.id === e.id);
            return (
              <div
                key={e.eventId}
                ref={(el) => {
                  if (el) rowRefs.current.set(e.id, el);
                  else rowRefs.current.delete(e.id);
                }}
                style={{
                  padding: '4px 6px',
                  marginBottom: 2,
                  borderRadius: 3,
                  background: highlighted ? '#422006' : abnormal ? '#1c0a0a' : 'transparent',
                  borderLeft: abnormal ? '3px solid #ef4444' : '3px solid transparent',
                }}
              >
                <span style={{ color: '#64748b' }}>{e.isoTime.slice(11, 19)}</span>{' '}
                <span style={{ color: eventColor(e.type), fontWeight: abnormal ? 700 : 400 }}>{e.type}</span>
                <span style={{ color: '#475569' }}> ← {e.source}</span>
                {e.route && e.route !== '/__studio-os-live-runtime' && (
                  <span style={{ color: '#334155' }}> · {e.route}</span>
                )}
                {abnormal && e.detail && (
                  <pre style={{ margin: '4px 0 0', fontSize: 9, color: '#fca5a5', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(e.detail)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 10, color: '#64748b' }}>
        Showing {filtered.length} / {events.length} events ·{' '}
        <a href="/__studio-os-flight-recorder" style={{ color: '#7dd3fc' }}>
          Flight Recorder
        </a>{' '}
        ·{' '}
        <a href="/__studio-os-session-report" style={{ color: '#7dd3fc' }}>
          Session Report
        </a>
      </p>
    </div>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: alert ? '#f87171' : '#e2e8f0', fontSize: 10, wordBreak: 'break-all' }}>{value}</div>
    </div>
  );
}
