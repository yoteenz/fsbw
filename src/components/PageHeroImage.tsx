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

/** Fade + trim before loop seek — hides Kling clips that do not match first frame. */
const HERO_VIDEO_LOOP_FADE_SEC = 0.22;
const HERO_VIDEO_LOOP_END_TRIM_SEC = 0.14;

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
  const [videoReady, setVideoReady] = useState(false);
  const [loopOpacity, setLoopOpacity] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const onTimeUpdate = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const t = video.currentTime;
      const fade = HERO_VIDEO_LOOP_FADE_SEC;
      const trim = HERO_VIDEO_LOOP_END_TRIM_SEC;
      const loopPoint = Math.max(fade + trim + 0.05, duration - trim);

      if (t >= loopPoint) {
        video.currentTime = 0;
        setLoopOpacity(0);
        return;
      }

      if (t >= loopPoint - fade) {
        setLoopOpacity((loopPoint - t) / fade);
        return;
      }

      if (t <= fade) {
        setLoopOpacity(Math.min(1, t / fade));
        return;
      }

      setLoopOpacity(1);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [videoSrc]);

  if (!videoSrc || prefersReducedMotion) {
    return <img src={src} alt="" style={PAGE_HERO_IMAGE_STYLE} />;
  }

  const videoOpacity = videoReady ? loopOpacity : 0;
  const posterOpacity = videoReady ? Math.max(0, 1 - loopOpacity) : 1;

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
          transition: posterOpacity > 0.98 || posterOpacity < 0.02 ? 'opacity 0.12s ease-out' : 'none',
        }}
      />
      <video
        ref={videoRef}
        src={videoSrc}
        poster={src}
        preload="auto"
        playsInline
        muted
        autoPlay
        aria-hidden
        onLoadedData={() => setVideoReady(true)}
        onCanPlay={() => setVideoReady(true)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: videoOpacity,
          transition: videoOpacity > 0.98 || videoOpacity < 0.02 ? 'opacity 0.12s ease-out' : 'none',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}
