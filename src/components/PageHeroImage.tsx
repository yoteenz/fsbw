import { useEffect, useRef, useState, type CSSProperties } from 'react';

/** Shared hero image layout — order form, brand member, etc. */
export const PAGE_HERO_IMAGE_STYLE: CSSProperties = {
  width: '75%',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
  marginTop: '22px',
  marginBottom: '12px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

type PageHeroImageProps = {
  /** Poster / static fallback (also used as `poster` when `videoSrc` is set). */
  src: string;
  /** When set, plays a looped muted inline video over the hero slot. */
  videoSrc?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

export default function PageHeroImage({ src, videoSrc }: PageHeroImageProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc || videoFailed) return;

    const tryPlay = () => {
      void video.play().catch(() => {
        /* Autoplay may be blocked until user gesture — poster remains visible. */
      });
    };

    video.addEventListener('canplay', tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    tryPlay();

    return () => {
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [videoSrc, videoFailed]);

  if (!videoSrc || prefersReducedMotion || videoFailed) {
    return <img src={src} alt="" style={PAGE_HERO_IMAGE_STYLE} />;
  }

  return (
    <video
      ref={videoRef}
      key={videoSrc}
      src={videoSrc}
      poster={src}
      preload="auto"
      playsInline
      muted
      loop
      autoPlay
      aria-hidden
      onError={() => setVideoFailed(true)}
      style={PAGE_HERO_IMAGE_STYLE}
    />
  );
}
