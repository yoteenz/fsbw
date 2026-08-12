import { useEffect, useRef, useState } from 'react';
import {
  ARCHIVE_VAULT_SHELL_POSTER_SRC,
  ARCHIVE_VAULT_SHELL_VIDEO_SRC,
} from '../../../../constants/archiveVault';
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

type ArchiveVaultMediaProps = {
  /** When false, pause ambient playback (viewport visibility). */
  motionActive?: boolean;
};

/** Ambient acrylic shell — poster crossfade, muted loop, static fallback. */
export function ArchiveVaultMedia({ motionActive = true }: ArchiveVaultMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

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
      { threshold: 0.1, rootMargin: '10% 0px' },
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

  return (
    <div ref={rootRef} className="archive-vault__shell-media" aria-hidden>
      <img
        className="archive-vault__shell-poster"
        src={ARCHIVE_VAULT_SHELL_POSTER_SRC}
        alt=""
        decoding="async"
        draggable={false}
        style={{ opacity: showVideo ? 0 : 1 }}
      />
      {!prefersReducedMotion && !videoFailed ? (
        <video
          ref={videoRef}
          className="archive-vault__shell-video"
          {...{ [LOUNGE_TV_DECORATIVE_MOTION_ATTR]: 'true' }}
          src={ARCHIVE_VAULT_SHELL_VIDEO_SRC}
          poster={ARCHIVE_VAULT_SHELL_POSTER_SRC}
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
