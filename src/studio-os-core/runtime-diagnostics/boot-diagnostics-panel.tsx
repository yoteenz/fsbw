import type { CSSProperties } from 'react';
import type { StudioBootLiveState } from '../kernel/types';

const statusColor: Record<string, string> = {
  ready: '#166534',
  fallback: '#b45309',
  failed: '#eb1c24',
  running: '#1d4ed8',
  starting: '#2563eb',
  idle: '#6b7280',
  skipped: '#9333ea',
};

const btnStyle: CSSProperties = {
  padding: '8px 12px',
  margin: '4px 4px 4px 0',
  border: '1px solid #333',
  background: '#fff',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  textDecoration: 'none',
  color: '#111',
  display: 'inline-block',
};

const eventColor: Record<string, string> = {
  info: '#374151',
  warn: '#b45309',
  error: '#eb1c24',
  module: '#2563eb',
};

/** Live boot diagnostics — visible during loading, never blank. */
export function BootDiagnosticsPanel({
  live,
  title = 'StudioBootstrap™ Boot Diagnostics',
  autoStart = true,
  onStart,
  onRetry,
  onSafeMode,
  onSkipCurrent,
  showBypass = true,
}: {
  live: StudioBootLiveState;
  title?: string;
  autoStart?: boolean;
  onStart?: () => void;
  onRetry?: () => void;
  onSafeMode?: () => void;
  onSkipCurrent?: () => void;
  showBypass?: boolean;
}) {
  const currentLabel =
    live.currentModuleId != null
      ? live.modules.find((m) => m.id === live.currentModuleId)?.label ?? live.currentModuleId
      : live.complete
        ? '(complete)'
        : live.waitingForManualStart
          ? '(waiting for manual start)'
          : live.started
            ? '(starting…)'
            : '(waiting)';

  const stuckModule = live.modules.find((m) => m.status === 'starting' || m.status === 'running');
  const showManualWaiting = live.waitingForManualStart || (!autoStart && !live.started && !live.complete);

  return (
    <div
      data-studio-boot-diagnostics
      style={{
        minHeight: '40vh',
        padding: '16px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#111',
        background: '#fafafa',
      }}
    >
      <h1 style={{ fontSize: '14px', margin: '0 0 8px', letterSpacing: '0.04em' }}>{title}</h1>

      {showManualWaiting ? (
        <p style={{ margin: '0 0 12px', color: '#b45309', fontWeight: 600 }}>
          Bootstrap is waiting for manual start.
        </p>
      ) : null}

      <p style={{ margin: '0 0 4px' }}>
        <strong>Current module:</strong> {currentLabel}
        {stuckModule ? (
          <span style={{ color: '#2563eb' }}> ({stuckModule.status}…)</span>
        ) : null}
      </p>
      <p style={{ margin: '0 0 12px', color: '#555' }}>
        <strong>Elapsed:</strong> {(live.elapsedMs / 1000).toFixed(1)}s ·{' '}
        <strong>Started:</strong> {live.started ? 'yes' : 'no'} ·{' '}
        <strong>Complete:</strong> {live.complete ? 'yes' : 'no'} ·{' '}
        <strong>Ready:</strong> {live.ready ? 'yes' : 'no'}
        {live.safeMode ? ' · SAFE MODE' : ''}
      </p>

      {showBypass ? (
        <div style={{ marginBottom: '16px' }}>
          {onStart ? (
            <button type="button" style={{ ...btnStyle, fontWeight: 700 }} onClick={onStart}>
              Start Bootstrap
            </button>
          ) : null}
          {onSafeMode ? (
            <button type="button" style={btnStyle} onClick={onSafeMode}>
              Continue in Safe Mode
            </button>
          ) : null}
          {onSkipCurrent ? (
            <button type="button" style={btnStyle} onClick={onSkipCurrent}>
              Skip failed module
            </button>
          ) : null}
          {onRetry ? (
            <button type="button" style={btnStyle} onClick={onRetry}>
              Retry Bootstrap
            </button>
          ) : null}
          <a href="/__studio-health" style={btnStyle}>
            Go to /__studio-health
          </a>
        </div>
      ) : null}

      <p style={{ fontWeight: 600, margin: '0 0 8px' }}>Boot sequence</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
        {live.modules.map((mod) => (
          <li
            key={mod.id}
            style={{
              padding: '6px 0',
              borderBottom: '1px solid #eee',
              background: mod.id === live.currentModuleId ? '#eef2ff' : 'transparent',
            }}
          >
            <span style={{ color: statusColor[mod.status] ?? '#333', fontWeight: 700 }}>
              {mod.status.toUpperCase()}
            </span>{' '}
            <strong>{mod.label}</strong>{' '}
            <span style={{ color: '#888' }}>({mod.id})</span>
            {mod.errors.map((e) => (
              <div key={e} style={{ color: '#eb1c24', marginTop: '4px' }}>
                {e}
              </div>
            ))}
            {mod.warnings.map((w) => (
              <div key={w} style={{ color: '#b45309', marginTop: '4px' }}>
                {w}
              </div>
            ))}
          </li>
        ))}
      </ul>

      {live.eventLog.length > 0 ? (
        <>
          <p style={{ fontWeight: 600, margin: '0 0 8px' }}>Event log</p>
          <ul
            style={{
              listStyle: 'none',
              padding: '8px',
              margin: '0 0 12px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              maxHeight: '180px',
              overflowY: 'auto',
            }}
          >
            {live.eventLog.map((entry, idx) => (
              <li
                key={`${entry.ts}-${idx}`}
                style={{
                  padding: '2px 0',
                  color: eventColor[entry.kind] ?? '#374151',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '11px',
                }}
              >
                +{((entry.ts - (live.eventLog[0]?.ts ?? entry.ts)) / 1000).toFixed(2)}s [{entry.kind}]{' '}
                {entry.message}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {live.errors.length > 0 ? (
        <div style={{ color: '#eb1c24', marginBottom: '8px' }}>
          <strong>Errors:</strong> {live.errors.join(' · ')}
        </div>
      ) : null}
      {live.warnings.length > 0 ? (
        <div style={{ color: '#666', marginBottom: '8px' }}>
          <strong>Warnings:</strong> {live.warnings.join(' · ')}
        </div>
      ) : null}
      {live.fallbacksUsed.length > 0 ? (
        <div style={{ color: '#b45309' }}>
          <strong>Fallbacks:</strong> {live.fallbacksUsed.join(' · ')}
        </div>
      ) : null}
    </div>
  );
}
