import type React from 'react';

const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

/** Seedance 2.0 lobby → lounge (forward). */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_REMOTE = `${FINAL_LP_BASE}/positive_Image-to-video_using__Seedance_20_98495.mov`;

/** Lounge → lobby reverse clip — set when asset is ready. */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_REMOTE = '';

export const LOBBY_LOUNGE_TRANSITION_VIDEO_VERSION = 'seedance98495';

/** Reverse playback when using forward MP4 backwards (`playbackRate` or RAF fallback). */
export const LOBBY_LOUNGE_TRANSITION_REVERSE_PLAYBACK_RATE = 2;

/** Bundled Seedance clip (portrait). */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_WIDTH = 1080;
export const LOBBY_LOUNGE_TRANSITION_VIDEO_HEIGHT = 1920;

/**
 * @deprecated Sub-pixel nudge removed — transition uses original `center top` cover in a
 * portrait frame; letterbox bands are transparent spacers (see letterbox layout helpers).
 */
export const LOBBY_LOUNGE_TRANSITION_MEDIA_OFFSET_Y_PX = 0;

/** Final LP lobby/lounge slides — same as first transition ship (`center top`). */
export function lobbyLoungeTransitionCoverPosition(): string {
  return 'center top';
}

/** Original transition video/poster layer (full bleed inside the portrait frame). */
export function lobbyLoungeTransitionMediaLayerStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
  };
}

export function lobbyLoungeTransitionPosterLayerStyle(posterSrc: string): React.CSSProperties {
  return {
    ...lobbyLoungeTransitionMediaLayerStyle(),
    backgroundImage: `url(${posterSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
  };
}

/** Flex column shell: transparent spacers + centered portrait frame. */
export function lobbyLoungeTransitionLetterboxShellStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  };
}

/** Responsive bands above/below the clip — show carousel through (no black matte). */
export function lobbyLoungeTransitionLetterboxSpacerStyle(): React.CSSProperties {
  return {
    flex: '1 1 0',
    minHeight: 0,
    width: '100%',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

/** Portrait frame sized to clip aspect; video uses original cover inside. */
export function lobbyLoungeTransitionFrameStyle(): React.CSSProperties {
  return {
    flex: '0 1 auto',
    position: 'relative',
    width: '100%',
    maxWidth: '100vw',
    maxHeight: '100dvh',
    aspectRatio: `${LOBBY_LOUNGE_TRANSITION_VIDEO_WIDTH} / ${LOBBY_LOUNGE_TRANSITION_VIDEO_HEIGHT}`,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  };
}

/** Full-viewport poster while loading — matches slide cover in letterbox bands. */
export function lobbyLoungeTransitionFullBleedPosterStyle(posterSrc: string): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${posterSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  };
}

/** H.264 for mobile; MOV kept as remote fallback in video element. */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_SRC = `/assets/lobby-lounge-transition-seedance.mp4?v=${LOBBY_LOUNGE_TRANSITION_VIDEO_VERSION}`;

/** Reverse MP4 path (empty until bundled). */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_SRC = `/assets/lobby-lounge-transition-seedance-reverse.mp4?v=${LOBBY_LOUNGE_TRANSITION_VIDEO_VERSION}`;

export const LOBBY_TRANSITION_VIDEO_SESSION_KEY = 'baw_lobby_transition_video';

/** Final LP carousel uses Seedance transition on arrow navigation. Opt out with `?lobbyTransitionVideo=0`. */
export const LOBBY_LOUNGE_TRANSITION_VIDEO_ENABLED = true;

export type LobbyLoungeTransitionDirection = 'forward' | 'reverse';

export function lobbyLoungeTransitionVideoSrc(direction: LobbyLoungeTransitionDirection): string {
  if (direction === 'reverse' && LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_REMOTE) {
    return LOBBY_LOUNGE_TRANSITION_VIDEO_REVERSE_REMOTE;
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

/** Reverse uses dedicated asset when set; otherwise forward MP4 with reverse playback. */
export function isLobbyLoungeReverseTransitionAvailable(): boolean {
  return LOBBY_LOUNGE_TRANSITION_VIDEO_ENABLED;
}
