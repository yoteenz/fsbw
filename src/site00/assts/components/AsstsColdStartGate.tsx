import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../../platform-stabilization/loadingScreenLock';
import { ASSTS_IMMERSIVE_LOADER_CONFIG } from '../../components/loader/site00LoaderConfig';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from '../../components/loader/Site00ImmersiveLoader';
import { initSite00AsstsLoaderBoot, teardownSite00AsstsBootShell } from '../../components/loader/site00LoaderBoot';
import { resolveLoaderGeometryMode } from '../../components/loader/site00LoaderGeometryMode';
import {
  site00LoaderPrefersApngGeometry,
} from '../../components/loader/site00LoaderMedia';
import {
  preloadSite00LoaderAnimation,
  preloadSite00LoaderBackground,
} from '../../components/loader/site00LoaderPreload';
import {
  markAsstsImmersiveComplete,
  shouldShowAsstsImmersiveLoader,
} from '../../components/loader/site00LoaderSession';
import { useSite00LoaderProgress } from '../../components/loader/useSite00LoaderProgress';
import { Site00TypographyBootstrap } from '../../components/Site00TypographyBootstrap';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsLibrary, primeAsstsLibraryCache, resolveAsstsSlot } from '../services/asstsApi';

const COMPLETE_HOLD_MS = 680;
const MIN_CINEMATIC_MS = 1800;

initSite00AsstsLoaderBoot();

/**
 * Cold-start gate for ASSTS — full immersive Asset Vault loader on first session entry.
 * Loader media is boot-critical (same-origin) and does NOT wait on ASSTS API resolution.
 */
export function AsstsColdStartGate() {
  const immersive = shouldShowAsstsImmersiveLoader();
  const [phase, setPhase] = useState<Site00ImmersiveLoaderPhase>(immersive ? 'loading' : 'exiting');
  const [revealed, setRevealed] = useState(!immersive);
  const startedAt = useRef(Date.now());
  const config = ASSTS_IMMERSIVE_LOADER_CONFIG;
  const { progress, statusLabel, loaderState, isComplete, completeStage, forceComplete } = useSite00LoaderProgress(
    config.stages,
    config.completionMessage,
  );

  useEffect(() => {
    if (!immersive || revealed) return;
    return acquireLoadingScreenDocumentLock();
  }, [immersive, revealed]);

  useEffect(() => {
    if (!immersive) {
      markAsstsImmersiveComplete();
      teardownSite00AsstsBootShell();
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        completeStage('bootstrap');

        await preloadSite00LoaderBackground(config.backgroundUrl);
        if (cancelled) return;
        completeStage('preparing');

        const geometryUrl =
          resolveLoaderGeometryMode() === 'alpha'
            ? site00LoaderPrefersApngGeometry()
              ? config.geometryApngUrl
              : config.geometryWebmUrl
            : config.geometrySourceUrl;
        const geometryPromise = preloadSite00LoaderAnimation(geometryUrl);

        completeStage('connect');

        const libraryPromise = fetchAsstsLibrary();
        const slotPromise = resolveAsstsSlot(ASSTS_ENVIRONMENT_SLOTS.library);

        const [library] = await Promise.all([libraryPromise, slotPromise]);
        if (cancelled) return;
        primeAsstsLibraryCache(library);
        completeStage('resolve');

        await geometryPromise;
        if (cancelled) return;
        completeStage('assemble');

        const elapsed = Date.now() - startedAt.current;
        if (elapsed < MIN_CINEMATIC_MS) {
          await new Promise((r) => window.setTimeout(r, MIN_CINEMATIC_MS - elapsed));
        }
        if (cancelled) return;

        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        await new Promise((r) => window.setTimeout(r, COMPLETE_HOLD_MS));
        if (cancelled) return;

        setPhase('exiting');
      } catch {
        if (cancelled) return;
        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        await new Promise((r) => window.setTimeout(r, COMPLETE_HOLD_MS));
        if (cancelled) return;
        setPhase('exiting');
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [immersive, completeStage, forceComplete, config.backgroundUrl, config.geometryApngUrl, config.geometryWebmUrl, config.geometrySourceUrl]);

  const handleExitComplete = () => {
    markAsstsImmersiveComplete();
    teardownSite00AsstsBootShell();
    setRevealed(true);
  };

  if (revealed) {
    return (
      <>
        <Site00TypographyBootstrap />
        <Outlet />
      </>
    );
  }

  const overlay = (
    <>
      <Site00TypographyBootstrap />
      <Site00ImmersiveLoader
      config={config}
      progress={progress}
      statusLabel={statusLabel}
      loaderState={loaderState}
      isComplete={isComplete}
      phase={phase}
      onExitComplete={handleExitComplete}
    />
    </>
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
}
