import type { DesktopFloor } from './desktopFloors';

export const TOWER_TRAVEL_MS = 2000;
export const TOWER_BOARD_MS = 350;
export const TOWER_ARRIVED_MS = 450;
export const TOWER_DOORS_MS = 550;
export const TOWER_FADE_MS = 400;

export type TowerTravelDirection = 'up' | 'down';

export function resolveTowerDirection(fromFloor: DesktopFloor, toFloor: DesktopFloor): TowerTravelDirection {
  return toFloor.id > fromFloor.id ? 'up' : 'down';
}

/** Smooth acceleration / deceleration for believable cabin motion. */
export function towerEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function interpolateTowerLevel(fromId: number, toId: number, progress: number): number {
  return fromId + (toId - fromId) * progress;
}

export function getDesktopFloorFromHref(
  href: string,
  getByPath: (path: string) => DesktopFloor | undefined,
): DesktopFloor | undefined {
  const path = href.split('?')[0];
  return getByPath(path);
}
