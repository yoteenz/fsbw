/**
 * Studio OS Flight Recorder — live event stream.
 * Path: /__studio-os-flight-recorder
 */
import { useCallback, useEffect, useState } from 'react';
import {
  getFlightEvents,
  getFlightSessionIdFromRecorder,
  captureEnvironmentSnapshot,
  saveEnvironmentSnapshot,
  formatTimelineAscii,
  buildEventTimeline,
} from '../../../studio-os/diagnostics';
import { onFlightEvent } from '../../../studio-os/diagnostics/flight-recorder/recorder';
import type { FlightRecorderEvent } from '../../../studio-os/diagnostics/types';

export default function StudioOsFlightRecorderPage() {
  const [events, setEvents] = useState<FlightRecorderEvent[]>(() => [...getFlightEvents()]);
  const [envLabel, setEnvLabel] = useState('safari-normal');
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    return onFlightEvent((ev) => {
      setEvents((prev) => [...prev, ev].slice(-500));
    });
  }, []);

  const captureEnv = useCallback(async () => {
    setCapturing(true);
    try {
      const snap = await captureEnvironmentSnapshot(envLabel);
      saveEnvironmentSnapshot(snap);
    } finally {
      setCapturing(false);
    }
  }, [envLabel]);

  const timeline = buildEventTimeline(events);
  const sessionId = getFlightSessionIdFromRecorder();

  return (
    <div
      data-temp-debug-route="__studio-os-flight-recorder"
      style={{
        minHeight: '100vh',
        padding: 20,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
        background: '#0a0a12',
        color: '#e2e8f0',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#a78bfa' }}>
        Studio OS Flight Recorder™
      </h1>
      <p style={{ margin: '0 0 12px', color: '#94a3b8' }}>
        Append-only event log — observe only, no runtime modifications. Session: {sessionId}
      </p>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Environment snapshot</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={envLabel}
            onChange={(e) => setEnvLabel(e.target.value)}
            style={{ fontSize: 11, padding: 4 }}
          >
            <option value="safari-normal">safari-normal</option>
            <option value="safari-private">safari-private</option>
            <option value="chrome-normal">chrome-normal</option>
            <option value="chrome-incognito">chrome-incognito</option>
            <option value="boot">boot</option>
          </select>
          <button type="button" onClick={() => void captureEnv()} disabled={capturing} style={{ fontSize: 11 }}>
            {capturing ? 'Capturing…' : 'Capture env fingerprint'}
          </button>
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Timeline analysis</h2>
        <pre style={{ background: '#111827', padding: 12, borderRadius: 6, fontSize: 10, overflow: 'auto' }}>
          {formatTimelineAscii(timeline)}
        </pre>
        <p style={{ color: '#64748b', marginTop: 8 }}>
          Final success: {timeline.finalSuccessfulEvent?.type ?? '—'} · First abnormal:{' '}
          {timeline.firstAbnormalEvent?.type ?? '—'} · Missing: {timeline.firstMissingEvent ?? '—'}
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 13, margin: '0 0 8px' }}>Events ({events.length} in memory)</h2>
        <pre
          style={{
            background: '#111827',
            padding: 12,
            borderRadius: 6,
            fontSize: 9,
            overflow: 'auto',
            maxHeight: 480,
          }}
        >
          {events
            .slice(-120)
            .map(
              (e) =>
                `#${e.id} ${e.isoTime.slice(11, 23)} ${e.type} ← ${e.source}${e.detail ? ` ${JSON.stringify(e.detail)}` : ''}`
            )
            .join('\n') || '(no events yet)'}
        </pre>
      </section>

      <p style={{ marginTop: 16, fontSize: 11 }}>
        <a href="/__studio-os-session-report" style={{ color: '#7dd3fc' }}>
          /__studio-os-session-report
        </a>{' '}
        ·{' '}
        <a href="/__experience-engine-bisect" style={{ color: '#7dd3fc' }}>
          /__experience-engine-bisect
        </a>
      </p>
    </div>
  );
}
