/** Architectural room code on destination cards — 1-based, left to right. */
export function getDirectoryRoomCode(roomIndex: number): string {
  return `R${roomIndex + 1}`;
}

export function getDirectoryRoomStatus(
  isActive: boolean,
  isDestination: boolean,
  isHovered: boolean,
  comingSoon?: boolean,
): string | null {
  if (isActive) return 'Active destination';
  if (isDestination) return 'Destination';
  if (isHovered) return comingSoon ? 'Explore' : 'Select destination';
  if (comingSoon) return 'Explore';
  return 'Available';
}

/** Map room index to horizontal position on connector (0 = left, 1 = right). */
export function roomIndexToConnectorRatio(roomIndex: number, roomCount: number): number {
  if (roomCount <= 1) return 0.5;
  return roomIndex / (roomCount - 1);
}

export function resolveRoomTravelDirection(fromIndex: number, toIndex: number): 'left' | 'right' | null {
  if (fromIndex === toIndex) return null;
  return toIndex > fromIndex ? 'right' : 'left';
}
