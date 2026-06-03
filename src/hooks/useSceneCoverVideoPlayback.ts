import { useEffect, useRef, type RefObject } from 'react';

export type SceneCoverVideoDirection = 'forward' | 'reverse';

type Options = {
  active: boolean;
  direction: SceneCoverVideoDirection;
  reversePlaybackRate: number;
  /** Forward-timeline fraction (0–1) where reverse begins; default 1 = clip end. */
  reverseStartFraction?: number;
  onComplete: () => void;
  onPlaying?: () => void;
  /** When false, `onPlaying` runs on `playing` only (not before `play()` at frame 0). */
  revealOnFirstDecodedFrame?: boolean;
  /** When true, `onPlaying` fires synchronously (no `requestVideoFrameCallback` / double rAF). */
  instantReveal?: boolean;
  safetyTimeoutMs?: number;
};

/**
 * Forward play + reverse (negative `playbackRate` or RAF step-back) for cover-aligned scene clips.
 */
export function useSceneCoverVideoPlayback(
  videoRef: RefObject<HTMLVideoElement | null>,
  {
    active,
    direction,
    reversePlaybackRate,
    reverseStartFraction = 1,
    onComplete,
    onPlaying,
    revealOnFirstDecodedFrame = true,
    instantReveal = false,
    safetyTimeoutMs = 12000,
  }: Options,
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

    const notifyPlaying = () => {
      const fire = () => onPlayingRef.current?.();
      if (instantReveal) {
        fire();
        return;
      }
      if (typeof el.requestVideoFrameCallback === 'function') {
        el.requestVideoFrameCallback(fire);
        return;
      }
      requestAnimationFrame(() => requestAnimationFrame(fire));
    };

    const onPlayingEvent = () => {
      if (direction === 'reverse') return;
      notifyPlaying();
    };

    const waitUntilCanStart = () =>
      new Promise<void>((resolve) => {
        if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          resolve();
          return;
        }
        const done = () => {
          el.removeEventListener('loadeddata', done);
          el.removeEventListener('canplay', done);
          resolve();
        };
        el.addEventListener('loadeddata', done);
        el.addEventListener('canplay', done);
      });

    const playForward = async () => {
      el.playbackRate = 1;
      el.currentTime = 0;

      const revealIfDecoded = () => {
        if (
          revealOnFirstDecodedFrame &&
          el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
        ) {
          notifyPlaying();
        }
      };

      revealIfDecoded();

      try {
        await el.play();
      } catch {
        try {
          if (el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            await waitUntilCanStart();
            revealIfDecoded();
          }
          await el.play();
        } catch {
          finish();
        }
      }

      if (el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await waitUntilCanStart();
        revealIfDecoded();
      }
    };

    const playReverse = async () => {
      const rate = reversePlaybackRate;

      const waitForDuration = () =>
        new Promise<void>((resolve) => {
          if (el.readyState >= 1 && Number.isFinite(el.duration) && el.duration > 0) {
            resolve();
            return;
          }
          const onMeta = () => {
            el.removeEventListener('loadedmetadata', onMeta);
            resolve();
          };
          el.addEventListener('loadedmetadata', onMeta);
          if (el.readyState === HTMLMediaElement.HAVE_NOTHING) el.load();
        });

      await waitForDuration();

      const duration = el.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        finish();
        return;
      }

      el.pause();
      el.playbackRate = 1;

      const frac = Math.min(1, Math.max(0, reverseStartFraction));
      const reverseStartTime =
        frac >= 1 ? Math.max(0, duration - 0.02) : Math.max(0, duration * frac);

      const seekToStart = () =>
        new Promise<void>((resolve) => {
          const done = () => {
            el.removeEventListener('seeked', done);
            resolve();
          };
          el.addEventListener('seeked', done);
          el.currentTime = reverseStartTime;
        });

      await seekToStart();

      // Show the hand-press frame immediately (close must not lead with black UI / static).
      notifyPlaying();

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
  }, [
    active,
    direction,
    reversePlaybackRate,
    reverseStartFraction,
    revealOnFirstDecodedFrame,
    instantReveal,
    safetyTimeoutMs,
    videoRef,
  ]);
}
