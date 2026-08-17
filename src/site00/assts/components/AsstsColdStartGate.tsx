import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../../platform-stabilization/loadingScreenLock';
import { ASSTS_IMMERSIVE_LOADER_CONFIG, resolveSite00PublicAsset } from '../../components/loader/site00LoaderConfig';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from '../../components/loader/Site00ImmersiveLoader';
import { preloadSite00LoaderAssets } from '../../components/loader/site00LoaderPreload';
import {
  markAsstsImmersiveComplete,
  shouldShowAsstsImmersiveLoader,
} from '../../components/loader/site00LoaderSession';
import { useSite00LoaderProgress } from '../../components/loader/useSite00LoaderProgress';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsLibrary, primeAsstsLibraryCache, resolveAsstsSlot } from '../services/asstsApi';
import { isSignedIn } from '../../../utils/adminAuth';

const COMPLETE_HOLD_MS = 680;
const MIN_CINEMATIC_MS = 2200;

/**
 * Cold-start gate for ASSTS — full immersive Asset Vault loader on first session entry.
 * Ordinary in-session navigation skips the cinematic sequence.
 */
export function AsstsColdStartGate() {
  const immersive = shouldShowAsstsImmersiveLoader();
  const [phase, setPhase] = useState<Site00ImmersiveLoaderPhase>(immersive ? 'loading' : 'exiting');
  const [revealed, setRevealed] = useState(!immersive);
  const startedAt = useRef(Date.now());
  const config = ASSTS_IMMERSIVE_LOADER_CONFIG;
  const { progress, statusLabel, completeStage, forceComplete } = useSite00LoaderProgress(
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
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        completeStage('boot');

        if (isSignedIn()) completeStage('connect');
        else completeStage('connect');

        const assetsPromise = preloadSite00LoaderAssets(
          resolveSite00PublicAsset(config.backgroundPath),
          resolveSite00PublicAsset(config.animationPath),
        );
        const libraryPromise = fetchAsstsLibrary();
        const slotPromise = resolveAsstsSlot(ASSTS_ENVIRONMENT_SLOTS.library);

        await assetsPromise;
        if (cancelled) return;
        completeStage('visuals');

        const [library] = await Promise.all([libraryPromise, slotPromise]);
        if (cancelled) return;
        primeAsstsLibraryCache(library);
        completeStage('resolve');
        completeStage('sync');
        completeStage('hydrate');

        const elapsed = Date.now() - startedAt.current;
        if (elapsed < MIN_CINEMATIC_MS) {
          await new Promise((r) => window.setTimeout(r, MIN_CINEMATIC_MS - elapsed));
        }
        if (cancelled) return;

        forceComplete();
        setPhase('complete-hold');
        await new Promise((r) => window.setTimeout(r, COMPLETE_HOLD_MS));
        if (cancelled) return;

        setPhase('exiting');
      } catch {
        if (cancelled) return;
        completeStage('hydrate');
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
  }, [immersive, completeStage, forceComplete, config.backgroundPath, config.animationPath]);

  const handleExitComplete = () => {
    markAsstsImmersiveComplete();
    setRevealed(true);
  };

  if (revealed) return <Outlet />;

  const overlay = (
    <Site00ImmersiveLoader
      config={config}
      progress={progress}
      statusLabel={statusLabel}
      phase={phase}
      onExitComplete={handleExitComplete}
    />
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
}
