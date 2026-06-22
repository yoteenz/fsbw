import { DESKTOP_PENTHOUSE_ROOMS } from './desktopPenthouseRooms';

export type DesktopZone = {
  id: string;
  label: string;
  comingSoon?: boolean;
};

export type DesktopFloor = {
  id: number;
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

/**
 * Frontal Slayer tower — fully data-driven floor registry.
 * Display order: highest id first in elevator shaft (L4 at top).
 */
export const DESKTOP_FLOORS: readonly DesktopFloor[] = [
  {
    id: 4,
    name: 'PENTHOUSE',
    path: DESKTOP_PENTHOUSE_PATH,
    defaultZoneId: 'showroom',
    zones: DESKTOP_PENTHOUSE_ROOMS.map((room) => ({
      id: room.id,
      label: room.name,
      comingSoon: room.comingSoon,
    })),
  },
  {
    id: 3,
    name: 'LOBBY',
    path: DESKTOP_LOBBY_PATH,
    defaultZoneId: 'shop',
    zones: [
      { id: 'shop', label: 'Shop' },
      { id: 'build-a-wig-atelier', label: 'Build-A-Wig Atelier', comingSoon: true },
    ],
  },
  {
    id: 2,
    name: 'GALLERY',
    path: DESKTOP_GALLERY_PATH,
    defaultZoneId: 'members-lounge',
    zones: [
      { id: 'slay-cam-gallery', label: 'Slay Cam Gallery', comingSoon: true },
      { id: 'members-lounge', label: 'Members Only Lounge', comingSoon: true },
      { id: 'rewards-gallery', label: 'Rewards Gallery', comingSoon: true },
    ],
  },
  {
    id: 1,
    name: 'CONCIERGE',
    path: DESKTOP_CONCIERGE_PATH,
    defaultZoneId: 'psa-concierge-suite',
    zones: [{ id: 'psa-concierge-suite', label: 'PSA Concierge Suite', comingSoon: true }],
  },
] as const;

export function getDesktopFloorByPath(pathname: string): DesktopFloor | undefined {
  return DESKTOP_FLOORS.find((f) => f.path === pathname);
}

export function getDesktopFloorById(id: number): DesktopFloor | undefined {
  return DESKTOP_FLOORS.find((f) => f.id === id);
}

export function getDesktopZoneOnFloor(floor: DesktopFloor, zoneId: string): DesktopZone | undefined {
  return floor.zones.find((z) => z.id === zoneId);
}

export function resolveDesktopFloorZoneId(floor: DesktopFloor, zoneParam: string | null): string {
  if (zoneParam && floor.zones.some((z) => z.id === zoneParam)) return zoneParam;
  return floor.defaultZoneId;
}

/** Active destination id from URL — `room` on penthouse, `zone` elsewhere. */
export function resolveDesktopActiveDestinationId(
  floor: DesktopFloor,
  search: string,
): string {
  const params = new URLSearchParams(search);
  if (floor.path === DESKTOP_PENTHOUSE_PATH) {
    return resolveDesktopFloorZoneId(floor, params.get('room'));
  }
  return resolveDesktopFloorZoneId(floor, params.get('zone'));
}

/** @deprecated Use floor.id — kept for elevator title strings during migration. */
export function getDesktopFloorLevel(floor: DesktopFloor): number {
  return floor.id;
}
