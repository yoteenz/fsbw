import { DESKTOP_NO_TEXT_ROOM_BACKGROUNDS } from './desktopNoTextBackgrounds';

export const DESKTOP_LOUNGE_ZONE_ID = 'lounge' as const;

/** Default bright TV Lounge hero. */
export const DESKTOP_LOUNGE_BRIGHT_BACKGROUND =
  DESKTOP_NO_TEXT_ROOM_BACKGROUNDS[DESKTOP_LOUNGE_ZONE_ID];

/** Dimmed Slay Cinema hero — actual asset, not CSS filters. */
export const DESKTOP_LOUNGE_SLAY_CINEMA_BACKGROUND =
  DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['lounge-slay-cinema'];

/** Crossfade between bright and dimmed lounge backgrounds (ms). */
export const DESKTOP_LOUNGE_SLAY_CINEMA_CROSSFADE_MS = 550;

export type DesktopLoungeSlayCinemaMode = {
  enabled: boolean;
  brightSrc: string;
  dimmedSrc: string;
  crossfadeMs?: number;
};
