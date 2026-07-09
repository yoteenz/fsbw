import type { CSSProperties } from 'react';
import type { StudioBootLiveState } from '../kernel/types';

const statusColor: Record<string, string> = {
  ready: '#166534',
  fallback: '#b45309',
  failed: '#eb1c24',
  loading: '#2563eb',
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

/** Live boot diagnostics — visible during loading, never blank. */
export function BootDiagnosticsPanel({
  live,
  title = 'StudioBootstrap™ Boot Diagnostics',
  onRetry,
  onSafeMode,
  onSkipCurrent,
  showBypass = true,
}: {
  live: StudioBootLiveState;
  title?: string;
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
        : '(waiting)';

  const stuckModule = live.modules.find((m) => m.status === 'loading');

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
      <p style={{ margin: '0 0 4px' }}>
        <strong>Current module:</strong> {currentLabel}
        {stuckModule ? (
          <span style={{ color: '#2563eb' }}> (loading…)</span>
        ) : null}
      </p>
      <p style={{ margin: '0 0 12px', color: '#555' }}>
        <strong>Elapsed:</strong> {(live.elapsedMs / 1000).toFixed(1)}s ·{' '}
        <strong>Complete:</strong> {live.complete ? 'yes' : 'no'} ·{' '}
        <strong>Ready:</strong> {live.ready ? 'yes' : 'no'}
        {live.safeMode ? ' · SAFE MODE' : ''}
      </p>

      {showBypass ? (
        <div style={{ marginBottom: '16px' }}>
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
