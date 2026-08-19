import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { acquireLoadingScreenDocumentLock } from '../../platform-stabilization/loadingScreenLock';
import {
  DEFAULT_MAX_LOADING_MS,
  registerLoadingTerminal,
} from '../../platform-stabilization/loadingTerminalRegistry';
import { Site00LoaderAnimation } from '../../site00/components/loader/Site00LoaderAnimation';
import { Site00LoaderEnvironment } from '../../site00/components/loader/Site00LoaderEnvironment';
import {
  resolveSite00LoaderAnimationFocal,
  resolveSite00LoaderBackgroundFocal,
  resolveSite00LoaderBackgroundUrl,
} from '../../site00/components/loader/site00LoaderMedia';
import { useLoaderMediaPresentation } from '../../site00/components/loader/useLoaderMediaPresentation';
import { teardownLobbyLoungeImmersiveBootShell } from './lobbyLoungeLoaderBoot';
import '../../site00/styles/site00-loader.css';
import './lobby-lounge-immersive-loader.css';

type LobbyLoungeImmersiveLoaderProps = {
  /** Diagnostic label for loading terminal registry. */
  source?: string;
  maxDurationMs?: number;
};

/**
 * Frontal Slayer lobby/lounge initial load — SITE 00 env stack (Layer0 PNG, Layer1 MP4, Layer2 UI).
 * Split focal: animation center center; static bg mobile center 45%.
 */
export function LobbyLoungeImmersiveLoader({
  source = 'LobbyApp.initial',
  maxDurationMs = DEFAULT_MAX_LOADING_MS,
}: LobbyLoungeImmersiveLoaderProps) {
  const mediaPresentation = useLoaderMediaPresentation();
  const backgroundUrl = resolveSite00LoaderBackgroundUrl(mediaPresentation);
  const backgroundFocal = resolveSite00LoaderBackgroundFocal(mediaPresentation);
  const animationFocal = resolveSite00LoaderAnimationFocal(mediaPresentation);
  const envFit = mediaPresentation === 'desktop' ? 'cover-landscape' : 'cover';

  useEffect(() => acquireLoadingScreenDocumentLock(), []);

  useEffect(() => {
    const unregister = registerLoadingTerminal(source, maxDurationMs);
    return unregister;
  }, [source, maxDurationMs]);

  const handleBootHandoff = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        teardownLobbyLoungeImmersiveBootShell();
      });
    });
  }, []);

  const rootClass = [
    'fs-lobby-lounge-immersive-loader',
    'site00-immersive-loader',
    mediaPresentation === 'desktop' ? 'site00-immersive-loader--media-desktop' : 'site00-immersive-loader--media-mobile',
  ]
    .filter(Boolean)
    .join(' ');

  const overlay = (
    <div
      className={rootClass}
      data-loading-source={source}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        className="site00-immersive-loader__media fs-lobby-lounge-immersive-loader__media"
        aria-hidden="true"
        style={{
          ['--site00-loader-bg-focal' as string]: backgroundFocal,
          ['--site00-loader-animation-focal' as string]: animationFocal,
          ['--fs-lobby-lounge-loader-bg-focal' as string]: backgroundFocal,
        }}
      >
        <Site00LoaderEnvironment
          backgroundUrl={backgroundUrl}
          viewport
          fit={envFit}
          mediaFocal={backgroundFocal}
          onBackgroundLoad={handleBootHandoff}
        />
        <Site00LoaderAnimation mediaPresentation={mediaPresentation} mediaFocal={animationFocal} />
      </div>
    </div>
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
}
