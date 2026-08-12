import type { ForecastOverlayZone } from './editionTypes';
import type { ForecastEdition, ForecastBroadcastPhase } from './editionTypes';
import type { ForecastSignalStatus } from './types';
import {
  formatPrimaryForecastOverlay,
  getEditionObservations,
} from './weeklyForecastHelpers';

/** Seconds before closing when graphics begin clearing. */
const CLEAR_LEAD_SEC = 0.85;

/** Minimum gap between beat reveals. */
const MIN_BEAT_GAP_SEC = 0.55;

/** Max supporting beats shown during broadcast hold. */
const MAX_SUPPORTING_BEATS = 4;

export type ForecastBeatKind = 'primary' | 'supporting';

export type ForecastBeat = {
  id: string;
  kind: ForecastBeatKind;
  label: string;
  action?: string;
  momentum?: ForecastSignalStatus;
  zoneKey: ForecastOverlayZone;
  revealAt: number;
  hideAt: number;
};

export type AuthoritativeBroadcastTimeline = {
  openingStart: number;
  openingEnd: number;
  holdEnd: number;
  clearStart: number;
  closingStart: number;
  closingEnd: number;
  beats: ForecastBeat[];
};

export type PackageTimelineInput = {
  openingEnd: number;
  closingStart: number;
  signals?: Array<{ signalId: string; revealAt: number }>;
};

export type SlayForecastExperienceMode = 'poster' | 'playing' | 'ended';

export type BroadcastPlayerVisualState =
  | 'poster'
  | 'playing_opening'
  | 'playing_hold'
  | 'playing_closing'
  | 'ended';

function zoneForBeatIndex(index: number): ForecastOverlayZone {
  const zones: ForecastOverlayZone[] = [
    'broadcast-left',
    'broadcast-right',
    'broadcast-left',
    'broadcast-right',
    'broadcast-bottom',
  ];
  return zones[index % zones.length];
}

function scheduleBeats(
  edition: ForecastEdition,
  holdStart: number,
  clearStart: number,
  packageTimeline?: PackageTimelineInput,
): ForecastBeat[] {
  const primary = formatPrimaryForecastOverlay(edition);
  const observations = getEditionObservations(edition).slice(0, MAX_SUPPORTING_BEATS);
  const beats: ForecastBeat[] = [];

  const primaryReveal =
    packageTimeline?.signals?.[0]?.revealAt != null
      ? Math.max(holdStart, packageTimeline.signals[0].revealAt)
      : holdStart;

  beats.push({
    id: `${edition.id}-primary`,
    kind: 'primary',
    label: primary.label,
    action: primary.action,
    momentum: edition.momentum,
    zoneKey: 'broadcast-bottom',
    revealAt: primaryReveal,
    hideAt: clearStart,
  });

  const holdWindow = Math.max(0.5, clearStart - holdStart);
  const supportingCount = observations.length;
  const interval =
    supportingCount > 0
      ? Math.max(MIN_BEAT_GAP_SEC, holdWindow / (supportingCount + 1))
      : MIN_BEAT_GAP_SEC;

  observations.forEach((observation, index) => {
    const packageSignal = packageTimeline?.signals?.find((s) => s.signalId === observation.id);
    const staggered = holdStart + interval * (index + 1);
    const revealAt = packageSignal?.revealAt != null ? Math.max(holdStart, packageSignal.revealAt) : staggered;

    beats.push({
      id: observation.id,
      kind: 'supporting',
      label: observation.label,
      momentum: observation.momentum,
      zoneKey: observation.overlayZone ?? zoneForBeatIndex(index),
      revealAt: Math.min(revealAt, clearStart - 0.15),
      hideAt: clearStart + index * 0.06,
    });
  });

  return beats;
}

/** Build one authoritative broadcast timeline from edition cues (+ optional published package). */
export function buildBroadcastTimeline(
  edition: ForecastEdition,
  packageTimeline?: PackageTimelineInput,
): AuthoritativeBroadcastTimeline {
  const openingStart = 0;
  const openingEnd = packageTimeline?.openingEnd ?? edition.forecastRevealCue;
  const closingStart = packageTimeline?.closingStart ?? edition.closingCue;
  const closingEnd = edition.completeCue;
  const clearStart = Math.max(openingEnd + 0.4, closingStart - CLEAR_LEAD_SEC);
  const holdEnd = clearStart;

  return {
    openingStart,
    openingEnd,
    holdEnd,
    clearStart,
    closingStart,
    closingEnd,
    beats: scheduleBeats(edition, openingEnd, clearStart, packageTimeline),
  };
}

export function resolveBroadcastPhase(
  currentTime: number,
  timeline: AuthoritativeBroadcastTimeline,
): ForecastBroadcastPhase {
  if (currentTime <= 0) return 'idle';
  if (currentTime >= timeline.closingEnd) return 'end';
  if (currentTime >= timeline.closingStart) return 'closing';
  if (currentTime >= timeline.clearStart) return 'clearing';
  if (currentTime >= timeline.openingEnd) return 'hold';
  return 'opening';
}

export function resolvePlayerVisualState(
  hasStarted: boolean,
  phase: ForecastBroadcastPhase,
): BroadcastPlayerVisualState {
  if (!hasStarted || phase === 'idle') return 'poster';
  if (phase === 'end') return 'ended';
  if (phase === 'opening') return 'playing_opening';
  if (phase === 'hold' || phase === 'clearing') return 'playing_hold';
  if (phase === 'closing') return 'playing_closing';
  return 'playing_opening';
}

export function resolveExperienceMode(
  hasStarted: boolean,
  phase: ForecastBroadcastPhase,
): SlayForecastExperienceMode {
  const visual = resolvePlayerVisualState(hasStarted, phase);
  if (visual === 'poster') return 'poster';
  if (visual === 'ended') return 'ended';
  return 'playing';
}

export function getVisibleBeats(
  currentTime: number,
  phase: ForecastBroadcastPhase,
  timeline: AuthoritativeBroadcastTimeline,
): ForecastBeat[] {
  if (phase !== 'hold' && phase !== 'clearing') return [];

  return timeline.beats.filter((beat) => {
    if (currentTime < beat.revealAt) return false;
    if (phase === 'clearing') {
      return currentTime < beat.hideAt + 0.35;
    }
    return currentTime < beat.hideAt;
  });
}

export function beatExitProgress(
  currentTime: number,
  beat: ForecastBeat,
  phase: ForecastBroadcastPhase,
): number {
  if (phase !== 'clearing') return 0;
  const window = 0.35;
  const elapsed = currentTime - beat.hideAt;
  if (elapsed <= 0) return 0;
  return Math.min(1, elapsed / window);
}
