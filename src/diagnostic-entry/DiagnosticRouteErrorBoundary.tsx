import { Component, type ErrorInfo, type ReactNode } from 'react';
import { getLastDiagnosticCheckpoint } from './checkpoints';
import { getBundleVersionLabel } from './plain-dom';

type Props = {
  route: string;
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class DiagnosticRouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[DiagnosticRouteErrorBoundary ${this.props.route}]`, error, info);
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    const message = this.state.error.message || String(this.state.error);
    const stack = this.state.error.stack ?? '(no stack)';
    const checkpoint = getLastDiagnosticCheckpoint();

    return (
      <div
        data-diagnostic-route-error={this.props.route}
        style={{
          minHeight: '100vh',
          padding: 24,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 12,
          color: '#fecaca',
          background: '#1a0000',
        }}
      >
        <h1 style={{ fontSize: 16, margin: '0 0 8px' }}>Studio OS Diagnostic Route Failed</h1>
        <p style={{ margin: '0 0 4px' }}>Route: {this.props.route}</p>
        <p style={{ margin: '0 0 4px' }}>Checkpoint: {checkpoint}</p>
        <p style={{ margin: '0 0 12px' }}>Bundle: {getBundleVersionLabel()}</p>
        <p style={{ fontWeight: 700, margin: '0 0 4px' }}>{this.state.error.name}</p>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#2d1515', padding: 12, borderRadius: 6 }}>
          {message}
        </pre>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            background: '#2d1515',
            padding: 12,
            borderRadius: 6,
            marginTop: 12,
            maxHeight: 320,
            overflow: 'auto',
            fontSize: 10,
          }}
        >
          {stack}
        </pre>
      </div>
    );
  }
}
