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
): TowerTravelFrame {
  if (floorStops.length <= 1) {
    const only = floorStops[0] ?? 1;
    return { displayLevelId: only, cabinFloorId: only, atIntermediateDwell: false };
  }

  let remaining = Math.max(0, elapsedMs);

  for (let i = 0; i < floorStops.length - 1; i += 1) {
    const fromId = floorStops[i];
    const toId = floorStops[i + 1];
    const isFinalSegment = i === floorStops.length - 2;

    if (remaining < TOWER_TRAVEL_MS_PER_FLOOR) {
      const eased = towerEaseInOut(remaining / TOWER_TRAVEL_MS_PER_FLOOR);
      const displayLevelId = interpolateTowerLevel(fromId, toId, eased);
      return {
        displayLevelId,
        cabinFloorId: Math.round(displayLevelId),
        atIntermediateDwell: false,
      };
    }

    remaining -= TOWER_TRAVEL_MS_PER_FLOOR;

    if (!isFinalSegment) {
      if (remaining < TOWER_FLOOR_DWELL_MS) {
        return {
          displayLevelId: toId,
          cabinFloorId: toId,
          atIntermediateDwell: true,
        };
      }
      remaining -= TOWER_FLOOR_DWELL_MS;
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
  return `LEVEL ${floor.id}`;
}

export function getDesktopFloorFromHref(
  href: string,
  getByPath: (path: string) => DesktopFloor | undefined,
): DesktopFloor | undefined {
  const path = href.split('?')[0];
  return getByPath(path);
}
