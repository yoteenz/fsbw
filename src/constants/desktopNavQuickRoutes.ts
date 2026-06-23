import {
  DESKTOP_CONCIERGE_PATH,
  DESKTOP_GALLERY_PATH,
  DESKTOP_LOBBY_PATH,
  DESKTOP_PENTHOUSE_PATH,
} from './desktopFloors';

export type DesktopNavQuickRoute = {
  label: string;
  path: string;
  room?: string;
  zone?: string;
};

/** Navbar express transport — lands on exact floor zone/room instantly (no elevator). */
export const DESKTOP_NAV_QUICK_ROUTES: readonly DesktopNavQuickRoute[] = [
  { label: 'HOME', path: DESKTOP_LOBBY_PATH, zone: 'grand-lobby' },
  { label: 'SHOP', path: DESKTOP_PENTHOUSE_PATH, room: 'boutique' },
  { label: 'BUILD-A-WIG', path: DESKTOP_LOBBY_PATH, zone: 'build-a-wig-atelier' },
  { label: 'SHOWROOM', path: DESKTOP_PENTHOUSE_PATH, room: 'showroom' },
  { label: 'SLAY CAM', path: DESKTOP_GALLERY_PATH, zone: 'slay-cam-gallery' },
  { label: 'ANALYSIS', path: DESKTOP_PENTHOUSE_PATH, room: 'analysis-lab' },
  { label: 'MEMBERSHIP', path: DESKTOP_GALLERY_PATH, zone: 'members-lounge' },
  { label: 'REWARDS', path: DESKTOP_GALLERY_PATH, zone: 'rewards-gallery' },
  { label: 'PSA', path: DESKTOP_CONCIERGE_PATH, zone: 'psa-suite' },
] as const;

export function buildDesktopQuickRouteHref(route: Pick<DesktopNavQuickRoute, 'path' | 'room' | 'zone'>): string {
  const params = new URLSearchParams();
  if (route.room) params.set('room', route.room);
  if (route.zone) params.set('zone', route.zone);
  const q = params.toString();
  return q ? `${route.path}?${q}` : route.path;
}

/** Elevator — floor default zone/room only (middle hub), no deep-link params from nav. */
export function buildDesktopElevatorHref(floorPath: string, defaultZoneId: string): string {
  return buildDesktopDestinationHref(floorPath, defaultZoneId);
}

/** Deep-link to a specific zone/room on a floor (elevator + directory destinations). */
export function buildDesktopDestinationHref(floorPath: string, destinationId: string): string {
  if (floorPath === DESKTOP_PENTHOUSE_PATH) {
    return `${floorPath}?room=${destinationId}`;
  }
  return `${floorPath}?zone=${destinationId}`;
}

export function resolveDesktopNavActiveLabel(pathname: string, search: string): string | undefined {
  const params = new URLSearchParams(search);
  const room = params.get('room');
  const zone = params.get('zone');

  for (const route of DESKTOP_NAV_QUICK_ROUTES) {
    if (route.path !== pathname) continue;
    if (route.room) {
      if (route.room === room) return route.label;
      continue;
    }
    if (route.zone) {
      if (route.zone === zone) return route.label;
      continue;
    }
    if (!room && !zone) return route.label;
  }
  return undefined;
}
