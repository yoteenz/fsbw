import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isDynamicImportChunkFailure, reloadForStaleChunks } from '../utils/chunkLoadRecovery';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/** Root App shell — never leave a blank #root after lazy App load fails. */
export class RootAppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RootAppErrorBoundary]', error, info);
    if (isDynamicImportChunkFailure(error)) {
      reloadForStaleChunks();
    }
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    const message = this.state.error.message || String(this.state.error);

    return (
      <div
        data-root-app-error
        style={{
          minHeight: '100vh',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '13px',
          color: '#111',
          background: '#fff5f5',
        }}
      >
        <h1 style={{ fontSize: '16px', margin: '0 0 12px', color: '#eb1c24' }}>
          Application failed to load
        </h1>
        <p style={{ margin: '0 0 8px', lineHeight: 1.5 }}>
          The app shell could not start. This is usually a stale deploy tab or a blocked script chunk.
        </p>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#fff',
            border: '1px solid #fecaca',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        >
          {message}
        </pre>
        <p style={{ marginTop: '16px', fontSize: '12px' }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginRight: '12px', padding: '6px 10px' }}
          >
            Reload
          </button>
          <a href="/__boot-debug">Open /__boot-debug</a>
          {' · '}
          <a href="/__studio-health">Open /__studio-health</a>
        </p>
      </div>
    );
  }
}
