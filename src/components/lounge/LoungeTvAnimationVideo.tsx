import { useCallback, useEffect, useRef, useState } from 'react';
import { FINAL_LOUNGE_BACKGROUND_SRC } from '../../constants/finalLobbySceneAssets';
import {
  LOUNGE_TV_ANIMATION_VIDEO_REMOTE,
  LOUNGE_TV_ANIMATION_REVERSE_PLAYBACK_RATE,
  loungeTvAnimationVideoSrc,
} from '../../constants/loungeTvAnimationVideo';
import { useSceneCoverVideoPlayback, type SceneCoverVideoDirection } from '../../hooks/useSceneCoverVideoPlayback';

type Props = {
  active: boolean;
  direction: SceneCoverVideoDirection;
  onComplete: () => void;
};

const mediaStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  objectPosition: 'center top',
};

/** Full-screen TV open/close Seedance clip (`Final LP/video.mov`). */
export function LoungeTvAnimationVideo({ active, direction, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const src = loungeTvAnimationVideoSrc();
  const poster = FINAL_LOUNGE_BACKGROUND_SRC;

  const finish = useCallback(() => {
    setFrameVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.preload = 'auto';
    el.load();
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
      {!frameVisible ? (
        <div
          aria-hidden
          style={{
            ...mediaStyle,
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : null}
      <video
        ref={videoRef}
        playsInline
        muted
        preload="auto"
        poster={poster}
        onError={finish}
        style={{
          ...mediaStyle,
          opacity: frameVisible ? 1 : 0,
          transition: 'opacity 60ms linear',
        }}
      >
        <source src={src} type="video/quicktime" />
        <source src={LOUNGE_TV_ANIMATION_VIDEO_REMOTE} type="video/quicktime" />
      </video>
    </div>
  );
}
