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
 * Seedance clip only — nudge cover anchor down to counter ~2px upward settle at play start.
 * Do **not** apply to lobby/lounge slide backgrounds (see `sceneCarouselCoverBackgroundPosition`).
 */
export const LOBBY_LOUNGE_TRANSITION_MEDIA_OFFSET_Y_PX = 2;

/** Transition video + poster `object-position` / `background-position`. */
export function lobbyLoungeTransitionCoverPosition(): string {
  const offsetY = LOBBY_LOUNGE_TRANSITION_MEDIA_OFFSET_Y_PX;
  if (!offsetY) return 'center top';
  return `center calc(0% + ${offsetY}px)`;
}

/** Video layer inside the shared portrait frame (same box as poster). */
export function lobbyLoungeTransitionMediaLayerStyle(
  _direction: LobbyLoungeTransitionDirection = 'forward',
): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: lobbyLoungeTransitionCoverPosition(),
    pointerEvents: 'none',
  };
}

/** Poster layer — identical geometry to {@link lobbyLoungeTransitionMediaLayerStyle}. */
export function lobbyLoungeTransitionPosterInFrameStyle(
  posterSrc: string,
  _direction: LobbyLoungeTransitionDirection = 'forward',
): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${posterSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: lobbyLoungeTransitionCoverPosition(),
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  };
}

export function lobbyLoungeTransitionPosterLayerStyle(posterSrc: string): React.CSSProperties {
  return lobbyLoungeTransitionPosterInFrameStyle(posterSrc, 'forward');
}

/**
 * Letterbox root — transparent bands + shared portrait frame (see
 * {@link useLobbyLoungeTransitionLetterboxLayout}). Poster and video use the same
 * inset box and crossfade opacity (no DOM swap).
 */
export function lobbyLoungeTransitionLetterboxShellStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

/** Transparent band above the clip (carousel shows through the fixed host). */
export function lobbyLoungeTransitionLetterboxTopBandStyle(heightPx: number): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: `${heightPx}px`,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

/** Transparent band below the clip — sized for portrait letterbox + bounce pad. */
export function lobbyLoungeTransitionLetterboxBottomBandStyle(heightPx: number): React.CSSProperties {
  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: `${heightPx}px`,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

/** Portrait frame — fixed top offset; original cover video inside. */
export function lobbyLoungeTransitionFrameStyle(
  layout: { frameWidth: number; frameHeight: number; topBandPx: number },
): React.CSSProperties {
  return {
    position: 'absolute',
    top: `${layout.topBandPx}px`,
    left: '50%',
    width: `${layout.frameWidth}px`,
    height: `${layout.frameHeight}px`,
    maxWidth: '100vw',
    transform: 'translateX(-50%)',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  };
}

/** Full-viewport poster while loading — matches slide cover in letterbox bands. */
export function lobbyLoungeTransitionFullBleedPosterStyle(posterSrc: string): React.CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${posterSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: lobbyLoungeTransitionCoverPosition(),
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
