const DESKTOP_ZONE_BG_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop';

/** Per-zone hero backgrounds for lobby, gallery, and concierge floors. */
export const DESKTOP_FLOOR_ZONE_BACKGROUNDS: Readonly<Record<string, string>> = {
  'build-a-wig-atelier': `${DESKTOP_ZONE_BG_BASE}/IMG_4011.png`,
  'grand-lobby': `${DESKTOP_ZONE_BG_BASE}/IMG_4013.png`,
  lounge: `${DESKTOP_ZONE_BG_BASE}/140E544B-FF7D-49C9-A693-71AF1C7ABEC9.png`,
  'slay-cam-gallery': `${DESKTOP_ZONE_BG_BASE}/IMG_4025.png`,
  'members-lounge': `${DESKTOP_ZONE_BG_BASE}/IMG_4034.png`,
  'rewards-gallery': `${DESKTOP_ZONE_BG_BASE}/IMG_4026.png`,
  reception: `${DESKTOP_ZONE_BG_BASE}/IMG_4014.png`,
  'founder-suite': `${DESKTOP_ZONE_BG_BASE}/80957FCA-ACF1-4FAA-9448-59DE0A0D739A.png`,
  'psa-suite': `${DESKTOP_ZONE_BG_BASE}/8D5E0E87-1363-4E72-85EE-E10294F1172B.png`,
};

export function resolveFloorZoneBackground(zoneId: string): string | undefined {
  return DESKTOP_FLOOR_ZONE_BACKGROUNDS[zoneId];
}
