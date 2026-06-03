import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE,
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  lobbyLoungeTransitionCoverPosition,
  lobbyLoungeTransitionLetterboxShellStyle,
  lobbyLoungeTransitionMediaLayerStyle,
  lobbyLoungeTransitionVideoSrc,
} from '../../constants/lobbyLoungeTransitionVideo';
import { useSceneCoverVideoPlayback } from '../../hooks/useSceneCoverVideoPlayback';

type OverlayProps = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  onComplete: () => void;
};

/**
 * No slide PNG poster — it uses 928×1680 `cover` vs Seedance 1080×1920, so it sits lower than
 * video frame 0 and causes a drop-then-rise when `notifyPlaying()` swaps layers. The carousel
 * slide shows through the transparent overlay until the video fades in (aligned with the slide).
 */
const transitionPosterSrc = (_direction: LobbyLoungeTransitionDirection): string | null => null;

type TransitionMediaProps = {
  active: boolean;
  frameVisible: boolean;
  poster: string | null;
  videoRef: RefObject<HTMLVideoElement>;
  src: string;
  onError: () => void;
};

/** Full-viewport `cover` + `center top` — same box as {@link SceneCarouselViewportStage} (no letterbox bands). */
function LobbyLoungeTransitionMedia({
  active,
  frameVisible,
  poster,
  videoRef,
  src,
  onError,
}: TransitionMediaProps) {
  const showPoster = active && !frameVisible && poster;

  return (
    <div style={lobbyLoungeTransitionLetterboxShellStyle()}>
      {showPoster ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: lobbyLoungeTransitionCoverPosition(),
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
        onError={onError}
        style={{
          ...lobbyLoungeTransitionMediaLayerStyle(),
          opacity: active && frameVisible ? 1 : 0,
          transition: frameVisible ? 'opacity 60ms linear' : 'none',
        }}
      >
        <source src={src} type={src.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
        <source src={LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE} type="video/quicktime" />
      </video>
    </div>
  );
}

/**
 * Seedance clip — fixed viewport (`inset: 0`, `100dvh`) aligned with carousel cover math.
 * Prefer {@link LobbyLoungeTransitionHost} on {@link LobbyApp} (warm preload + no end flash).
 */
export function LobbyLoungeTransitionOverlay({ active, direction, onComplete }: OverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const src = lobbyLoungeTransitionVideoSrc(direction);
  const poster = transitionPosterSrc(direction);

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setFrameVisible(false);
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    el.preload = 'auto';
    if (el.dataset.sceneCoverSrc !== src) {
      el.dataset.sceneCoverSrc = src;
      el.load();
    }
  }, [active, src]);

  useEffect(() => {
    if (!active) setFrameVisible(false);
  }, [active, direction]);

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
      <LobbyLoungeTransitionMedia
        active={active}
        frameVisible={frameVisible}
        poster={poster}
        videoRef={videoRef}
        src={src}
        onError={finish}
      />
    </div>
  );
}

type HostProps = {
  /** `null` = hidden warm preload only; otherwise plays forward / reverse. */
  phase: LobbyLoungeTransitionDirection | null;
  onComplete: (direction: LobbyLoungeTransitionDirection) => void;
};

/**
 * Single fixed overlay for lobby ↔ lounge — keeps `<video>` warm and avoids lobby poster flash on complete.
 */
export function LobbyLoungeTransitionHost({ phase, onComplete }: HostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const active = phase !== null;
  const direction = phase ?? 'forward';
  const src = lobbyLoungeTransitionVideoSrc(direction);
  const poster = active ? transitionPosterSrc(direction) : null;

  const finish = useCallback(() => {
    if (!phase) return;
    onComplete(phase);
  }, [onComplete, phase]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.preload = 'auto';
    if (el.dataset.sceneCoverSrc !== src) {
      el.dataset.sceneCoverSrc = src;
      el.load();
    }
  }, [src]);

  useEffect(() => {
    if (!active) setFrameVisible(false);
  }, [active, direction]);

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
        position: 'fixed',
        inset: 0,
        zIndex: active ? 250 : -1,
        overflow: 'hidden',
        pointerEvents: 'none',
        visibility: active ? 'visible' : 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      <LobbyLoungeTransitionMedia
        active={active}
        frameVisible={frameVisible}
        poster={poster}
        videoRef={videoRef}
        src={src}
        onError={finish}
      />
    </div>
  );
}

/** @deprecated Carousel middle panel — use {@link LobbyLoungeTransitionHost}. */
export const LobbyLoungeTransitionSlide = LobbyLoungeTransitionOverlay;
