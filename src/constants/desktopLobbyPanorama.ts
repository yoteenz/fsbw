/**
 * @deprecated Panorama pan/zoom removed — penthouse uses per-room backgrounds in
 * `desktopPenthouseRooms.ts`. This module re-exports room ids for legacy imports.
 */
import {
  DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID,
  DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX,
  DESKTOP_PENTHOUSE_ROOMS,
  getPenthouseRoomIdByIndex,
  getPenthouseRoomIndexById,
  type DesktopPenthouseRoom,
} from './desktopPenthouseRooms';

export type DesktopLobbyPanoramaRoom = Pick<DesktopPenthouseRoom, 'id' | 'comingSoon'> & {
  label: string;
};

/** @deprecated Use DESKTOP_PENTHOUSE_ROOMS */
export const DESKTOP_LOBBY_PANORAMA_ROOMS: readonly DesktopLobbyPanoramaRoom[] = DESKTOP_PENTHOUSE_ROOMS.map(
  (room) => ({
    id: room.id,
    label: room.name,
    comingSoon: room.comingSoon,
  }),
);

/** @deprecated Use DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID */
export const DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID = DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID;

/** @deprecated Use DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX */
export const DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX = DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX;

export { getPenthouseRoomIdByIndex, getPenthouseRoomIndexById };
