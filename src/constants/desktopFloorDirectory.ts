/** Architectural floor number on directory cards — data-driven from floor id. */
export function getDirectoryFloorNumber(floorId: number): string {
  return floorId === 4 ? `P${floorId}` : `L${floorId}`;
}

export function getDirectoryFloorStatus(isHere: boolean, isHovered: boolean): string | null {
  if (isHere) return 'You are here';
  if (isHovered) return 'Select destination';
  return null;
}

export type ElevatorDirectoryCardState = 'boarding' | 'passing' | 'arriving' | 'arrived' | 'destination';

export function getElevatorDirectoryCardState(
  floorId: number,
  fromFloorId: number,
  toFloorId: number,
  cabinFloorId: number,
  phase: 'boarding' | 'traveling' | 'arrived' | 'opening' | 'exiting',
): ElevatorDirectoryCardState | null {
  if (phase === 'boarding' && floorId === fromFloorId) return 'boarding';
  if (phase === 'arrived' && floorId === toFloorId) return 'arrived';
  if (floorId === cabinFloorId && cabinFloorId !== toFloorId) return 'passing';
  if (floorId === toFloorId && cabinFloorId === toFloorId && phase === 'traveling') return 'arriving';
  if (floorId === toFloorId && cabinFloorId !== toFloorId) return 'destination';
  return null;
}

export function getElevatorDirectoryStatus(state: ElevatorDirectoryCardState | null): string | null {
  switch (state) {
    case 'boarding':
      return 'Boarding';
    case 'passing':
      return 'Passing';
    case 'arriving':
      return 'Arriving';
    case 'arrived':
      return 'Arrived';
    case 'destination':
      return 'Destination';
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
