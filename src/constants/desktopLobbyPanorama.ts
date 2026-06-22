/** Wide desktop flagship panorama (`IMG_3880.png`) — source pixels. */
export const DESKTOP_PANORAMA_SOURCE_WIDTH = 3808;
export const DESKTOP_PANORAMA_SOURCE_HEIGHT = 1632;

/**
 * Vertical crop: viewport ends at the bottom of the front marble slab (hide lower floor below).
 * ~1094px on the 1632px-tall source — tune after QA on device.
 */
export const DESKTOP_PANORAMA_FLOOR_EDGE_Y_RATIO = 0.672;

export type DesktopLobbyPanoramaRoom = {
  id: string;
  label: string;
  /** Horizontal focal point on the full source image (0 = left, 1 = right). */
  focalXRatio: number;
  comingSoon?: boolean;
};

/** Top-floor rooms on the single panoramic asset (left → right). */
export const DESKTOP_LOBBY_PANORAMA_ROOMS: readonly DesktopLobbyPanoramaRoom[] = [
  { id: 'analysis-lab', label: 'Hair Analysis Lab', focalXRatio: 0.165, comingSoon: true },
  { id: 'showroom', label: 'Hair Showroom', focalXRatio: 0.5 },
  { id: 'boutique', label: 'Extensions Boutique', focalXRatio: 0.835 },
] as const;

export const DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID = 'showroom';

export const DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX = DESKTOP_LOBBY_PANORAMA_ROOMS.findIndex(
  (r) => r.id === DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID,
);

export function getPenthouseRoomIndexById(roomId: string | null | undefined): number {
  if (!roomId) return DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX;
  const i = DESKTOP_LOBBY_PANORAMA_ROOMS.findIndex((r) => r.id === roomId);
  return i >= 0 ? i : DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX;
}

export function getPenthouseRoomIdByIndex(index: number): string {
  return DESKTOP_LOBBY_PANORAMA_ROOMS[index]?.id ?? DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_ID;
}

/**
 * Horizontal slice of the source image shown per room (smaller = more zoom).
 * ~0.30 keeps a single zone centered without bleeding adjacent rooms.
 */
export const DESKTOP_PANORAMA_ROOM_VIEW_WIDTH_RATIO = 0.3;

export type DesktopLobbyPanoramaTransform = {
  translateX: number;
  translateY: number;
  scale: number;
  imageWidth: number;
  imageHeight: number;
};

/**
 * Cover-fill the viewport from panorama top through the marble slab (floor edge).
 * Uniform scale preserves proportions; horizontal pan centers the active room.
 * Vertical scale wins over room-width zoom so ceiling-to-slab stays visible.
 */
export function computeDesktopLobbyPanoramaTransform(
  containerWidth: number,
  containerHeight: number,
  roomIndex: number,
): DesktopLobbyPanoramaTransform {
  const room = DESKTOP_LOBBY_PANORAMA_ROOMS[roomIndex] ?? DESKTOP_LOBBY_PANORAMA_ROOMS[DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX];
  const srcW = DESKTOP_PANORAMA_SOURCE_WIDTH;
  const srcH = DESKTOP_PANORAMA_SOURCE_HEIGHT;
  const floorEdge = DESKTOP_PANORAMA_FLOOR_EDGE_Y_RATIO;

  const visibleSrcH = srcH * floorEdge;
  const scale = containerHeight / visibleSrcH;

  const scaledW = srcW * scale;
  const focalX = room.focalXRatio * srcW * scale;
  let translateX = containerWidth / 2 - focalX;
  const minTranslateX = containerWidth - scaledW;
  translateX = Math.max(minTranslateX, Math.min(0, translateX));

  return { translateX, translateY: 0, scale, imageWidth: srcW, imageHeight: srcH };
}
