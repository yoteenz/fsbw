import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
} from './desktopRoomHeroArt';

/** Full-bleed desktop Notifications room hero — 21:9 cover, no letterboxing. */
export const DESKTOP_NOTIFICATIONS_BACKGROUND_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/NO%20TEXT%20BG/CD7F20DB-064B-4D0E-A7CE-BEDCD8F72AF5.png';

export const DESKTOP_NOTIFICATIONS_IMAGE = {
  width: DESKTOP_ROOM_HERO_ART_WIDTH,
  height: DESKTOP_ROOM_HERO_ART_HEIGHT,
} as const;

export const DESKTOP_ALERTS_PATH = '/desktop/alerts';

/** @deprecated Use DESKTOP_ALERTS_PATH */
export const DESKTOP_NOTIFICATIONS_PATH = DESKTOP_ALERTS_PATH;
