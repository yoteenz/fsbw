import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../../platform-stabilization/loadingScreenLock';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from './Site00ImmersiveLoader';
import { initSite00ImmersiveLoaderBoot, teardownSite00ImmersiveBootShell } from './site00LoaderBoot';
import { resolveSite00ImmersiveLoaderConfig } from './site00LoaderConfig';
import { preloadSite00LoaderAnimation, preloadSite00LoaderBackground } from './site00LoaderPreload';
import { resolveSite00LoaderGeometryPreloadUrl } from './site00LoaderBootstrap';
import {
  markSite00ImmersiveComplete,
  shouldShowSite00ImmersiveLoader,
} from './site00LoaderSession';
import { useSite00LoaderProgress } from './useSite00LoaderProgress';

const COMPLETE_HOLD_MS = 680;
const MIN_CINEMATIC_MS = 4200;
const MIN_GEOMETRY_PLAY_MS = 2800;

initSite00ImmersiveLoaderBoot();

function waitForGeometryReady(getReady: () => boolean, timeoutMs = 8000): Promise<void> {
  if (getReady()) return Promise.resolve();
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (getReady()) {
        resolve();
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Cinematic cold-start gate for SITE 00 world routes (Origin, Enter, IDNTY, BLDR, …).
 * ASSTS uses its own gate with vault API bootstrap.
 */
export function Site00WorldColdStartGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const immersive = shouldShowSite00ImmersiveLoader();
  const [phase, setPhase] = useState<Site00ImmersiveLoaderPhase>(immersive ? 'loading' : 'exiting');
  const [revealed, setRevealed] = useState(!immersive);
  const startedAt = useRef(Date.now());
  const geometryReadyAt = useRef<number | null>(null);
  const geometryReadyRef = useRef(false);
  const config = resolveSite00ImmersiveLoaderConfig(pathname);
  const { progress, statusLabel, loaderState, isComplete, completeStage, forceComplete } = useSite00LoaderProgress(
    config.stages,
    config.completionMessage,
  );

  const handleAnimationReady = useCallback(() => {
    if (geometryReadyRef.current) return;
    geometryReadyRef.current = true;
    geometryReadyAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!immersive || revealed) return;
    return acquireLoadingScreenDocumentLock();
  }, [immersive, revealed]);

  useEffect(() => {
    if (!immersive) {
      markSite00ImmersiveComplete();
      teardownSite00ImmersiveBootShell();
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        completeStage('bootstrap');
        await preloadSite00LoaderBackground(config.backgroundUrl);
        if (cancelled) return;
        completeStage('preparing');

        const geometryUrl = await resolveSite00LoaderGeometryPreloadUrl();
        await preloadSite00LoaderAnimation(geometryUrl);
        if (cancelled) return;
        completeStage('assemble');

        await waitForGeometryReady(() => geometryReadyRef.current);
        if (cancelled) return;

        const geometryStartedAt = geometryReadyAt.current ?? Date.now();
        const geometryElapsed = Date.now() - geometryStartedAt;
        if (geometryElapsed < MIN_GEOMETRY_PLAY_MS) {
          await sleep(MIN_GEOMETRY_PLAY_MS - geometryElapsed);
        }
        if (cancelled) return;

        const elapsed = Date.now() - startedAt.current;
        if (elapsed < MIN_CINEMATIC_MS) {
          await sleep(MIN_CINEMATIC_MS - elapsed);
        }
        if (cancelled) return;

        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;

        setPhase('exiting');
      } catch {
        if (cancelled) return;
        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;
        setPhase('exiting');
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [immersive, completeStage, forceComplete, config.backgroundUrl]);

  const handleExitComplete = () => {
    markSite00ImmersiveComplete();
    teardownSite00ImmersiveBootShell();
    setRevealed(true);
  };

  if (revealed) return <>{children}</>;

  const overlay = (
    <Site00ImmersiveLoader
      config={config}
      progress={progress}
      statusLabel={statusLabel}
      loaderState={loaderState}
      isComplete={isComplete}
      phase={phase}
      onAnimationReady={handleAnimationReady}
      onExitComplete={handleExitComplete}
    />
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
}
