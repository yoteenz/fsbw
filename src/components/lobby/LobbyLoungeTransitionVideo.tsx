import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE,
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  lobbyLoungeTransitionVideoSrc,
} from '../../constants/lobbyLoungeTransitionVideo';
import {
  FINAL_LOBBY_BACKGROUND_SRC,
  FINAL_LOUNGE_BACKGROUND_SRC,
} from '../../constants/finalLobbySceneAssets';
import { sceneCarouselSlideMinHeightCss } from '../../utils/sceneCarouselBackground';

type Props = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  onComplete: () => void;
};

const posterForDirection = (direction: LobbyLoungeTransitionDirection) =>
  direction === 'forward' ? FINAL_LOBBY_BACKGROUND_SRC : FINAL_LOUNGE_BACKGROUND_SRC;

/** Same box + crop as `sceneCarouselBackgroundLayerStyle` (cover, center top). */
const transitionMediaStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  objectPosition: 'center top',
};

/**
 * Seedance clip — mount inside the active lobby/lounge slide (`position: absolute; inset: 0`)
 * so video/poster match the slide background geometry.
 */
export function LobbyLoungeTransitionOverlay({ active, direction, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const reverseRafRef = useRef<number | null>(null);
  const [frameVisible, setFrameVisible] = useState(false);
  const src = lobbyLoungeTransitionVideoSrc(direction);
  const poster = posterForDirection(direction);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFrameVisible(false);
    if (reverseRafRef.current !== null) {
      cancelAnimationFrame(reverseRafRef.current);
      reverseRafRef.current = null;
    }
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.playbackRate = 1;
      el.currentTime = direction === 'reverse' ? 0 : el.currentTime;
    }
    onComplete();
  }, [direction, onComplete]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.preload = 'auto';
    el.load();
  }, [src]);

  useEffect(() => {
    if (!active) {
      completedRef.current = false;
      setFrameVisible(false);
      if (reverseRafRef.current !== null) {
        cancelAnimationFrame(reverseRafRef.current);
        reverseRafRef.current = null;
      }
      return;
    }

    completedRef.current = false;
    setFrameVisible(false);
    const el = videoRef.current;
    if (!el) return;

    let safetyTimer = window.setTimeout(finish, 12000);
    const clearSafety = () => window.clearTimeout(safetyTimer);
    const armSafetyFromDuration = () => {
      clearSafety();
      const baseMs =
        Number.isFinite(el.duration) && el.duration > 0 ? el.duration * 1000 + 500 : 6500;
      const ms =
        direction === 'reverse'
          ? baseMs / LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE
          : baseMs;
      safetyTimer = window.setTimeout(finish, ms);
    };

    const onPlaying = () => setFrameVisible(true);

    const playForward = async () => {
      el.playbackRate = 1;
      el.currentTime = 0;
      try {
        if (el.readyState < 2) {
          await new Promise<void>((resolve) => {
            const done = () => {
              el.removeEventListener('canplay', done);
              resolve();
            };
            el.addEventListener('canplay', done);
          });
        }
        await el.play();
      } catch {
        try {
          await new Promise((r) => setTimeout(r, 80));
          await el.play();
        } catch {
          finish();
        }
      }
    };

    const playReverse = async () => {
      const rate = LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE;
      const startReversePlayback = () => {
        const duration = el.duration;
        if (!Number.isFinite(duration) || duration <= 0) {
          void playForward();
          return;
        }
        el.currentTime = Math.max(0, duration - 0.04);
        el.playbackRate = -rate;
        void el.play().catch(() => {
          el.playbackRate = 1;
          el.pause();
          let last = performance.now();
          const tick = (now: number) => {
            if (completedRef.current) return;
            const dt = Math.min(now - last, 50);
            last = now;
            const next = Math.max(0, el.currentTime - (dt / 1000) * rate);
            el.currentTime = next;
            if (next <= 0.04) {
              finish();
              return;
            }
            reverseRafRef.current = requestAnimationFrame(tick);
          };
          reverseRafRef.current = requestAnimationFrame(tick);
        });
      };

      if (el.readyState >= 1 && Number.isFinite(el.duration)) {
        startReversePlayback();
        return;
      }
      const onMeta = () => {
        el.removeEventListener('loadedmetadata', onMeta);
        startReversePlayback();
      };
      el.addEventListener('loadedmetadata', onMeta);
      el.load();
    };

    const onEnded = () => {
      if (direction === 'forward') finish();
    };
    const onTimeUpdate = () => {
      if (direction !== 'reverse') return;
      if (el.playbackRate < 0 && el.currentTime <= 0.05) finish();
    };

    el.addEventListener('playing', onPlaying);
    el.addEventListener('ended', onEnded);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', armSafetyFromDuration);
    if (el.readyState >= 1) armSafetyFromDuration();

    void (direction === 'reverse' ? playReverse() : playForward());

    return () => {
      clearSafety();
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', armSafetyFromDuration);
      if (reverseRafRef.current !== null) {
        cancelAnimationFrame(reverseRafRef.current);
        reverseRafRef.current = null;
      }
    };
  }, [active, direction, finish, src]);

  const slideHeight = sceneCarouselSlideMinHeightCss();

  return (
    <div
      aria-hidden={!active}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: slideHeight,
        minHeight: slideHeight,
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
