import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE,
  LOUNGE_TV_ANIMATION_VIDEO_SRC,
  LOUNGE_TV_ANIMATION_VIDEO_SRC_MOV,
  loungeTvAnimationMediaLayerStyle,
  loungeTvAnimationPosterSrc,
  loungeTvAnimationVideoSrc,
} from '../../constants/loungeTvAnimationVideo';
import { useSceneCoverVideoPlayback, type SceneCoverVideoDirection } from '../../hooks/useSceneCoverVideoPlayback';

type Props = {
  active: boolean;
  direction: SceneCoverVideoDirection;
  onComplete: () => void;
};

/** Full-screen TV open/close Seedance clip (`Final LP/video.mov`). */
export function LoungeTvAnimationVideo({ active, direction, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const src = loungeTvAnimationVideoSrc();
  /** Lounge composite on open; black on reverse (end-still has hand — never use as pre-roll). */
  const poster = loungeTvAnimationPosterSrc(direction);

  const finish = useCallback(() => {
    setFrameVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.preload = 'auto';
    if (el.dataset.sceneCoverSrc !== src) {
      el.dataset.sceneCoverSrc = src;
      el.load();
    }
  }, [src]);

  useSceneCoverVideoPlayback(videoRef, {
    active,
    direction,
    reversePlaybackRate: LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE,
    onComplete: finish,
    onPlaying: () => setFrameVisible(true),
    safetyTimeoutMs: 15000,
  });

  if (!active) return null;

  return (
    <div
      aria-hidden={!active}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#000000',
      }}
    >
      {!frameVisible && poster ? (
        <div
          aria-hidden
          style={{
            ...loungeTvAnimationMediaLayerStyle(),
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : null}
      <video
        ref={videoRef}
        playsInline
        muted
        preload="auto"
        poster={poster ?? undefined}
        onError={finish}
        style={{
          ...loungeTvAnimationMediaLayerStyle(),
          opacity: frameVisible ? 1 : 0,
          transition: 'opacity 60ms linear',
        }}
      >
        <source src={LOUNGE_TV_ANIMATION_VIDEO_SRC} type="video/mp4" />
        <source src={LOUNGE_TV_ANIMATION_VIDEO_SRC_MOV} type="video/quicktime" />
      </video>
    </div>
  );
}
