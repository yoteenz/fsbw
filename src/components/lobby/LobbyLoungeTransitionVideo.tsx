import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE,
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  lobbyLoungeTransitionFrameStyle,
  lobbyLoungeTransitionFullBleedPosterStyle,
  lobbyLoungeTransitionLetterboxBottomBandStyle,
  lobbyLoungeTransitionLetterboxShellStyle,
  lobbyLoungeTransitionLetterboxTopBandStyle,
  lobbyLoungeTransitionMediaLayerStyle,
  lobbyLoungeTransitionPosterLayerStyle,
  lobbyLoungeTransitionVideoSrc,
} from '../../constants/lobbyLoungeTransitionVideo';
import {
  FINAL_LOBBY_BACKGROUND_SRC,
  FINAL_LOUNGE_BACKGROUND_SRC,
} from '../../constants/finalLobbySceneAssets';
import { useLobbyLoungeTransitionLetterboxLayout } from '../../hooks/useLobbyLoungeTransitionLetterboxLayout';
import { useSceneCoverVideoPlayback } from '../../hooks/useSceneCoverVideoPlayback';

type OverlayProps = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  onComplete: () => void;
};

const posterForDirection = (direction: LobbyLoungeTransitionDirection) =>
  direction === 'forward' ? FINAL_LOBBY_BACKGROUND_SRC : FINAL_LOUNGE_BACKGROUND_SRC;

type TransitionMediaProps = {
  active: boolean;
  frameVisible: boolean;
  poster: string | null;
  videoRef: RefObject<HTMLVideoElement>;
  src: string;
  onError: () => void;
};

/**
 * Original cover clip in a portrait frame; transparent flex spacers mask baked-in letterbox.
 */
function LobbyLoungeTransitionMedia({
  active,
  frameVisible,
  poster,
  videoRef,
  src,
  onError,
}: TransitionMediaProps) {
  const showPoster = active && !frameVisible && poster;
  const letterbox = useLobbyLoungeTransitionLetterboxLayout();

  return (
    <div style={lobbyLoungeTransitionLetterboxShellStyle()}>
      {showPoster ? (
        <div aria-hidden style={lobbyLoungeTransitionFullBleedPosterStyle(poster)} />
      ) : null}
      <div aria-hidden style={lobbyLoungeTransitionLetterboxTopBandStyle(letterbox.topBandPx)} />
      <div style={lobbyLoungeTransitionFrameStyle(letterbox)}>
        {showPoster ? (
          <div aria-hidden style={lobbyLoungeTransitionPosterLayerStyle(poster)} />
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
      <div aria-hidden style={lobbyLoungeTransitionLetterboxBottomBandStyle(letterbox.bottomBandPx)} />
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
  const poster = posterForDirection(direction);

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
  const poster = active ? posterForDirection(direction) : null;

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
