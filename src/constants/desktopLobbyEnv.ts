/**
 * Desktop Flagship Lobby -- environment background constants.
 *
 * VITE_DESKTOP_LOBBY_BG_URL is set by running: npm run lobby:generate-desktop-bg
 * Add the printed URL to .env.local and Vercel. Until set, lobby uses CSS fallback.
 */

export const DESKTOP_LOBBY_BG_URL: string | undefined =
  (import.meta.env as Record<string, string>)?.VITE_DESKTOP_LOBBY_BG_URL || undefined;

export const DESKTOP_LOBBY_BG_STORAGE_PATH = 'desktop-lobby/lobby-bg-v1.webp';
export const DESKTOP_LOBBY_BG_STORAGE_BUCKET = 'live-preview';
export const hasDesktopLobbyBg = Boolean(DESKTOP_LOBBY_BG_URL);