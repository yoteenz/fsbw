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

/** Fade before manual loop seek — hides clips that do not match first frame. */
const HERO_VIDEO_LOOP_FADE_SEC = 0.2;
const HERO_VIDEO_LOOP_END_TRIM_SEC = 0.12;

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
  const pendingLoopFadeRef = useRef(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [loopOpacity, setLoopOpacity] = useState(1);

  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);
    setLoopOpacity(1);
    pendingLoopFadeRef.current = false;
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc || videoFailed) return;

    const onTimeUpdate = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const t = video.currentTime;
      const fade = HERO_VIDEO_LOOP_FADE_SEC;
      const trim = HERO_VIDEO_LOOP_END_TRIM_SEC;
      const loopPoint = Math.max(fade + trim + 0.05, duration - trim);

      if (t >= loopPoint) {
        pendingLoopFadeRef.current = true;
        video.currentTime = 0;
        setLoopOpacity(0);
        return;
      }

      if (pendingLoopFadeRef.current) {
        if (t < fade) {
          setLoopOpacity(Math.min(1, t / fade));
          return;
        }
        pendingLoopFadeRef.current = false;
      }

      if (t >= loopPoint - fade) {
        setLoopOpacity(Math.max(0, (loopPoint - t) / fade));
        return;
      }

      setLoopOpacity(1);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [videoSrc, videoFailed]);

  if (!videoSrc || prefersReducedMotion || videoFailed) {
    return <img src={src} alt="" style={PAGE_HERO_IMAGE_STYLE} />;
  }

  const showVideo = videoReady && loopOpacity > 0.01;
  const posterOpacity = showVideo ? Math.max(0, 1 - loopOpacity) : 1;

  return (
    <div
      style={{
        position: 'relative',
        width: '75%',
        marginTop: '22px',
        marginBottom: '12px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'contain',
          opacity: posterOpacity,
          visibility: posterOpacity < 0.01 ? 'hidden' : 'visible',
          transition: 'opacity 0.15s ease-out',
        }}
      />
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc}
        poster={src}
        preload="auto"
        playsInline
        muted
        autoPlay
        aria-hidden
        onLoadedData={() => {
          setVideoReady(true);
          setLoopOpacity(1);
        }}
        onCanPlay={() => {
          setVideoReady(true);
          setLoopOpacity(1);
        }}
        onError={() => setVideoFailed(true)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: videoReady ? loopOpacity : 0,
          transition: 'opacity 0.15s ease-out',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
