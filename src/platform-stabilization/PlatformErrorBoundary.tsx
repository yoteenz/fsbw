import { Component, type ErrorInfo, type ReactNode } from 'react';
import { forceReloadForStaleChunks, isDynamicImportChunkFailure, reloadForStaleChunks } from '../utils/chunkLoadRecovery';
import { PlatformErrorScreen } from './PlatformErrorScreen';

type Props = {
  children: ReactNode;
  /** Route or shell label for diagnostics. */
  boundary: string;
};

type State = {
  error: Error | null;
  componentStack: string | null;
};

/** Catches render errors in providers/routes — shows stack instead of blank screen. */
export class PlatformErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[PlatformErrorBoundary:${this.props.boundary}]`, error, info);
    this.setState({ componentStack: info.componentStack ?? null });
    if (isDynamicImportChunkFailure(error)) {
      reloadForStaleChunks();
    }
  }

  handleRetry = (): void => {
    const { error } = this.state;
    if (error && isDynamicImportChunkFailure(error)) {
      forceReloadForStaleChunks();
      return;
    }
    this.setState({ error: null, componentStack: null });
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <PlatformErrorScreen
        title="Application error"
        message={this.state.error.message || String(this.state.error)}
        stack={this.state.error.stack}
        componentStack={this.state.componentStack ?? undefined}
        boundary={this.props.boundary}
        onRetry={this.handleRetry}
      />
    );
  }
}
