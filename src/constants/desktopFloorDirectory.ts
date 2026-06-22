/** Architectural floor number on directory cards — data-driven from floor id. */
export function getDirectoryFloorNumber(floorId: number): string {
  return floorId === 4 ? `P${floorId}` : `L${floorId}`;
}

export function getDirectoryFloorStatus(isHere: boolean, isHovered: boolean): string | null {
  if (isHere) return 'You are here';
  if (isHovered) return 'Select destination';
  return null;
}

/** Map floor id to vertical position on spine (0 = top / highest floor). */
export function floorIdToSpineRatio(floorId: number, floorIds: readonly number[]): number {
  if (floorIds.length <= 1) return 0;
  const sorted = [...floorIds].sort((a, b) => b - a);
  const index = sorted.indexOf(floorId);
  if (index < 0) return 0;
  return index / (sorted.length - 1);
}
