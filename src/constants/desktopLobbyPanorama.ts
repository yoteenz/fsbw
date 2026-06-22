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
};

/** Top-floor rooms on the single panoramic asset (left → right). */
export const DESKTOP_LOBBY_PANORAMA_ROOMS: readonly DesktopLobbyPanoramaRoom[] = [
  { id: 'analysis-lab', label: 'Hair Analysis Lab', focalXRatio: 0.165 },
  { id: 'showroom', label: 'Hair Showroom', focalXRatio: 0.5 },
  { id: 'boutique', label: 'Extensions Boutique', focalXRatio: 0.835 },
] as const;

export const DESKTOP_LOBBY_PANORAMA_DEFAULT_ROOM_INDEX = 1;

export type DesktopLobbyPanoramaTransform = {
  translateX: number;
  scale: number;
  imageWidth: number;
  imageHeight: number;
};

/** Panoramic map math — cover-fill viewport; pan clamps so edges never expose gaps. */
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
  const scaleY = containerHeight / visibleSrcH;
  const scaleX = containerWidth / srcW;
  const scale = Math.max(scaleY, scaleX);

  const scaledW = srcW * scale;
  const focalX = room.focalXRatio * srcW * scale;
  let translateX = containerWidth / 2 - focalX;
  const minTranslateX = containerWidth - scaledW;
  translateX = Math.max(minTranslateX, Math.min(0, translateX));

  return { translateX, scale, imageWidth: srcW, imageHeight: srcH };
}
