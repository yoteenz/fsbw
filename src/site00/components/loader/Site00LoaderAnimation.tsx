import { useEffect, useRef, useState } from 'react';
import {
  site00LoaderGeometryApngUrl,
  site00LoaderGeometrySourceRemoteUrl,
  site00LoaderGeometrySourceUrl,
  site00LoaderGeometryWebmUrl,
  site00LoaderPrefersApngGeometry,
} from './site00LoaderMedia';
import {
  probeProductionAlphaAvailable,
  resolveLoaderGeometryMode,
  resolveLoaderGeometryModeFromQuery,
  type LoaderGeometryMode,
} from './site00LoaderGeometryMode';

type Site00LoaderAnimationProps = {
  reducedMotion?: boolean;
  onReady?: () => void;
};

/**
 * Loader geometry renderer — production alpha when locked derivative exists;
 * screen blend remains debug fallback via ?loaderGeometry=screen.
 */
export function Site00LoaderAnimation({ reducedMotion = false, onReady }: Site00LoaderAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<LoaderGeometryMode>(() => resolveLoaderGeometryModeFromQuery() ?? 'alpha');
  const [alphaUrl, setAlphaUrl] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState(site00LoaderGeometrySourceUrl());

  useEffect(() => {
    const forced = resolveLoaderGeometryModeFromQuery();
    if (forced) {
      setMode(forced);
      return;
    }
    void probeProductionAlphaAvailable().then((hasAlpha) => {
      setMode(resolveLoaderGeometryMode(hasAlpha));
      if (hasAlpha) setAlphaUrl(site00LoaderGeometryWebmUrl());
    });
  }, []);

  useEffect(() => {
    if (mode !== 'screen') return;
    fetch(site00LoaderGeometrySourceUrl(), { method: 'HEAD' })
      .then((r) => {
        if (!r.ok) setSourceUrl(site00LoaderGeometrySourceRemoteUrl());
      })
      .catch(() => setSourceUrl(site00LoaderGeometrySourceRemoteUrl()));
  }, [mode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const enforceSilent = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
    };

    enforceSilent();
    video.addEventListener('volumechange', enforceSilent);
    video.addEventListener('play', enforceSilent);

    if (reducedMotion) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
    } else {
      void video.play().catch(() => undefined);
    }

    return () => {
      video.removeEventListener('volumechange', enforceSilent);
      video.removeEventListener('play', enforceSilent);
    };
  }, [reducedMotion, mode, sourceUrl, alphaUrl]);

  const handleReady = () => {
    if (ready) return;
    setReady(true);
    onReady?.();
  };

  const useAlphaMode = mode === 'alpha';
  const useApng = useAlphaMode && site00LoaderPrefersApngGeometry();
  const webmSrc = alphaUrl ?? site00LoaderGeometryWebmUrl();

  return (
    <div className={`site00-loader-geometry-mount ${ready ? 'site00-loader-geometry-mount--ready' : ''}`}>
      {useAlphaMode ? (
        useApng ? (
          <img
            className={`site00-loader-animation site00-loader-animation--alpha ${reducedMotion ? 'site00-loader-animation--static' : ''}`}
            src={site00LoaderGeometryApngUrl()}
            alt=""
            decoding="async"
            draggable={false}
            aria-hidden="true"
            onLoad={handleReady}
          />
        ) : (
          <video
            ref={videoRef}
            className={`site00-loader-animation site00-loader-animation--alpha ${reducedMotion ? 'site00-loader-animation--static' : ''}`}
            muted
            playsInline
            autoPlay={!reducedMotion}
            loop={!reducedMotion}
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            onLoadedData={handleReady}
            onCanPlay={handleReady}
          >
            <source src={webmSrc} type="video/webm" />
          </video>
        )
      ) : (
        <video
          ref={videoRef}
          className={`site00-loader-animation site00-loader-animation--screen ${reducedMotion ? 'site00-loader-animation--static' : ''}`}
          src={sourceUrl}
          muted
          playsInline
          autoPlay={!reducedMotion}
          loop={!reducedMotion}
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={handleReady}
          onCanPlay={handleReady}
        />
      )}
    </div>
  );
}
