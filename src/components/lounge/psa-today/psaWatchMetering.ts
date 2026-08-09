/**
 * Actual active playback metering — excludes seeks, pauses, and buffering.
 * Shared by client hook and unit tests.
 */

/** Max media-time delta treated as real playback between ticks (seconds). */
export const MAX_PLAYBACK_DELTA_SEC = 2.75;

export type WatchMeterTickInput = {
  currentTimeSec: number;
  playing: boolean;
  seeking: boolean;
  buffering: boolean;
  tabVisible: boolean;
};

export type WatchMeterState = {
  lastMediaTimeSec: number | null;
  accumulatedSec: number;
  qualified: boolean;
};

export function createWatchMeterState(initialAccumulatedSec = 0): WatchMeterState {
  return {
    lastMediaTimeSec: null,
    accumulatedSec: Math.max(0, initialAccumulatedSec),
    qualified: false,
  };
}

export function tickWatchMeter(
  state: WatchMeterState,
  input: WatchMeterTickInput,
  thresholdSec: number
): WatchMeterState {
  const { currentTimeSec, playing, seeking, buffering, tabVisible } = input;

  if (!playing || seeking || buffering || !tabVisible) {
    return {
      ...state,
      lastMediaTimeSec: Number.isFinite(currentTimeSec) ? currentTimeSec : state.lastMediaTimeSec,
    };
  }

  let accumulated = state.accumulatedSec;
  const prev = state.lastMediaTimeSec;

  if (prev != null && Number.isFinite(currentTimeSec)) {
    const delta = currentTimeSec - prev;
    if (delta > 0 && delta <= MAX_PLAYBACK_DELTA_SEC) {
      accumulated += delta;
    }
  }

  const qualified = state.qualified || (thresholdSec > 0 && accumulated >= thresholdSec);

  return {
    lastMediaTimeSec: Number.isFinite(currentTimeSec) ? currentTimeSec : prev,
    accumulatedSec: accumulated,
    qualified,
  };
}

export function totalQualifyingSeconds(pendingFromEntitlement: number, sessionAccumulated: number): number {
  return Math.max(0, pendingFromEntitlement) + Math.max(0, sessionAccumulated);
}

export function shouldConsumeWatch(
  pendingFromEntitlement: number,
  sessionAccumulated: number,
  thresholdSec: number,
  alreadyQualified: boolean
): boolean {
  if (alreadyQualified || thresholdSec <= 0) return false;
  return totalQualifyingSeconds(pendingFromEntitlement, sessionAccumulated) >= thresholdSec;
}
