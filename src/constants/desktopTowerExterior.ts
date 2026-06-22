import type { TowerTravelDirection } from './desktopTowerMotion';
import { TOWER_EXTERIOR_PX_PER_FLOOR } from './desktopTowerElevatorLayout';

export function computeTowerTravelProgress(
  fromFloorId: number,
  toFloorId: number,
  displayLevelId: number,
): number {
  const span = toFloorId - fromFloorId;
  if (span === 0) return 1;
  const raw = (displayLevelId - fromFloorId) / span;
  return Math.max(0, Math.min(1, raw));
}

/** Exterior layer Y offset — up travel moves world downward (positive). */
export function computeTowerExteriorOffsetY(
  fromFloorId: number,
  toFloorId: number,
  displayLevelId: number,
  direction: TowerTravelDirection,
): number {
  const progress = computeTowerTravelProgress(fromFloorId, toFloorId, displayLevelId);
  const distance = Math.abs(toFloorId - fromFloorId) * TOWER_EXTERIOR_PX_PER_FLOOR;
  return direction === 'up' ? progress * distance : -progress * distance;
}

/** Ghost markers scroll with exterior; opposite sign for light bands. */
export function computeTowerLightBandOffsetY(exteriorOffsetY: number): number {
  return -exteriorOffsetY * 0.35;
}
