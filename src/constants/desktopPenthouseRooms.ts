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
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/17119677-8B89-4BEB-91A7-F4A65B74270A.png',
    comingSoon: true,
  },
  {
    id: 'showroom',
    name: 'Hair Showroom',
    background:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/BA4C3C3F-2BA5-4DBD-B932-0B787787D94D.png',
  },
  {
    id: 'boutique',
    name: 'Extensions Boutique',
    background:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/2E6CF455-E09B-4A5C-B8BE-009242C6FCCA.png',
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
