import {
  EXECUTIVE_HEADQUARTERS_BASE_PATH,
  HQ_DEFAULT_ROOM_ID,
  type HqRoomId,
} from '../constants';
import { getHeadquartersRoom, listHeadquartersRooms } from '../rooms/registry';

export function buildHeadquartersRoomPath(roomId: HqRoomId): string {
  const room = getHeadquartersRoom(roomId);
  return room?.routePath ?? EXECUTIVE_HEADQUARTERS_BASE_PATH;
}

export function resolveHeadquartersNavigationTarget(roomId: HqRoomId): {
  roomId: HqRoomId;
  path: string;
  locked: boolean;
  lockReason?: string;
} {
  const room = getHeadquartersRoom(roomId);
  if (!room || room.locked) {
    const fallback = getHeadquartersRoom(HQ_DEFAULT_ROOM_ID)!;
    return {
      roomId: HQ_DEFAULT_ROOM_ID,
      path: fallback.routePath,
      locked: true,
      lockReason: room?.lockReason ?? 'Room unavailable.',
    };
  }
  return { roomId: room.roomId, path: room.routePath, locked: false };
}

export function listHeadquartersNavigationRooms() {
  return listHeadquartersRooms().map((room) => ({
    roomId: room.roomId,
    title: room.officialName,
    purpose: room.purpose,
    path: room.routePath,
    locked: room.locked,
    lockReason: room.lockReason,
    maturityLevel: room.maturityLevel,
    roomClass: room.roomClass,
    launchStackV1: room.launchStackV1,
  }));
}

export const HEADQUARTERS_SPATIAL_NAV_PHILOSOPHY = [
  'Rooms replace tabs.',
  'Wings replace module grids.',
  'One executive question at a time.',
  'Locked rooms signal planned expansion, not missing features.',
] as const;
