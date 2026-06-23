import {
  elevatorTransitionConfig,
  getElevatorDirectionMarkers,
  type ElevatorDirectionMarkers,
} from '../constants/elevatorTransitionConfig';
import type { TowerTravelDirection } from '../constants/desktopTowerMotion';

export type ElevatorPlaybackPlan = {
  currentFloor: number;
  destinationFloor: number;
  direction: TowerTravelDirection;
  floorsTraveled: number;
  markers: ElevatorDirectionMarkers;
  /** Resolved by caller via {@link resolveDesktopTowerElevatorVideoSrc}. */
  videoSrc: string;
  /** Video timestamp where travel motion begins. */
  startTime: number;
  /** Video timestamp where per-floor travel ends (before door-open scrub). */
  travelEndTime: number;
  arrivalStart: number;
  doorOpenStart: number;
  doorOpenEnd: number;
  /** Wall-clock ms for the travel segment only. */
  travelDurationMs: number;
  /** Wall-clock ms for door-open segment. */
  doorOpenDurationMs: number;
  /** Ms from travel phase start until doors begin opening. */
  doorOpenStartMs: number;
  /** Total wall-clock ms for travel + door-open segments. */
  totalTransitionDurationMs: number;
};

export function getElevatorPlaybackPlan(
  currentFloor: number,
  destinationFloor: number,
): ElevatorPlaybackPlan {
  const floorsTraveled = Math.abs(destinationFloor - currentFloor);
  const direction: TowerTravelDirection =
    destinationFloor > currentFloor ? 'up' : 'down';
  const markers = getElevatorDirectionMarkers(direction);

  const startTime = markers.travelStart;
  const travelEndTime =
    markers.travelStart + Math.max(1, floorsTraveled) * markers.perFloorTravelDuration;
  const doorOpenStart = markers.doorOpenStart;
  const doorOpenEnd = markers.doorOpenEnd;
  const arrivalStart = Math.max(
    markers.travelStart,
    doorOpenStart - markers.arrivalStartOffset,
  );

  const travelDurationSec = Math.max(0, travelEndTime - startTime);
  const doorOpenDurationSec = Math.max(0, doorOpenEnd - doorOpenStart);
  const travelDurationMs = Math.round(travelDurationSec * 1000);
  const doorOpenDurationMs = Math.round(doorOpenDurationSec * 1000);

  return {
    currentFloor,
    destinationFloor,
    direction,
    floorsTraveled: Math.max(1, floorsTraveled),
    markers,
    videoSrc: '',
    startTime,
    travelEndTime,
    arrivalStart,
    doorOpenStart,
    doorOpenEnd,
    travelDurationMs,
    doorOpenDurationMs,
    doorOpenStartMs: travelDurationMs,
    totalTransitionDurationMs: travelDurationMs + doorOpenDurationMs,
  };
}

export function logElevatorPlaybackPlanDebug(plan: ElevatorPlaybackPlan): void {
  if (!import.meta.env.DEV) return;

  console.info('[elevator playback plan]', {
    currentFloor: plan.currentFloor,
    destinationFloor: plan.destinationFloor,
    direction: plan.direction,
    floorsTraveled: plan.floorsTraveled,
    selectedVideo: plan.videoSrc,
    travelDurationMs: plan.travelDurationMs,
    doorOpenStart: plan.doorOpenStart,
    doorOpenEnd: plan.doorOpenEnd,
    doorOpenStartMs: plan.doorOpenStartMs,
    totalTransitionDurationMs: plan.totalTransitionDurationMs,
    markers: plan.markers,
    config: elevatorTransitionConfig,
  });
}
