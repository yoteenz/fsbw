/** Architectural floor number on directory cards — data-driven from floor id. */
export function getDirectoryFloorNumber(floorId: number): string {
  return floorId === 4 ? `P${floorId}` : `L${floorId}`;
}

export function getDirectoryFloorStatus(isHere: boolean, isHovered: boolean): string | null {
  if (isHere) return 'You are here';
  if (isHovered) return 'Select destination';
  return null;
}

export type ElevatorDirectoryCardState = 'boarding' | 'passing' | 'destination' | 'arrived';

export type ElevatorDirectoryPhase =
  | 'boarding'
  | 'traveling'
  | 'arrived'
  | 'opening'
  | 'exiting';

/** Exactly one floor card is active per phase — no overlapping destination highlight. */
export function getElevatorDirectoryCardState(
  floorId: number,
  fromFloorId: number,
  toFloorId: number,
  cabinFloorId: number,
  phase: ElevatorDirectoryPhase,
): ElevatorDirectoryCardState | null {
  if (phase === 'boarding') {
    return floorId === fromFloorId ? 'boarding' : null;
  }

  if (phase === 'traveling' && floorId === cabinFloorId) {
    if (cabinFloorId === toFloorId) return 'destination';
    if (cabinFloorId !== fromFloorId) return 'passing';
    return null;
  }

  if ((phase === 'arrived' || phase === 'exiting') && floorId === toFloorId) {
    return 'destination';
  }

  return null;
}

export function getElevatorDirectoryStatus(
  state: ElevatorDirectoryCardState | null,
  direction?: 'up' | 'down',
): string | null {
  switch (state) {
    case 'boarding':
      return 'Boarding';
    case 'passing':
      return direction === 'up' ? 'Ascending' : 'Descending';
    case 'destination':
      return 'Destination';
    case 'arrived':
      return 'Arrived';
    default:
      return null;
  }
}

/** Map floor id to vertical position on spine (0 = top / highest floor). */
export function floorIdToSpineRatio(floorId: number, floorIds: readonly number[]): number {
  if (floorIds.length <= 1) return 0;
  const sorted = [...floorIds].sort((a, b) => b - a);
  const index = sorted.indexOf(floorId);
  if (index < 0) return 0;
  return index / (sorted.length - 1);
}
