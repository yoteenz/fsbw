import { useEffect, useState } from 'react';
import type { Site00ImmersiveLoaderConfig, Site00LoaderState } from './site00LoaderConfig';
import { ASSTS_LOADER_GEOMETRY_ANCHOR } from './site00LoaderMedia';
import { teardownSite00AsstsBootShell } from './site00LoaderBoot';
import { Site00LoaderAnimation } from './Site00LoaderAnimation';
import { Site00LoaderEnvironment } from './Site00LoaderEnvironment';
import { Site00LoaderProgress } from './Site00LoaderProgress';
import { Site00LoaderStatus } from './Site00LoaderStatus';
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
  const [backgroundReady, setBackgroundReady] = useState(() => {
    if (typeof document === 'undefined') return false;
    return Boolean(document.getElementById('site00-assts-boot-shell'));
  });

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

  const experienceSubtitle =
    loaderState === 'RESOLVING' || loaderState === 'ASSEMBLING' || loaderState === 'READY'
      ? config.experienceSubtitle
      : loaderState === 'CONNECTING'
        ? 'SECURE ADMIN SESSION'
        : config.experienceSubtitle;

  const rootClass = [
    'site00-immersive-loader',
    phase === 'exiting' ? 'site00-immersive-loader--exiting' : '',
    phase === 'complete-hold' ? 'site00-immersive-loader--complete' : '',
    error ? 'site00-immersive-loader--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-label={displayStatus}>
      <div className="site00-loader-stage">
        <Site00LoaderEnvironment backgroundUrl={config.backgroundUrl} ready={backgroundReady} />

        {!error ? (
          <>
            <Site00LoaderAnimation
              webmUrl={config.geometryWebmUrl}
              apngUrl={config.geometryApngUrl}
              anchor={ASSTS_LOADER_GEOMETRY_ANCHOR}
              reducedMotion={reducedMotion}
              onReady={onAnimationReady}
            />

            <div className="site00-immersive-loader__ui">
              <Site00LoaderStatus
                siteLabel={config.siteLabel}
                experienceTitle={experienceTitle}
                experienceSubtitle={experienceSubtitle}
                statusLabel={displayStatus}
                tagline={config.tagline}
                footerMark={config.footerMark}
                footerLabel={config.footerLabel}
              />
              <Site00LoaderProgress
                progress={progress}
                assemblingLabel={config.assemblingLabel}
                completionLabel={config.completionMessage}
                isComplete={atComplete}
              />
            </div>
          </>
        ) : (
          <div className="site00-immersive-loader__ui site00-immersive-loader__ui--error">
            <Site00LoaderStatus
              siteLabel={config.siteLabel}
              experienceTitle="BUILD INTERRUPTED"
              experienceSubtitle="WE COULDN'T COMPLETE THIS STEP"
              statusLabel="RETRY REQUIRED"
              tagline={config.tagline}
              footerMark={config.footerMark}
              footerLabel={config.footerLabel}
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
