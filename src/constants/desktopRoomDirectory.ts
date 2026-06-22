export function getDirectoryZoneStatus(
  isHere: boolean,
  isPending: boolean,
  isHovered: boolean,
): string | null {
  if (isHere) return 'You are here';
  if (isPending) return 'Destination';
  if (isHovered) return 'Select destination';
  return null;
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
