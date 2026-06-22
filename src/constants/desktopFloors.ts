export type DesktopFloor = {
  level: number;
  name: string;
  path: string;
};

/** Virtual skyscraper floors — elevator routes between full-screen destinations. */
export const DESKTOP_FLOORS: readonly DesktopFloor[] = [
  { level: 5, name: 'Penthouse', path: '/desktop/penthouse' },
  { level: 4, name: 'Lounge', path: '/desktop/lounge' },
  { level: 3, name: 'Concierge', path: '/desktop/concierge' },
  { level: 2, name: 'Slay Cam', path: '/desktop/slay-cam' },
  { level: 1, name: 'Lobby', path: '/desktop/lobby' },
] as const;

export const DESKTOP_PENTHOUSE_PATH = '/desktop/penthouse';

export function getDesktopFloorByPath(pathname: string): DesktopFloor | undefined {
  return DESKTOP_FLOORS.find((f) => f.path === pathname);
}
