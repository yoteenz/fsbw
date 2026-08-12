import { useEffect, useRef, useState } from 'react';
import {
  SLAY_FORECAST_ORB_VIDEO_SRC,
  slayForecastOrbPosterSrc,
} from '../../../../constants/slayForecastOrb';
import type { ForecastSeason } from '../../../../content/slay-forecast';
import {
  applyLoungeTvDecorativeMotionPlayback,
  LOUNGE_TV_DECORATIVE_MOTION_ATTR,
  pauseLoungeTvVideo,
  playLoungeTvDecorativeMotion,
} from '../../loungeTvMutedPlayback';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

type SlayForecastOrbMediaProps = {
  season: ForecastSeason;
  /** When false, pause playback (viewport visibility). */
  motionActive?: boolean;
  className?: string;
};

/** Ambient forecast instrument media — muted loop, no controls, poster fallback. */
export function SlayForecastOrbMedia({
  season,
  motionActive = true,
  className = '',
}: SlayForecastOrbMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const posterSrc = slayForecastOrbPosterSrc(season);

  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [inView, setInView] = useState(false);

  const shouldPlay =
    motionActive && inView && !prefersReducedMotion && !videoFailed;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.12, rootMargin: '8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    applyLoungeTvDecorativeMotionPlayback(video);
    video.loop = true;

    const markReady = () => {
      applyLoungeTvDecorativeMotionPlayback(video);
      setVideoReady(true);
    };
    const onError = () => {
      setVideoFailed(true);
      setVideoReady(false);
    };

    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
      video.removeEventListener('error', onError);
      pauseLoungeTvVideo(video);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!shouldPlay) {
      pauseLoungeTvVideo(video);
      return;
    }

    if (!videoReady) return;

    void playLoungeTvDecorativeMotion(video).catch(() => setVideoFailed(true));
  }, [shouldPlay, videoReady]);

  const showVideo = shouldPlay && videoReady;
  const showPoster = !showVideo;

  return (
    <div
      ref={rootRef}
      className={`lounge-tv-slay-forecast-orb__media ${className}`.trim()}
      aria-hidden
    >
      {showPoster ? (
        <img
          className="lounge-tv-slay-forecast-orb__poster"
          src={posterSrc}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : null}
      {!prefersReducedMotion && !videoFailed ? (
        <video
          ref={videoRef}
          className="lounge-tv-slay-forecast-orb__video"
          {...{ [LOUNGE_TV_DECORATIVE_MOTION_ATTR]: 'true' }}
          src={SLAY_FORECAST_ORB_VIDEO_SRC}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden
          style={{ opacity: showVideo ? 1 : 0 }}
        />
      ) : null}
    </div>
  );
}
