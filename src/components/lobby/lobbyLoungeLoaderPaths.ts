/** Frontal Slayer lobby/lounge immersive loader — route detection + boot shell ids. */

export const FS_LOBBY_LOUNGE_LOADER_BOOT_CLASS = 'fs-lobby-lounge-boot';
export const FS_LOBBY_LOUNGE_LOADER_SHELL_ID = 'fs-lobby-lounge-boot-shell';

const LOBBY_PATH_PREFIXES = ['/lobby', '/lounge'] as const;

/** True for `/lobby`, `/lobby/lounge`, and `/lounge` (redirect target). */
export function isLobbyLoungeImmersiveLoaderPath(pathname: string): boolean {
  if (pathname === '/lobby' || pathname === '/lobby/lounge' || pathname === '/lounge') return true;
  return LOBBY_PATH_PREFIXES.some((prefix) => prefix !== '/lounge' && pathname.startsWith(`${prefix}/`));
}

declare global {
  interface Window {
    fsIsLobbyLoungeImmersivePath?: (path: string) => boolean;
    fsShouldBootLobbyLoungeImmersiveLoader?: () => boolean;
  }
}

if (typeof window !== 'undefined') {
  window.fsIsLobbyLoungeImmersivePath = isLobbyLoungeImmersiveLoaderPath;
  window.fsShouldBootLobbyLoungeImmersiveLoader = () => true;
}
