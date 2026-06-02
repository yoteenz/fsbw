import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE,
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  lobbyLoungeTransitionMediaPosition,
  lobbyLoungeTransitionVideoSrc,
} from '../../constants/lobbyLoungeTransitionVideo';
import {
  FINAL_LOBBY_BACKGROUND_SRC,
  FINAL_LOUNGE_BACKGROUND_SRC,
} from '../../constants/finalLobbySceneAssets';
import { useSceneCoverVideoPlayback } from '../../hooks/useSceneCoverVideoPlayback';

type Props = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  onComplete: () => void;
};

const posterForDirection = (direction: LobbyLoungeTransitionDirection) =>
  direction === 'forward' ? FINAL_LOBBY_BACKGROUND_SRC : FINAL_LOUNGE_BACKGROUND_SRC;

const transitionMediaPosition = lobbyLoungeTransitionMediaPosition();

/** Same box + crop as `sceneCarouselBackgroundLayerStyle` (cover, center top + Y nudge). */
const transitionMediaStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  objectPosition: transitionMediaPosition,
};

/**
 * Seedance clip — mount inside {@link SceneCarouselViewportStage} (`inset: 0`, `100dvh`)
 * so video/poster use the same cover box as the composite background.
 */
export function LobbyLoungeTransitionOverlay({ active, direction, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const src = lobbyLoungeTransitionVideoSrc(direction);
  const poster = posterForDirection(direction);

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
    reversePlaybackRate: LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE,
    onComplete: finish,
    onPlaying: () => setFrameVisible(true),
  });

  return (
    <div
      aria-hidden={!active}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        overflow: 'hidden',
        pointerEvents: 'none',
        visibility: active ? 'visible' : 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      {!frameVisible && active ? (
        <div
          aria-hidden
          style={{
            ...transitionMediaStyle,
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: transitionMediaPosition,
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
          ...transitionMediaStyle,
          opacity: frameVisible ? 1 : 0,
          transition: 'opacity 60ms linear',
        }}
      >
        <source src={src} type={src.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
        <source src={LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE} type="video/quicktime" />
      </video>
    </div>
  );
}

/** @deprecated Carousel middle panel — use {@link LobbyLoungeTransitionOverlay}. */
export const LobbyLoungeTransitionSlide = LobbyLoungeTransitionOverlay;
