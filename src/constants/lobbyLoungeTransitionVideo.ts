/** Kling / Seedance lobby → lounge transition test clip (Supabase). */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/positive_Image-to-video_using__Kling_30__69734.mov';

export const LOBBY_TRANSITION_VIDEO_SESSION_KEY = 'baw_lobby_transition_video';

/** Dev, `?lobbyTransitionVideo=1`, or prior session toggle — plays MOV instead of CSS slide (lobby → lounge). */
export function isLobbyTransitionVideoEnabledFromSearch(search: string): boolean {
  if (import.meta.env.DEV) return true;
  try {
    const params = new URLSearchParams(search);
    if (params.get('lobbyTransitionVideo') === '1') {
      sessionStorage.setItem(LOBBY_TRANSITION_VIDEO_SESSION_KEY, '1');
      return true;
    }
    if (params.get('lobbyTransitionVideo') === '0') {
      sessionStorage.removeItem(LOBBY_TRANSITION_VIDEO_SESSION_KEY);
      return false;
    }
    return sessionStorage.getItem(LOBBY_TRANSITION_VIDEO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}
