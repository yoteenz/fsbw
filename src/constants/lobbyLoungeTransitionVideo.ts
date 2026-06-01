/** Kling lobby → lounge transition test clip (Supabase MOV source). */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/positive_Image-to-video_using__Kling_30__69734.mov';

/** Bundled H.264 MP4 for reliable mobile/desktop playback (converted from REMOTE). */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_VERSION = 'kling69734';

export const LOBBY_LOUNGE_TRANSITION_VIDEO_SRC = `/assets/lobby-lounge-transition.mp4?v=${LOBBY_LOUNGE_TRANSITION_VIDEO_VERSION}`;

export const LOBBY_TRANSITION_VIDEO_SESSION_KEY = 'baw_lobby_transition_video';

/**
 * Lobby → lounge: middle carousel panel plays the Kling clip in-place (not a fullscreen overlay).
 * Disable with `?lobbyTransitionVideo=0`. Default: on.
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
    return sessionStorage.getItem(LOBBY_TRANSITION_VIDEO_SESSION_KEY) !== '0';
  } catch {
    return true;
  }
}
