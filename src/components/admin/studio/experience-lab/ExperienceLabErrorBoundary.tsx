import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  route: string;
  children: ReactNode;
};

type State = {
  error: Error | null;
  failedModule?: string;
};

export class ExperienceLabErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const failedModule =
      info.componentStack?.split('\n').find((line) => line.includes('.tsx') || line.includes('.ts'))?.trim() ??
      undefined;
    this.setState({ error, failedModule });
    console.error('[ExperienceLabErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const { error, failedModule } = this.state;
    return (
      <div
        style={{
          minHeight: '50vh',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '13px',
          color: '#1a1a1a',
          background: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
        data-xelab-error-boundary
      >
        <h1 style={{ fontSize: '16px', color: '#eb1c24', margin: '0 0 12px' }}>EXPERIENCE LAB ERROR</h1>
        <p style={{ margin: '0 0 8px' }}>
          <strong>ROUTE:</strong> {this.props.route}
        </p>
        {failedModule ? (
          <p style={{ margin: '0 0 8px' }}>
            <strong>COMPONENT STACK:</strong> {failedModule}
          </p>
        ) : null}
        <p style={{ margin: '0 0 8px' }}>
          <strong>MESSAGE:</strong> {error.message}
        </p>
        {error.stack ? (
          <pre
            style={{
              marginTop: '12px',
              padding: '12px',
              background: '#f5f5f5',
              overflow: 'auto',
              fontSize: '11px',
              whiteSpace: 'pre-wrap',
              maxHeight: '320px',
            }}
          >
            {error.stack}
          </pre>
        ) : null}
      </div>
    );
  }
}
