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

/** Navbar time-travel — lands on exact floor zone/room (not elevator default hub). */
export const DESKTOP_NAV_QUICK_ROUTES: readonly DesktopNavQuickRoute[] = [
  { label: 'HOME', path: DESKTOP_LOBBY_PATH, zone: 'shop' },
  { label: 'SHOP', path: DESKTOP_PENTHOUSE_PATH, room: 'boutique' },
  { label: 'BUILD-A-WIG', path: DESKTOP_LOBBY_PATH, zone: 'build-a-wig-atelier' },
  { label: 'SLAY CAM', path: DESKTOP_GALLERY_PATH, zone: 'slay-cam-gallery' },
  { label: 'ANALYSIS', path: DESKTOP_PENTHOUSE_PATH, room: 'analysis-lab' },
  { label: 'MEMBERSHIP', path: DESKTOP_GALLERY_PATH, zone: 'members-lounge' },
  { label: 'REWARDS', path: DESKTOP_GALLERY_PATH, zone: 'rewards-gallery' },
  { label: 'PSA', path: DESKTOP_CONCIERGE_PATH, zone: 'psa-concierge-suite' },
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
  if (floorPath === DESKTOP_PENTHOUSE_PATH) {
    return `${floorPath}?room=${defaultZoneId}`;
  }
  return `${floorPath}?zone=${defaultZoneId}`;
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
