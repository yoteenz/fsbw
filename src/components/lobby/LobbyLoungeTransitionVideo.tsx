import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE,
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  lobbyLoungeTransitionMediaShellStyle,
  lobbyLoungeTransitionVideoClipStyle,
  lobbyLoungeTransitionVideoElementStyle,
  lobbyLoungeTransitionPosterInFrameStyle,
  lobbyLoungeTransitionVideoSrc,
} from '../../constants/lobbyLoungeTransitionVideo';
import { SCENE_CAROUSEL_LETTERBOX_BG } from '../../utils/sceneCarouselBackground';
import {
  FINAL_LOBBY_BACKGROUND_SRC,
  FINAL_LOUNGE_BACKGROUND_SRC,
} from '../../constants/finalLobbySceneAssets';
import { useSceneCoverVideoPlayback } from '../../hooks/useSceneCoverVideoPlayback';
import { useLobbyLoungeTransitionDebug } from '../../utils/lobbyLoungeTransitionDebug';

type OverlayProps = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  onComplete: () => void;
};

const MASKED_MEDIA_CROSSFADE_MS = 60;

/** Production: no slide PNG — carousel lobby/lounge background shows through until video. */
function resolveTransitionPoster(
  direction: LobbyLoungeTransitionDirection,
  debug: ReturnType<typeof useLobbyLoungeTransitionDebug>,
): string | null {
  if (debug.posterReveal === 'slide') {
    return direction === 'forward' ? FINAL_LOBBY_BACKGROUND_SRC : FINAL_LOUNGE_BACKGROUND_SRC;
  }
  return null;
}

type TransitionMediaProps = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  frameVisible: boolean;
  poster: string | null;
  videoRef: RefObject<HTMLVideoElement>;
  src: string;
  onError: () => void;
  debug: ReturnType<typeof useLobbyLoungeTransitionDebug>;
};

/**
 * Full-viewport `contain` + `center top` — same geometry as lobby/lounge carousel slides.
 * Black letterbox (no transparent bands) so the slide does not peek through at play start.
 */
function LobbyLoungeTransitionMedia({
  active,
  direction,
  frameVisible,
  poster,
  videoRef,
  src,
  onError,
  debug,
}: TransitionMediaProps) {
  const offsetY = debug.mediaOffsetYPx;
  const posterSrc = poster;
  const posterOpacity = active && posterSrc ? (frameVisible ? 0 : 1) : 0;
  const videoOpacity = active && frameVisible ? 1 : 0;

  return (
    <div
      style={{
        ...lobbyLoungeTransitionMediaShellStyle(),
        backgroundColor: frameVisible ? SCENE_CAROUSEL_LETTERBOX_BG : 'transparent',
      }}
    >
      {posterSrc ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            opacity: posterOpacity,
            transition: `opacity ${MASKED_MEDIA_CROSSFADE_MS}ms linear`,
          }}
        >
          <div style={lobbyLoungeTransitionPosterInFrameStyle(posterSrc, direction, offsetY)} />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: videoOpacity,
          transition: `opacity ${MASKED_MEDIA_CROSSFADE_MS}ms linear`,
        }}
      >
        <div style={lobbyLoungeTransitionVideoClipStyle()}>
          <video
            ref={videoRef}
            playsInline
            muted
            preload="auto"
            onError={onError}
            style={lobbyLoungeTransitionVideoElementStyle(direction, offsetY)}
          >
            <source src={src} type={src.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
            <source src={LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE} type="video/quicktime" />
          </video>
        </div>
      </div>
    </div>
  );
}

function useTransitionPlaybackOptions(
  debug: ReturnType<typeof useLobbyLoungeTransitionDebug>,
  onPlaying: () => void,
) {
  return {
    revealOnFirstDecodedFrame: debug.posterReveal !== 'videoOnPlayingOnly',
    onPlaying,
  };
}

/**
 * Seedance clip — fixed viewport (`inset: 0`, `100dvh`) aligned with carousel cover math.
 * Prefer {@link LobbyLoungeTransitionHost} on {@link LobbyApp} (warm preload + no end flash).
 */
export function LobbyLoungeTransitionOverlay({ active, direction, onComplete }: OverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const debug = useLobbyLoungeTransitionDebug();
  const src = lobbyLoungeTransitionVideoSrc(direction);
  const poster = resolveTransitionPoster(direction, debug);
  const playbackOpts = useTransitionPlaybackOptions(debug, () => setFrameVisible(true));

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
    onPlaying: playbackOpts.onPlaying,
    revealOnFirstDecodedFrame: playbackOpts.revealOnFirstDecodedFrame,
  });

  return (
    <div
      aria-hidden={!active}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        visibility: active ? 'visible' : 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      <LobbyLoungeTransitionMedia
        active={active}
        direction={direction}
        frameVisible={frameVisible}
        poster={poster}
        videoRef={videoRef}
        src={src}
        onError={finish}
        debug={debug}
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
 * Scene-locked overlay for lobby ↔ lounge — render inside {@link SceneViewportPortal}
 * on the active slide viewport (keeps `<video>` warm when `phase` is null on lobby).
 */
export function LobbyLoungeTransitionHost({ phase, onComplete }: HostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const debug = useLobbyLoungeTransitionDebug();
  const active = phase !== null;
  const direction = phase ?? 'forward';
  const src = lobbyLoungeTransitionVideoSrc(direction);
  const poster = active ? resolveTransitionPoster(direction, debug) : null;
  const playbackOpts = useTransitionPlaybackOptions(debug, () => setFrameVisible(true));

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
    onPlaying: playbackOpts.onPlaying,
    revealOnFirstDecodedFrame: playbackOpts.revealOnFirstDecodedFrame,
  });

  return (
    <div
      aria-hidden={!active && phase === null}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        visibility: active || phase === null ? 'visible' : 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      <LobbyLoungeTransitionMedia
        active={active}
        direction={direction}
        frameVisible={frameVisible}
        poster={poster}
        videoRef={videoRef}
        src={src}
        onError={finish}
        debug={debug}
      />
    </div>
  );
}

/** @deprecated Carousel middle panel — use {@link LobbyLoungeTransitionHost}. */
export const LobbyLoungeTransitionSlide = LobbyLoungeTransitionOverlay;
