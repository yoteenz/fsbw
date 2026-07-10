import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Stage 1 — minimal error boundary (not wired until matrix stage 1). */
export class ShellV2ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ShellV2ErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="shell-v2-root" data-shell-v2="error">
          <header className="shell-v2-header">
            <h1>Shell V2 Error</h1>
          </header>
          <main className="shell-v2-main">
            <div className="shell-v2-card">
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: 0 }}>
                {this.state.error.message}
              </pre>
              <button
                type="button"
                style={{ marginTop: 12, padding: '6px 12px' }}
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
            </div>
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}
