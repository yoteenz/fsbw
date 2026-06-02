import { useCallback, useEffect, useRef } from 'react';
import {
  type LobbyLoungeTransitionDirection,
  LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE,
  lobbyLoungeTransitionVideoSrc,
} from '../../constants/lobbyLoungeTransitionVideo';

type Props = {
  active: boolean;
  direction: LobbyLoungeTransitionDirection;
  onComplete: () => void;
};

/**
 * Full-viewport Seedance clip over the current lobby/lounge slide (no carousel pan to a black panel).
 */
export function LobbyLoungeTransitionOverlay({ active, direction, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const reverseRafRef = useRef<number | null>(null);
  const src = lobbyLoungeTransitionVideoSrc(direction);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
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
    if (!active) {
      completedRef.current = false;
      if (reverseRafRef.current !== null) {
        cancelAnimationFrame(reverseRafRef.current);
        reverseRafRef.current = null;
      }
      return;
    }

    completedRef.current = false;
    const el = videoRef.current;
    if (!el) return;

    let safetyTimer = window.setTimeout(finish, 12000);
    const clearSafety = () => {
      window.clearTimeout(safetyTimer);
    };
    const armSafetyFromDuration = () => {
      clearSafety();
      const ms = Number.isFinite(el.duration) && el.duration > 0 ? el.duration * 1000 + 500 : 6500;
      safetyTimer = window.setTimeout(finish, ms);
    };

    const playForward = async () => {
      el.playbackRate = 1;
      el.currentTime = 0;
      try {
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
      el.playbackRate = 1;
      const startReversePlayback = () => {
        const duration = el.duration;
        if (!Number.isFinite(duration) || duration <= 0) {
          void playForward();
          return;
        }
        el.currentTime = Math.max(0, duration - 0.04);
        el.playbackRate = -1;
        void el.play().catch(() => {
          el.playbackRate = 1;
          el.pause();
          let last = performance.now();
          const tick = (now: number) => {
            if (completedRef.current) return;
            const dt = Math.min(now - last, 50);
            last = now;
            const next = Math.max(0, el.currentTime - dt / 1000);
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

    el.addEventListener('ended', onEnded);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', armSafetyFromDuration);
    if (el.readyState >= 1) armSafetyFromDuration();

    void (direction === 'reverse' ? playReverse() : playForward());

    return () => {
      clearSafety();
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', armSafetyFromDuration);
      if (reverseRafRef.current !== null) {
        cancelAnimationFrame(reverseRafRef.current);
        reverseRafRef.current = null;
      }
    };
  }, [active, direction, finish, src]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#000',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <video
        key={`${direction}-${src}`}
        ref={videoRef}
        playsInline
        muted
        preload="auto"
        onError={finish}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
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
