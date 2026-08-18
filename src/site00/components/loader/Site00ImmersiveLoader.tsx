import { useEffect, useState } from 'react';
import type { Site00ImmersiveLoaderConfig, Site00LoaderState } from './site00LoaderConfig';
import { isLoaderDebugEnabled } from './site00LoaderHeroStage';
import { teardownSite00AsstsBootShell } from './site00LoaderBoot';
import { LoaderCopyRegions } from './LoaderCopyRegions';
import { LoaderCompositionProvider } from './LoaderCompositionContext';
import { LoaderReferenceMapDebug } from './LoaderReferenceMapDebug';
import { LoaderReferenceOverlay } from './LoaderReferenceOverlay';
import { LoaderRegion } from './LoaderRegion';
import { Site00LoaderAnimation } from './Site00LoaderAnimation';
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
  const [backgroundReady, setBackgroundReady] = useState(() => {
    if (typeof document === 'undefined') return false;
    return Boolean(document.getElementById('site00-assts-boot-shell'));
  });
  const [geometryReady, setGeometryReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void preloadSite00LoaderBackground(config.backgroundUrl).then(() => {
      if (!cancelled) setBackgroundReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [config.backgroundUrl]);

  useEffect(() => {
    if (!backgroundReady || !geometryReady) return;
    teardownSite00AsstsBootShell();
  }, [backgroundReady, geometryReady]);

  const handleAnimationReady = () => {
    setGeometryReady(true);
    onAnimationReady?.();
  };

  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = window.setTimeout(() => onExitComplete?.(), 720);
    return () => window.clearTimeout(t);
  }, [phase, onExitComplete]);

  const atComplete = isComplete || phase === 'complete-hold' || progress >= 100;
  const progressLabel = atComplete ? config.completionMessage : config.assemblingLabel;

  const rootClass = [
    'site00-immersive-loader',
    phase === 'exiting' ? 'site00-immersive-loader--exiting' : '',
    phase === 'complete-hold' ? 'site00-immersive-loader--complete' : '',
    error ? 'site00-immersive-loader--error' : '',
    debug ? 'site00-immersive-loader--debug' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-label={progressLabel}>
      <LoaderCompositionProvider backgroundUrl={config.backgroundUrl}>
        {debug ? (
          <LoaderRegion id="pedestal" className="site00-loader-pedestal-debug" aria-hidden="true" />
        ) : null}

        {!error ? (
          <>
            <LoaderRegion id="geometry" className="site00-loader-geometry-region" allowOverflow>
              <Site00LoaderAnimation reducedMotion={reducedMotion} onReady={handleAnimationReady} />
            </LoaderRegion>

            <LoaderCopyRegions
              siteLabel={config.siteLabel}
              title={config.experienceTitle}
              subtitle={config.experienceSubtitle}
              tagline={config.tagline}
              footerMark={config.footerMark}
              footerLabel={config.footerLabel}
              progress={progress}
              progressLabel={progressLabel}
            />
          </>
        ) : (
          <div className="site00-loader-error-mount">
            <LoaderCopyRegions
              siteLabel={config.siteLabel}
              title="BUILD INTERRUPTED"
              subtitle="WE COULDN'T COMPLETE THIS STEP"
              tagline={config.tagline}
              footerMark={config.footerMark}
              footerLabel={config.footerLabel}
              progress={0}
              progressLabel="RETRY REQUIRED"
            />
            {onRetry ? (
              <button type="button" className="site00-loader__retry" onClick={onRetry}>
                TRY AGAIN →
              </button>
            ) : null}
          </div>
        )}

        <LoaderReferenceOverlay />
        <LoaderReferenceMapDebug />
      </LoaderCompositionProvider>
    </div>
  );
}
