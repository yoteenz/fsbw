// Desktop Flagship Lobby -- environment background.
// Derived from VITE_SUPABASE_URL (already set in Vercel) -- no new env var needed.
// Override via VITE_DESKTOP_LOBBY_BG_URL.

const supabaseUrl = (import.meta.env as Record<string, string>).VITE_SUPABASE_URL;
const explicitUrl = (import.meta.env as Record<string, string>).VITE_DESKTOP_LOBBY_BG_URL;

const STORAGE_PATH = '/storage/v1/object/public/live-preview/desktop-lobby/lobby-bg-v1.webp';

export const DESKTOP_LOBBY_BG_URL: string | undefined =
  explicitUrl || (supabaseUrl ? supabaseUrl + STORAGE_PATH : undefined);

export const DESKTOP_LOBBY_BG_STORAGE_PATH = 'desktop-lobby/lobby-bg-v1.webp';
export const DESKTOP_LOBBY_BG_STORAGE_BUCKET = 'live-preview';
export const hasDesktopLobbyBg = Boolean(DESKTOP_LOBBY_BG_URL);
