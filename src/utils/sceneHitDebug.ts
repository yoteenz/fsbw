import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LOBBY_SHELF_HIT_DEBUG_OVERLAY,
  LOUNGE_CHANDELIER_HIT_DEBUG_OVERLAY,
} from '../constants/finalLobbySceneAssets';

export const SCENE_HIT_DEBUG_SESSION_KEY = 'baw_scene_hit_debug';

/**
 * QA overlays for lobby shelf + lounge chandelier hit boxes.
 * Enable: `/lobby?sceneHitDebug=1` (persists for the tab via sessionStorage).
 * Disable: `/lobby?sceneHitDebug=0`
 */
export function isSceneHitDebugEnabledFromSearch(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    if (params.get('sceneHitDebug') === '0') {
      sessionStorage.removeItem(SCENE_HIT_DEBUG_SESSION_KEY);
      return false;
    }
    const flag = params.get('sceneHitDebug');
    if (flag === '1' || flag === 'true' || flag === 'yes') {
      sessionStorage.setItem(SCENE_HIT_DEBUG_SESSION_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(SCENE_HIT_DEBUG_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/** @deprecated Prefer {@link useSceneHitDebugEnabled} (React Router search + session). */
export function isSceneHitDebugQueryEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return isSceneHitDebugEnabledFromSearch(window.location.search);
}

/** React Router–aware — re-renders when `?sceneHitDebug=` changes. */
export function useSceneHitDebugEnabled(): boolean {
  const { search } = useLocation();
  return useMemo(() => isSceneHitDebugEnabledFromSearch(search), [search]);
}

/** Chandelier hit-box QA overlay — dev constant and/or {@link useSceneHitDebugEnabled}. */
export function useLoungeChandelierHitDebugEnabled(): boolean {
  const queryOrSession = useSceneHitDebugEnabled();
  return LOUNGE_CHANDELIER_HIT_DEBUG_OVERLAY || queryOrSession;
}

/** Lobby mannequin shelf hit boxes — dev constant and/or {@link useSceneHitDebugEnabled}. */
export function useLobbyShelfHitDebugEnabled(): boolean {
  const queryOrSession = useSceneHitDebugEnabled();
  return LOBBY_SHELF_HIT_DEBUG_OVERLAY || queryOrSession;
}

/** @deprecated Use {@link useLoungeChandelierHitDebugEnabled}. */
export function isLoungeChandelierHitDebugEnabled(): boolean {
  if (LOUNGE_CHANDELIER_HIT_DEBUG_OVERLAY) return true;
  return isSceneHitDebugQueryEnabled();
}

/** @deprecated Use {@link useLobbyShelfHitDebugEnabled}. */
export function isLobbyShelfHitDebugEnabled(): boolean {
  if (LOBBY_SHELF_HIT_DEBUG_OVERLAY) return true;
  return isSceneHitDebugQueryEnabled();
}
