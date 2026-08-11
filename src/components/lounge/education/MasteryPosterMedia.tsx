import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { MasteryTrackPresentation } from '../../../content/education/hierarchy/masteryTracks';
import {
  applyLoungeTvDecorativeMotionPlayback,
  LOUNGE_TV_DECORATIVE_MOTION_ATTR,
  pauseLoungeTvVideo,
  playLoungeTvDecorativeMotion,
} from '../loungeTvMutedPlayback';

const MASTERY_POSTER_SCRIM =
  'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 34%, rgba(0,0,0,0.52) 62%, rgba(0,0,0,0.86) 100%)';

const MASTERY_POSTER_SCRIM_TOP =
  'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 36%, rgba(0,0,0,0.08) 58%, rgba(0,0,0,0) 100%)';

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

/** Full-bleed cover layer — inline so Tailwind preflight (`img { height: auto }`) cannot win. */
function masteryPosterLayerStyle(objectPosition: string): CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    minWidth: 0,
    objectFit: 'cover',
    objectPosition,
    display: 'block',
    pointerEvents: 'none',
    userSelect: 'none',
  };
}

type MasteryPosterMediaProps = {
  track: MasteryTrackPresentation;
  /** Living loop when this card is highlighted (focus / touch drag-over). */
  motionActive?: boolean;
  /** When false, still-only (no decorative motion loop). */
  allowVideoMotion?: boolean;
  /** Top-row panels — scrim weighted for copy at the top edge. */
  metaAtTop?: boolean;
};

/**
 * Mastery collage media — still by default; decorative motion loop only while highlighted.
 * Motion uses the silent decorative path — never registered as audio-capable media.
 */
export function MasteryPosterMedia({
  track,
  motionActive = false,
  allowVideoMotion = true,
  metaAtTop = false,
}: MasteryPosterMediaProps) {
  const staticHeroUrl = track.heroImageUrl?.trim();
  const animatedHeroUrl = track.heroVideoUrl?.trim();
  const objectPosition = track.heroPosition ?? 'center center';
  const prefersReducedMotion = usePrefersReducedMotion();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionPaintReady, setMotionPaintReady] = useState(false);
  const [motionFailed, setMotionFailed] = useState(false);

  const shouldAnimate =
    allowVideoMotion &&
    motionActive &&
    Boolean(animatedHeroUrl) &&
    Boolean(staticHeroUrl) &&
    !prefersReducedMotion &&
    !motionFailed;
  const hasMedia = Boolean(staticHeroUrl || animatedHeroUrl);
  const layerStyle = masteryPosterLayerStyle(objectPosition);
  const crossfadeActive = shouldAnimate && motionPaintReady;

  useEffect(() => {
    if (!shouldAnimate) {
      setMotionPaintReady(false);
      pauseLoungeTvVideo(videoRef.current);
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    setMotionPaintReady(false);
    applyLoungeTvDecorativeMotionPlayback(video);

    const markReady = () => {
      applyLoungeTvDecorativeMotionPlayback(video);
      setMotionPaintReady(true);
    };
    const onError = () => setMotionFailed(true);
    const onMetadata = () => applyLoungeTvDecorativeMotionPlayback(video);

    video.addEventListener('loadeddata', markReady);
    video.addEventListener('canplay', markReady);
    video.addEventListener('loadedmetadata', onMetadata);
    video.addEventListener('error', onError);
    video.load();

    return () => {
      video.removeEventListener('loadeddata', markReady);
      video.removeEventListener('canplay', markReady);
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('error', onError);
      pauseLoungeTvVideo(video);
    };
  }, [shouldAnimate, animatedHeroUrl]);

  useEffect(() => {
    if (!shouldAnimate || !motionPaintReady) {
      pauseLoungeTvVideo(videoRef.current);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    void playLoungeTvDecorativeMotion(video).catch(() => setMotionFailed(true));
  }, [shouldAnimate, motionPaintReady]);

  useEffect(() => {
    return () => {
      pauseLoungeTvVideo(videoRef.current);
    };
  }, []);

  return (
    <div
      className="lounge-tv-mastery-poster-media"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {!hasMedia ? <span className="lounge-tv-mastery-poster-placeholder" aria-hidden /> : null}

      {staticHeroUrl ? (
        <img
          className="lounge-tv-mastery-poster-still"
          src={staticHeroUrl}
          alt=""
          draggable={false}
          decoding="async"
          style={{
            ...layerStyle,
            zIndex: 0,
            opacity: crossfadeActive ? 0 : 1,
          }}
        />
      ) : null}

      {shouldAnimate && animatedHeroUrl ? (
        <video
          ref={videoRef}
          className="lounge-tv-mastery-poster-video"
          {...{ [LOUNGE_TV_DECORATIVE_MOTION_ATTR]: 'true' }}
          src={animatedHeroUrl}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          aria-hidden
          style={{
            ...layerStyle,
            zIndex: 1,
            opacity: crossfadeActive ? 1 : 0,
            backgroundColor: 'transparent',
          }}
        />
      ) : null}

      <span
        className="lounge-tv-mastery-poster-scrim"
        style={{
          background: track.heroOverlay ?? (metaAtTop ? MASTERY_POSTER_SCRIM_TOP : MASTERY_POSTER_SCRIM),
        }}
      />
    </div>
  );
}
