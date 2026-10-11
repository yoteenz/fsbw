import { useEffect, useRef } from 'react';

const VISIBILITY_RESUME_DEBOUNCE_MS = 400;
const ERROR_BACKOFF_BASE_MS = 5_000;
const ERROR_BACKOFF_MAX_MS = 120_000;

export type AdminLivePresencePollOptions = {
  /** When false, polling stops and in-flight work is aborted. */
  enabled: boolean;
  /** Base interval between successful polls while tab is visible. */
  refreshMs: number;
  /** Perform one fetch; throw or reject to trigger backoff. */
  poll: (signal: AbortSignal) => Promise<void>;
};

/**
 * Visibility-aware polling for Admin Revenue live globe.
 * - Pauses when document is hidden or `enabled` is false
 * - Coalesces overlapping requests via AbortController
 * - Exponential backoff after errors (does not stack timers)
 */
export function useAdminLivePresencePolling({ enabled, refreshMs, poll }: AdminLivePresencePollOptions): void {
  const pollRef = useRef(poll);
  pollRef.current = poll;

  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const backoffMsRef = useRef(0);
  const nextEligibleAtRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      abortRef.current?.abort();
      abortRef.current = null;
      inFlightRef.current = false;
      return;
    }

    const clearIntervalSafe = () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const runPoll = async (reason: 'initial' | 'interval' | 'visible') => {
      if (!enabled) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const now = Date.now();
      if (now < nextEligibleAtRef.current && reason === 'interval') return;
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        await pollRef.current(ac.signal);
        backoffMsRef.current = 0;
        nextEligibleAtRef.current = 0;
      } catch (e) {
        if (ac.signal.aborted) return;
        const nextBackoff = Math.min(
          ERROR_BACKOFF_MAX_MS,
          backoffMsRef.current > 0 ? backoffMsRef.current * 2 : ERROR_BACKOFF_BASE_MS
        );
        backoffMsRef.current = nextBackoff;
        nextEligibleAtRef.current = Date.now() + nextBackoff;
      } finally {
        inFlightRef.current = false;
      }
    };

    const scheduleInterval = () => {
      clearIntervalSafe();
      intervalRef.current = setInterval(() => {
        void runPoll('interval');
      }, refreshMs);
    };

    const onVisible = () => {
      if (visibilityTimerRef.current != null) clearTimeout(visibilityTimerRef.current);
      visibilityTimerRef.current = setTimeout(() => {
        void runPoll('visible');
        scheduleInterval();
      }, VISIBILITY_RESUME_DEBOUNCE_MS);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearIntervalSafe();
        if (visibilityTimerRef.current != null) {
          clearTimeout(visibilityTimerRef.current);
          visibilityTimerRef.current = null;
        }
        abortRef.current?.abort();
        return;
      }
      onVisible();
    };

    void runPoll('initial');
    scheduleInterval();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearIntervalSafe();
      if (visibilityTimerRef.current != null) clearTimeout(visibilityTimerRef.current);
      abortRef.current?.abort();
      inFlightRef.current = false;
    };
  }, [enabled, refreshMs]);
}
