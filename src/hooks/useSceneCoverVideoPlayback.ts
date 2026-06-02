import { useEffect, useRef, type RefObject } from 'react';

export type SceneCoverVideoDirection = 'forward' | 'reverse';

type Options = {
  active: boolean;
  direction: SceneCoverVideoDirection;
  reversePlaybackRate: number;
  onComplete: () => void;
  onPlaying?: () => void;
  safetyTimeoutMs?: number;
};

/**
 * Forward play + reverse (negative `playbackRate` or RAF step-back) for cover-aligned scene clips.
 */
export function useSceneCoverVideoPlayback(
  videoRef: RefObject<HTMLVideoElement | null>,
  { active, direction, reversePlaybackRate, onComplete, onPlaying, safetyTimeoutMs = 12000 }: Options,
): void {
  const completedRef = useRef(false);
  const reverseRafRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onPlayingRef = useRef(onPlaying);

  onCompleteRef.current = onComplete;
  onPlayingRef.current = onPlaying;

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

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      if (reverseRafRef.current !== null) {
        cancelAnimationFrame(reverseRafRef.current);
        reverseRafRef.current = null;
      }
      el.pause();
      el.playbackRate = 1;
      if (direction === 'reverse') el.currentTime = 0;
      onCompleteRef.current();
    };

    let safetyTimer = window.setTimeout(finish, safetyTimeoutMs);
    const clearSafety = () => window.clearTimeout(safetyTimer);
    const armSafetyFromDuration = () => {
      clearSafety();
      const baseMs =
        Number.isFinite(el.duration) && el.duration > 0 ? el.duration * 1000 + 500 : 6500;
      const ms = direction === 'reverse' ? baseMs / reversePlaybackRate : baseMs;
      safetyTimer = window.setTimeout(finish, ms);
    };

    const onPlayingEvent = () => onPlayingRef.current?.();

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
      const rate = reversePlaybackRate;
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

    el.addEventListener('playing', onPlayingEvent);
    el.addEventListener('ended', onEnded);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', armSafetyFromDuration);
    if (el.readyState >= 1) armSafetyFromDuration();

    void (direction === 'reverse' ? playReverse() : playForward());

    return () => {
      clearSafety();
      el.removeEventListener('playing', onPlayingEvent);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', armSafetyFromDuration);
      if (reverseRafRef.current !== null) {
        cancelAnimationFrame(reverseRafRef.current);
        reverseRafRef.current = null;
      }
    };
  }, [active, direction, reversePlaybackRate, safetyTimeoutMs, videoRef]);
}
