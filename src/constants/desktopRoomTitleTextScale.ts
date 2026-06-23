/** Default + pinch bounds for room label QA (`?roomTitleEdit=1`). */
export const DESKTOP_ROOM_TITLE_TEXT_SCALE_DEFAULT = 1;
export const DESKTOP_ROOM_TITLE_TEXT_SCALE_MIN = 0.45;
export const DESKTOP_ROOM_TITLE_TEXT_SCALE_MAX = 1.5;

export function resolveDesktopRoomTitleTextScale(
  placement: { textScale?: number },
): number {
  const scale = placement.textScale ?? DESKTOP_ROOM_TITLE_TEXT_SCALE_DEFAULT;
  if (!Number.isFinite(scale)) return DESKTOP_ROOM_TITLE_TEXT_SCALE_DEFAULT;
  return clampDesktopRoomTitleTextScale(scale);
}

export function resolveDesktopRoomTitleLineTextScale(
  placement: { textScale?: number; titleTextScale?: number; subtitleTextScale?: number },
  line: 'title' | 'subtitle',
): number {
  const master = resolveDesktopRoomTitleTextScale(placement);
  const lineScale =
    line === 'title'
      ? placement.titleTextScale ?? DESKTOP_ROOM_TITLE_TEXT_SCALE_DEFAULT
      : placement.subtitleTextScale ?? DESKTOP_ROOM_TITLE_TEXT_SCALE_DEFAULT;
  if (!Number.isFinite(lineScale)) return master;
  return clampDesktopRoomTitleTextScale(master * lineScale);
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
