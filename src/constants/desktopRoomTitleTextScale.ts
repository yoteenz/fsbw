/** Default + pinch bounds for room label QA (`?roomTitleEdit=1`). */
export const DESKTOP_ROOM_TITLE_TEXT_SCALE_DEFAULT = 1;
export const DESKTOP_ROOM_TITLE_TEXT_SCALE_MIN = 0.45;
export const DESKTOP_ROOM_TITLE_TEXT_SCALE_MAX = 1.5;

export function resolveDesktopRoomTitleTextScale(
  placement: { textScale?: number },
): number {
  const scale = placement.textScale ?? DESKTOP_ROOM_TITLE_TEXT_SCALE_DEFAULT;
  if (!Number.isFinite(scale)) return DESKTOP_ROOM_TITLE_TEXT_SCALE_DEFAULT;
  return Math.min(
    DESKTOP_ROOM_TITLE_TEXT_SCALE_MAX,
    Math.max(DESKTOP_ROOM_TITLE_TEXT_SCALE_MIN, scale),
  );
}

export function clampDesktopRoomTitleTextScale(scale: number): number {
  return Math.min(
    DESKTOP_ROOM_TITLE_TEXT_SCALE_MAX,
    Math.max(DESKTOP_ROOM_TITLE_TEXT_SCALE_MIN, scale),
  );
}

export function roundDesktopRoomTitleTextScale(scale: number): number {
  return Math.round(clampDesktopRoomTitleTextScale(scale) * 1000) / 1000;
}
