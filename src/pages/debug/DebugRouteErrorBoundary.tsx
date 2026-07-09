import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  route: string;
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/** Visible failure screen for public debug routes — never a blank page. */
export class DebugRouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[DebugRouteErrorBoundary ${this.props.route}]`, error, info);
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    const message = this.state.error.message || String(this.state.error);
    const stack = this.state.error.stack ?? '(no stack)';

    return (
      <div
        data-debug-route-error={this.props.route}
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
          Debug route failed: {this.props.route}
        </h1>
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
          }}
        >
          {message}
        </pre>
        <p style={{ margin: '16px 0 8px', fontWeight: 700 }}>Stack</p>
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
          }}
        >
          {stack}
        </pre>
        <p style={{ marginTop: '16px', fontSize: '12px' }}>
          <a href="/__studio-health">/__studio-health</a>
          {' · '}
          <a href="/__boot-debug">Reload /__boot-debug</a>
        </p>
      </div>
    );
  }
}
