export type DesktopRoomTitleCopy = {
  title: string;
  subtitle: string;
};

/** Live overlay copy — replaces baked wall text on NO TEXT BG heroes. */
export const DESKTOP_ROOM_TITLES: Readonly<Record<string, DesktopRoomTitleCopy>> = {
  'grand-lobby': {
    title: 'GRAND CENTRAL LOBBY',
    subtitle: 'LUXURY WITHOUT LIMITS',
  },
  'analysis-lab': {
    title: 'HAIR ANALYSIS LAB',
    subtitle: 'ANALYZE. CUSTOMIZE. PERFECT.',
  },
  showroom: {
    title: 'HAIR SHOWROOM',
    subtitle: 'LUXURY UNITS. ICONIC STYLES.',
  },
  boutique: {
    title: 'EXTENSIONS BOUTIQUE',
    subtitle: 'BUNDLES. CLOSURES. FRONTALS.',
  },
  'build-a-wig-atelier': {
    title: 'BUILD-A-WIG ATELIER',
    subtitle: 'DESIGN. CUSTOMIZE. SLAY.',
  },
  lounge: {
    title: 'THE LOUNGE',
    subtitle: 'WATCH. LEARN. GET INSPIRED.',
  },
  'slay-cam-gallery': {
    title: 'SLAY CAM GALLERY',
    subtitle: 'YOU SLAY. WE CELEBRATE.',
  },
  'members-lounge': {
    title: 'MEMBERS LOUNGE',
    subtitle: 'EXCLUSIVE ACCESS. EXCLUSIVE REWARDS.',
  },
  'rewards-gallery': {
    title: 'REWARDS GALLERY',
    subtitle: 'COLLECT. UNLOCK. SLAY.',
  },
  'founder-suite': {
    title: 'FOUNDER SUITE',
    subtitle: 'VISION. EXECUTION. DISCIPLINE.',
  },
  reception: {
    title: '',
    subtitle: 'DESIGN. CUSTOMIZE. SLAY.',
  },
  'psa-suite': {
    title: 'PSA SUITE',
    subtitle: 'PLAN. STRATEGIZE. ACCELERATE.',
  },
};

export function resolveDesktopRoomTitleCopy(zoneId: string): DesktopRoomTitleCopy | undefined {
  return DESKTOP_ROOM_TITLES[zoneId];
}
