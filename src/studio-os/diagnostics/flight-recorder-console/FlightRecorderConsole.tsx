/**
 * Studio OS Black Box — operational flight recorder console.
 * Read-only view of the global singleton recorder (not page-local state).
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { onFlightEvent, getFlightEvents, getFlightSessionIdFromRecorder } from '../flight-recorder/recorder';
import { buildEventTimeline } from '../event-timeline/timeline';
import { buildMarkdownFlightReport } from '../markdown-report';
import { buildSessionForensicReport } from '../session-report/builder';
import {
  clearRecording,
  getRecorderRuntimeStatus,
  getRecordingElapsedMs,
  isRecorderPaused,
  pauseRecording,
  resumeRecording,
  startRecording,
} from '../recorder-controller';
import type { FlightRecorderEvent } from '../types';

type Props = {
  title?: string;
  showReportPanel?: boolean;
};

function formatElapsed(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${String(min).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

const btnStyle: CSSProperties = {
  fontSize: 11,
  padding: '6px 10px',
  cursor: 'pointer',
  border: '1px solid #334155',
  borderRadius: 4,
  background: '#1e293b',
  color: '#e2e8f0',
};

export function FlightRecorderConsole({ title = 'Studio OS Black Box Flight Recorder™', showReportPanel = true }: Props) {
  const [events, setEvents] = useState<FlightRecorderEvent[]>(() => [...getFlightEvents()]);
  const [paused, setPaused] = useState(isRecorderPaused());
  const [elapsedMs, setElapsedMs] = useState(getRecordingElapsedMs());
  const [status, setStatus] = useState(() => getRecorderRuntimeStatus(getFlightSessionIdFromRecorder()));
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);

  const sessionId = getFlightSessionIdFromRecorder();
  const timeline = useMemo(() => buildEventTimeline(events), [events]);

  useEffect(() => {
    return onFlightEvent((ev) => {
      setEvents((prev) => [...prev, ev]);
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedMs(getRecordingElapsedMs());
      setStatus(getRecorderRuntimeStatus(getFlightSessionIdFromRecorder()));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const refreshEvents = useCallback(() => {
    setEvents([...getFlightEvents()]);
  }, []);

  const handleCopyReport = useCallback(async () => {
    const md = await buildMarkdownFlightReport(events);
    setReportMarkdown(md);
    try {
      await navigator.clipboard.writeText(md);
      setCopyStatus('Copied Markdown report to clipboard');
    } catch {
      setCopyStatus('Copy failed — use Download Markdown');
    }
  }, [events]);

  const handleExportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify({ sessionId, events, timeline }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studio-os-flight-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events, sessionId, timeline]);

  const handleDownloadMarkdown = useCallback(async () => {
    const md = reportMarkdown ?? (await buildMarkdownFlightReport(events));
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studio-os-flight-${sessionId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events, reportMarkdown, sessionId]);

  const lifecycleEvents = useMemo(
    () =>
      events.filter((e) =>
        [
          'RECORDER_ATTACHED',
          'RECORDER_READY',
          'BOOT_STARTED',
          'BOOT_COMPLETED',
          'HEARTBEAT_STARTED',
          'HEARTBEAT_STOPPED',
          'HEARTBEAT_RESTARTED',
          'SESSION_CREATED',
          'SESSION_DESTROYED',
          'EXPERIENCE_LAB_STARTED',
          'EXPERIENCE_LAB_DESTROYED',
          'WORLD_COMPILER_STARTED',
          'WORLD_COMPILER_STOPPED',
          'COMPILER_STAGE_CHANGED',
          'COMPILER_RESET',
          'LANDMARK_GENERATED',
          'SHELL_CREATED',
          'SHELL_LOADED',
          'SHELL_DESTROYED',
          'ERROR',
          'RUNTIME_ERROR',
          'UNCAUGHT_EXCEPTION',
          'UNHANDLED_REJECTION',
        ].includes(e.type)
      ),
    [events]
  );

  return (
    <div
      data-flight-recorder-console
      style={{
        minHeight: '100vh',
        padding: 16,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        background: '#07070f',
        color: '#e2e8f0',
      }}
    >
      <header style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 16, margin: '0 0 8px', color: '#a78bfa' }}>{title}</h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          Global singleton recorder — observes entire Studio OS runtime across all routes.
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
          padding: 10,
          background: '#111827',
          borderRadius: 6,
          border: '1px solid #1f2937',
        }}
      >
        <button
          type="button"
          style={btnStyle}
          onClick={() => {
            startRecording();
            setPaused(false);
          }}
        >
          ▶ Start Recording
        </button>
        <button
          type="button"
          style={btnStyle}
          onClick={() => {
            if (paused) {
              resumeRecording();
              setPaused(false);
            } else {
              pauseRecording();
              setPaused(true);
            }
          }}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          type="button"
          style={btnStyle}
          onClick={() => {
            clearRecording();
            refreshEvents();
            setPaused(false);
          }}
        >
          🗑 Clear
        </button>
        <button type="button" style={btnStyle} onClick={() => void handleCopyReport()}>
          📋 Copy Report
        </button>
        <button type="button" style={btnStyle} onClick={handleExportJson}>
          💾 Export JSON
        </button>
        <button type="button" style={btnStyle} onClick={() => void handleDownloadMarkdown()}>
          ⬇ Download Markdown Report
        </button>
        <button type="button" style={btnStyle} onClick={refreshEvents}>
          ↻ Refresh
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
          marginBottom: 16,
          padding: 10,
          background: '#0f172a',
          borderRadius: 6,
        }}
      >
        <div>
          <span style={{ color: paused ? '#fbbf24' : '#4ade80' }}>{paused ? '○ Paused' : '● Recording'}</span>
        </div>
        <div>Session: {sessionId}</div>
        <div>Elapsed: {formatElapsed(elapsedMs)}</div>
        <div>Memory: {status.memoryLabel}</div>
        <div>Events: {events.length}</div>
        <div>Runtime: {status.recording ? (paused ? 'paused' : 'active') : 'idle'}</div>
      </div>

      {copyStatus && <p style={{ color: '#7dd3fc', margin: '0 0 12px' }}>{copyStatus}</p>}

      {timeline.gapDescription && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            background: '#451a03',
            color: '#fde68a',
            borderRadius: 6,
          }}
        >
          {timeline.gapDescription}
        </div>
      )}

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px', color: '#93c5fd' }}>Lifecycle timeline</h2>
        <div
          style={{
            background: '#0b1220',
            padding: 16,
            borderRadius: 6,
            maxHeight: 420,
            overflow: 'auto',
            lineHeight: 1.6,
          }}
        >
          {lifecycleEvents.length === 0 ? (
            <p style={{ color: '#64748b', margin: 0 }}>
              No lifecycle events yet. Navigate Studio OS (Experience Lab, etc.) — recorder persists across routes.
            </p>
          ) : (
            lifecycleEvents.map((e, i) => (
              <div key={e.eventId}>
                <div style={{ color: '#94a3b8', fontSize: 10 }}>{e.isoTime.slice(11, 19)}</div>
                <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{e.type}</div>
                <div style={{ color: '#64748b', fontSize: 10, marginBottom: 8 }}>{e.source}</div>
                {i < lifecycleEvents.length - 1 && (
                  <div style={{ color: '#475569', margin: '4px 0 8px' }}>↓</div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Full event stream ({events.length})</h2>
        <pre
          style={{
            background: '#111827',
            padding: 12,
            borderRadius: 6,
            fontSize: 9,
            overflow: 'auto',
            maxHeight: 280,
          }}
        >
          {events
            .slice(-200)
            .map(
              (e) =>
                `#${e.id} ${e.isoTime.slice(11, 23)} ${e.type} ← ${e.source}${e.detail ? ` ${JSON.stringify(e.detail)}` : ''}`
            )
            .join('\n') || '(no events)'}
        </pre>
      </section>

      {showReportPanel && (
        <section>
          <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Forensic summary</h2>
          <button
            type="button"
            style={{ ...btnStyle, marginBottom: 8 }}
            onClick={() => void buildSessionForensicReport().then(() => refreshEvents())}
          >
            Rebuild forensic report
          </button>
          <pre style={{ background: '#1e1b4b', padding: 12, borderRadius: 6, fontSize: 10, overflow: 'auto' }}>
            {JSON.stringify(
              {
                bootCompleted: timeline.events.some((e) => e.type === 'BOOT_COMPLETED'),
                recorderAttached: timeline.events.some((e) => e.type === 'RECORDER_ATTACHED'),
                experienceLabStarted: timeline.events.some((e) => e.type === 'EXPERIENCE_LAB_STARTED'),
                worldCompilerStarted: timeline.events.some((e) => e.type === 'WORLD_COMPILER_STARTED'),
                finalSuccess: timeline.finalSuccessfulEvent?.type ?? null,
                firstAbnormal: timeline.firstAbnormalEvent?.type ?? null,
                firstMissing: timeline.firstMissingEvent,
              },
              null,
              2
            )}
          </pre>
        </section>
      )}
    </div>
  );
}
