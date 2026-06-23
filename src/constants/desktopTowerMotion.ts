import type { DesktopFloor } from './desktopFloors';

/** Time between floors while the cabin is in motion. */
export const TOWER_TRAVEL_MS_PER_FLOOR = 1500;
/** Pause on intermediate floors so directory + holo can call out each level. */
export const TOWER_FLOOR_DWELL_MS = 550;
export const TOWER_BOARD_MS = 500;
export const TOWER_ARRIVED_MS = 500;
export const TOWER_FADE_MS = 400;
export const TOWER_VIDEO_READY_TIMEOUT_MS = 3500;

/** @deprecated Use {@link computeTowerTravelDurationMs} — kept for migration references. */
export const TOWER_TRAVEL_MS = TOWER_TRAVEL_MS_PER_FLOOR;

/** @deprecated Doors are not used with shell image — kept for migration. */
export const TOWER_DOORS_MS = 0;

export type TowerTravelDirection = 'up' | 'down';

export type TowerTravelFrame = {
  displayLevelId: number;
  cabinFloorId: number;
  atIntermediateDwell: boolean;
};

export function resolveTowerDirection(fromFloor: DesktopFloor, toFloor: DesktopFloor): TowerTravelDirection {
  return toFloor.id > fromFloor.id ? 'up' : 'down';
}

/** Ordered floor ids visited from origin through destination (inclusive). */
export function getTowerFloorStops(fromId: number, toId: number): number[] {
  if (fromId === toId) return [fromId];
  const step = fromId < toId ? 1 : -1;
  const stops: number[] = [];
  for (let id = fromId; ; id += step) {
    stops.push(id);
    if (id === toId) break;
  }
  return stops;
}

export function computeTowerTravelDurationMs(floorStops: readonly number[]): number {
  const segments = Math.max(0, floorStops.length - 1);
  const intermediateDwells = Math.max(0, floorStops.length - 2);
  return segments * TOWER_TRAVEL_MS_PER_FLOOR + intermediateDwells * TOWER_FLOOR_DWELL_MS;
}

/** Used when the warmed MP4 metadata is not available yet. */
export const TOWER_ELEVATOR_VIDEO_FALLBACK_MS = 8000;

export type TowerTravelTiming = {
  travelMsPerFloor: number;
  floorDwellMs: number;
  totalDurationMs: number;
};

/**
 * Scale per-floor travel + intermediate dwells so the cabin timeline ends exactly
 * when the elevator clip finishes (keeps the same travel/dwell ratio as defaults).
 */
export function resolveTowerTravelTiming(
  floorStops: readonly number[],
  targetDurationMs: number = TOWER_ELEVATOR_VIDEO_FALLBACK_MS,
): TowerTravelTiming {
  const segments = Math.max(0, floorStops.length - 1);
  const intermediateDwells = Math.max(0, floorStops.length - 2);
  const defaultTotal = computeTowerTravelDurationMs(floorStops);
  const safeTarget = Math.max(0, targetDurationMs);

  if (segments === 0 || defaultTotal <= 0 || safeTarget <= 0) {
    return {
      travelMsPerFloor: safeTarget,
      floorDwellMs: 0,
      totalDurationMs: safeTarget,
    };
  }

  const scale = safeTarget / defaultTotal;
  const travelMsPerFloor = TOWER_TRAVEL_MS_PER_FLOOR * scale;
  const floorDwellMs = TOWER_FLOOR_DWELL_MS * scale;
  const totalDurationMs =
    segments * travelMsPerFloor + intermediateDwells * floorDwellMs;

  return { travelMsPerFloor, floorDwellMs, totalDurationMs };
}

/** Smooth acceleration / deceleration for believable cabin motion. */
export function towerEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function interpolateTowerLevel(fromId: number, toId: number, progress: number): number {
  return fromId + (toId - fromId) * progress;
}

/** Step through each floor with a dwell on intermediate levels (elevator-style). */
export function resolveTowerTravelFrame(
  floorStops: readonly number[],
  elapsedMs: number,
  timing?: Pick<TowerTravelTiming, 'travelMsPerFloor' | 'floorDwellMs'>,
): TowerTravelFrame {
  const travelMsPerFloor = timing?.travelMsPerFloor ?? TOWER_TRAVEL_MS_PER_FLOOR;
  const floorDwellMs = timing?.floorDwellMs ?? TOWER_FLOOR_DWELL_MS;

  if (floorStops.length <= 1) {
    const only = floorStops[0] ?? 1;
    return { displayLevelId: only, cabinFloorId: only, atIntermediateDwell: false };
  }

  let remaining = Math.max(0, elapsedMs);

  for (let i = 0; i < floorStops.length - 1; i += 1) {
    const fromId = floorStops[i];
    const toId = floorStops[i + 1];
    const isFinalSegment = i === floorStops.length - 2;

    if (remaining < travelMsPerFloor) {
      const eased = towerEaseInOut(remaining / travelMsPerFloor);
      const displayLevelId = interpolateTowerLevel(fromId, toId, eased);
      return {
        displayLevelId,
        cabinFloorId: Math.round(displayLevelId),
        atIntermediateDwell: false,
      };
    }

    remaining -= travelMsPerFloor;

    if (!isFinalSegment) {
      if (remaining < floorDwellMs) {
        return {
          displayLevelId: toId,
          cabinFloorId: toId,
          atIntermediateDwell: true,
        };
      }
      remaining -= floorDwellMs;
    }
  }

  const destinationId = floorStops[floorStops.length - 1];
  return {
    displayLevelId: destinationId,
    cabinFloorId: destinationId,
    atIntermediateDwell: false,
  };
}

export function formatTowerLevelLabel(floor: DesktopFloor): string {
  const labels: Record<number, string> = {
    1: 'GROUND FLOOR',
    2: 'SECOND FLOOR',
    3: 'THIRD FLOOR',
    4: 'PENTHOUSE',
  };
  return labels[floor.id] ?? floor.name;
}

/** Elevator holo subtitle — penthouse level already reads PENTHOUSE, so use VIP SUITE here only. */
export function formatTowerElevatorHoloName(floor: DesktopFloor): string {
  if (floor.id === 4) return 'VIP SUITE';
  return floor.name;
}

export function getDesktopFloorFromHref(
  href: string,
  getByPath: (path: string) => DesktopFloor | undefined,
): DesktopFloor | undefined {
  const path = href.split('?')[0];
  return getByPath(path);
}
