import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Site00GeometryAnchor } from './site00LoaderMedia';
import { site00LoaderPrefersApngGeometry } from './site00LoaderMedia';

type Site00LoaderAnimationProps = {
  webmUrl: string;
  apngUrl: string;
  anchor: Site00GeometryAnchor;
  reducedMotion?: boolean;
  onReady?: () => void;
};

/** Transcoded geometry — WebM alpha (Chromium) or APNG (iOS Safari). Silent, no player chrome. */
export function Site00LoaderAnimation({
  webmUrl,
  apngUrl,
  anchor,
  reducedMotion = false,
  onReady,
}: Site00LoaderAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const useApng = site00LoaderPrefersApngGeometry();

  useEffect(() => {
    if (useApng) return;
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
    video.addEventListener('loadeddata', enforceSilent);

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
      video.removeEventListener('loadeddata', enforceSilent);
    };
  }, [reducedMotion, webmUrl, useApng]);

  const handleReady = () => {
    if (ready) return;
    setReady(true);
    onReady?.();
  };

  const anchorStyle = {
    '--site00-geo-x': `${anchor.xPercent}%`,
    '--site00-geo-y': `${anchor.yPercent}%`,
    '--site00-geo-width': `${anchor.widthPercent}%`,
    '--site00-geo-translate-y': `${anchor.translateYPercent}%`,
  } as CSSProperties;

  return (
    <div
      className={`site00-loader-animation-wrap ${ready ? 'site00-loader-animation-wrap--ready' : ''}`}
      style={anchorStyle}
    >
      {useApng ? (
        <img
          className={`site00-loader-animation site00-loader-animation--apng ${reducedMotion ? 'site00-loader-animation--static' : ''}`}
          src={apngUrl}
          alt=""
          decoding="async"
          draggable={false}
          aria-hidden="true"
          onLoad={handleReady}
        />
      ) : (
        <video
          ref={videoRef}
          className={`site00-loader-animation ${reducedMotion ? 'site00-loader-animation--static' : ''}`}
          muted
          playsInline
          autoPlay={!reducedMotion}
          loop={!reducedMotion}
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={handleReady}
          onCanPlay={handleReady}
        >
          <source src={webmUrl} type="video/webm" />
        </video>
      )}
    </div>
  );
}
