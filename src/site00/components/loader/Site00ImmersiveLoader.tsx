import { useEffect, useState } from 'react';
import type { Site00ImmersiveLoaderConfig } from './site00LoaderConfig';
import { resolveSite00PublicAsset } from './site00LoaderConfig';
import { Site00LoaderAnimation } from './Site00LoaderAnimation';
import { Site00LoaderEnvironment } from './Site00LoaderEnvironment';
import { Site00LoaderProgress } from './Site00LoaderProgress';
import { Site00LoaderStatus } from './Site00LoaderStatus';
import '../../styles/site00-loader.css';

export type Site00ImmersiveLoaderPhase = 'loading' | 'complete-hold' | 'exiting';

type Site00ImmersiveLoaderProps = {
  config: Site00ImmersiveLoaderConfig;
  progress: number;
  statusLabel: string;
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
  phase = 'loading',
  reducedMotion: reducedMotionProp,
  onAnimationReady,
  onExitComplete,
  error = false,
  onRetry,
}: Site00ImmersiveLoaderProps) {
  const systemReducedMotion = usePrefersReducedMotion();
  const reducedMotion = reducedMotionProp ?? systemReducedMotion;

  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = window.setTimeout(() => onExitComplete?.(), 720);
    return () => window.clearTimeout(t);
  }, [phase, onExitComplete]);

  const displayStatus = phase === 'complete-hold' || progress >= 100 ? config.completionMessage : statusLabel;
  const backgroundUrl = resolveSite00PublicAsset(config.backgroundPath);
  const animationUrl = resolveSite00PublicAsset(config.animationPath);

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
      <Site00LoaderEnvironment backgroundUrl={backgroundUrl} />

      {!error ? (
        <>
          <Site00LoaderAnimation
            animationUrl={animationUrl}
            reducedMotion={reducedMotion}
            onReady={onAnimationReady}
          />

          <div className="site00-immersive-loader__ui">
            <Site00LoaderStatus
              siteLabel={config.siteLabel}
              experienceTitle={config.experienceTitle}
              experienceSubtitle={config.experienceSubtitle}
              statusLabel={displayStatus}
              tagline={config.tagline}
              footerMark={config.footerMark}
              footerLabel={config.footerLabel}
            />
            <Site00LoaderProgress progress={progress} assemblingLabel={config.assemblingLabel} />
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
  );
}
