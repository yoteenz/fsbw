import { useEffect, useState } from 'react';
import type { Site00ImmersiveLoaderConfig, Site00LoaderState } from './site00LoaderConfig';
import { ASSTS_LOADER_HERO_STAGE, isLoaderDebugEnabled, loaderHeroStageCssVars } from './site00LoaderHeroStage';
import { teardownSite00AsstsBootShell } from './site00LoaderBoot';
import { Site00LoaderCopy } from './Site00LoaderCopy';
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
  statusLabel,
  loaderState = 'BOOTSTRAP',
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

  const heroVars = loaderHeroStageCssVars(ASSTS_LOADER_HERO_STAGE);

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
    if (phase === 'loading') {
      teardownSite00AsstsBootShell();
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = window.setTimeout(() => onExitComplete?.(), 720);
    return () => window.clearTimeout(t);
  }, [phase, onExitComplete]);

  const atComplete = isComplete || phase === 'complete-hold' || progress >= 100 || loaderState === 'READY';
  const displayStatus = atComplete ? config.completionMessage : statusLabel;

  const experienceTitle =
    loaderState === 'BOOTSTRAP'
      ? 'INITIALIZING SITE 00'
      : loaderState === 'CONNECTING'
        ? 'CONNECTING TO ASSET VAULT'
        : config.experienceTitle;

  const displaySubtitle =
    loaderState === 'CONNECTING'
      ? 'SECURE ADMIN SESSION'
      : loaderState === 'BOOTSTRAP'
        ? 'INITIALIZING ENVIRONMENT'
        : config.experienceSubtitle;

  const progressLabel =
    atComplete || progress >= 100 ? config.completionMessage : config.assemblingLabel;

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
    <div
      className={rootClass}
      style={heroVars as React.CSSProperties}
      role="status"
      aria-live="polite"
      aria-label={displayStatus}
    >
      <div className="site00-loader-hero-stage">
        <Site00LoaderEnvironment backgroundUrl={config.backgroundUrl} ready={backgroundReady} />

        {debug ? (
          <>
            <span className="site00-loader-debug site00-loader-debug--pedestal" aria-hidden="true" />
            <span className="site00-loader-debug site00-loader-debug--pedestal-center" aria-hidden="true" />
            <span className="site00-loader-debug site00-loader-debug--geometry-anchor" aria-hidden="true" />
            <span className="site00-loader-debug site00-loader-debug--copy-anchor" aria-hidden="true" />
            <span className="site00-loader-debug site00-loader-debug--safe-bottom" aria-hidden="true" />
          </>
        ) : null}

        {!error ? (
          <>
            <Site00LoaderAnimation reducedMotion={reducedMotion} onReady={onAnimationReady} />

            <div className="site00-loader-copy-mount">
              <Site00LoaderCopy
                siteLabel={config.siteLabel}
                title={experienceTitle}
                subtitle={displaySubtitle}
                tagline={config.tagline}
                footerMark={config.footerMark}
                footerLabel={config.footerLabel}
                progress={progress}
                progressLabel={progressLabel}
              />
            </div>
          </>
        ) : (
          <div className="site00-loader-copy-mount site00-loader-copy-mount--error">
            <Site00LoaderCopy
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
      </div>
    </div>
  );
}
