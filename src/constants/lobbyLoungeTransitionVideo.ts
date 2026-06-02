const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

/** Seedance 2.0 lobby → lounge (forward). */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE = `${FINAL_LP_BASE}/positive_Image-to-video_using__Seedance_20_98495.mov`;

/** Lounge → lobby reverse clip — set when asset is ready. */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_REMOTE = '';

export const LOBBY_LOUNGE_TRANSITION_VIDEO_VERSION = 'seedance98495';

/** H.264 for mobile; MOV kept as remote fallback in video element. */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_SRC = `/assets/lobby-lounge-transition-seedance.mp4?v=${LOBBY_LOUNGE_TRANSITION_VIDEO_VERSION}`;

/** Reverse MP4 path (empty until bundled). */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_SRC = `/assets/lobby-lounge-transition-seedance-reverse.mp4?v=${LOBBY_LOUNGE_TRANSITION_VIDEO_VERSION}`;

export const LOBBY_TRANSITION_VIDEO_SESSION_KEY = 'baw_lobby_transition_video';

/** Final LP carousel uses Seedance transition on arrow navigation. Opt out with `?lobbyTransitionVideo=0`. */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_ENABLED = true;

export type LobbyLoungeTransitionDirection = 'forward' | 'reverse';

export function lobbyLoungeTransitionVideoSrc(direction: LobbyLoungeTransitionDirection): string {
  if (direction === 'reverse') {
    if (LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_REMOTE) return LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_REMOTE;
    return LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_SRC;
  }
  return LOBBY_LOUNGE_TRANSITION_VIDEO_SRC;
}

/**
 * Middle carousel panel: Seedance clip between lobby and lounge slides.
 * Opt out with `?lobbyTransitionVideo=0`.
 */
export function isLobbyTransitionVideoEnabledFromSearch(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    if (params.get('lobbyTransitionVideo') === '0') {
      sessionStorage.setItem(LOBBY_TRANSITION_VIDEO_SESSION_KEY, '0');
      return false;
    }
    if (params.get('lobbyTransitionVideo') === '1') {
      sessionStorage.removeItem(LOBBY_TRANSITION_VIDEO_SESSION_KEY);
      return true;
    }
    if (!LOBBY_LOUNGE_TRANSITION_VIDEO_ENABLED) {
      return false;
    }
    return sessionStorage.getItem(LOBBY_TRANSITION_VIDEO_SESSION_KEY) !== '0';
  } catch {
    return LOBBY_LOUNGE_TRANSITION_VIDEO_ENABLED;
  }
}

export function isLobbyLoungeReverseTransitionAvailable(): boolean {
  return Boolean(LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_REMOTE);
}
