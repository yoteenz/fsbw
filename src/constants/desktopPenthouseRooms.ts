import { DESKTOP_LOBBY_BG_URL } from './desktopLobbyEnv';

/** Master 3-room panorama — reference / fallback only (not panned in production). */
export const DESKTOP_PENTHOUSE_MASTER_PANORAMA_URL = DESKTOP_LOBBY_BG_URL;

export type DesktopPenthouseRoom = {
  id: string;
  /** Display name (directory cards, badges). */
  name: string;
  /** Dedicated 21:9 hero environment for this room. */
  background: string;
  comingSoon?: boolean;
};

/** Penthouse destinations — each room is its own full-screen desktop environment. */
export const DESKTOP_PENTHOUSE_ROOMS: readonly DesktopPenthouseRoom[] = [
  {
    id: 'analysis-lab',
    name: 'Hair Analysis Lab',
    background:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/A6B0A7CB-0299-4DAF-A39E-49468BE1A6F9.png',
  },
  {
    id: 'showroom',
    name: 'Hair Showroom',
    background:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/7F16AAFA-F3D1-4FD2-B6E3-F20F6B10CBD3.png',
  },
  {
    id: 'boutique',
    name: 'Extensions Boutique',
    background:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/8358D320-29F7-48DC-97B7-484432003684.png',
  },
] as const;

export const DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID = 'showroom';

export const DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX = DESKTOP_PENTHOUSE_ROOMS.findIndex(
  (r) => r.id === DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID,
);

export function getPenthouseRoomById(roomId: string | null | undefined): DesktopPenthouseRoom | undefined {
  if (!roomId) return undefined;
  return DESKTOP_PENTHOUSE_ROOMS.find((r) => r.id === roomId);
}

export function getPenthouseRoomIndexById(roomId: string | null | undefined): number {
  if (!roomId) return DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX;
  const i = DESKTOP_PENTHOUSE_ROOMS.findIndex((r) => r.id === roomId);
  return i >= 0 ? i : DESKTOP_PENTHOUSE_DEFAULT_ROOM_INDEX;
}

export function getPenthouseRoomIdByIndex(index: number): string {
  return DESKTOP_PENTHOUSE_ROOMS[index]?.id ?? DESKTOP_PENTHOUSE_DEFAULT_ROOM_ID;
}

/** Dedicated room asset, or master panorama when missing / fallback requested. */
export function resolvePenthouseRoomBackground(
  roomId: string,
  options?: { fallback?: boolean },
): string {
  if (options?.fallback) return DESKTOP_PENTHOUSE_MASTER_PANORAMA_URL;
  const room = getPenthouseRoomById(roomId);
  return room?.background ?? DESKTOP_PENTHOUSE_MASTER_PANORAMA_URL;
}
