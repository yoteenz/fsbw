import { useEffect, useRef, useState } from 'react';

type Site00LoaderAnimationProps = {
  animationUrl: string;
  reducedMotion?: boolean;
  onReady?: () => void;
};

/** Original OpenArt geometry loop — runtime-muted, no controls, no visible player chrome. */
export function Site00LoaderAnimation({
  animationUrl,
  reducedMotion = false,
  onReady,
}: Site00LoaderAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

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
    video.addEventListener('loadeddata', enforceSilent);

    if (reducedMotion) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore seek errors */
      }
    } else {
      void video.play().catch(() => undefined);
    }

    return () => {
      video.removeEventListener('volumechange', enforceSilent);
      video.removeEventListener('play', enforceSilent);
      video.removeEventListener('loadeddata', enforceSilent);
    };
  }, [reducedMotion, animationUrl]);

  const handleReady = () => {
    setReady(true);
    onReady?.();
  };

  return (
    <div className={`site00-loader-animation-wrap ${ready ? 'site00-loader-animation-wrap--ready' : ''}`}>
      <video
        ref={videoRef}
        className={`site00-loader-animation ${reducedMotion ? 'site00-loader-animation--static' : ''}`}
        src={animationUrl}
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
      />
    </div>
  );
}
