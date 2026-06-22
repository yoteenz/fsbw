/** Wide desktop flagship panorama (`IMG_3880.png`) — source pixels. */
export const DESKTOP_PANORAMA_SOURCE_WIDTH = 3808;
export const DESKTOP_PANORAMA_SOURCE_HEIGHT = 1632;

/**
 * Vertical crop: top-floor viewport ends at the front marble slab (hide cityscape below).
 * Normalized source height (0–1); tune after QA on device.
 */
export const DESKTOP_PANORAMA_FLOOR_EDGE_Y_RATIO = 0.505;

export type DesktopLobbyPanoramaRoom = {
  id: string;
  label: string;
  /** Horizontal focal point on the full source image (0 = left, 1 = right). */
  focalXRatio: number;
};

/** Top-floor rooms on the single panoramic asset (left → right). */
export const DESKTOP_LOBBY_PANORAMA_ROOMS: readonly DesktopLobbyPanoramaRoom[] = [
  { id: 'analysis-lab', label: 'HAIR ANALYSIS LAB', focalXRatio: 0.165 },
  { id: 'showroom', label: 'HAIR SHOWROOM', focalXRatio: 0.5 },
  { id: 'boutique', label: 'EXTENSIONS BOUTIQUE', focalXRatio: 0.835 },
] as const;

export const DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX = 1;

export type DesktopLobbyPanoramaTransform = {
  translateX: number;
  scale: number;
  imageWidth: number;
  imageHeight: number;
};

/** Panoramic map math — one asset, translateX + optional scale; bottom clipped by viewport. */
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
  const focalX = room.focalXRatio * srcW * scale;
  const translateX = containerWidth / 2 - focalX;

  return { translateX, scale, imageWidth: srcW, imageHeight: srcH };
}
