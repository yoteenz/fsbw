/** Horizontal lobby carousel: `/lobby` (index 0) and `/lobby/lounge` (index 1). */
export const LOBBY_CAROUSEL_LOBBY_PATH = '/lobby';
export const LOBBY_CAROUSEL_LOUNGE_PATH = '/lobby/lounge';

export function lobbyCarouselIndexFromPath(pathname: string): number {
  return pathname === LOBBY_CAROUSEL_LOUNGE_PATH ? 1 : 0;
}

export function lobbyCarouselPathFromIndex(index: number): string {
  return index === 1 ? LOBBY_CAROUSEL_LOUNGE_PATH : LOBBY_CAROUSEL_LOBBY_PATH;
}
