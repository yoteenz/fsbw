import { useEffect, useState } from 'react';

export type PlatformErrorDetails = {
  title: string;
  message: string;
  stack?: string;
  componentStack?: string;
  boundary?: string;
  bootStatus?: string;
  extra?: string;
};

type Props = PlatformErrorDetails & {
  onRetry?: () => void;
  dataAttr?: string;
};

async function loadBootStatusLine(): Promise<string | undefined> {
  try {
    const { getStudioBootstrapLiveState } = await import('../studio-os-core/bootstrap');
    const live = getStudioBootstrapLiveState();
    if (!live) return 'Bootstrap: no live state yet';
    return `Bootstrap: started=${live.started ? 'yes' : 'no'} complete=${live.complete ? 'yes' : 'no'} ready=${live.ready ? 'yes' : 'no'} module=${live.currentModuleId ?? '(none)'}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `Bootstrap: unavailable (${msg})`;
  }
}

/** Visible platform failure screen — never a blank white page. */
export function PlatformErrorScreen({
  title,
  message,
  stack,
  componentStack,
  boundary,
  bootStatus,
  extra,
  onRetry,
  dataAttr = 'platform-error',
}: Props) {
  const [bootLine, setBootLine] = useState(bootStatus);

  useEffect(() => {
    if (bootStatus) return;
    void loadBootStatusLine().then((line) => {
      if (line) setBootLine(line);
    });
  }, [bootStatus]);

  return (
    <div
      data-platform-error={dataAttr}
      style={{
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        color: '#111',
        background: '#fff5f5',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ fontSize: '16px', margin: '0 0 8px', color: '#eb1c24' }}>{title}</h1>
      {boundary ? (
        <p style={{ margin: '0 0 12px', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Boundary: {boundary}
        </p>
      ) : null}
      <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Error</p>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          background: '#fff',
          border: '1px solid #fecaca',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '12px',
          margin: '0 0 12px',
        }}
      >
        {message}
      </pre>
      {bootLine ? (
        <>
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Bootstrap</p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#fff',
              border: '1px solid #e5e7eb',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              margin: '0 0 12px',
            }}
          >
            {bootLine}
          </pre>
        </>
      ) : null}
      {extra ? (
        <>
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Details</p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#fff',
              border: '1px solid #e5e7eb',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              margin: '0 0 12px',
            }}
          >
            {extra}
          </pre>
        </>
      ) : null}
      {stack ? (
        <>
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Stack</p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#fff',
              border: '1px solid #e5e7eb',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              maxHeight: '240px',
              overflow: 'auto',
              margin: '0 0 12px',
            }}
          >
            {stack}
          </pre>
        </>
      ) : null}
      {componentStack ? (
        <>
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Component stack</p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#fff',
              border: '1px solid #e5e7eb',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '11px',
              maxHeight: '240px',
              overflow: 'auto',
              margin: '0 0 12px',
            }}
          >
            {componentStack}
          </pre>
        </>
      ) : null}
      <p style={{ marginTop: '8px', fontSize: '12px' }}>
        {onRetry ? (
          <button type="button" onClick={onRetry} style={{ marginRight: '12px', padding: '6px 10px' }}>
            Retry
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ marginRight: '12px', padding: '6px 10px' }}
        >
          Reload
        </button>
        <a href="/__boot-debug">/__boot-debug</a>
        {' · '}
        <a href="/__studio-health">/__studio-health</a>
      </p>
    </div>
  );
}
