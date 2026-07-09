import { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  forceReloadForStaleChunks,
  isDynamicImportChunkFailure,
  staleChunkReloadRecentlyAttempted,
} from '../../../../utils/chunkLoadRecovery';

type Props = {
  children: ReactNode;
  onBack: () => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Catches failed nested lazy loads for company-scoped Studio routes (Headquarters / Grand Atrium)
 * without replacing the entire app shell with the global ErrorBoundary.
 */
export class CompanyRouteLoadErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Company route load failed:', error, errorInfo);
  }

  private handleRetry = () => {
    const chunkError = this.state.error ? isDynamicImportChunkFailure(this.state.error) : false;
    if (chunkError) {
      forceReloadForStaleChunks();
      return;
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const chunkError = this.state.error ? isDynamicImportChunkFailure(this.state.error) : false;
    const recentlyReloaded = staleChunkReloadRecentlyAttempted();
    const title =
      chunkError && !recentlyReloaded ? 'UPDATING THE APP' : 'HEADQUARTERS DID NOT LOAD';
    const body =
      chunkError && !recentlyReloaded
        ? 'A new version was deployed while this tab was open. Tap reload to refresh — your data on this device is kept.'
        : 'Studio could not load this page. This can happen on slow connections or when the browser is low on memory. Try again or return to Admin.';

    return (
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-12 text-center uppercase"
        style={{ fontFamily: '"Futura PT Book", Futura, sans-serif' }}
      >
        <h1
          className="text-[18px] font-semibold tracking-[0.12em] mb-4"
          style={{ color: '#EB1C24', fontFamily: '"Covered By Your Grace", cursive' }}
        >
          {title}
        </h1>
        <p
          className="text-[14px] max-w-[320px] leading-relaxed tracking-[0.06em] normal-case"
          style={{ color: '#1A1A1A' }}
        >
          {body}
        </p>
        <div className="mt-6 flex flex-col gap-3 items-center">
          <button
            type="button"
            onClick={this.handleRetry}
            className="text-[16px] font-semibold tracking-[0.14em] underline underline-offset-4"
            style={{ color: '#808080', background: 'transparent', border: 'none' }}
          >
            RELOAD PAGE
          </button>
          <button
            type="button"
            onClick={this.props.onBack}
            className="text-[11px] font-semibold tracking-[0.1em] px-4 py-2 border border-black"
            style={{ background: '#fff', color: '#1A1A1A' }}
          >
            BACK TO ADMIN
          </button>
        </div>
      </div>
    );
  }
}
