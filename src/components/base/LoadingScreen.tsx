import React from 'react';
import { createPortal } from 'react-dom';
import { Site00Loader, contextFromLoadingSource } from '../../site00/components/loader/Site00Loader';
import { ASSTS_IMMERSIVE_LOADER_CONFIG } from '../../site00/components/loader/site00LoaderConfig';
import { Site00ImmersiveLoader } from '../../site00/components/loader/Site00ImmersiveLoader';
import { shouldShowAsstsImmersiveLoader } from '../../site00/components/loader/site00LoaderSession';
import { acquireLoadingScreenDocumentLock } from '../../platform-stabilization/loadingScreenLock';
import {
  DEFAULT_MAX_LOADING_MS,
  forceLoadingTerminalRecovery,
  getActiveLoadingSources,
  registerLoadingTerminal,
} from '../../platform-stabilization/loadingTerminalRegistry';

type LoadingScreenProps = {
  autoHideAfterMs?: number;
  /** Diagnostic label — required for terminal trace (defaults to callsite hint). */
  source?: string;
  maxDurationMs?: number;
};

function useLockPageScroll(active: boolean) {
  React.useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    return acquireLoadingScreenDocumentLock();
  }, [active]);
}

/** Full-screen SITE 00 construction loader (portaled to document.body). */
export default function LoadingScreen({
  autoHideAfterMs,
  source = 'LoadingScreen',
  maxDurationMs = DEFAULT_MAX_LOADING_MS,
}: LoadingScreenProps = {}) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  useLockPageScroll(isVisible);

  React.useEffect(() => {
    const unregister = registerLoadingTerminal(source, maxDurationMs);
    const timer = window.setTimeout(() => {
      const stuck = getActiveLoadingSources();
      void forceLoadingTerminalRecovery(
        stuck.length > 0 ? stuck : [{ id: source, label: source, since: Date.now() - maxDurationMs }],
        `LoadingScreen:${source}`,
      );
      setFailed(true);
      window.setTimeout(() => setIsVisible(false), 2400);
    }, maxDurationMs);
    return () => {
      window.clearTimeout(timer);
      unregister();
    };
  }, [source, maxDurationMs]);

  React.useEffect(() => {
    if (autoHideAfterMs == null || autoHideAfterMs <= 0) return;
    const timer = setTimeout(() => setIsVisible(false), autoHideAfterMs);
    return () => clearTimeout(timer);
  }, [autoHideAfterMs]);

  if (!isVisible) return null;

  const loaderContext = contextFromLoadingSource(source);
  const onAsstsPath =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/assts');

  if (onAsstsPath && shouldShowAsstsImmersiveLoader()) {
    return null;
  }

  const useImmersiveAssts = loaderContext === 'assts' && shouldShowAsstsImmersiveLoader();

  const overlay = (
    <div className="loading-screen-root" data-loading-source={source}>
      {!useImmersiveAssts ? <div className="loading-screen-root__backdrop" aria-hidden /> : null}
      {useImmersiveAssts ? (
        <Site00ImmersiveLoader
          config={ASSTS_IMMERSIVE_LOADER_CONFIG}
          progress={12}
          statusLabel={ASSTS_IMMERSIVE_LOADER_CONFIG.stages[0]?.label ?? 'BOOTING SITE 00'}
        />
      ) : (
        <Site00Loader
          context={loaderContext}
          fullScreen
          showDelayMs={200}
          error={failed}
          onRetry={failed ? () => window.location.reload() : undefined}
        />
      )}
    </div>
  );

  if (typeof document === 'undefined') return overlay;

  return createPortal(overlay, document.body);
}
