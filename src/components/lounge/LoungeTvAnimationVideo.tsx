import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE,
  LOUNGE_TV_ANIMATION_REVERSE_START_FRACTION,
  LOUNGE_TV_ANIMATION_VIDEO_SRC,
  LOUNGE_TV_ANIMATION_VIDEO_SRC_MOV,
  loungeTvAnimationCoverPosition,
  loungeTvAnimationLetterboxShellStyle,
  loungeTvAnimationMediaLayerStyle,
  loungeTvAnimationPosterSrc,
  loungeTvAnimationVideoSrc,
} from '../../constants/loungeTvAnimationVideo';

function parkVideoAtReverseHandFrame(el: HTMLVideoElement): Promise<void> {
  const seek = (time: number) =>
    new Promise<void>((resolve) => {
      const done = () => {
        el.removeEventListener('seeked', done);
        resolve();
      };
      el.addEventListener('seeked', done);
      el.currentTime = time;
    });

  const waitForDuration = () =>
    new Promise<void>((resolve) => {
      if (el.readyState >= 1 && Number.isFinite(el.duration) && el.duration > 0) {
        resolve();
        return;
      }
      const onMeta = () => {
        el.removeEventListener('loadedmetadata', onMeta);
        resolve();
      };
      el.addEventListener('loadedmetadata', onMeta);
      if (el.readyState === HTMLMediaElement.HAVE_NOTHING) el.load();
    });

  return waitForDuration().then(async () => {
    const duration = el.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const frac = Math.min(1, Math.max(0, LOUNGE_TV_ANIMATION_REVERSE_START_FRACTION));
    const t = frac >= 1 ? Math.max(0, duration - 0.02) : Math.max(0, duration * frac);
    el.pause();
    el.playbackRate = 1;
    await seek(t);
  });
}
import { useSceneCoverVideoPlayback, type SceneCoverVideoDirection } from '../../hooks/useSceneCoverVideoPlayback';

type Props = {
  active: boolean;
  direction: SceneCoverVideoDirection;
  onComplete: () => void;
};

/** Full-viewport TV Seedance clip — `cover` aligned with lounge slide (no letterbox bands). */
export function LoungeTvAnimationVideo({ active, direction, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const src = loungeTvAnimationVideoSrc();
  const poster = loungeTvAnimationPosterSrc(direction);
  const showPoster = !frameVisible && poster;

  const finish = useCallback(() => {
    setFrameVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!active) setFrameVisible(false);
  }, [active, direction]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.preload = 'auto';
    if (el.dataset.sceneCoverSrc !== src) {
      el.dataset.sceneCoverSrc = src;
      el.load();
    }
  }, [src]);

  /** While menu is open, park on hand-press so close reverse starts instantly (no black lead-in). */
  useEffect(() => {
    if (active) return;
    const el = videoRef.current;
    if (!el) return;
    let cancelled = false;
    void parkVideoAtReverseHandFrame(el).then(() => {
      if (!cancelled) setFrameVisible(false);
    });
    return () => {
      cancelled = true;
    };
  }, [active, src]);

  useSceneCoverVideoPlayback(videoRef, {
    active,
    direction,
    reversePlaybackRate: LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE,
    reverseStartFraction:
      direction === 'reverse' ? LOUNGE_TV_ANIMATION_REVERSE_START_FRACTION : 1,
    onComplete: finish,
    onPlaying: () => setFrameVisible(true),
    safetyTimeoutMs: 15000,
  });

  return (
    <div
      aria-hidden={!active}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        overflow: 'hidden',
        pointerEvents: 'none',
        visibility: active ? 'visible' : 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      <div style={loungeTvAnimationLetterboxShellStyle()}>
        {showPoster ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${poster})`,
              backgroundSize: direction === 'forward' ? 'cover' : 'contain',
              backgroundPosition: loungeTvAnimationCoverPosition(direction),
              backgroundRepeat: 'no-repeat',
              pointerEvents: 'none',
            }}
          />
        ) : null}
        <video
          ref={videoRef}
          playsInline
          muted
          preload="auto"
          onError={finish}
          style={{
            ...loungeTvAnimationMediaLayerStyle(direction),
            opacity: frameVisible ? 1 : 0,
            transition: frameVisible ? 'opacity 60ms linear' : 'none',
          }}
        >
          <source src={LOUNGE_TV_ANIMATION_VIDEO_SRC} type="video/mp4" />
          <source src={LOUNGE_TV_ANIMATION_VIDEO_SRC_MOV} type="video/quicktime" />
        </video>
      </div>
    </div>
  );
}
