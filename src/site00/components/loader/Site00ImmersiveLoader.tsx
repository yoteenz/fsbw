import { useEffect, useState } from 'react';
import type { Site00ImmersiveLoaderConfig, Site00LoaderState } from './site00LoaderConfig';
import {
  isLoaderAnimationEnabled,
  isLoaderDebugEnabled,
  isLoaderMediaDebugEnabled,
} from './site00LoaderHeroStage';
import { teardownSite00AsstsBootShell } from './site00LoaderBoot';
import { LoaderCopyRegions } from './LoaderCopyRegions';
import { LoaderCompositionProvider } from './LoaderCompositionContext';
import { LoaderReferenceMapDebug } from './LoaderReferenceMapDebug';
import { LoaderReferenceOverlay } from './LoaderReferenceOverlay';
import { LoaderRegion } from './LoaderRegion';
import { loaderLifecycleLog } from './loaderLifecycleLog';
import { Site00LoaderAnimation } from './Site00LoaderAnimation';
import { Site00LoaderEnvironment } from './Site00LoaderEnvironment';
import { preloadSite00LoaderBackground } from './site00LoaderPreload';
import '../../styles/site00-loader.css';

export type Site00ImmersiveLoaderPhase = 'loading' | 'complete-hold' | 'exiting';

type Site00ImmersiveLoaderProps = {
  config: Site00ImmersiveLoaderConfig;
  progress: number;
  statusLabel: string;
  loaderState?: Site00LoaderState;
  isComplete?: boolean;
  phase?: Site00ImmersiveLoaderPhase;
  reducedMotion?: boolean;
  onAnimationReady?: () => void;
  onExitComplete?: () => void;
  error?: boolean;
  onRetry?: () => void;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function Site00ImmersiveLoader({
  config,
  progress,
  statusLabel: _statusLabel,
  loaderState: _loaderState = 'BOOTSTRAP',
  isComplete = false,
  phase = 'loading',
  reducedMotion: reducedMotionProp,
  onAnimationReady,
  onExitComplete,
  error = false,
  onRetry,
}: Site00ImmersiveLoaderProps) {
  const systemReducedMotion = usePrefersReducedMotion();
  const reducedMotion = reducedMotionProp ?? systemReducedMotion;
  const debug = isLoaderDebugEnabled();
  const animationEnabled = isLoaderAnimationEnabled();
  const mediaDebug = isLoaderMediaDebugEnabled();

  useEffect(() => {
    loaderLifecycleLog('LOADER_MOUNTED', { path: window.location.pathname });
    teardownSite00AsstsBootShell();
    loaderLifecycleLog('BACKGROUND_SOURCE_RESOLVED', { url: config.backgroundUrl });
    return () => {
      loaderLifecycleLog('LOADER_UNMOUNTED');
    };
  }, [config.backgroundUrl]);

  useEffect(() => {
    let cancelled = false;
    void preloadSite00LoaderBackground(config.backgroundUrl).then(() => {
      if (!cancelled) loaderLifecycleLog('BACKGROUND_LOADED');
    });
    return () => {
      cancelled = true;
    };
  }, [config.backgroundUrl]);

  const handleAnimationReady = () => {
    loaderLifecycleLog('ANIMATION_CANPLAY');
    onAnimationReady?.();
  };

  const handleAnimationError = (detail: unknown) => {
    loaderLifecycleLog('ANIMATION_ERROR', detail);
  };

  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = window.setTimeout(() => onExitComplete?.(), 720);
    return () => window.clearTimeout(t);
  }, [phase, onExitComplete]);

  const atComplete = isComplete || phase === 'complete-hold' || progress >= 100;
  const progressLabel = error ? 'RETRY REQUIRED' : atComplete ? config.completionMessage : config.assemblingLabel;

  const rootClass = [
    'site00-immersive-loader',
    phase === 'exiting' ? 'site00-immersive-loader--exiting' : '',
    phase === 'complete-hold' ? 'site00-immersive-loader--complete' : '',
    error ? 'site00-immersive-loader--error' : '',
    debug ? 'site00-immersive-loader--debug' : '',
    mediaDebug ? 'site00-immersive-loader--media-debug' : '',
    animationEnabled ? '' : 'site00-immersive-loader--animation-off',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-label={progressLabel}>
      <LoaderCompositionProvider>
        <Site00LoaderEnvironment backgroundUrl={config.backgroundUrl} />

        {debug ? (
          <LoaderRegion id="pedestal" className="site00-loader-pedestal-debug" aria-hidden="true" />
        ) : null}

        {animationEnabled ? (
          <LoaderRegion id="geometry" className="site00-loader-geometry-region">
            <Site00LoaderAnimation
              reducedMotion={reducedMotion}
              onReady={handleAnimationReady}
              onError={handleAnimationError}
            />
          </LoaderRegion>
        ) : null}

        <LoaderCopyRegions
          siteLabel={config.siteLabel}
          title={error ? 'BUILD INTERRUPTED' : config.experienceTitle}
          subtitle={error ? "WE COULDN'T COMPLETE THIS STEP" : config.experienceSubtitle}
          tagline={config.tagline}
          footerMark={config.footerMark}
          footerLabel={config.footerLabel}
          progress={error ? 0 : progress}
          progressLabel={progressLabel}
        />

        {error && onRetry ? (
          <div className="site00-loader-error-actions">
            <button type="button" className="site00-loader__retry" onClick={onRetry}>
              TRY AGAIN →
            </button>
          </div>
        ) : null}

        {debug ? (
          <>
            <LoaderReferenceOverlay />
            <LoaderReferenceMapDebug />
          </>
        ) : null}
      </LoaderCompositionProvider>
    </div>
  );
}
