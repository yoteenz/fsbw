export type DesktopZone = {
  id: string;
  label: string;
  comingSoon?: boolean;
};

export type DesktopFloor = {
  level: number;
  name: string;
  path: string;
  /** Elevator lands on this zone (middle / default hub of the floor). */
  defaultZoneId: string;
  zones: readonly DesktopZone[];
};

export const DESKTOP_PENTHOUSE_PATH = '/desktop/penthouse';
export const DESKTOP_LOBBY_PATH = '/desktop/lobby';
export const DESKTOP_GALLERY_PATH = '/desktop/gallery';
export const DESKTOP_CONCIERGE_PATH = '/desktop/concierge';

/** Virtual skyscraper — L4 (top) through L1. Elevator lands on each floor's default zone. */
export const DESKTOP_FLOORS: readonly DesktopFloor[] = [
  {
    level: 4,
    name: 'Penthouse',
    path: DESKTOP_PENTHOUSE_PATH,
    defaultZoneId: 'showroom',
    zones: [],
  },
  {
    level: 3,
    name: 'Lobby',
    path: DESKTOP_LOBBY_PATH,
    defaultZoneId: 'shop',
    zones: [
      { id: 'shop', label: 'Shop' },
      { id: 'build-a-wig-atelier', label: 'Build-A-Wig Atelier', comingSoon: true },
    ],
  },
  {
    level: 2,
    name: 'Gallery',
    path: DESKTOP_GALLERY_PATH,
    defaultZoneId: 'members-lounge',
    zones: [
      { id: 'slay-cam-gallery', label: 'Slay Cam Gallery', comingSoon: true },
      { id: 'members-lounge', label: 'Members Only Lounge', comingSoon: true },
      { id: 'rewards-gallery', label: 'Rewards Gallery', comingSoon: true },
    ],
  },
  {
    level: 1,
    name: 'Concierge',
    path: DESKTOP_CONCIERGE_PATH,
    defaultZoneId: 'psa-concierge-suite',
    zones: [{ id: 'psa-concierge-suite', label: 'PSA Concierge Suite', comingSoon: true }],
  },
] as const;

export function getDesktopFloorByPath(pathname: string): DesktopFloor | undefined {
  return DESKTOP_FLOORS.find((f) => f.path === pathname);
}

export function getDesktopZoneOnFloor(floor: DesktopFloor, zoneId: string): DesktopZone | undefined {
  return floor.zones.find((z) => z.id === zoneId);
}

export function resolveDesktopFloorZoneId(floor: DesktopFloor, zoneParam: string | null): string {
  if (zoneParam && floor.zones.some((z) => z.id === zoneParam)) return zoneParam;
  return floor.defaultZoneId;
}
