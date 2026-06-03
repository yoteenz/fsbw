import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { LOBBY_LOUNGE_TRANSITION_MEDIA_OFFSET_Y_PX } from '../constants/lobbyLoungeTransitionVideo';

export const LOBBY_TRANSITION_DEBUG_SESSION_KEY = 'baw_lobby_transition_debug';

export type LobbyLoungeTransitionPosterRevealMode = 'default' | 'hidden' | 'videoOnPlayingOnly';

export type LobbyLoungeTransitionDebugState = {
  /** Magenta/lime layer overlays + frame/letterbox outlines. */
  showLayerOverlays: boolean;
  /** Effective `object-position` Y (query overrides constant). */
  mediaOffsetYPx: number;
  posterReveal: LobbyLoungeTransitionPosterRevealMode;
};

function parseOffsetOverride(search: string): number | null {
  const raw = new URLSearchParams(search).get('lobbyTransitionOffset');
  if (raw === null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parsePosterReveal(search: string): LobbyLoungeTransitionPosterRevealMode | null {
  const raw = new URLSearchParams(search).get('lobbyTransitionPoster');
  if (raw === 'hidden' || raw === '0' || raw === 'none') return 'hidden';
  if (raw === 'afterPlaying' || raw === 'onPlaying' || raw === 'playing') return 'videoOnPlayingOnly';
  return null;
}

/** `/lobby?lobbyTransitionDebug=1` — layer overlays; optional `lobbyTransitionOffset=0`, `lobbyTransitionPoster=hidden|afterPlaying`. */
export function lobbyLoungeTransitionDebugFromSearch(search: string): LobbyLoungeTransitionDebugState {
  const params = new URLSearchParams(search);
  let showLayerOverlays = false;

  try {
    if (params.get('lobbyTransitionDebug') === '0') {
      sessionStorage.removeItem(LOBBY_TRANSITION_DEBUG_SESSION_KEY);
    } else if (
      params.get('lobbyTransitionDebug') === '1' ||
      params.get('lobbyTransitionDebug') === 'true'
    ) {
      sessionStorage.setItem(LOBBY_TRANSITION_DEBUG_SESSION_KEY, '1');
      showLayerOverlays = true;
    } else if (sessionStorage.getItem(LOBBY_TRANSITION_DEBUG_SESSION_KEY) === '1') {
      showLayerOverlays = true;
    }
  } catch {
    /* ignore */
  }

  const offsetOverride = parseOffsetOverride(search);
  const posterOverride = parsePosterReveal(search);

  return {
    showLayerOverlays,
    mediaOffsetYPx: offsetOverride ?? LOBBY_LOUNGE_TRANSITION_MEDIA_OFFSET_Y_PX,
    posterReveal: posterOverride ?? 'default',
  };
}

export function useLobbyLoungeTransitionDebug(): LobbyLoungeTransitionDebugState {
  const { search } = useLocation();
  return useMemo(() => lobbyLoungeTransitionDebugFromSearch(search), [search]);
}

export function lobbyLoungeTransitionCoverPositionForOffset(offsetY: number): string {
  if (!offsetY) return 'center top';
  return `center calc(0% + ${offsetY}px)`;
}
