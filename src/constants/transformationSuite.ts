import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
} from './desktopRoomHeroArt';

/** Full-bleed Transformation Suite desktop hero — do not crop or letterbox. */
export const TRANSFORMATION_SUITE_BACKGROUND_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/NO%20TEXT%20BG/C8F3EB03-4249-4EFE-9ADB-EE435CA97138.png';

/** Source asset is 1914×822; use shared hero art constants for cover math. */
export const TRANSFORMATION_SUITE_IMAGE = {
  width: DESKTOP_ROOM_HERO_ART_WIDTH,
  height: DESKTOP_ROOM_HERO_ART_HEIGHT,
} as const;

export const DESKTOP_BOOKING_SUITE_PATH = '/desktop/booking-suite';
