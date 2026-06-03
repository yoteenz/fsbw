import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE,
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  lobbyLoungeTransitionFrameStyle,
  lobbyLoungeTransitionLetterboxBottomBandStyle,
  lobbyLoungeTransitionLetterboxShellStyle,
  lobbyLoungeTransitionLetterboxTopBandStyle,
  lobbyLoungeTransitionMediaLayerStyle,
  lobbyLoungeTransitionPosterInFrameStyle,
  lobbyLoungeTransitionVideoSrc,
} from '../../constants/lobbyLoungeTransitionVideo';
import {
  FINAL_LOBBY_BACKGROUND_SRC,
  FINAL_LOUNGE_BACKGROUND_SRC,
} from '../../constants/finalLobbySceneAssets';
import { useLobbyLoungeTransitionLetterboxLayout } from '../../hooks/useLobbyLoungeTransitionLetterboxLayout';
import { useSceneCoverVideoPlayback } from '../../hooks/useSceneCoverVideoPlayback';
import { useLobbyLoungeTransitionDebug } from '../../utils/lobbyLoungeTransitionDebug';
import {
  LobbyLoungeTransitionDebugBanner,
  LobbyLoungeTransitionLayerOutline,
  lobbyLoungeTransitionFrameDebugStyle,
  lobbyLoungeTransitionLetterboxBandDebugStyle,
} from './LobbyLoungeTransitionDebugLayers';

type OverlayProps = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  onComplete: () => void;
};

const transitionPosterSrc = (direction: LobbyLoungeTransitionDirection) =>
  direction === 'forward' ? FINAL_LOBBY_BACKGROUND_SRC : FINAL_LOUNGE_BACKGROUND_SRC;

const MASKED_MEDIA_CROSSFADE_MS = 60;

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
 * Slide-sized portrait frame (928×1680 cover math) + transparent letterbox bands.
 * Poster and video share the same clipped box and crossfade — no layout swap on reveal.
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
  const letterbox = useLobbyLoungeTransitionLetterboxLayout();
  const offsetY = debug.mediaOffsetYPx;
  const posterSrc = debug.posterReveal === 'hidden' ? null : poster;
  const posterOpacity = active && posterSrc ? (frameVisible ? 0 : 1) : 0;
  const videoOpacity = active && frameVisible ? 1 : 0;
  const showDebug = debug.showLayerOverlays;

  return (
    <>
      <LobbyLoungeTransitionDebugBanner debug={debug} />
      <div style={lobbyLoungeTransitionLetterboxShellStyle()}>
        <div
          aria-hidden
          style={{
            ...lobbyLoungeTransitionLetterboxTopBandStyle(letterbox.topBandPx),
            ...lobbyLoungeTransitionLetterboxBandDebugStyle(showDebug),
          }}
        />
        <div
          style={{
            ...lobbyLoungeTransitionFrameStyle(letterbox),
            ...lobbyLoungeTransitionFrameDebugStyle(showDebug),
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
              {showDebug ? (
                <LobbyLoungeTransitionLayerOutline
                  label={`POSTER · offsetY ${offsetY}px`}
                  color="#c2185b"
                  fill="rgba(233, 30, 99, 0.32)"
                  opacity={posterOpacity}
                />
              ) : null}
            </div>
          ) : showDebug ? (
            <LobbyLoungeTransitionLayerOutline
              label="POSTER hidden (?lobbyTransitionPoster=hidden)"
              color="#c2185b"
              fill="rgba(233, 30, 99, 0.12)"
              opacity={0}
            />
          ) : null}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: videoOpacity,
              transition: `opacity ${MASKED_MEDIA_CROSSFADE_MS}ms linear`,
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              preload="auto"
              onError={onError}
              style={lobbyLoungeTransitionMediaLayerStyle(direction, offsetY)}
            >
              <source src={src} type={src.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
              <source src={LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE} type="video/quicktime" />
            </video>
            {showDebug ? (
              <LobbyLoungeTransitionLayerOutline
                label={`VIDEO · offsetY ${offsetY}px`}
                color="#64dd17"
                fill="rgba(118, 255, 3, 0.26)"
                opacity={videoOpacity}
              />
            ) : null}
          </div>
        </div>
        <div
          aria-hidden
          style={{
            ...lobbyLoungeTransitionLetterboxBottomBandStyle(letterbox.bottomBandPx),
            ...lobbyLoungeTransitionLetterboxBandDebugStyle(showDebug),
          }}
        />
      </div>
    </>
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
  const poster = transitionPosterSrc(direction);
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
        zIndex: 200,
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
 * Single fixed overlay for lobby ↔ lounge — keeps `<video>` warm and avoids lobby poster flash on complete.
 */
export function LobbyLoungeTransitionHost({ phase, onComplete }: HostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const debug = useLobbyLoungeTransitionDebug();
  const active = phase !== null;
  const direction = phase ?? 'forward';
  const src = lobbyLoungeTransitionVideoSrc(direction);
  const poster = active ? transitionPosterSrc(direction) : null;
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
