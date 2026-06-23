import type { TowerTravelDirection } from './desktopTowerMotion';

/** Timeline markers (seconds) on each elevator MP4 — tune after reviewing clips. */
export type ElevatorDirectionMarkers = {
  doorClosedStart: number;
  travelStart: number;
  perFloorTravelDuration: number;
  /** Seconds before {@link doorOpenStart} where the “arrival” beat begins (scrub target). */
  arrivalStartOffset: number;
  doorOpenStart: number;
  doorOpenEnd: number;
};

export type ElevatorTransitionConfig = {
  ascending: ElevatorDirectionMarkers;
  descending: ElevatorDirectionMarkers;
};

/**
 * Marker timings for ascending / descending elevator clips.
 * Values are starting points — adjust after visual QA on the real MP4s.
 */
export const elevatorTransitionConfig: ElevatorTransitionConfig = {
  ascending: {
    doorClosedStart: 0,
    travelStart: 1.2,
    perFloorTravelDuration: 1.15,
    arrivalStartOffset: 0.35,
    doorOpenStart: 5.8,
    doorOpenEnd: 7.2,
  },
  descending: {
    doorClosedStart: 0,
    travelStart: 1.2,
    perFloorTravelDuration: 1.15,
    arrivalStartOffset: 0.35,
    doorOpenStart: 5.8,
    doorOpenEnd: 7.2,
  },
};

export function getElevatorDirectionMarkers(
  direction: TowerTravelDirection,
): ElevatorDirectionMarkers {
  return direction === 'up'
    ? elevatorTransitionConfig.ascending
    : elevatorTransitionConfig.descending;
}
