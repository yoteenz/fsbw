import { DESKTOP_NO_TEXT_ROOM_BACKGROUNDS } from './desktopNoTextBackgrounds';

const DESKTOP_ZONE_BG_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop';

/** Per-zone hero backgrounds for lobby, gallery, and concierge floors. */
export const DESKTOP_FLOOR_ZONE_BACKGROUNDS: Readonly<Record<string, string>> = {
  'build-a-wig-atelier': DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['build-a-wig-atelier'],
  'grand-lobby': `${DESKTOP_ZONE_BG_BASE}/IMG_4013.png`,
  lounge: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS.lounge,
  'slay-cam-gallery': DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['slay-cam-gallery'],
  'members-lounge': DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['members-lounge'],
  'rewards-gallery': DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['rewards-gallery'],
  reception: DESKTOP_NO_TEXT_ROOM_BACKGROUNDS.reception,
  'founder-suite': DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['founder-suite'],
  'psa-suite': DESKTOP_NO_TEXT_ROOM_BACKGROUNDS['psa-suite'],
};

export function resolveFloorZoneBackground(zoneId: string): string | undefined {
  return DESKTOP_FLOOR_ZONE_BACKGROUNDS[zoneId];
}
