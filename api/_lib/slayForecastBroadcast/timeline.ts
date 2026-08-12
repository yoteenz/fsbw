import {
  FULL_BROADCAST_DURATION_SEC,
  SEAM_CROSSFADE_MS,
  TIMELINE_INITIAL_HOLD_MS,
  TIMELINE_PRE_CLOSING_HOLD_MS,
  TIMELINE_SIGNAL_INTERVAL_MS,
} from './constants.js';
import { slayForecastGenerationConfig } from './generationConfig.js';
import type { BroadcastTimeline, BroadcastTimelineSignal } from './types.js';

export function suggestBroadcastTimeline(
  signalIds: string[],
  openingDurationSec = slayForecastGenerationConfig.phaseTiming.openingEndSec,
  _closingDurationSec = FULL_BROADCAST_DURATION_SEC - slayForecastGenerationConfig.phaseTiming.closingStartSec,
): BroadcastTimeline {
  const openingEnd = openingDurationSec;
  const intervalMs =
    signalIds.length <= 3
      ? TIMELINE_SIGNAL_INTERVAL_MS + 200
      : signalIds.length >= 5
        ? Math.max(550, TIMELINE_SIGNAL_INTERVAL_MS - 200)
        : TIMELINE_SIGNAL_INTERVAL_MS;

  const signals: BroadcastTimelineSignal[] = signalIds.map((signalId, index) => ({
    signalId,
    revealAt: openingEnd + (TIMELINE_INITIAL_HOLD_MS + index * intervalMs) / 1000,
  }));

  const restingMs =
    TIMELINE_INITIAL_HOLD_MS +
    Math.max(0, signalIds.length - 1) * intervalMs +
    TIMELINE_PRE_CLOSING_HOLD_MS;

  const closingStart = slayForecastGenerationConfig.phaseTiming.closingStartSec;

  return {
    openingEnd,
    signals,
    closingStart,
    restingLoopDurationSec: restingMs / 1000,
    seamCrossfadeMs: SEAM_CROSSFADE_MS,
  };
}

export function restingHoldDurationSec(signalCount: number): number {
  const intervalMs =
    signalCount <= 3
      ? TIMELINE_SIGNAL_INTERVAL_MS + 200
      : signalCount >= 5
        ? Math.max(550, TIMELINE_SIGNAL_INTERVAL_MS - 200)
        : TIMELINE_SIGNAL_INTERVAL_MS;
  return (
    (TIMELINE_INITIAL_HOLD_MS +
      Math.max(0, signalCount - 1) * intervalMs +
      TIMELINE_PRE_CLOSING_HOLD_MS) /
    1000
  );
}

export function computeRestingLoopCount(signalCount: number, restingClipDurationSec = 3): number {
  const needed = restingHoldDurationSec(signalCount);
  if (restingClipDurationSec <= 0) return 1;
  return Math.max(1, Math.ceil(needed / restingClipDurationSec));
}
